import { APIGatewayProxyResult } from 'aws-lambda';

export class ApiResponse {
  static success(data: any, statusCode = 200): APIGatewayProxyResult {
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        data
      })
    };
  }

  static error(message: string, statusCode = 500, errors?: any): APIGatewayProxyResult {
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify({
        success: false,
        message,
        errors
      })
    };
  }

  static paginated<T>(items: T[], count: number, nextToken?: string): APIGatewayProxyResult {
    return this.success({
      items,
      count,
      pagination: {
        nextToken,
        hasMore: !!nextToken
      }
    });
  }
}