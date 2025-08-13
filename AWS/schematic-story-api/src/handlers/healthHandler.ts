import { APIGatewayProxyHandler } from 'aws-lambda';
import { ApiResponse } from '../utils/response';

export const health: APIGatewayProxyHandler = async (event) => {
  return ApiResponse.success({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.ENVIRONMENT || 'development',
    version: process.env.VERSION || '1.0.0'
  });
};