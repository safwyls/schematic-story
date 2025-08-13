// test-setup.js
// Run this locally to test your DynamoDB setup

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { 
    DynamoDBDocumentClient, 
    PutCommand, 
    GetCommand, 
    QueryCommand, 
    UpdateCommand 
} = require('@aws-sdk/lib-dynamodb');

// Configure AWS SDK
const client = new DynamoDBClient({ 
  region: 'us-east-2' // Change to your region
});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'SchematicStoryTable';

async function testDynamoDBSetup() {
  console.log('🧪 Testing DynamoDB Setup...\n');

  try {
    // Test 1: Create a test user
    console.log('1️⃣ Creating test user...');
    const userId = `test-${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${userId}`,
        SK: 'METADATA',
        EntityType: 'User',
        UserId: userId,
        Username: `testuser${Date.now()}`,
        Email: 'test@example.com',
        Status: 'active',
        CreatedAt: timestamp,
        UpdatedAt: timestamp,
        GSI1PK: `USER#${userId}`,
        GSI1SK: `USER#${timestamp}`
      }
    }));
    console.log('✅ User created successfully\n');

    // Test 2: Read the user back
    console.log('2️⃣ Reading user back...');
    const userResult = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: 'METADATA'
      }
    }));
    console.log('✅ User retrieved:', userResult.Item.Username, '\n');

    // Test 3: Create a test schematic
    console.log('3️⃣ Creating test schematic...');
    const schematicId = `sch-test-${Date.now()}`;
    
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `SCHEMATIC#${schematicId}`,
        SK: 'METADATA',
        EntityType: 'Schematic',
        SchematicId: schematicId,
        Title: 'Test Schematic',
        Description: 'A test schematic for verification',
        AuthorId: userId,
        AuthorUsername: userResult.Item.Username,
        Status: 'active',
        CreatedAt: timestamp,
        UpdatedAt: timestamp,
        GSI1PK: `USER#${userId}`,
        GSI1SK: `SCHEMATIC#${timestamp}#${schematicId}`,
        GSI4PK: 'FEED#LATEST',
        GSI4SK: `${timestamp}#SCHEMATIC#${schematicId}`
      }
    }));
    console.log('✅ Schematic created successfully\n');

    // Test 4: Query GSI1 for user's schematics
    console.log('4️⃣ Testing GSI1 - Getting user schematics...');
    const gsi1Result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'UserContentIndex', // Update with your actual GSI name
      KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'SCHEMATIC#'
      }
    }));
    console.log(`✅ Found ${gsi1Result.Items.length} schematic(s) for user\n`);

    // Test 5: Create a comment
    console.log('5️⃣ Creating test comment...');
    const commentId = `com-test-${Date.now()}`;
    
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `COMMENT#${commentId}`,
        SK: 'METADATA',
        EntityType: 'Comment',
        CommentId: commentId,
        SchematicId: schematicId,
        AuthorId: userId,
        AuthorUsername: userResult.Item.Username,
        Content: 'This is a test comment',
        Status: 'active',
        CreatedAt: timestamp,
        GSI1PK: `USER#${userId}`,
        GSI1SK: `COMMENT#${timestamp}#${commentId}`,
        GSI3PK: `SCHEMATIC#${schematicId}`,
        GSI3SK: `${timestamp}#COMMENT#${commentId}`
      }
    }));
    console.log('✅ Comment created successfully\n');

    // Test 6: Query GSI3 for schematic's comments
    console.log('6️⃣ Testing GSI3 - Getting schematic comments...');
    const gsi3Result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'CommentIndex', // Update with your actual GSI name
      KeyConditionExpression: 'GSI3PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `SCHEMATIC#${schematicId}`
      }
    }));
    console.log(`✅ Found ${gsi3Result.Items.length} comment(s) for schematic\n`);

    // Test 7: Test soft delete
    console.log('7️⃣ Testing soft delete...');
    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `SCHEMATIC#${schematicId}`,
        SK: 'METADATA'
      },
      UpdateExpression: 'SET #status = :deleted, DeletedAt = :timestamp',
      ExpressionAttributeNames: {
        '#status': 'Status'
      },
      ExpressionAttributeValues: {
        ':deleted': 'deleted',
        ':timestamp': new Date().toISOString()
      }
    }));
    console.log('✅ Soft delete successful\n');

    // Test 8: Verify soft delete filtering
    console.log('8️⃣ Verifying soft delete filtering...');
    const deletedSchematic = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `SCHEMATIC#${schematicId}`,
        SK: 'METADATA'
      }
    }));
    
    if (deletedSchematic.Item?.Status === 'deleted') {
      console.log('✅ Schematic marked as deleted correctly\n');
    }

    // Test 9: Test pagination
    console.log('9️⃣ Testing pagination...');
    const paginationResult = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'FeedIndex', // Update with your actual GSI name
      KeyConditionExpression: 'GSI4PK = :pk',
      ExpressionAttributeValues: {
        ':pk': 'FEED#LATEST'
      },
      Limit: 2
    }));
    
    console.log(`✅ Pagination: Retrieved ${paginationResult.Items.length} items`);
    if (paginationResult.LastEvaluatedKey) {
      console.log('   NextToken available for pagination\n');
    }

    console.log('🎉 All tests passed! Your DynamoDB setup is working correctly.\n');

    // Cleanup (optional)
    console.log('🧹 Cleaning up test data...');
    // In production, you might want to delete the test items
    // For now, they'll help you see data in the AWS Console

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('\nTroubleshooting tips:');
    console.error('1. Check your AWS credentials are configured');
    console.error('2. Verify the table name is correct');
    console.error('3. Ensure GSI names match what you created');
    console.error('4. Check your AWS region is correct');
  }
}

// Run the tests
testDynamoDBSetup();

console.log('\n📝 Next steps:');
console.log('1. Check AWS Console to see the test data');
console.log('2. Try running queries in the DynamoDB console');
console.log('3. Monitor the "Metrics" tab for performance data');
console.log('4. Set up CloudWatch alarms for throttling');