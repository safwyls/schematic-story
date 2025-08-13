# ==========================================
# clean-build.ps1 - Clean and rebuild
# ==========================================

Write-Host "🧹 Cleaning build artifacts..." -ForegroundColor Yellow

# Remove dist and build artifacts
if (Test-Path dist) {
    Remove-Item -Recurse -Force dist
}

if (Test-Path .aws-sam) {
    Remove-Item -Recurse -Force .aws-sam
}

if (Test-Path function.zip) {
    Remove-Item function.zip
}

Write-Host "✅ Clean complete" -ForegroundColor Green

# Now rebuild
Write-Host "🔨 Rebuilding..." -ForegroundColor Yellow
npx tsc

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build complete" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
}