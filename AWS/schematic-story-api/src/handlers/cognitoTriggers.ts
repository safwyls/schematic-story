// ==========================================
// src/handlers/cognitoTriggers.ts - FIXED VERSION
// ==========================================

import {
    PostConfirmationTriggerEvent,
    PreSignUpTriggerEvent,
    CustomMessageTriggerEvent,
    PreTokenGenerationTriggerEvent
} from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME || 'SchematicStoryTable';

/**
 * Post Confirmation Lambda Trigger
 * This runs after a user confirms their email/phone
 * 
 * IMPORTANT: Must return the event object unchanged for Cognito to accept it
 */
export const postConfirmation = async (event: PostConfirmationTriggerEvent): Promise<PostConfirmationTriggerEvent> => {
  console.log('Post Confirmation Trigger:', JSON.stringify(event));

  // Extract user attributes for easier access
  const { userAttributes } = event.request;
  const timestamp = new Date().toISOString();

  // Only process if email is verified (skip if only phone verification)
  const shouldProcess = userAttributes.email_verified === 'true' || 
                        userAttributes.phone_number_verified === 'true';
  
  if (!shouldProcess) {
    console.log('User not verified, skipping DynamoDB creation');
    // CRITICAL: Return the original event unchanged
    return event;
  }

  try {
    // Build user data from Cognito attributes
    const userData = {
      userId: userAttributes.sub, // Cognito's unique identifier
      cognitoUsername: event.userName,
      email: userAttributes.email,
      emailVerified: userAttributes.email_verified === 'true',
      // Determine username: prefer preferred_username, then email prefix, then Cognito username
      username: userAttributes.preferred_username || 
                userAttributes.email?.split('@')[0] || 
                event.userName,
      displayName: userAttributes.name || 
                   userAttributes.preferred_username || 
                   'New User',
      givenName: userAttributes.given_name,
      familyName: userAttributes.family_name,
      picture: userAttributes.picture,
      bio: '',
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp
    };

    // Check if user already exists in DynamoDB
    // This prevents duplicate entries if the trigger fires multiple times
    const existingUser = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userData.userId}`,
        SK: 'METADATA'
      }
    }));

    if (existingUser.Item) {
      console.log('User already exists in DynamoDB, skipping creation');
      return event; // Return unchanged event
    }

    // Create the user record in DynamoDB
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${userData.userId}`,
        SK: 'METADATA',
        EntityType: 'User',
        UserId: userData.userId,
        CognitoUsername: userData.cognitoUsername,
        Username: userData.username,
        Email: userData.email,
        EmailVerified: userData.emailVerified,
        DisplayName: userData.displayName,
        GivenName: userData.givenName,
        FamilyName: userData.familyName,
        Picture: userData.picture,
        Bio: userData.bio,
        Status: userData.status,
        CreatedAt: userData.createdAt,
        UpdatedAt: userData.updatedAt,
        // GSI attributes for queries
        GSI1PK: `USER#${userData.userId}`,
        GSI1SK: `USER#${timestamp}`
      },
      // Prevent race conditions with concurrent executions
      ConditionExpression: 'attribute_not_exists(PK)'
    }));

    console.log('User created in DynamoDB:', userData.userId);

    // Initialize user statistics
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${userData.userId}`,
        SK: 'STATS',
        EntityType: 'UserStats',
        SchematicCount: 0,
        FollowerCount: 0,
        FollowingCount: 0,
        CommentCount: 0,
        LikeCount: 0,
        UpdatedAt: timestamp
      }
    }));

    console.log('User stats initialized');

    // Create welcome notification
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${userData.userId}`,
        SK: `NOTIF#${timestamp}#welcome`,
        EntityType: 'Notification',
        NotificationId: `welcome-${userData.userId}`,
        Type: 'WELCOME',
        Message: `Welcome to Schematic Story, ${userData.displayName}! Start by uploading your first schematic or exploring what others have created.`,
        IsRead: false,
        CreatedAt: timestamp
      }
    }));

    console.log('Welcome notification created');

  } catch (error) {
    // Log the error but don't throw it
    // We don't want to break the Cognito signup flow
    console.error('Error creating user in DynamoDB:', error);
    
    // Consider sending to DLQ or creating a CloudWatch alarm
    // You could also store failed attempts in a separate DynamoDB table for retry
  }

  // CRITICAL: Always return the original event object
  // Cognito needs this exact format to continue the authentication flow
  return event;
};

/**
 * Pre Sign-up Lambda Trigger (Optional)
 * Validates and potentially auto-confirms users
 */
