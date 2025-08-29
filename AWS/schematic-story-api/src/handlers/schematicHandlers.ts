import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoService } from '../services/dynamoService';
import { S3Service } from '../services/s3Service';
import { ApiResponse } from '../utils/response';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { S3Client, DeleteObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient, PutItemCommand, QueryCommand, UpdateItemCommand, DeleteItemCommand, BatchWriteItemCommand } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });

// GET /schematics/{schematicId}
export const getSchematic: APIGatewayProxyHandler = async (event) => {
  console.log('getSchematic event:', JSON.stringify(event));
  
  try {
    const schematicId = event.pathParameters?.schematicId;

    if (!schematicId) {
      return ApiResponse.error('Schematic ID is required', 400);
    }

    const schematic = await DynamoService.getSchematic(schematicId);

    if (!schematic) {
      return ApiResponse.error('Schematic not found', 404);
    }

    return ApiResponse.success(schematic);
  } catch (error: any) {
    console.error('Error getting schematic:', error);
    return ApiResponse.error('Internal server error', 500);
  }
};

// POST /schematics
export const createSchematic = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub;
    
    if (!userId) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    const body = JSON.parse(event.body || '{}');
    const {
      title,
      description,
      tags,
      contributors,
      dimensions,
      metadata,
      imageIds, // Array of staged image IDs
      coverImageId // Which image should be the cover
    } = body;

    if (!title || !imageIds || imageIds.length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Title and at least one image are required' })
      };
    }

    const schematicId = `sch-${uuidv4()}`;
    const timestamp = new Date().toISOString();

    // Step 1: Create schematic record
    const schematicItem = {
      PK: `SCHEMATIC#${schematicId}`,
      SK: 'METADATA',
      EntityType: 'Schematic',
      SchematicId: schematicId,
      Title: title,
      Description: description || '',
      AuthorId: userId,
      Status: 'draft', // Will be 'active' after file upload
      Tags: tags || [],
      Contributors: contributors || [],
      Dimensions: dimensions || {},
      Metadata: metadata || {},
      CoverImageId: coverImageId || imageIds[0],
      CreatedAt: timestamp,
      UpdatedAt: timestamp,
      Version: 1,
      ViewCount: 0,
      Downloads: 0,
      // GSI projections
      GSI1PK: `USER#${userId}`,
      GSI1SK: `SCHEMATIC#${timestamp}#${schematicId}`,
      GSI4PK: 'FEED#LATEST',
      GSI4SK: `${timestamp}#SCHEMATIC#${schematicId}`
    };

    // Step 2: Prepare batch operations for committing images
    const batchOperations = [];
    
    for (const imageId of imageIds) {
      // Get staged image data
      const stagedResponse = await dynamoClient.send(new QueryCommand({
        TableName: process.env.TABLE_NAME!,
        KeyConditionExpression: 'PK = :pk AND SK = :sk',
        ExpressionAttributeValues: marshall({
          ':pk': `STAGED#${imageId}`,
          ':sk': 'METADATA'
        })
      }));

      if (!stagedResponse.Items || stagedResponse.Items.length === 0) {
        console.warn(`Staged image ${imageId} not found`);
        continue;
      }

      const stagedImage = unmarshall(stagedResponse.Items[0]);
      
      // Verify ownership
      if (stagedImage.UploaderId !== userId) {
        console.warn(`User ${userId} doesn't own staged image ${imageId}`);
        continue;
      }

      // Move image from staging to permanent location in S3
      const newS3Key = `gallery/${schematicId}/${imageId}-${stagedImage.FileName}`;
      
      await s3Client.send(new CopyObjectCommand({
        Bucket: process.env.S3_IMAGES_BUCKET_NAME!,
        CopySource: `${process.env.S3_STAGING_BUCKET_NAME || process.env.S3_IMAGES_BUCKET_NAME}/${stagedImage.S3Key}`,
        Key: newS3Key,
        MetadataDirective: 'COPY'
      }));

      // Delete from staging
      await s3Client.send(new DeleteObjectCommand({
        Bucket: process.env.S3_STAGING_BUCKET_NAME || process.env.S3_IMAGES_BUCKET_NAME!,
        Key: stagedImage.S3Key
      }));

      // Create permanent image record
      const imageItem = {
        PK: `IMAGE#${imageId}`,
        SK: 'METADATA',
        EntityType: 'Image',
        ImageId: imageId,
        FileName: stagedImage.FileName,
        FileSize: stagedImage.FileSize,
        ContentType: stagedImage.ContentType,
        ImageType: imageId === coverImageId ? 'cover' : 'gallery',
        UploaderId: userId,
        SchematicId: schematicId,
        S3Key: newS3Key,
        Status: 'active',
        CreatedAt: timestamp,
        UpdatedAt: timestamp,
        GSI1PK: `SCHEMATIC#${schematicId}`,
        GSI1SK: `IMAGE#${timestamp}#${imageId}`
      };

      // Create schematic-image association
      const associationItem = {
        PK: `SCHEMATIC#${schematicId}`,
        SK: `IMAGE#${imageId}`,
        EntityType: 'SchematicImage',
        SchematicId: schematicId,
        ImageId: imageId,
        ImageType: imageId === coverImageId ? 'cover' : 'gallery',
        CreatedAt: timestamp
      };

      batchOperations.push(
        { PutRequest: { Item: marshall(imageItem) } },
        { PutRequest: { Item: marshall(associationItem) } }
      );
    }

    // Step 3: Write everything to DynamoDB
    await dynamoClient.send(new PutItemCommand({
      TableName: process.env.TABLE_NAME!,
      Item: marshall(schematicItem)
    }));

    // Batch write image records (max 25 items per batch)
    const chunks = [];
    for (let i = 0; i < batchOperations.length; i += 25) {
      chunks.push(batchOperations.slice(i, i + 25));
    }

    for (const chunk of chunks) {
      await dynamoClient.send(new BatchWriteItemCommand({
        RequestItems: {
          [process.env.TABLE_NAME!]: chunk
        }
      }));
    }

    // Step 4: Clean up staged records
    for (const imageId of imageIds) {
      await dynamoClient.send(new DeleteItemCommand({
        TableName: process.env.TABLE_NAME!,
        Key: marshall({
          PK: `STAGED#${imageId}`,
          SK: 'METADATA'
        })
      })).catch(err => console.warn(`Failed to delete staged record for ${imageId}:`, err));
    }

    // Step 5: Create tags
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        const tagItem = {
          PK: `SCHEMATIC#${schematicId}`,
          SK: `TAG#${tag}`,
          EntityType: 'SchematicTag',
          SchematicId: schematicId,
          TagName: tag,
          CreatedAt: timestamp,
          GSI2PK: `TAG#${tag}`,
          GSI2SK: `${timestamp}#SCHEMATIC#${schematicId}`
        };

        await dynamoClient.send(new PutItemCommand({
          TableName: process.env.TABLE_NAME!,
          Item: marshall(tagItem)
        }));
      }
    }

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        schematicId,
        message: 'Schematic created successfully'
      })
    };

  } catch (error) {
    console.error('Error creating schematic:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to create schematic' })
    };
  }
};

