# ==========================================
# view-logs.ps1 - View CloudWatch logs
# ==========================================

param(
    [string]$FunctionName,
    [int]$Hours = 1
)

if (-not $FunctionName) {
    # List all functions
    Write-Host "Available functions:" -ForegroundColor Yellow
    aws lambda list-functions --query "Functions[?contains(FunctionName, 'schematic-story')].FunctionName" --output table
    
    $FunctionName = Read-Host "Enter function name"
}

$logGroup = "/aws/lambda/$FunctionName"
$startTime = (Get-Date).AddHours(-$Hours).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

Write-Host "Fetching logs for $FunctionName (last $Hours hour(s))..." -ForegroundColor Yellow

aws logs filter-log-events --log-group-name $logGroup --start-time $startTime --output text