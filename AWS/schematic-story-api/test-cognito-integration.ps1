# ==========================================
# test-cognito-integration.ps1
# ==========================================

param(
    [Parameter(Mandatory=$true)]
    [string]$UserPoolId,
    
    [Parameter(Mandatory=$true)]
    [string]$ClientId
)

Write-Host "Testing Cognito Integration" -ForegroundColor Green

# Generate test user data
$timestamp = Get-Date -Format "HHmmss"
$testUsername = "testuser$timestamp"
$testEmail = "test$timestamp@example.com"
$testPassword = "TempPassword123!"

Write-Host "Creating test user in Cognito..." -ForegroundColor Yellow
Write-Host "Username: $testUsername" -ForegroundColor Cyan
Write-Host "Email: $testEmail" -ForegroundColor Cyan

# Create user in Cognito
$signUpResult = aws cognito-idp sign-up `
    --client-id $ClientId `
    --username $testUsername `
    --password $testPassword `
    --user-attributes "Name=email,Value=$testEmail" "Name=preferred_username,Value=$testUsername" `
    --output json | ConvertFrom-Json

if ($signUpResult) {
    $userSub = $signUpResult.UserSub
    Write-Host "User created with Sub: $userSub" -ForegroundColor Green
    
    # Auto-confirm for testing (requires admin privileges)
    Write-Host "Confirming user (admin)..." -ForegroundColor Yellow
    
    aws cognito-idp admin-confirm-sign-up `
        --user-pool-id $UserPoolId `
        --username $testUsername
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "User confirmed" -ForegroundColor Green
    }
    
    # Wait for Lambda trigger to complete
    Write-Host "Waiting for Lambda trigger..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    # Check if user was created in DynamoDB
    Write-Host "Checking DynamoDB..." -ForegroundColor Yellow
    
    $dynamoResult = aws dynamodb get-item `
        --table-name SchematicStoryTable `
        --key \"{`"PK`":{`"S`":`"USER#$userSub`"},`"SK`":{`"S`":`"METADATA`"}}\" `
        --output json | ConvertFrom-Json
    
    if ($dynamoResult.Item) {
        Write-Host "User found in DynamoDB!" -ForegroundColor Green
        Write-Host "Username: $($dynamoResult.Item.Username.S)" -ForegroundColor Cyan
        Write-Host "Email: $($dynamoResult.Item.Email.S)" -ForegroundColor Cyan
    } else {
        Write-Host "User not found in DynamoDB" -ForegroundColor Red
        Write-Host "Check CloudWatch logs for the Post Confirmation Lambda function" -ForegroundColor Yellow
    }
    
} else {
    Write-Host "Failed to create user in Cognito" -ForegroundColor Red
}