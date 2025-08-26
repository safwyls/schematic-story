// dynamodb-algolia-sync.js
// Lambda function triggered by DynamoDB Streams to sync data to Algolia
const algoliasearch = require('algoliasearch');

// Initialize Algolia client
const client = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_ADMIN_API_KEY // Use admin key for writing
);

const schematicsIndex = client.initIndex('schematics');
const usersIndex = client.initIndex('users');

// Configure index settings on cold start
const configureIndices = async () => {
  try {
    // Configure schematics index
    await schematicsIndex.setSettings({
      searchableAttributes: [
        'title',
        'description',
        'tags',
        'authorUsername'
      ],
      attributesForFaceting: [
        'filterOnly(authorId)',
        'searchable(tags)',
        'filterOnly(status)',
        'filterOnly(createdAt)'
      ],
      customRanking: [
        'desc(popularityScore)',
        'desc(createdAt)'
      ],
      attributesToRetrieve: [
        'objectID',
        'title',
        'description',
        'tags',
        'authorId',
        'authorUsername',
        'coverImageUrl',
        'viewCount',
        'downloadCount',
        'commentCount',
        'createdAt',
        'updatedAt'
      ],
      attributesToHighlight: [
        'title',
        'description'
      ],
      hitsPerPage: 20,
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>'
    });

    // Configure users index
    await usersIndex.setSettings({
      searchableAttributes: [
        'username',
        'displayName',
        'bio'
      ],
      attributesForFaceting: [
        'filterOnly(status)'
      ],
      customRanking: [
        'desc(followerCount)',
        'desc(schematicCount)'
      ]
    });

    console.log('Algolia indices configured successfully');
  } catch (error) {
    console.error('Error configuring Algolia indices:', error);
  }
};

// Call configuration on cold start
configureIndices();

// Helper function to calculate popularity score
const calculatePopularityScore = (item: any) => {
  const viewWeight = 1;
  const downloadWeight = 3;
  const commentWeight = 2;
  const followerWeight = 5;
  
  const views = parseInt(item.ViewCount?.N || '0');
  const downloads = parseInt(item.Downloads?.N || '0');
  const comments = parseInt(item.CommentCount?.N || '0');
  const followers = parseInt(item.FollowerCount?.N || '0');
  
  return (views * viewWeight) + 
         (downloads * downloadWeight) + 
         (comments * commentWeight) + 
         (followers * followerWeight);
};

// Helper function to determine if schematic is trending
const isTrending = (item: any) => {
  if (!item.UpdatedAt?.S) return false;
  
  const updatedAt = new Date(item.UpdatedAt.S);
  const daysSinceUpdate = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
  
  // Consider trending if updated in last 7 days and has significant engagement
  if (daysSinceUpdate <= 7) {
    const recentViews = parseInt(item.RecentViewCount?.N || '0');
    const totalViews = parseInt(item.ViewCount?.N || '0');
    
    // Trending if recent views are more than 20% of total views
    return recentViews > totalViews * 0.2;
  }
  
  return false;
};

// Transform DynamoDB record to Algolia object
const transformSchematicRecord = (dynamoRecord: any) => {
  const item = dynamoRecord.NewImage || dynamoRecord.OldImage;
  
  return {
    objectID: item.PK.S.replace('SCHEMATIC#', ''),
    title: item.Title?.S || '',
    description: item.Description?.S || '',
    tags: item.Tags?.SS || [],
    authorId: item.AuthorId?.S || '',
    authorUsername: item.AuthorUsername?.S || '',
    status: item.Status?.S || 'active',
    version: parseInt(item.Version?.N || '1'),
    viewCount: parseInt(item.ViewCount?.N || '0'),
    downloadCount: parseInt(item.Downloads?.N || '0'),
    commentCount: parseInt(item.CommentCount?.N || '0'),
    coverImageUrl: item.CoverImageUrl?.S || null,
    fileSize: parseInt(item.FileSize?.N || '0'),
    dimensions: {
      x: parseInt(item.DimensionX?.N || '0'),
      y: parseInt(item.DimensionY?.N || '0'),
      z: parseInt(item.DimensionZ?.N || '0')
    },
    createdAt: item.CreatedAt?.S || new Date().toISOString(),
    updatedAt: item.UpdatedAt?.S || new Date().toISOString(),
    popularityScore: calculatePopularityScore(item),
    trending: isTrending(item),
    _geoloc: item.Latitude?.N && item.Longitude?.N ? {
      lat: parseFloat(item.Latitude.N),
      lng: parseFloat(item.Longitude.N)
    } : undefined
  };
};

// Transform user record for search
const transformUserRecord = (dynamoRecord: any) => {
  const item = dynamoRecord.NewImage || dynamoRecord.OldImage;
  
  return {
    objectID: item.PK.S.replace('USER#', ''),
    username: item.Username?.S || '',
    displayName: item.DisplayName?.S || '',
    bio: item.Bio?.S || '',
    status: item.Status?.S || 'active',
    schematicCount: parseInt(item.SchematicCount?.N || '0'),
    followerCount: parseInt(item.FollowerCount?.N || '0'),
    followingCount: parseInt(item.FollowingCount?.N || '0'),
    avatarUrl: item.AvatarUrl?.S || null,
    createdAt: item.CreatedAt?.S || new Date().toISOString()
  };
};

