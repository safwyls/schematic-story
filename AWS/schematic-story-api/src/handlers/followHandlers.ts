// ==========================================
// src/handlers/followHandlers.ts
// ==========================================

import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoService } from '../services/dynamoService';
import { ApiResponse } from '../utils/response';

// POST /users/{userId}/follow
export const followUser: APIGatewayProxyHandler = async (event) => {
  console.log('followUser event:', JSON.stringify(event));
  
  try {
    const targetUserId = event.pathParameters?.userId;
    const followerId = event.headers['x-user-id'];

    if (!targetUserId) {
      return ApiResponse.error('Target user ID is required', 400);
    }

    if (!followerId) {
      return ApiResponse.error('User authentication required', 401);
    }

    if (targetUserId === followerId) {
      return ApiResponse.error('Cannot follow yourself', 400);
    }

    // Verify both users exist
    const [follower, target] = await Promise.all([
      DynamoService.getUser(followerId),
      DynamoService.getUser(targetUserId)
    ]);

    if (!follower || !target) {
      return ApiResponse.error('User not found', 404);
    }

    const result = await DynamoService.followUser(followerId, targetUserId);

    if (!result) {
      return ApiResponse.error('Already following this user', 400);
    }

    // Create notification
    await DynamoService.createNotification({
      userId: targetUserId,
      type: 'NEW_FOLLOWER',
      message: `${follower.username} started following you`,
      relatedEntityId: followerId,
      fromUserId: followerId
    });

    return ApiResponse.success({ message: 'Successfully followed user' });
  } catch (error: any) {
    console.error('Error following user:', error);
    return ApiResponse.error('Internal server error', 500);
  }
};

// DELETE /users/{userId}/follow
export const unfollowUser: APIGatewayProxyHandler = async (event) => {
  console.log('unfollowUser event:', JSON.stringify(event));
  
  try {
    const targetUserId = event.pathParameters?.userId;
    const followerId = event.headers['x-user-id'];

    if (!targetUserId) {
      return ApiResponse.error('Target user ID is required', 400);
    }

    if (!followerId) {
      return ApiResponse.error('User authentication required', 401);
    }

    const result = await DynamoService.unfollowUser(followerId, targetUserId);

    if (!result) {
      return ApiResponse.error('Not following this user', 400);
    }

    return ApiResponse.success({ message: 'Successfully unfollowed user' });
  } catch (error: any) {
    console.error('Error unfollowing user:', error);
    return ApiResponse.error('Internal server error', 500);
  }
};

// GET /users/{userId}/followers
export const getUserFollowers: APIGatewayProxyHandler = async (event) => {
  console.log('getUserFollowers event:', JSON.stringify(event));
  
  try {
    const userId = event.pathParameters?.userId;
    const limit = parseInt(event.queryStringParameters?.limit || '50');
    const nextToken = event.queryStringParameters?.nextToken;

    if (!userId) {
      return ApiResponse.error('User ID is required', 400);
    }

    const result = await DynamoService.getUserFollowers(userId, limit, nextToken);
    return ApiResponse.paginated(result.items, result.count, result.nextToken);
  } catch (error: any) {
    console.error('Error getting followers:', error);
    return ApiResponse.error('Internal server error', 500);
  }
};

// GET /users/{userId}/following
export const getUserFollowing: APIGatewayProxyHandler = async (event) => {
  console.log('getUserFollowing event:', JSON.stringify(event));
  
  try {
    const userId = event.pathParameters?.userId;
    const limit = parseInt(event.queryStringParameters?.limit || '50');
    const nextToken = event.queryStringParameters?.nextToken;

    if (!userId) {
      return ApiResponse.error('User ID is required', 400);
    }

    const result = await DynamoService.getUserFollowing(userId, limit, nextToken);
    return ApiResponse.paginated(result.items, result.count, result.nextToken);
  } catch (error: any) {
    console.error('Error getting following:', error);
    return ApiResponse.error('Internal server error', 500);
  }
};