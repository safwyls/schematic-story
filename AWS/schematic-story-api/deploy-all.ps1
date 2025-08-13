# ==========================================
# deploy-all.ps1 - Complete deployment script
# ==========================================

Write-Host "🚀 Deploying Schematic Story API" -ForegroundColor Green

# Build TypeScript
Write-Host "📦 Building TypeScript..." -ForegroundColor Yellow
npx tsc

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ TypeScript build failed" -ForegroundColor Red
    exit 1
}

# Copy package files to dist
Write-Host "📦 Copying package files..." -ForegroundColor Yellow
Copy-Item package.json -Destination dist\
Copy-Item package-lock.json -Destination dist\

# Install production dependencies
Write-Host "📦 Installing production dependencies..." -ForegroundColor Yellow
Push-Location dist
npm ci --production
Pop-Location

# Install S3 SDK if not already installed
Write-Host "📦 Ensuring S3 SDK is installed..." -ForegroundColor Yellow
Push-Location dist
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
Pop-Location

# Build with SAM
Write-Host "🔨 Building with SAM..." -ForegroundColor Yellow
sam build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ SAM build failed" -ForegroundColor Red
    exit 1
}

# Deploy with SAM
Write-Host "☁️ Deploying to AWS..." -ForegroundColor Yellow
sam deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    
    # Get API URL
    $outputs = sam list stack-outputs --stack-name schematic-story-api --output json | ConvertFrom-Json
    $apiUrl = $outputs | Where-Object { $_.OutputKey -eq "ApiUrl" } | Select-Object -ExpandProperty OutputValue
    
    Write-Host "`n📍 API URL: $apiUrl" -ForegroundColor Cyan
    Write-Host "📍 Health Check: $apiUrl/health" -ForegroundColor Cyan
    
    # Save API URL to file for testing
    $apiUrl | Out-File -FilePath api-url.txt -Encoding UTF8
} else {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}