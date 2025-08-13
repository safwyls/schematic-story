// src/services/dynamoService.ts - Complete Implementation

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  BatchGetCommand,
  TransactWriteCommand,
  BatchWriteCommand
} from '@aws-sdk/lib-dynamodb';
import { User, Schematic, Comment, PaginatedResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true
  }
});

const TABLE_NAME = process.env.TABLE_NAME || 'SchematicStoryTable';

export class DynamoService {
  // ==========================================
  // USER OPERATIONS
  // ==========================================
  
  static async getUser(userId: string): Promise<User | null> {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: 'METADATA'
      }
    }));

    if (!result.Item || result.Item.Status === 'deleted') {
      return null;
    }

    return this.mapToUser(result.Item);
  }

  static async createUser(userData: Omit<User, 'userId' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    const item = {
      PK: `USER#${userId}`,
      SK: 'METADATA',
      EntityType: 'User',
      UserId: userId,
      Username: userData.username,
      Email: userData.email,
      DisplayName: userData.displayName || userData.username,
      Bio: userData.bio || '',
      Status: 'active',
      CreatedAt: timestamp,
      UpdatedAt: timestamp,
      GSI1PK: `USER#${userId}`,
      GSI1SK: `USER#${timestamp}`
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
      ConditionExpression: 'attribute_not_exists(PK)'
    }));

    // Initialize user stats
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${userId}`,
        SK: 'STATS',
        EntityType: 'UserStats',
        SchematicCount: 0,
        FollowerCount: 0,
        FollowingCount: 0,
        UpdatedAt: timestamp
      }
    }));

    return this.mapToUser(item);
  }

  static async getUserStats(userId: string): Promise<any> {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: 'STATS'
      }
    }));

    return result.Item || { SchematicCount: 0, FollowerCount: 0, FollowingCount: 0 };
  }

  // ==========================================
  // SCHEMATIC OPERATIONS
  // ==========================================

  static async getSchematic(schematicId: string): Promise<Schematic | null> {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `SCHEMATIC#${schematicId}`,
        SK: 'METADATA'
      }
    }));

    if (!result.Item || result.Item.Status === 'deleted') {
      return null;
    }

    // Increment view count asynchronously
    this.incrementSchematicStat(schematicId, 'ViewCount').catch(console.error);

    return this.mapToSchematic(result.Item);
  }

  static async createSchematic(
    schematicData: Omit<Schematic, 'schematicId' | 'createdAt' | 'updatedAt'>,
    authorUsername: string
  ): Promise<Schematic> {
    const schematicId = `sch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    const item = {
      PK: `SCHEMATIC#${schematicId}`,
      SK: 'METADATA',
      EntityType: 'Schematic',
      SchematicId: schematicId,
      Title: schematicData.title,
      Description: schematicData.description,
      AuthorId: schematicData.authorId,
      AuthorUsername: authorUsername,
      Tags: schematicData.tags || [],
      Status: 'active',
      Version: 1,
      FileUrl: schematicData.fileUrl,
      CoverImageUrl: schematicData.coverImageUrl,
      Dimensions: schematicData.dimensions,
      BlockCount: schematicData.blockCount,
      CreatedAt: timestamp,
      UpdatedAt: timestamp,
      GSI1PK: `USER#${schematicData.authorId}`,
      GSI1SK: `SCHEMATIC#${timestamp}#${schematicId}`,
      GSI4PK: 'FEED#LATEST',
      GSI4SK: `${timestamp}#SCHEMATIC#${schematicId}`
    };

    // Use transaction to create schematic and update user stats
    await docClient.send(new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: TABLE_NAME,
            Item: item
          }
        },
        {
          Update: {
            TableName: TABLE_NAME,
            Key: {
              PK: `USER#${schematicData.authorId}`,
              SK: 'STATS'
            },
            UpdateExpression: 'ADD SchematicCount :inc',
            ExpressionAttributeValues: {
              ':inc': 1
            }
          }
        }
      ]
    }));

    // Create schematic stats
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `SCHEMATIC#${schematicId}`,
        SK: 'STATS',
        EntityType: 'SchematicStats',
        ViewCount: 0,
        LikeCount: 0,
        CommentCount: 0,
        DownloadCount: 0,
        UpdatedAt: timestamp
      }
    }));

    // Add tags to GSI2
    if (schematicData.tags && schematicData.tags.length > 0) {
      await Promise.all(schematicData.tags.map(tag =>
        docClient.send(new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `SCHEMATIC#${schematicId}`,
            SK: `TAG#${tag}`,
            EntityType: 'SchematicTag',
            TagName: tag,
            GSI2PK: `TAG#${tag}`,
            GSI2SK: `${timestamp}#SCHEMATIC#${schematicId}`
          }
        }))
      ));
    }

    return this.mapToSchematic(item);
  }

  static async updateSchematic(
    schematicId: string,
    userId: string,
    updates: Partial<Schematic>
  ): Promise<Schematic | null> {
    const timestamp = new Date().toISOString();
    
    // Build update expression
    const updateParts: string[] = ['UpdatedAt = :timestamp'];
    const expressionValues: any = { ':timestamp': timestamp, ':userId': userId };
    const expressionNames: any = {};

    if (updates.title) {
      updateParts.push('#title = :title');
      expressionValues[':title'] = updates.title;
      expressionNames['#title'] = 'Title';
    }

    if (updates.description !== undefined) {
      updateParts.push('#desc = :desc');
      expressionValues[':desc'] = updates.description;
      expressionNames['#desc'] = 'Description';
    }

    if (updates.tags) {
      updateParts.push('Tags = :tags');
      expressionValues[':tags'] = updates.tags;
    }

    try {
      const result = await docClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `SCHEMATIC#${schematicId}`,
          SK: 'METADATA'
        },
        UpdateExpression: `SET ${updateParts.join(', ')}`,
        ConditionExpression: 'AuthorId = :userId',
        ExpressionAttributeNames: Object.keys(expressionNames).length > 0 ? expressionNames : undefined,
        ExpressionAttributeValues: expressionValues,
        ReturnValues: 'ALL_NEW'
      }));

      return result.Attributes ? this.mapToSchematic(result.Attributes) : null;
    } catch (error: any) {
      if (error.name === 'ConditionalCheckFailedException') {
        return null;
      }
      throw error;
    }
  }

  static async softDeleteSchematic(schematicId: string, userId: string): Promise<boolean> {
    const timestamp = new Date().toISOString();

    try {
      await docClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `SCHEMATIC#${schematicId}`,
          SK: 'METADATA'
        },
        UpdateExpression: 'SET #status = :deleted, DeletedAt = :timestamp, UpdatedAt = :timestamp',
        ConditionExpression: 'AuthorId = :userId AND #status = :active',
        ExpressionAttributeNames: {
          '#status': 'Status'
        },
        ExpressionAttributeValues: {
          ':deleted': 'deleted',
          ':active': 'active',
          ':userId': userId,
          ':timestamp': timestamp
        }
      }));

      // Update user stats
      await docClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: 'STATS'
        },
        UpdateExpression: 'ADD SchematicCount :dec',
        ExpressionAttributeValues: {
          ':dec': -1
        }
      }));

      return true;
    } catch (error: any) {
      if (error.name === 'ConditionalCheckFailedException') {
        return false;
      }
      throw error;
    }
  }

  static async getUserSchematics(
    userId: string,
    limit = 20,
    nextToken?: string
  ): Promise<PaginatedResponse<Schematic>> {
    let exclusiveStartKey;
    if (nextToken) {
      try {
        exclusiveStartKey = JSON.parse(Buffer.from(nextToken, 'base64').toString());
      } catch {
        throw new Error('Invalid pagination token');
      }
    }

    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI1PK-GSI1SK-index',
      KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
      FilterExpression: '#status <> :deleted',
      ExpressionAttributeNames: {
        '#status': 'Status'
      },
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'SCHEMATIC#',
        ':deleted': 'deleted'
      },
      Limit: limit,
      ScanIndexForward: false,
      ExclusiveStartKey: exclusiveStartKey
    }));

    const items = result.Items?.map(item => this.mapToSchematic(item)) || [];
    
    return {
      items,
      count: items.length,
      nextToken: result.LastEvaluatedKey 
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
        : undefined
    };
  }

  static async getLatestSchematics(
    limit = 20,
    nextToken?: string
  ): Promise<PaginatedResponse<Schematic>> {
    let exclusiveStartKey;
    if (nextToken) {
      try {
        exclusiveStartKey = JSON.parse(Buffer.from(nextToken, 'base64').toString());
      } catch {
        throw new Error('Invalid pagination token');
      }
    }

    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI4PK-GSI4SK-index',
      KeyConditionExpression: 'GSI4PK = :pk',
      FilterExpression: '#status <> :deleted',
      ExpressionAttributeNames: {
        '#status': 'Status'
      },
      ExpressionAttributeValues: {
        ':pk': 'FEED#LATEST',
        ':deleted': 'deleted'
      },
      Limit: limit,
      ScanIndexForward: false,
      ExclusiveStartKey: exclusiveStartKey
    }));

    const items = result.Items?.map(item => this.mapToSchematic(item)) || [];
    
    return {
      items,
      count: items.length,
      nextToken: result.LastEvaluatedKey 
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
        : undefined
    };
  }

  static async getSchematicsByTag(
    tagName: string,
    limit = 20,
    nextToken?: string
  ): Promise<PaginatedResponse<Schematic>> {
    let exclusiveStartKey;
    if (nextToken) {
      try {
        exclusiveStartKey = JSON.parse(Buffer.from(nextToken, 'base64').toString());
      } catch {
        throw new Error('Invalid pagination token');
      }
    }

    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI2PK-GSI2SK-index',
      KeyConditionExpression: 'GSI2PK = :pk',
      FilterExpression: '#status <> :deleted',
      ExpressionAttributeNames: {
        '#status': 'Status'
      },
      ExpressionAttributeValues: {
        ':pk': `TAG#${tagName}`,
        ':deleted': 'deleted'
      },
      Limit: limit,
      ScanIndexForward: false,
      ExclusiveStartKey: exclusiveStartKey
    }));

    const items = result.Items?.map(item => this.mapToSchematic(item)) || [];
    
    return {
      items,
      count: items.length,
      nextToken: result.LastEvaluatedKey 
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
        : undefined
    };
  }

  static async incrementSchematicStat(schematicId: string, statName: string): Promise<void> {
    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `SCHEMATIC#${schematicId}`,
        SK: 'STATS'
      },
      UpdateExpression: `ADD ${statName} :inc`,
      ExpressionAttributeValues: {
        ':inc': 1
      }
    }));
  }

  // ==========================================
  // COMMENT OPERATIONS
  // ==========================================

  static async createComment(commentData: {
    schematicId: string;
    authorId: string;
    authorUsername: string;
    content: string;
    status: string;
  }): Promise<Comment> {
    const commentId = `com-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    const item = {
      PK: `COMMENT#${commentId}`,
      SK: 'METADATA',
      EntityType: 'Comment',
      CommentId: commentId,
      SchematicId: commentData.schematicId,
      AuthorId: commentData.authorId,
      AuthorUsername: commentData.authorUsername,
      Content: commentData.content,
      Status: 'active',
      CreatedAt: timestamp,
      UpdatedAt: timestamp,
      GSI1PK: `USER#${commentData.authorId}`,
      GSI1SK: `COMMENT#${timestamp}#${commentId}`,
      GSI3PK: `SCHEMATIC#${commentData.schematicId}`,
      GSI3SK: `${timestamp}#COMMENT#${commentId}`
    };

    // Create comment and update stats
    await docClient.send(new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: TABLE_NAME,
            Item: item
          }
        },
        {
          Update: {
            TableName: TABLE_NAME,
            Key: {
              PK: `SCHEMATIC#${commentData.schematicId}`,
              SK: 'STATS'
            },
            UpdateExpression: 'ADD CommentCount :inc',
            ExpressionAttributeValues: {
              ':inc': 1
            }
          }
        }
      ]
    }));

    return this.mapToComment(item);
  }

  static async getCommentsBySchematic(
    schematicId: string,
    limit = 20,
    nextToken?: string
  ): Promise<PaginatedResponse<Comment>> {
    let exclusiveStartKey;
    if (nextToken) {
      try {
        exclusiveStartKey = JSON.parse(Buffer.from(nextToken, 'base64').toString());
      } catch {
        throw new Error('Invalid pagination token');
      }
    }

    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI3PK-GSI3SK-index',
      KeyConditionExpression: 'GSI3PK = :pk',
      FilterExpression: '#status <> :deleted',
      ExpressionAttributeNames: {
        '#status': 'Status'
      },
      ExpressionAttributeValues: {
        ':pk': `SCHEMATIC#${schematicId}`,
        ':deleted': 'deleted'
      },
      Limit: limit,
      ScanIndexForward: false,
      ExclusiveStartKey: exclusiveStartKey
    }));

    const items = result.Items?.map(item => this.mapToComment(item)) || [];
    
    return {
      items,
      count: items.length,
      nextToken: result.LastEvaluatedKey 
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
        : undefined
    };
  }

  static async updateComment(commentId: string, userId: string, content: string): Promise<Comment | null> {
    const timestamp = new Date().toISOString();

    try {
      const result = await docClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `COMMENT#${commentId}`,
          SK: 'METADATA'
        },
        UpdateExpression: 'SET Content = :content, UpdatedAt = :timestamp, #status = :edited',
        ConditionExpression: 'AuthorId = :userId',
        ExpressionAttributeNames: {
          '#status': 'Status'
        },
        ExpressionAttributeValues: {
          ':content': content,
          ':timestamp': timestamp,
          ':edited': 'edited',
          ':userId': userId
        },
        ReturnValues: 'ALL_NEW'
      }));

      return result.Attributes ? this.mapToComment(result.Attributes) : null;
    } catch (error: any) {
      if (error.name === 'ConditionalCheckFailedException') {
        return null;
      }
      throw error;
    }
  }

  static async deleteComment(commentId: string, userId: string): Promise<boolean> {
    const timestamp = new Date().toISOString();

    try {
      await docClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `COMMENT#${commentId}`,
          SK: 'METADATA'
        },
        UpdateExpression: 'SET #status = :deleted, DeletedAt = :timestamp',
        ConditionExpression: 'AuthorId = :userId',
        ExpressionAttributeNames: {
          '#status': 'Status'
        },
        ExpressionAttributeValues: {
          ':deleted': 'deleted',
          ':timestamp': timestamp,
          ':userId': userId
        }
      }));

      return true;
    } catch (error: any) {
      if (error.name === 'ConditionalCheckFailedException') {
        return false;
      }
      throw error;
    }
  }

  // ==========================================
  // FOLLOW OPERATIONS
  // ==========================================

  static async followUser(followerId: string, followeeId: string): Promise<boolean> {
    const timestamp = new Date().toISOString();

    try {
      await docClient.send(new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: TABLE_NAME,
              Item: {
                PK: `USER#${followerId}`,
                SK: `FOLLOWING#${followeeId}`,
                EntityType: 'UserFollow',
                FollowerId: followerId,
                FolloweeId: followeeId,
                CreatedAt: timestamp,
                GSI5PK: `FOLLOWEE#${followeeId}`,
                GSI5SK: `${timestamp}#USER#${followerId}`
              },
              ConditionExpression: 'attribute_not_exists(PK)'
            }
          },
          {
            Update: {
              TableName: TABLE_NAME,
              Key: {
                PK: `USER#${followerId}`,
                SK: 'STATS'
              },
              UpdateExpression: 'ADD FollowingCount :inc',
              ExpressionAttributeValues: {
                ':inc': 1
              }
            }
          },
          {
            Update: {
              TableName: TABLE_NAME,
              Key: {
                PK: `USER#${followeeId}`,
                SK: 'STATS'
              },
              UpdateExpression: 'ADD FollowerCount :inc',
              ExpressionAttributeValues: {
                ':inc': 1
              }
            }
          }
        ]
      }));

      return true;
    } catch (error: any) {
      if (error.name === 'TransactionCanceledException') {
        return false;
      }
      throw error;
    }
  }

  static async unfollowUser(followerId: string, followeeId: string): Promise<boolean> {
    try {
      await docClient.send(new TransactWriteCommand({
        TransactItems: [
          {
            Delete: {
              TableName: TABLE_NAME,
              Key: {
                PK: `USER#${followerId}`,
                SK: `FOLLOWING#${followeeId}`
              },
              ConditionExpression: 'attribute_exists(PK)'
            }
          },
          {
            Update: {
              TableName: TABLE_NAME,
              Key: {
                PK: `USER#${followerId}`,
                SK: 'STATS'
              },
              UpdateExpression: 'ADD FollowingCount :dec',
              ExpressionAttributeValues: {
                ':dec': -1
              }
            }
          },
          {
            Update: {
              TableName: TABLE_NAME,
              Key: {
                PK: `USER#${followeeId}`,
                SK: 'STATS'
              },
              UpdateExpression: 'ADD FollowerCount :dec',
              ExpressionAttributeValues: {
                ':dec': -1
              }
            }
          }
        ]
      }));

      return true;
    } catch (error: any) {
      if (error.name === 'TransactionCanceledException') {
        return false;
      }
      throw error;
    }
  }

  static async getUserFollowers(
    userId: string,
    limit = 50,
    nextToken?: string
  ): Promise<PaginatedResponse<any>> {
    let exclusiveStartKey;
    if (nextToken) {
      try {
        exclusiveStartKey = JSON.parse(Buffer.from(nextToken, 'base64').toString());
      } catch {
        throw new Error('Invalid pagination token');
      }
    }

    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI5PK-GSI5SK-index',
      KeyConditionExpression: 'GSI5PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `FOLLOWEE#${userId}`
      },
      Limit: limit,
      ScanIndexForward: false,
      ExclusiveStartKey: exclusiveStartKey
    }));

    const items = result.Items || [];
    
    return {
      items,
      count: items.length,
      nextToken: result.LastEvaluatedKey 
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
        : undefined
    };
  }

  static async getUserFollowing(
    userId: string,
    limit = 50,
    nextToken?: string
  ): Promise<PaginatedResponse<any>> {
    let exclusiveStartKey;
    if (nextToken) {
      try {
        exclusiveStartKey = JSON.parse(Buffer.from(nextToken, 'base64').toString());
      } catch {
        throw new Error('Invalid pagination token');
      }
    }

    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'FOLLOWING#'
      },
      Limit: limit,
      ScanIndexForward: false,
      ExclusiveStartKey: exclusiveStartKey
    }));

    const items = result.Items || [];
    
    return {
      items,
      count: items.length,
      nextToken: result.LastEvaluatedKey 
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
        : undefined
    };
  }

  // ==========================================
  // NOTIFICATION OPERATIONS
  // ==========================================

  static async createNotification(data: {
    userId: string;
    type: string;
    message: string;
    relatedEntityId?: string;
    fromUserId?: string;
  }): Promise<void> {
    const notificationId = uuidv4();
    const timestamp = new Date().toISOString();

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${data.userId}`,
        SK: `NOTIF#${timestamp}#${notificationId}`,
        EntityType: 'Notification',
        NotificationId: notificationId,
        Type: data.type,
        Message: data.message,
        RelatedEntityId: data.relatedEntityId,
        FromUserId: data.fromUserId,
        IsRead: false,
        CreatedAt: timestamp
      }
    }));
  }

  static async getUserNotifications(
    userId: string,
    limit = 20,
    nextToken?: string,
    unreadOnly = false
  ): Promise<PaginatedResponse<any>> {
    let exclusiveStartKey;
    if (nextToken) {
      try {
        exclusiveStartKey = JSON.parse(Buffer.from(nextToken, 'base64').toString());
      } catch {
        throw new Error('Invalid pagination token');
      }
    }

    const queryParams: any = {
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'NOTIF#'
      },
      Limit: limit,
      ScanIndexForward: false,
      ExclusiveStartKey: exclusiveStartKey
    };

    if (unreadOnly) {
      queryParams.FilterExpression = 'IsRead = :false';
      queryParams.ExpressionAttributeValues[':false'] = false;
    }

    const result = await docClient.send(new QueryCommand(queryParams));

    const items = result.Items || [];
    
    return {
      items,
      count: items.length,
      nextToken: result.LastEvaluatedKey 
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
        : undefined
    };
  }

  static async markNotificationAsRead(notificationId: string, userId: string): Promise<boolean> {
    // First, find the notification
    const queryResult = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      FilterExpression: 'NotificationId = :notifId',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'NOTIF#',
        ':notifId': notificationId
      }
    }));

    if (!queryResult.Items || queryResult.Items.length === 0) {
      return false;
    }

    const notification = queryResult.Items[0];

    // Update the notification
    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: notification.PK,
        SK: notification.SK
      },
      UpdateExpression: 'SET IsRead = :true',
      ExpressionAttributeValues: {
        ':true': true
      }
    }));

    return true;
  }

  static async markAllNotificationsAsRead(userId: string): Promise<void> {
    // Get all unread notifications
    const queryResult = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      FilterExpression: 'IsRead = :false',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'NOTIF#',
        ':false': false
      }
    }));

    if (!queryResult.Items || queryResult.Items.length === 0) {
      return;
    }

    // Batch update all notifications
    const updatePromises = queryResult.Items.map(notification =>
      docClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: notification.PK,
          SK: notification.SK
        },
        UpdateExpression: 'SET IsRead = :true',
        ExpressionAttributeValues: {
          ':true': true
        }
      }))
    );

    await Promise.all(updatePromises);
  }

  // ==========================================
  // MAPPER FUNCTIONS
  // ==========================================

  private static mapToUser(item: any): User {
    return {
      userId: item.UserId,
      username: item.Username,
      email: item.Email,
      displayName: item.DisplayName,
      bio: item.Bio,
      avatarUrl: item.AvatarUrl,
      status: item.Status,
      createdAt: item.CreatedAt,
      updatedAt: item.UpdatedAt
    };
  }

  private static mapToSchematic(item: any): Schematic {
    return {
      schematicId: item.SchematicId,
      title: item.Title,
      description: item.Description,
      authorId: item.AuthorId,
      authorUsername: item.AuthorUsername,
      tags: item.Tags || [],
      status: item.Status,
      version: item.Version,
      fileUrl: item.FileUrl,
      coverImageUrl: item.CoverImageUrl,
      dimensions: item.Dimensions,
      blockCount: item.BlockCount,
      createdAt: item.CreatedAt,
      updatedAt: item.UpdatedAt
    };
  }

  private static mapToComment(item: any): Comment {
    return {
      commentId: item.CommentId,
      schematicId: item.SchematicId,
      authorId: item.AuthorId,
      authorUsername: item.AuthorUsername,
      content: item.Content,
      status: item.Status,
      createdAt: item.CreatedAt,
      updatedAt: item.UpdatedAt
    };
  }
}