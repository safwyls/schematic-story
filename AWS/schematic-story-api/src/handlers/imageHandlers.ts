import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { DynamoDBClient, PutItemCommand, QueryCommand, UpdateItemCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { APIGatewayProxyEvent, APIGatewayProxyResult, S3Event } from 'aws-lambda';

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });

//#region Staging Images
// Generate upload URL for STAGED images (not associated with schematic yet)
export const getStagedImageUploadUrl = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
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
    const { fileName, fileSize, contentType } = body;

    if (!fileName || !fileSize || !contentType) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing required fields' })
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
        body: JSON.stringify({ error: 'Invalid file type' })
      };
    }

    // Generate unique image ID and temporary key
    const imageId = `img-${uuidv4()}`;
    const timestamp = new Date().toISOString();
    const ttl = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours from now
    
    // Use staging folder in S3
    const s3Key = `staging/${userId}/${imageId}-${fileName}`;

    // Create presigned POST URL for staging bucket/folder
    const maxFileSize = parseInt(process.env.MAX_IMAGE_SIZE_MB || '10') * 1024 * 1024;
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: process.env.S3_STAGING_BUCKET_NAME || process.env.S3_IMAGES_BUCKET_NAME!,
      Key: s3Key,
      Conditions: [
        ['content-length-range', 0, maxFileSize],
        ['starts-with', '$Content-Type', 'image/'],
      ],
      Fields: {
        'Content-Type': contentType,
      },
      Expires: 600, // 10 minutes
    });

    // Create STAGED image record in DynamoDB with TTL
    const stagedImageItem = {
      PK: `STAGED#${imageId}`,
      SK: 'METADATA',
      EntityType: 'StagedImage',
      ImageId: imageId,
      FileName: fileName,
      FileSize: fileSize,
      ContentType: contentType,
      UploaderId: userId,
      S3Key: s3Key,
      Status: 'staged',
      CreatedAt: timestamp,
      TTL: ttl, // Auto-delete after 24 hours if not committed
      // GSI for user's staged images
      GSI1PK: `USER#${userId}`,
      GSI1SK: `STAGED#${timestamp}#${imageId}`
    };

    await dynamoClient.send(new PutItemCommand({
      TableName: process.env.TABLE_NAME!,
      Item: marshall(stagedImageItem)
    }));

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
    console.error('Error generating staged upload URL:', error);
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

// Confirm staged image upload (just marks as ready, doesn't associate yet)
export const confirmStagedImageUpload = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const imageId = event.pathParameters?.imageId;
    const userId = event.requestContext.authorizer?.claims?.sub;

    if (!imageId || !userId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    // Update staged image status
    await dynamoClient.send(new UpdateItemCommand({
      TableName: process.env.TABLE_NAME!,
      Key: marshall({
        PK: `STAGED#${imageId}`,
        SK: 'METADATA'
      }),
      UpdateExpression: 'SET #status = :status, UpdatedAt = :updated',
      ExpressionAttributeNames: {
        '#status': 'Status'
      },
      ExpressionAttributeValues: marshall({
        ':status': 'staged-ready',
        ':updated': new Date().toISOString()
      })
    }));

    // Generate temporary CloudFront URL (expires in 24 hours)
    const stagingDomain = process.env.CLOUDFRONT_STAGING_DOMAIN || process.env.CLOUDFRONT_IMAGES_DOMAIN;
    const imageUrl = `https://${stagingDomain}/staging/${userId}/${imageId}`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Staged upload confirmed',
        imageId,
        imageUrl,
        thumbnailUrl: imageUrl // Same for now, can be processed later
      })
    };

  } catch (error) {
    console.error('Error confirming staged upload:', error);
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

// Remove staged image (cleanup before TTL)
export const removeStagedImage = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const imageId = event.pathParameters?.imageId;
    const userId = event.requestContext.authorizer?.claims?.sub;

    if (!imageId || !userId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    // Get staged image record
    const getItemResponse = await dynamoClient.send(new QueryCommand({
      TableName: process.env.TABLE_NAME!,
      KeyConditionExpression: 'PK = :pk AND SK = :sk',
      ExpressionAttributeValues: marshall({
        ':pk': `STAGED#${imageId}`,
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
        body: JSON.stringify({ error: 'Staged image not found' })
      };
    }

    const stagedImage = unmarshall(getItemResponse.Items[0]);

    // Verify ownership
    if (stagedImage.UploaderId !== userId) {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    // Delete from S3
    await s3Client.send(new DeleteObjectCommand({
      Bucket: process.env.S3_STAGING_BUCKET_NAME || process.env.S3_IMAGES_BUCKET_NAME!,
      Key: stagedImage.S3Key
    }));

    // Delete from DynamoDB
    await dynamoClient.send(new DeleteItemCommand({
      TableName: process.env.TABLE_NAME!,
      Key: marshall({
        PK: `STAGED#${imageId}`,
        SK: 'METADATA'
      })
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Staged image removed' })
    };

  } catch (error) {
    console.error('Error removing staged image:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to remove staged image' })
    };
  }
};
//#endregion

//#region Images
// Generate upload URL for images
export const getImageUploadUrl = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
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
    const maxFileSize = parseInt(process.env.MAX_IMAGE_SIZE_MB || '10') * 1024 * 1024;
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: process.env.S3_IMAGES_BUCKET_NAME!,
      Key: s3Key,
      Conditions: [
        ['content-length-range', 0, maxFileSize],
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
        TableName: process.env.TABLE_NAME!,
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
    const userId = event.requestContext.authorizer?.claims?.sub;

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
      TableName: process.env.TABLE_NAME!,
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

// Delete image handler
export const deleteImage = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const imageId = event.pathParameters?.imageId;
    const userId = event.requestContext.authorizer?.claims?.sub;

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
      TableName: process.env.TABLE_NAME!,
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
        body: JSON.stringify({ error: 'Unauthorized - You can only delete your own images' })
      };
    }

    // Delete from S3 (original, optimized, and thumbnail)
    const deletePromises = [];
    
    // Delete original image
    if (imageRecord.S3Key) {
      deletePromises.push(
        s3Client.send(new DeleteObjectCommand({
          Bucket: process.env.S3_IMAGES_BUCKET_NAME!,
          Key: imageRecord.S3Key
        }))
      );
    }

    // Delete optimized version if exists
    if (imageRecord.OptimizedS3Key) {
      deletePromises.push(
        s3Client.send(new DeleteObjectCommand({
          Bucket: process.env.S3_IMAGES_BUCKET_NAME!,
          Key: imageRecord.OptimizedS3Key
        }))
      );
    }

    // Delete thumbnail if exists
    if (imageRecord.ThumbnailS3Key) {
      deletePromises.push(
        s3Client.send(new DeleteObjectCommand({
          Bucket: process.env.S3_IMAGES_BUCKET_NAME!,
          Key: imageRecord.ThumbnailS3Key
        }))
      );
    }

    // Execute S3 deletions
    await Promise.allSettled(deletePromises);

    // Delete image record from DynamoDB
    await dynamoClient.send(new DeleteItemCommand({
      TableName: process.env.TABLE_NAME!,
      Key: marshall({
        PK: `IMAGE#${imageId}`,
        SK: 'METADATA'
      })
    }));

    // Delete schematic association if exists
    if (imageRecord.SchematicId) {
      await dynamoClient.send(new DeleteItemCommand({
        TableName: process.env.TABLE_NAME!,
        Key: marshall({
          PK: `SCHEMATIC#${imageRecord.SchematicId}`,
          SK: `IMAGE#${imageId}`
        })
      }));
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Image deleted successfully',
        imageId
      })
    };

  } catch (error) {
    console.error('Error deleting image:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to delete image' })
    };
  }
};

