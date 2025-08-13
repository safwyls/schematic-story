#!/bin/bash
# deploy.sh - Deployment script for Lambda functions

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Schematic Story API Deployment${NC}"

# Step 1: Build TypeScript
echo -e "${YELLOW}📦 Building TypeScript...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Step 2: Install production dependencies
echo -e "${YELLOW}📦 Installing production dependencies...${NC}"
cp package.json dist/
cd dist
npm install --production
cd ..

# Step 3: Deploy with SAM
echo -e "${YELLOW}🚀 Deploying with AWS SAM...${NC}"
sam deploy \
    --template-file template.yaml \
    --stack-name schematic-story-api \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides \
        DynamoDBTableName=SchematicStoryTable \
        Environment=development \
    --guided

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    
    # Get API endpoint
    API_URL=$(aws cloudformation describe-stacks \
        --stack-name schematic-story-api \
        --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" \
        --output text)
    
    echo -e "${GREEN}API Endpoint: ${API_URL}${NC}"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi