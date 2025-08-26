import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { DynamoDBClient, PutItemCommand, QueryCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp'; // For image processing
import { APIGatewayProxyEvent, APIGatewayProxyResult, S3Event } from 'aws-lambda';

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });

// Generate upload URL for images
export const getImageUploadUrl = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // FIX 1: Correct way to extract userId from Cognito JWT
    const userId = event.requestContext.authorizer?.claims?.sub;
    
    if (!userId) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Unauthorized - User ID not found' })
      };
    }

    const body = JSON.parse(event.body || '{}');
    
    const { 
      fileName, 
      fileSize, 
      contentType, 
      schematicId, 
      imageType = 'gallery', // 'cover', 'gallery', 'avatar', 'thumbnail'
      generateThumbnail = true 
    } = body;

    // FIX 2: Add input validation
    if (!fileName || !fileSize || !contentType) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing required fields: fileName, fileSize, contentType' })
      };
    }

    // Validate image type
    if (!contentType.startsWith('image/')) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Invalid file type. Only images are allowed.' })
      };
    }

    // FIX 3: Validate schematicId is required for non-avatar images
    if (imageType !== 'avatar' && !schematicId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'schematicId is required for non-avatar images' })
      };
    }

    // Generate unique image ID
    const imageId = `img-${uuidv4()}`;
    const timestamp = new Date().toISOString();
    
    // Determine S3 key structure based on image type
    let s3Key: string;
    switch (imageType) {
      case 'avatar':
        s3Key = `avatars/${userId}/${imageId}-${fileName}`;
        break;
      case 'cover':
        s3Key = `covers/${schematicId}/${imageId}-${fileName}`;
        break;
      case 'thumbnail':
        s3Key = `thumbnails/${schematicId}/${imageId}-${fileName}`;
        break;
      default:
        s3Key = `gallery/${schematicId}/${imageId}-${fileName}`;
    }

    // Create presigned POST URL
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: process.env.S3_IMAGES_BUCKET_NAME!,
      Key: s3Key,
      Conditions: [
        ['content-length-range', 0, 10 * 1024 * 1024], // Max 10MB
        ['starts-with', '$Content-Type', 'image/'],
      ],
      Fields: {
        'Content-Type': contentType,
      },
      Expires: 600, // 10 minutes
    });

    // Create image record in DynamoDB
    const imageItem = {
      PK: `IMAGE#${imageId}`,
      SK: 'METADATA',
      EntityType: 'Image',
      ImageId: imageId,
      FileName: fileName,
      FileSize: fileSize,
      ContentType: contentType,
      ImageType: imageType,
      UploaderId: userId,
      SchematicId: schematicId || null,
      S3Key: s3Key,
      Status: 'uploading', // uploading -> processing -> active
      CreatedAt: timestamp,
      UpdatedAt: timestamp,
      // GSI projections based on type
      ...(schematicId && {
        GSI1PK: `SCHEMATIC#${schematicId}`,
        GSI1SK: `IMAGE#${timestamp}#${imageId}`,
      }),
      ...(imageType === 'avatar' && {
        GSI2PK: `USER#${userId}`,
        GSI2SK: `AVATAR#${timestamp}#${imageId}`,
      })
    };

    await dynamoClient.send(new PutItemCommand({
      TableName: process.env.TABLE_NAME!, // FIX 4: Use TABLE_NAME (consistent with your template)
      Item: marshall(imageItem)
    }));

    // If this is a schematic image, create the association
    if (schematicId) {
      const associationItem = {
        PK: `SCHEMATIC#${schematicId}`,
        SK: `IMAGE#${imageId}`,
        EntityType: 'SchematicImage',
        SchematicId: schematicId,
        ImageId: imageId,
        ImageType: imageType,
        CreatedAt: timestamp
      };

      await dynamoClient.send(new PutItemCommand({
        TableName: process.env.TABLE_NAME!, // FIX 4: Use TABLE_NAME
        Item: marshall(associationItem)
      }));
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        uploadUrl: url,
        fields,
        imageId
      })
    };

  } catch (error) {
    console.error('Error generating image upload URL:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to generate upload URL' })
    };
  }
};

// Confirm image upload and process
export const confirmImageUpload = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const imageId = event.pathParameters?.imageId;
    const userId = event.requestContext.authorizer?.claims?.sub; // FIX 5: Correct JWT path

    if (!imageId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Image ID is required' })
      };
    }

    if (!userId) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Unauthorized - User ID not found' })
      };
    }

    // Get image record from DynamoDB
    const getItemResponse = await dynamoClient.send(new QueryCommand({
      TableName: process.env.TABLE_NAME!, // FIX 6: Use TABLE_NAME
      KeyConditionExpression: 'PK = :pk AND SK = :sk',
      ExpressionAttributeValues: marshall({
        ':pk': `IMAGE#${imageId}`,
        ':sk': 'METADATA'
      })
    }));

    if (!getItemResponse.Items || getItemResponse.Items.length === 0) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Image not found' })
      };
    }

    const imageRecord = unmarshall(getItemResponse.Items[0]);

    // Verify user owns the image
    if (imageRecord.UploaderId !== userId) {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    // FIX 7: Use UpdateItemCommand instead of PutItemCommand to avoid overwriting
    await dynamoClient.send(new UpdateItemCommand({
      TableName: process.env.TABLE_NAME!,
      Key: marshall({
        PK: `IMAGE#${imageId}`,
        SK: 'METADATA'
      }),
      UpdateExpression: 'SET #status = :status, UpdatedAt = :updated',
      ExpressionAttributeNames: {
        '#status': 'Status'
      },
      ExpressionAttributeValues: marshall({
        ':status': 'processing',
        ':updated': new Date().toISOString()
      })
    }));

    // Generate CloudFront URLs
    const imageUrl = `https://${process.env.CLOUDFRONT_IMAGES_DOMAIN}/${imageRecord.S3Key}`;
    const thumbnailUrl = `https://${process.env.CLOUDFRONT_IMAGES_DOMAIN}/${imageRecord.S3Key.replace(/(\.[^.]+)$/, '_thumb$1')}`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Upload confirmed',
        imageId,
        imageUrl,
        thumbnailUrl
      })
    };

  } catch (error) {
    console.error('Error confirming image upload:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to confirm upload' })
    };
  }
};

