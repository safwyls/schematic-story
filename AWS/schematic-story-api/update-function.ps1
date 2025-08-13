# ==========================================
# update-function.ps1 - Update specific function
# ==========================================

param(
    [Parameter(Mandatory=$true)]
    [string]$FunctionName
)

Write-Host "Updating function: $FunctionName" -ForegroundColor Yellow

# Build TypeScript
npx tsc

# Copy dependencies
Copy-Item package*.json -Destination dist\
Push-Location dist
npm ci --production
Pop-Location

# Create zip
Compress-Archive -Path dist\* -DestinationPath function.zip -Force

# Update function code
aws lambda update-function-code --function-name $FunctionName --zip-file fileb://function.zip

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Function updated successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Update failed" -ForegroundColor Red
}