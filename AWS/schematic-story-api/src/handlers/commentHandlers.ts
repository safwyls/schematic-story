// ==========================================
// src/handlers/commentHandlers.ts
// ==========================================

import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoService } from '../services/dynamoService';
import { ApiResponse } from '../utils/response';
import { Validator } from '../utils/validation';

// GET /schematics/{schematicId}/comments
export const getCommentsBySchematic: APIGatewayProxyHandler = async (event) => {
  console.log('getCommentsBySchematic event:', JSON.stringify(event));
  
  try {
    const schematicId = event.pathParameters?.schematicId;
    const limit = parseInt(event.queryStringParameters?.limit || '20');
    const nextToken = event.queryStringParameters?.nextToken;

    if (!schematicId) {
      return ApiResponse.error('Schematic ID is required', 400);
    }

    const result = await DynamoService.getCommentsBySchematic(schematicId, limit, nextToken);
    return ApiResponse.paginated(result.items, result.count, result.nextToken);
  } catch (error: any) {
    console.error('Error getting comments:', error);
    return ApiResponse.error('Internal server error', 500);
  }
};

// POST /schematics/{schematicId}/comments
export const createComment: APIGatewayProxyHandler = async (event) => {
  console.log('createComment event:', JSON.stringify(event));
  
  try {
    const schematicId = event.pathParameters?.schematicId;
    const userId = event.headers['x-user-id'];
    
    if (!schematicId || !event.body) {
      return ApiResponse.error('Schematic ID and body are required', 400);
    }

    if (!userId) {
      return ApiResponse.error('User authentication required', 401);
    }

    const { content } = JSON.parse(event.body);
    
    if (!content || content.trim().length < 1) {
      return ApiResponse.error('Comment content is required', 400);
    }

    if (content.length > 1000) {
      return ApiResponse.error('Comment must be less than 1000 characters', 400);
    }

    // Get user details
    const user = await DynamoService.getUser(userId);
    if (!user) {
      return ApiResponse.error('User not found', 404);
    }

    // Verify schematic exists
    const schematic = await DynamoService.getSchematic(schematicId);
    if (!schematic) {
      return ApiResponse.error('Schematic not found', 404);
    }

    const comment = await DynamoService.createComment({
      schematicId,
      authorId: userId,
      authorUsername: user.username,
      content: Validator.sanitizeInput(content),
      status: 'active'
    });

    // Create notification for schematic owner
    if (schematic.authorId !== userId) {
      await DynamoService.createNotification({
        userId: schematic.authorId,
        type: 'NEW_COMMENT',
        message: `${user.username} commented on your schematic "${schematic.title}"`,
        relatedEntityId: schematicId,
        fromUserId: userId
      });
    }

    return ApiResponse.success(comment, 201);
  } catch (error: any) {
    console.error('Error creating comment:', error);
    return ApiResponse.error('Internal server error', 500);
  }
};

// PUT /comments/{commentId}
export const updateComment: APIGatewayProxyHandler = async (event) => {
  console.log('updateComment event:', JSON.stringify(event));
  
  try {
    const commentId = event.pathParameters?.commentId;
    const userId = event.headers['x-user-id'];
    
    if (!commentId || !event.body) {
      return ApiResponse.error('Comment ID and body are required', 400);
    }

    if (!userId) {
      return ApiResponse.error('User authentication required', 401);
    }

    const { content } = JSON.parse(event.body);
    
    if (!content || content.trim().length < 1) {
      return ApiResponse.error('Comment content is required', 400);
    }

    const updated = await DynamoService.updateComment(commentId, userId, content);
    
    if (!updated) {
      return ApiResponse.error('Comment not found or unauthorized', 404);
    }

    return ApiResponse.success(updated);
  } catch (error: any) {
    console.error('Error updating comment:', error);
    return ApiResponse.error('Internal server error', 500);
  }
};

// DELETE /comments/{commentId}
export const deleteComment: APIGatewayProxyHandler = async (event) => {
  console.log('deleteComment event:', JSON.stringify(event));
  
  try {
    const commentId = event.pathParameters?.commentId;
    const userId = event.headers['x-user-id'];

    if (!commentId) {
      return ApiResponse.error('Comment ID is required', 400);
    }

    if (!userId) {
      return ApiResponse.error('User authentication required', 401);
    }

    const deleted = await DynamoService.deleteComment(commentId, userId);

    if (!deleted) {
      return ApiResponse.error('Comment not found or unauthorized', 404);
    }

    return ApiResponse.success({ message: 'Comment deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    return ApiResponse.error('Internal server error', 500);
  }
};