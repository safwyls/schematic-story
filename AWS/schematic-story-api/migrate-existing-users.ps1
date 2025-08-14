# ==========================================
# migrate-existing-users.ps1 (Optional)
# ==========================================

param(
    [Parameter(Mandatory=$true)]
    [string]$UserPoolId
)

Write-Host "Migrating existing Cognito users to DynamoDB" -ForegroundColor Green

# Get all users from Cognito
Write-Host "Fetching users from Cognito..." -ForegroundColor Yellow

$users = @()
$paginationToken = $null

do {
    if ($paginationToken) {
        $result = aws cognito-idp list-users `
            --user-pool-id $UserPoolId `
            --pagination-token $paginationToken `
            --output json | ConvertFrom-Json
    } else {
        $result = aws cognito-idp list-users `
            --user-pool-id $UserPoolId `
            --output json | ConvertFrom-Json
    }
    
    $users += $result.Users
    $paginationToken = $result.PaginationToken
    
} while ($paginationToken)

Write-Host "Found $($users.Count) users in Cognito" -ForegroundColor Cyan

# Process each user
$created = 0
$skipped = 0

foreach ($user in $users) {
    $sub = ($user.Attributes | Where-Object { $_.Name -eq "sub" }).Value
    $email = ($user.Attributes | Where-Object { $_.Name -eq "email" }).Value
    $username = $user.Username
    $preferredUsername = ($user.Attributes | Where-Object { $_.Name -eq "preferred_username" }).Value
    $name = ($user.Attributes | Where-Object { $_.Name -eq "name" }).Value
    
    Write-Host "`nProcessing user: $username (sub: $sub)" -ForegroundColor Yellow
    
    # Check if user exists in DynamoDB
    $existingUser = aws dynamodb get-item `
        --table-name SchematicStoryTable `
        --key "{`"PK`":{`"S`":`"USER#$sub`"},`"SK`":{`"S`":`"METADATA`"}}" `
        --output json 2>$null | ConvertFrom-Json
    
    if ($existingUser.Item) {
        Write-Host "  User already exists, skipping" -ForegroundColor Gray
        $skipped++
    } else {
        # Create user in DynamoDB
        $timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        
        $item = @{
            PK = @{ S = "USER#$sub" }
            SK = @{ S = "METADATA" }
            EntityType = @{ S = "User" }
            UserId = @{ S = $sub }
            CognitoUsername = @{ S = $username }
            Username = @{ S = $(if ($preferredUsername) { $preferredUsername } else { $email.Split('@')[0] }) }
            Email = @{ S = $email }
            DisplayName = @{ S = $(if ($name) { $name } else { "User" }) }
            Status = @{ S = "active" }
            CreatedAt = @{ S = $timestamp }
            UpdatedAt = @{ S = $timestamp }
            GSI1PK = @{ S = "USER#$sub" }
            GSI1SK = @{ S = "USER#$timestamp" }
        }
        
        $itemJson = $item | ConvertTo-Json -Compress -Depth 10
        
        aws dynamodb put-item `
            --table-name SchematicStoryTable `
            --item $itemJson
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "User created in DynamoDB" -ForegroundColor Green
            $created++
        } else {
            Write-Host "Failed to create user" -ForegroundColor Red
        }
    }
}

Write-Host "Migration Summary" -ForegroundColor Green
Write-Host "Created: $created users" -ForegroundColor Cyan
Write-Host "Skipped: $skipped users" -ForegroundColor Cyan
Write-Host "Migration complete!" -ForegroundColor Green