// Process tag aggregation for tag cloud
const updateTagAggregation = async (tags: string[], operation: any) => {
  // This could update a separate tags index or aggregation
  // For now, we'll skip this but you could implement tag counting here
  console.log(`Tag operation ${operation} for tags:`, tags);
};

// Main Lambda handler
exports.handler = async (event: any) => {
  console.log(`Processing ${event.Records.length} stream records`);
  
  const schematicOperations = [] as any[];
  const userOperations = [] as any[];
  
  for (const record of event.Records) {
    try {
      const { eventName, dynamodb } = record;
      
      // Skip if no entity type
      const entityType = dynamodb.NewImage?.EntityType?.S || 
                        dynamodb.OldImage?.EntityType?.S;
      
      if (!entityType) continue;
      
      // Handle different entity types
      switch (entityType) {
        case 'Schematic':
          await handleSchematicRecord(record, schematicOperations);
          break;
          
        case 'User':
          await handleUserRecord(record, userOperations);
          break;
          
        case 'SchematicStats':
          await handleStatsUpdate(record, schematicOperations);
          break;
          
        default:
          // Skip other entity types
          console.log(`Skipping entity type: ${entityType}`);
      }
      
    } catch (error) {
      console.error('Error processing record:', error, record);
      // Continue processing other records
    }
  }
  
  // Batch update Algolia
  try {
    if (schematicOperations.length > 0) {
      const results = await schematicsIndex.batch(schematicOperations);
      console.log(`Updated ${schematicOperations.length} schematic records`);
    }
    
    if (userOperations.length > 0) {
      const results = await usersIndex.batch(userOperations);
      console.log(`Updated ${userOperations.length} user records`);
    }
  } catch (error) {
    console.error('Error batch updating Algolia:', error);
    throw error;
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      processed: event.Records.length,
      schematicUpdates: schematicOperations.length,
      userUpdates: userOperations.length
    })
  };
};

// Handle schematic records
async function handleSchematicRecord(record: any, operations: any[]) {
  const { eventName, dynamodb } = record;
  
  // Check if this is the METADATA record (not version or other sub-items)
  const sk = dynamodb.NewImage?.SK?.S || dynamodb.OldImage?.SK?.S;
  if (sk !== 'METADATA') return;
  
  switch (eventName) {
    case 'INSERT':
    case 'MODIFY':
      const schematicObject = transformSchematicRecord(dynamodb);
      
      // Only index active schematics
      if (schematicObject.status === 'active') {
        operations.push({
          action: 'updateObject',
          body: schematicObject
        });
        
        // Update tag aggregations if new schematic
        if (eventName === 'INSERT' && schematicObject.tags.length > 0) {
          await updateTagAggregation(schematicObject.tags, 'increment');
        }
      } else if (schematicObject.status === 'deleted') {
        // Remove from search index if deleted
        operations.push({
          action: 'deleteObject',
          body: { objectID: schematicObject.objectID }
        });
        
        // Update tag aggregations
        if (schematicObject.tags.length > 0) {
          await updateTagAggregation(schematicObject.tags, 'decrement');
        }
      }
      break;
      
    case 'REMOVE':
      const objectID = dynamodb.OldImage.PK.S.replace('SCHEMATIC#', '');
      operations.push({
        action: 'deleteObject',
        body: { objectID }
      });
      
      // Update tag aggregations
      const oldTags = dynamodb.OldImage.Tags?.SS || [];
      if (oldTags.length > 0) {
        await updateTagAggregation(oldTags, 'decrement');
      }
      break;
  }
}

// Handle user records
async function handleUserRecord(record: any, operations: any[]) {
  const { eventName, dynamodb } = record;
  
  // Check if this is the METADATA record
  const sk = dynamodb.NewImage?.SK?.S || dynamodb.OldImage?.SK?.S;
  if (sk !== 'METADATA') return;
  
  switch (eventName) {
    case 'INSERT':
    case 'MODIFY':
      const userObject = transformUserRecord(dynamodb);
      
      // Only index active users
      if (userObject.status === 'active') {
        operations.push({
          action: 'updateObject',
          body: userObject
        });
      } else {
        // Remove from search index if not active
        operations.push({
          action: 'deleteObject',
          body: { objectID: userObject.objectID }
        });
      }
      break;
      
    case 'REMOVE':
      const objectID = dynamodb.OldImage.PK.S.replace('USER#', '');
      operations.push({
        action: 'deleteObject',
        body: { objectID }
      });
      break;
  }
}

// Handle stats updates (separate items in your design)
async function handleStatsUpdate(record: any, operations: any[]) {
  const { dynamodb } = record;
  
  // Extract the parent schematic ID from the PK
  const pk = dynamodb.NewImage?.PK?.S || dynamodb.OldImage?.PK?.S;
  if (!pk || !pk.startsWith('SCHEMATIC#')) return;
  
  const schematicId = pk.replace('SCHEMATIC#', '');
  
  // Create a partial update for the stats
  const statsUpdate = {
    objectID: schematicId,
    viewCount: parseInt(dynamodb.NewImage?.ViewCount?.N || '0'),
    downloadCount: parseInt(dynamodb.NewImage?.Downloads?.N || '0'),
    commentCount: parseInt(dynamodb.NewImage?.CommentCount?.N || '0'),
    popularityScore: calculatePopularityScore(dynamodb.NewImage)
  };
  
  operations.push({
    action: 'partialUpdateObject',
    body: statsUpdate
  });
}

// Error handling wrapper for production
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = { handler: exports.handler };