// S3 Event handler for image processing
export const processImageUpload = async (event: S3Event): Promise<void> => {
  const sharp = require('sharp');
  
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    
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

      if (!getObjectResponse.Body) {
        throw new Error('No body in S3 response');
      }

      const originalBuffer = await streamToBuffer(getObjectResponse.Body as NodeJS.ReadableStream);

      // Process image with Sharp
      const imageMetadata = await sharp(originalBuffer).metadata();
      
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
        TableName: process.env.TABLE_NAME!,
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
          TableName: process.env.TABLE_NAME!,
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
//#endregion

//#region Utility functions
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

// Lambda to clean up expired staged images (runs on schedule)
export const cleanupExpiredStagedImages = async (): Promise<void> => {
  try {
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Query for expired staged images (TTL attribute is in the past)
    // Note: DynamoDB TTL cleanup happens automatically, but this ensures S3 cleanup
    const queryResponse = await dynamoClient.send(new QueryCommand({
      TableName: process.env.TABLE_NAME!,
      IndexName: 'GSI1', // Assuming GSI1 can be used to find staged images
      KeyConditionExpression: 'begins_with(GSI1PK, :staged)',
      FilterExpression: 'TTL < :now',
      ExpressionAttributeValues: marshall({
        ':staged': 'STAGED#',
        ':now': currentTime
      })
    }));

    if (!queryResponse.Items || queryResponse.Items.length === 0) {
      console.log('No expired staged images to clean up');
      return;
    }

    console.log(`Found ${queryResponse.Items.length} expired staged images to clean up`);

    for (const item of queryResponse.Items) {
      const stagedImage = unmarshall(item);
      
      try {
        // Delete from S3
        await s3Client.send(new DeleteObjectCommand({
          Bucket: process.env.S3_STAGING_BUCKET_NAME || process.env.S3_IMAGES_BUCKET_NAME!,
          Key: stagedImage.S3Key
        }));

        // Delete from DynamoDB (if TTL hasn't already removed it)
        await dynamoClient.send(new DeleteItemCommand({
          TableName: process.env.TABLE_NAME!,
          Key: marshall({
            PK: stagedImage.PK,
            SK: stagedImage.SK
          })
        }));

        console.log(`Cleaned up staged image: ${stagedImage.ImageId}`);
      } catch (error) {
        console.error(`Failed to clean up staged image ${stagedImage.ImageId}:`, error);
      }
    }

  } catch (error) {
    console.error('Error in cleanup job:', error);
  }
};
//#endregion