export const preSignUp = async (event: PreSignUpTriggerEvent): Promise<PreSignUpTriggerEvent> => {
  console.log('Pre Sign-up Trigger:', JSON.stringify(event));
  
  // Initialize response object if it doesn't exist
  event.response = event.response || {
    autoConfirmUser: false,
    autoVerifyEmail: false,
    autoVerifyPhone: false
  };

  const { userAttributes } = event.request;

  // Auto-confirm trusted domains (useful for testing)
  const trustedDomains = process.env.TRUSTED_DOMAINS?.split(',').filter(Boolean) || [];
  const emailDomain = userAttributes.email?.split('@')[1];
  
  if (emailDomain && trustedDomains.includes(emailDomain)) {
    event.response.autoConfirmUser = true;
    event.response.autoVerifyEmail = true;
    console.log(`Auto-confirming user from trusted domain: ${emailDomain}`);
  }

  // Validate username if provided
  if (userAttributes.preferred_username) {
    const username = userAttributes.preferred_username;
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    
    if (!usernameRegex.test(username)) {
      // This will show to the user as a signup error
      throw new Error('Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens');
    }

    // Optional: Check username uniqueness
    // Note: This requires a GSI on usernames or a separate username tracking table
    // Commented out unless you have the appropriate index
    /*
    try {
      const result = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'UsernameIndex',
        KeyConditionExpression: 'Username = :username',
        ExpressionAttributeValues: {
          ':username': username.toLowerCase()
        },
        Limit: 1
      }));

      if (result.Items && result.Items.length > 0) {
        throw new Error('Username is already taken');
      }
    } catch (error: any) {
      if (error.message === 'Username is already taken') {
        throw error; // Re-throw to show to user
      }
      // Log other errors but don't block signup
      console.error('Error checking username:', error);
    }
    */
  }

  // Return the event with any modifications
  return event;
};

/**
 * Custom Message Trigger
 * Customizes Cognito's email/SMS messages
 */
export const customMessage = async (event: CustomMessageTriggerEvent): Promise<CustomMessageTriggerEvent> => {
  console.log('Custom Message Trigger:', JSON.stringify(event));

  // Initialize response if not present
  event.response = event.response || {
    smsMessage: '',
    emailMessage: '',
    emailSubject: ''
  };

  const { codeParameter, userAttributes } = event.request;
  const { triggerSource, userName } = event;

  // Customize signup verification email
  if (triggerSource === 'CustomMessage_SignUp') {
    event.response.emailSubject = 'Welcome to Schematic Story! Verify your email';
    event.response.emailMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #667eea;">Welcome to Schematic Story!</h1>
        <p>Hi ${userAttributes.name || userName},</p>
        <p>Thank you for joining our community of Vintage Story creators!</p>
        <p>Please verify your email address by entering this code:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
          <h2 style="color: #111; letter-spacing: 5px;">${codeParameter}</h2>
        </div>
        <p>This code expires in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          Schematic Story - Share your Vintage Story creations
        </p>
      </div>
    `;
  }

  // Customize password reset email
  if (triggerSource === 'CustomMessage_ForgotPassword') {
    event.response.emailSubject = 'Reset your Schematic Story password';
    event.response.emailMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #667eea;">Password Reset Request</h1>
        <p>Hi ${userAttributes.name || userName},</p>
        <p>We received a request to reset your password. Enter this code to proceed:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
          <h2 style="color: #111; letter-spacing: 5px;">${codeParameter}</h2>
        </div>
        <p>This code expires in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          Schematic Story - Share your Vintage Story creations
        </p>
      </div>
    `;
  }

  return event;
};

/**
 * Pre Token Generation Trigger
 * Adds custom claims to JWT tokens
 */
export const preTokenGeneration = async (event: PreTokenGenerationTriggerEvent): Promise<PreTokenGenerationTriggerEvent> => {
  console.log('Pre Token Generation Trigger:', JSON.stringify(event));
  
  // Initialize response structure
  event.response = event.response || {
    claimsOverrideDetails: {
      claimsToAddOrOverride: {},
      claimsToSuppress: []
    }
  };

  const { userAttributes } = event.request;

  // Add custom claims to the JWT token
  // These will be available in your API when you decode the token
  event.response.claimsOverrideDetails = {
    claimsToAddOrOverride: {
      'custom:userId': userAttributes.sub,
      'custom:username': userAttributes.preferred_username || 
                        userAttributes.email?.split('@')[0] || 
                        event.userName,
      'custom:role': userAttributes['custom:role'] || 'user',
      'custom:displayName': userAttributes.name || 'User'
    },
    claimsToSuppress: [] // Optional: Remove default claims you don't need
  };

  return event;
};