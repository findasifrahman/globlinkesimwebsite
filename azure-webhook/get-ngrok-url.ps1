# This script will help you get the ngrok URL for your webhook
Write-Host "Starting ngrok to get your webhook URL..." -ForegroundColor Green

# Check if ngrok is running
$ngrokProcess = Get-Process -Name "ngrok" -ErrorAction SilentlyContinue
if ($ngrokProcess) {
    Write-Host "ngrok is already running. You can find the URL in the ngrok window." -ForegroundColor Yellow
} else {
    # Start ngrok in a new window
    Write-Host "Starting ngrok in a new window..." -ForegroundColor Green
    Start-Process -FilePath "powershell" -NoExit -ArgumentList "-Command", "ngrok http 7071"
    
    # Wait for ngrok to start
    Write-Host "Waiting for ngrok to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

# Instructions for using the webhook URL
Write-Host "`nInstructions:" -ForegroundColor Cyan
Write-Host "1. Look for the ngrok URL in the ngrok window (it should look like https://xxxx-xx-xx-xxx-xx.ngrok.io)" -ForegroundColor White
Write-Host "2. Your webhook URL will be: https://[ngrok-url]/api/redteamobile-webhook" -ForegroundColor White
Write-Host "3. Use this URL in your Redtea Mobile webhook configuration" -ForegroundColor White
Write-Host "4. Make sure your Azure Function is running (use 'npm start' in the azure-webhook directory)" -ForegroundColor White
Write-Host "5. Make sure your .env.local file is in the parent directory with the correct database URL" -ForegroundColor White

Write-Host "`nPress any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 