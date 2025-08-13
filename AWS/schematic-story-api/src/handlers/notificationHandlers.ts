// ==========================================
// src/handlers/notificationHandlers.ts
// ==========================================

import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoService } from '../services/dynamoService';
import { ApiResponse } from '../utils/response';

// GET /users/{userId}/notifications
export const getUserNotifications: APIGatewayProxyHandler = async (event) => {
  console.log('getUserNotifications event:', JSON.stringify(event));
  
  try {
    const userId = event.pathParameters?.userId;
    const requestingUserId = event.headers['x-user-id'];
    const limit = parseInt(event.queryStringParameters?.limit || '20');
    const nextToken = event.queryStringParameters?.nextToken;
    const unreadOnly = event.queryStringParameters?.unreadOnly === 'true';

    if (!userId) {
      return ApiResponse.error('User ID is required', 400);
    }

    // Users can only get their own notifications
    if (userId !== requestingUserId) {
      return ApiResponse.error('Unauthorized', 403);
    }

    const result = await DynamoService.getUserNotifications(userId, limit, nextToken, unreadOnly);
    return ApiResponse.paginated(result.items, result.count, result.nextToken);
  } catch (error: any) {
    console.error('Error getting notifications:', error);
    return ApiResponse.error('Internal server error', 500);
  }
};

// PUT /notifications/{notificationId}/read
export const markNotificationRead: APIGatewayProxyHandler = async (event) => {
  console.log('markNotificationRead event:', JSON.stringify(event));
  
  try {
    const notificationId = event.pathParameters?.notificationId;
    const userId = event.headers['x-user-id'];

    if (!notificationId) {
      return ApiResponse.error('Notification ID is required', 400);
    }

    if (!userId) {
      return ApiResponse.error('User authentication required', 401);
    }

    const result = await DynamoService.markNotificationAsRead(notificationId, userId);

    if (!result) {
      return ApiResponse.error('Notification not found or unauthorized', 404);
    }

    return ApiResponse.success({ message: 'Notification marked as read' });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return ApiResponse.error('Internal server error', 500);
  }
};

// PUT /users/{userId}/notifications/read-all
export const markAllNotificationsRead: APIGatewayProxyHandler = async (event) => {
  console.log('markAllNotificationsRead event:', JSON.stringify(event));
  
  try {
    const userId = event.pathParameters?.userId;
    const requestingUserId = event.headers['x-user-id'];

    if (!userId) {
      return ApiResponse.error('User ID is required', 400);
    }

    if (userId !== requestingUserId) {
      return ApiResponse.error('Unauthorized', 403);
    }

    await DynamoService.markAllNotificationsAsRead(userId);

    return ApiResponse.success({ message: 'All notifications marked as read' });
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    return ApiResponse.error('Internal server error', 500);
  }
};