// S3 Event handler for image processing
export const processImageUpload = async (event: S3Event): Promise<void> => { // FIX 8: Add return type
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' ')); // FIX 9: Decode URL-encoded key
    
    // Extract image ID from key structure
    const imageId = extractImageIdFromKey(key);
    if (!imageId) {
      console.log(`Could not extract image ID from key: ${key}`);
      continue;
    }

    try {
      // Download original image from S3
      const getObjectResponse = await s3Client.send(new GetObjectCommand({
        Bucket: bucket,
        Key: key
      }));

      // FIX 10: Add null check for Body
      if (!getObjectResponse.Body) {
        throw new Error('No body in S3 response');
      }

      const originalBuffer = await streamToBuffer(getObjectResponse.Body as NodeJS.ReadableStream);

      // Process image with Sharp
      const imageMetadata = await sharp(originalBuffer).metadata();
      
      // FIX 11: Add metadata validation
      if (!imageMetadata.width || !imageMetadata.height) {
        throw new Error('Invalid image: no dimensions');
      }

      // Generate optimized versions
      const optimizedBuffer = await sharp(originalBuffer)
        .jpeg({ quality: 85, progressive: true })
        .resize(1920, 1920, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .toBuffer();

      // Generate thumbnail (400x400)
      const thumbnailBuffer = await sharp(originalBuffer)
        .jpeg({ quality: 80 })
        .resize(400, 400, { 
          fit: 'cover',
          position: 'center' 
        })
        .toBuffer();

      // Upload optimized versions back to S3
      const optimizedKey = key.replace(/(\.[^.]+)$/, '_optimized$1');
      const thumbnailKey = key.replace(/(\.[^.]+)$/, '_thumb$1');

      await Promise.all([
        s3Client.send(new PutObjectCommand({
          Bucket: bucket,
          Key: optimizedKey,
          Body: optimizedBuffer,
          ContentType: 'image/jpeg',
          CacheControl: 'public, max-age=31536000', // 1 year
        })),
        s3Client.send(new PutObjectCommand({
          Bucket: bucket,
          Key: thumbnailKey,
          Body: thumbnailBuffer,
          ContentType: 'image/jpeg',
          CacheControl: 'public, max-age=31536000',
        }))
      ]);

      // Update DynamoDB with processing results
      await dynamoClient.send(new UpdateItemCommand({
        TableName: process.env.TABLE_NAME!, // FIX 12: Use TABLE_NAME
        Key: marshall({
          PK: `IMAGE#${imageId}`,
          SK: 'METADATA'
        }),
        UpdateExpression: 'SET #status = :status, Width = :width, Height = :height, OptimizedS3Key = :opt, ThumbnailS3Key = :thumb, ProcessedAt = :processed, UpdatedAt = :updated',
        ExpressionAttributeNames: {
          '#status': 'Status'
        },
        ExpressionAttributeValues: marshall({
          ':status': 'active',
          ':width': imageMetadata.width,
          ':height': imageMetadata.height,
          ':opt': optimizedKey,
          ':thumb': thumbnailKey,
          ':processed': new Date().toISOString(),
          ':updated': new Date().toISOString()
        })
      }));

      console.log(`Processed image ${imageId}: ${imageMetadata.width}x${imageMetadata.height}`);

    } catch (error) {
      console.error(`Error processing image ${imageId}:`, error);
      
      // Mark as failed
      try {
        await dynamoClient.send(new UpdateItemCommand({
          TableName: process.env.TABLE_NAME!, // FIX 13: Use TABLE_NAME
          Key: marshall({
            PK: `IMAGE#${imageId}`,
            SK: 'METADATA'
          }),
          UpdateExpression: 'SET #status = :status, ErrorMessage = :error, UpdatedAt = :updated',
          ExpressionAttributeNames: {
            '#status': 'Status'
          },
          ExpressionAttributeValues: marshall({
            ':status': 'failed',
            ':error': error instanceof Error ? error.message : 'Processing failed',
            ':updated': new Date().toISOString()
          })
        }));
      } catch (dbError) {
        console.error(`Failed to mark image ${imageId} as failed:`, dbError);
      }
    }
  }
};

// Utility functions
const streamToBuffer = async (stream: NodeJS.ReadableStream): Promise<Buffer> => {
  const chunks: Uint8Array[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
};

const extractImageIdFromKey = (key: string): string | null => {
  const match = key.match(/(img-[a-f0-9-]+)/);
  return match ? match[1] : null;
};