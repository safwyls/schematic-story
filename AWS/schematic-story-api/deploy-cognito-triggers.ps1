# ==========================================
# deploy-cognito-triggers.ps1
# ==========================================

param(
    [Parameter(Mandatory=$true)]
    [string]$UserPoolId,
    
    [string]$StackName = "schematic-story-api"
)

Write-Host "🔐 Setting up Cognito Lambda Triggers" -ForegroundColor Green
Write-Host "User Pool ID: $UserPoolId" -ForegroundColor Cyan

# Step 1: Build TypeScript
Write-Host "`n📦 Building TypeScript..." -ForegroundColor Yellow
npx tsc

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ TypeScript build failed" -ForegroundColor Red
    exit 1
}

# Step 2: Deploy Lambda functions
Write-Host "`n☁️ Deploying Lambda functions..." -ForegroundColor Yellow

# Make sure dependencies are in dist
Copy-Item package*.json -Destination dist\
Push-Location dist
npm ci --production
Pop-Location

# Deploy with SAM
sam build
sam deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}

# Step 3: Get Lambda function ARNs
Write-Host "`n🔍 Getting Lambda function ARNs..." -ForegroundColor Yellow

$postConfirmationArn = aws cloudformation describe-stacks `
    --stack-name $StackName `
    --query "Stacks[0].Outputs[?OutputKey=='CognitoPostConfirmationFunctionArn'].OutputValue" `
    --output text

$preSignUpArn = aws cloudformation describe-stacks `
    --stack-name $StackName `
    --query "Stacks[0].Outputs[?OutputKey=='CognitoPreSignUpFunctionArn'].OutputValue" `
    --output text

Write-Host "Post Confirmation ARN: $postConfirmationArn" -ForegroundColor Cyan
Write-Host "Pre Sign-up ARN: $preSignUpArn" -ForegroundColor Cyan

# Step 4: Update Cognito User Pool with Lambda triggers
Write-Host "`n🔗 Connecting Lambda triggers to Cognito..." -ForegroundColor Yellow

$lambdaConfig = @{
    PostConfirmation = $postConfirmationArn
}

# Add PreSignUp if you want username validation
if ($preSignUpArn) {
    $lambdaConfig.PreSignUp = $preSignUpArn
}

# Convert to JSON for AWS CLI
$lambdaConfigJson = $lambdaConfig | ConvertTo-Json -Compress

aws cognito-idp update-user-pool `
    --user-pool-id $UserPoolId `
    --lambda-config $lambdaConfigJson

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Lambda triggers connected successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to connect Lambda triggers" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 Setup complete!" -ForegroundColor Green
Write-Host "New users will now be automatically created in DynamoDB upon sign-up confirmation." -ForegroundColor Cyan
