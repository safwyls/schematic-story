import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoService } from '../services/dynamoService';
import { S3Service } from '../services/s3Service';
import { ApiResponse } from '../utils/response';
import { Validator } from '../utils/validation';

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
export const createSchematic: APIGatewayProxyHandler = async (event) => {
  console.log('createSchematic event:', JSON.stringify(event));
  
  try {
    if (!event.body) {
      return ApiResponse.error('Request body is required', 400);
    }

    const body = JSON.parse(event.body);
    
    // In production, get this from JWT token
    // For now, accept it from the body or headers
    const authorId = event.headers['x-user-id'] || body.authorId;
    
    if (!authorId) {
      return ApiResponse.error('User ID is required', 400);
    }

    // Validate schematic data
    const validation = Validator.validateSchematicData(body);
    if (!validation.valid) {
      return ApiResponse.error('Validation failed', 400, validation.errors);
    }

    // Get author details
    const author = await DynamoService.getUser(authorId);
    if (!author) {
      return ApiResponse.error('Author not found', 404);
    }

    const schematic = await DynamoService.createSchematic(
      {
        title: Validator.sanitizeInput(body.title),
        description: body.description ? Validator.sanitizeInput(body.description) : '',
        authorId,
        authorUsername: author.username,
        tags: body.tags || [],
        status: 'active',
        version: 1,
        fileUrl: body.fileUrl,
        coverImageUrl: body.coverImageUrl,
        dimensions: body.dimensions,
        blockCount: body.blockCount
      },
      author.username
    );

    return ApiResponse.success(schematic, 201);
  } catch (error: any) {
    console.error('Error creating schematic:', error);
    return ApiResponse.error('Internal server error', 500);
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