# ==========================================
# view-trigger-logs.ps1
# ==========================================

param(
    [string]$FunctionName = "CognitoPostConfirmationFunction",
    [int]$Minutes = 10
)

Write-Host "Viewing Cognito trigger logs..." -ForegroundColor Yellow

# Find the actual function name
$functions = aws lambda list-functions `
    --query "Functions[?contains(FunctionName, '$FunctionName')].FunctionName" `
    --output text

if ($functions) {
    $functionName = $functions.Split()[0]
    Write-Host "Function: $functionName" -ForegroundColor Cyan
    
    $logGroup = "/aws/lambda/$functionName"
    $startTime = (Get-Date).AddMinutes(-$Minutes).ToUniversalTime()
    $startTimeMs = [int64]($startTime - (Get-Date "1970-01-01")).TotalMilliseconds
    
    aws logs filter-log-events `
        --log-group-name $logGroup `
        --start-time $startTimeMs `
        --output text
} else {
    Write-Host "Function not found" -ForegroundColor Red
}