// GET /schematics/uploadUrl upload URL for schematic file
export const getSchematicFileUploadUrl = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub;
    
    if (!userId) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    const body = JSON.parse(event.body || '{}');
    const { schematicId, fileName, fileSize, contentType } = body;

    if (!schematicId || !fileName || !fileSize) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Verify user owns the schematic
    const schematicResponse = await dynamoClient.send(new QueryCommand({
      TableName: process.env.TABLE_NAME!,
      KeyConditionExpression: 'PK = :pk AND SK = :sk',
      ExpressionAttributeValues: marshall({
        ':pk': `SCHEMATIC#${schematicId}`,
        ':sk': 'METADATA'
      })
    }));

    if (!schematicResponse.Items || schematicResponse.Items.length === 0) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Schematic not found' })
      };
    }

    const schematic = unmarshall(schematicResponse.Items[0]);
    
    if (schematic.AuthorId !== userId) {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    // Generate S3 key for schematic file
    const s3Key = `schematics/${schematicId}/${fileName}`;

    // Create presigned POST URL
    const maxFileSize = parseInt(process.env.MAX_SCHEMATIC_SIZE_MB || '50') * 1024 * 1024;
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: process.env.S3_SCHEMATICS_BUCKET_NAME || process.env.S3_IMAGES_BUCKET_NAME!,
      Key: s3Key,
      Conditions: [
        ['content-length-range', 0, maxFileSize],
      ],
      Fields: {
        'Content-Type': contentType || 'application/json',
      },
      Expires: 600, // 10 minutes
    });

    // Update schematic record with file info
    await dynamoClient.send(new UpdateItemCommand({
      TableName: process.env.TABLE_NAME!,
      Key: marshall({
        PK: `SCHEMATIC#${schematicId}`,
        SK: 'METADATA'
      }),
      UpdateExpression: 'SET FileS3Key = :s3Key, FileName = :fileName, FileSize = :fileSize, UpdatedAt = :updated',
      ExpressionAttributeValues: marshall({
        ':s3Key': s3Key,
        ':fileName': fileName,
        ':fileSize': fileSize,
        ':updated': new Date().toISOString()
      })
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        uploadUrl: url,
        fields
      })
    };

  } catch (error) {
    console.error('Error generating schematic file upload URL:', error);
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

// GET /schematics/{schematicId}/confirmUpload Confirm schematic upload (after file is uploaded)
export const confirmSchematicUpload = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const schematicId = event.pathParameters?.schematicId;
    const userId = event.requestContext.authorizer?.claims?.sub;

    if (!schematicId || !userId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    // Update schematic status from draft to active
    const updateResult = await dynamoClient.send(new UpdateItemCommand({
      TableName: process.env.TABLE_NAME!,
      Key: marshall({
        PK: `SCHEMATIC#${schematicId}`,
        SK: 'METADATA'
      }),
      UpdateExpression: 'SET #status = :status, UpdatedAt = :updated',
      ExpressionAttributeNames: {
        '#status': 'Status'
      },
      ExpressionAttributeValues: marshall({
        ':status': 'active',
        ':updated': new Date().toISOString(),
        ':userId': userId
      }),
      ConditionExpression: 'AuthorId = :userId',
      ReturnValues: 'ALL_NEW'
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Schematic upload confirmed',
        schematicId
      })
    };

  } catch (error) {
    console.error('Error confirming schematic:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to confirm schematic' })
    };
  }
};

