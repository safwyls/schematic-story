# ==========================================
# test-endpoints.ps1 - Test all API endpoints
# ==========================================

param(
    [string]$ApiUrl
)

# Read API URL from file if not provided
if (-not $ApiUrl) {
    if (Test-Path api-url.txt) {
        $ApiUrl = Get-Content api-url.txt -Raw
        $ApiUrl = $ApiUrl.Trim()
    } else {
        Write-Host "❌ API URL not provided. Run deploy-all.ps1 first or provide -ApiUrl parameter" -ForegroundColor Red
        exit 1
    }
}

Write-Host "🧪 Testing API Endpoints" -ForegroundColor Green
Write-Host "📍 API URL: $ApiUrl" -ForegroundColor Cyan

# Test data
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testUserId = $null
$testSchematicId = $null
$testCommentId = $null

# Helper function for API calls
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body = @{},
        [hashtable]$Headers = @{}
    )
    
    $uri = "$ApiUrl$Endpoint"
    
    try {
        $params = @{
            Uri = $uri
            Method = $Method
            Headers = @{ "Content-Type" = "application/json" } + $Headers
            UseBasicParsing = $true
        }
        
        if ($Method -ne "GET" -and $Method -ne "DELETE") {
            $params.Body = $Body | ConvertTo-Json -Depth 10
        }
        
        $response = Invoke-WebRequest @params
        $content = $response.Content | ConvertFrom-Json
        
        Write-Host "✅ $Method $Endpoint - Status: $($response.StatusCode)" -ForegroundColor Green
        return $content
    }
    catch {
        Write-Host "❌ $Method $Endpoint - Error: $_" -ForegroundColor Red
        return $null
    }
}

# Test 1: Health Check
Write-Host "`n1️⃣ Testing Health Check..." -ForegroundColor Yellow
$health = Invoke-ApiRequest -Method GET -Endpoint "/health"

# Test 2: Create User
Write-Host "`n2️⃣ Creating User..." -ForegroundColor Yellow
$userData = @{
    username = "testuser$timestamp"
    email = "test$timestamp@example.com"
    displayName = "Test User"
    bio = "Testing the API"
}
$user = Invoke-ApiRequest -Method POST -Endpoint "/users" -Body $userData
if ($user) {
    $testUserId = $user.data.userId
    Write-Host "   User ID: $testUserId" -ForegroundColor Cyan
}

# Test 3: Get User
Write-Host "`n3️⃣ Getting User..." -ForegroundColor Yellow
$getUser = Invoke-ApiRequest -Method GET -Endpoint "/users/$testUserId"

# Test 4: Create Schematic
Write-Host "`n4️⃣ Creating Schematic..." -ForegroundColor Yellow
$schematicData = @{
    title = "Test Schematic $timestamp"
    description = "A test schematic created via PowerShell"
    authorId = $testUserId
    tags = @("test", "powershell", "api")
    dimensions = @{
        width = 10
        height = 10
        depth = 10
    }
    blockCount = 100
}
$headers = @{ "x-user-id" = $testUserId }
$schematic = Invoke-ApiRequest -Method POST -Endpoint "/schematics" -Body $schematicData -Headers $headers
if ($schematic) {
    $testSchematicId = $schematic.data.schematicId
    Write-Host "   Schematic ID: $testSchematicId" -ForegroundColor Cyan
}

# Test 5: Get Schematic
Write-Host "`n5️⃣ Getting Schematic..." -ForegroundColor Yellow
$getSchematic = Invoke-ApiRequest -Method GET -Endpoint "/schematics/$testSchematicId"

# Test 6: Get User's Schematics
Write-Host "`n6️⃣ Getting User's Schematics..." -ForegroundColor Yellow
$userSchematics = Invoke-ApiRequest -Method GET -Endpoint "/users/$testUserId/schematics"

# Test 7: Get Latest Feed
Write-Host "`n7️⃣ Getting Latest Feed..." -ForegroundColor Yellow
$latestFeed = Invoke-ApiRequest -Method GET -Endpoint "/schematics/feed/latest?limit=5"

# Test 8: Create Comment
Write-Host "`n8️⃣ Creating Comment..." -ForegroundColor Yellow
$commentData = @{
    content = "This is a test comment from PowerShell!"
}
$comment = Invoke-ApiRequest -Method POST -Endpoint "/schematics/$testSchematicId/comments" -Body $commentData -Headers $headers
if ($comment) {
    $testCommentId = $comment.data.commentId
    Write-Host "   Comment ID: $testCommentId" -ForegroundColor Cyan
}

# Test 9: Get Comments
Write-Host "`n9️⃣ Getting Comments..." -ForegroundColor Yellow
$comments = Invoke-ApiRequest -Method GET -Endpoint "/schematics/$testSchematicId/comments"

# Test 10: Follow User (create another user first)
Write-Host "`n🔟 Testing Follow System..." -ForegroundColor Yellow
$userData2 = @{
    username = "follower$timestamp"
    email = "follower$timestamp@example.com"
    displayName = "Follower User"
}
$user2 = Invoke-ApiRequest -Method POST -Endpoint "/users" -Body $userData2
if ($user2) {
    $followerId = $user2.data.userId
    $followHeaders = @{ "x-user-id" = $followerId }
    
    # Follow the first user
    $follow = Invoke-ApiRequest -Method POST -Endpoint "/users/$testUserId/follow" -Headers $followHeaders
    
    # Get followers
    $followers = Invoke-ApiRequest -Method GET -Endpoint "/users/$testUserId/followers"
    
    # Get following
    $following = Invoke-ApiRequest -Method GET -Endpoint "/users/$followerId/following"
}

# Summary
Write-Host "`n📊 Test Summary" -ForegroundColor Green
Write-Host "   User ID: $testUserId" -ForegroundColor Cyan
Write-Host "   Schematic ID: $testSchematicId" -ForegroundColor Cyan
Write-Host "   Comment ID: $testCommentId" -ForegroundColor Cyan
Write-Host "`n✅ All basic tests completed!" -ForegroundColor Green