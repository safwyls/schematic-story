import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoService } from '../services/dynamoService';
import { ApiResponse } from '../utils/response';
import { Validator } from '../utils/validation';

export const getUser: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.pathParameters?.userId;

    if (!userId) {
      return ApiResponse.error('User ID is required', 400);
    }

    const user = await DynamoService.getUser(userId);

    if (!user) {
      return ApiResponse.error('User not found', 404);
    }

    return ApiResponse.success(user);
  } catch (error) {
    console.error('Error getting user:', error);
    return ApiResponse.error('Internal server error');
  }
};

export const createUser: APIGatewayProxyHandler = async (event) => {
  try {
    if (!event.body) {
      return ApiResponse.error('Request body is required', 400);
    }

    const body = JSON.parse(event.body);
    const { username, email, displayName, bio } = body;

    // Validation
    if (!username || !email) {
      return ApiResponse.error('Username and email are required', 400);
    }

    if (!Validator.isValidUsername(username)) {
      return ApiResponse.error('Invalid username format', 400);
    }

    if (!Validator.isValidEmail(email)) {
      return ApiResponse.error('Invalid email format', 400);
    }

    const user = await DynamoService.createUser({
      username: Validator.sanitizeInput(username),
      email: email.toLowerCase(),
      displayName: displayName ? Validator.sanitizeInput(displayName) : undefined,
      bio: bio ? Validator.sanitizeInput(bio) : undefined,
      status: 'active'
    });

    return ApiResponse.success(user, 201);
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.name === 'ConditionalCheckFailedException') {
      return ApiResponse.error('User already exists', 409);
    }
    return ApiResponse.error('Internal server error');
  }
};

export const getUserSchematics: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.pathParameters?.userId;
    const limit = parseInt(event.queryStringParameters?.limit || '20');
    const nextToken = event.queryStringParameters?.nextToken;

    if (!userId) {
      return ApiResponse.error('User ID is required', 400);
    }

    if (limit < 1 || limit > 100) {
      return ApiResponse.error('Limit must be between 1 and 100', 400);
    }

    const result = await DynamoService.getUserSchematics(userId, limit, nextToken);

    return ApiResponse.paginated(result.items, result.count, result.nextToken);
  } catch (error) {
    console.error('Error getting user schematics:', error);
    return ApiResponse.error('Internal server error');
  }
};