// PUT /schematics/{schematicId}
export const updateSchematic: APIGatewayProxyHandler = async (event) => {
  console.log('updateSchematic event:', JSON.stringify(event));
  
  try {
    const schematicId = event.pathParameters?.schematicId;
    const userId = event.headers['x-user-id'];
    
    if (!schematicId || !event.body) {
      return ApiResponse.error('Schematic ID and body are required', 400);
    }

    if (!userId) {
      return ApiResponse.error('User authentication required', 401);
    }

    const updates = JSON.parse(event.body);
    
    // Validate updates
    if (updates.title && (updates.title.length < 3 || updates.title.length > 100)) {
      return ApiResponse.error('Title must be between 3 and 100 characters', 400);
    }

    const updated = await DynamoService.updateSchematic(schematicId, userId, updates);
    
    if (!updated) {
      return ApiResponse.error('Schematic not found or unauthorized', 404);
    }

    return ApiResponse.success(updated);
  } catch (error: any) {
    console.error('Error updating schematic:', error);
    return ApiResponse.error('Internal server error', 500);
  }
};

// DELETE /schematics/{schematicId}
export const deleteSchematic: APIGatewayProxyHandler = async (event) => {
  console.log('deleteSchematic event:', JSON.stringify(event));
  
  try {
    const schematicId = event.pathParameters?.schematicId;
    const userId = event.headers['x-user-id'];

    if (!schematicId) {
      return ApiResponse.error('Schematic ID is required', 400);
    }

    if (!userId) {
      return ApiResponse.error('User authentication required', 401);
    }

    const deleted = await DynamoService.softDeleteSchematic(schematicId, userId);

    if (!deleted) {
      return ApiResponse.error('Schematic not found or unauthorized', 404);
    }

    return ApiResponse.success({ message: 'Schematic deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting schematic:', error);
    return ApiResponse.error('Internal server error', 500);
  }
};

// GET /schematics/feed/latest
export const getLatestSchematics: APIGatewayProxyHandler = async (event) => {
  console.log('getLatestSchematics event:', JSON.stringify(event));
  
  try {
    const limit = parseInt(event.queryStringParameters?.limit || '20');
    const nextToken = event.queryStringParameters?.nextToken;

    if (limit < 1 || limit > 100) {
      return ApiResponse.error('Limit must be between 1 and 100', 400);
    }

    const result = await DynamoService.getLatestSchematics(limit, nextToken);
    return ApiResponse.paginated(result.items, result.count, result.nextToken);
  } catch (error: any) {
    console.error('Error getting latest schematics:', error);
    return ApiResponse.error('Internal server error', 500);
  }
};

// GET /schematics/tag/{tagName}
export const getSchematicsByTag: APIGatewayProxyHandler = async (event) => {
  console.log('getSchematicsByTag event:', JSON.stringify(event));
  
  try {
    const tagName = event.pathParameters?.tagName;
    const limit = parseInt(event.queryStringParameters?.limit || '20');
    const nextToken = event.queryStringParameters?.nextToken;

    if (!tagName) {
      return ApiResponse.error('Tag name is required', 400);
    }

    const result = await DynamoService.getSchematicsByTag(tagName, limit, nextToken);
    return ApiResponse.paginated(result.items, result.count, result.nextToken);
  } catch (error: any) {
    console.error('Error getting schematics by tag:', error);
    return ApiResponse.error('Internal server error', 500);
  }
};

// GET /schematics/{schematicId}/download-url
export const getSchematicDownloadUrl: APIGatewayProxyHandler = async (event) => {
  console.log('getSchematicDownloadUrl event:', JSON.stringify(event));
  
  try {
    const schematicId = event.pathParameters?.schematicId;

    if (!schematicId) {
      return ApiResponse.error('Schematic ID is required', 400);
    }

    // Get schematic to verify it exists and get S3 key
    const schematic = await DynamoService.getSchematic(schematicId);
    if (!schematic) {
      return ApiResponse.error('Schematic not found', 404);
    }

    // Increment download count
    await DynamoService.incrementSchematicStat(schematicId, 'DownloadCount');

    // Generate presigned URL for download
    const downloadUrl = await S3Service.getDownloadUrl(schematicId);

    return ApiResponse.success({ 
      downloadUrl,
      expiresIn: 3600, // 1 hour
      filename: `${schematic.title.replace(/[^a-z0-9]/gi, '_')}.schematic`
    });
  } catch (error: any) {
    console.error('Error getting download URL:', error);
    return ApiResponse.error('Internal server error', 500);
  }
};

// POST /schematics/{schematicId}/upload-url
export const getSchematicUploadUrl: APIGatewayProxyHandler = async (event) => {
  console.log('getSchematicUploadUrl event:', JSON.stringify(event));
  
  try {
    const userId = event.headers['x-user-id'];
    
    if (!userId) {
      return ApiResponse.error('User authentication required', 401);
    }

    if (!event.body) {
      return ApiResponse.error('Request body is required', 400);
    }

    const { filename, contentType } = JSON.parse(event.body);
    
    if (!filename) {
      return ApiResponse.error('Filename is required', 400);
    }

    // Generate unique key for S3
    const timestamp = Date.now();
    const safeFilename = filename.replace(/[^a-z0-9.-]/gi, '_');
    const s3Key = `schematics/${userId}/${timestamp}-${safeFilename}`;

    // Generate presigned URL for upload
    const uploadUrl = await S3Service.getUploadUrl(s3Key, contentType);

    return ApiResponse.success({ 
      uploadUrl,
      s3Key,
      expiresIn: 3600 // 1 hour
    });
  } catch (error: any) {
    console.error('Error getting upload URL:', error);
    return ApiResponse.error('Internal server error', 500);
  }
};