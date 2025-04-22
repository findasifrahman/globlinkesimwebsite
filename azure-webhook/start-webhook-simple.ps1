# Start the Azure Function
Write-Host "Starting Azure Function..." -ForegroundColor Green
Write-Host "Make sure you have the .env.local file in the parent directory with the correct database URL and other settings." -ForegroundColor Yellow

# Start the Azure Function in a new window
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm start"

# Wait for the function to start
Write-Host "Waiting for Azure Function to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Start ngrok tunnel for the Azure Function in a new window
Write-Host "Starting ngrok tunnel for Azure Function..." -ForegroundColor Green
Start-Process -FilePath "powershell" -NoExit -ArgumentList "-Command", "ngrok http 7071"

Write-Host "Your webhook URL will be displayed in the ngrok window." -ForegroundColor Cyan
Write-Host "The webhook endpoint is at /api/redteamobile-webhook" -ForegroundColor Cyan
Write-Host "Use this URL in your Redtea Mobile webhook configuration" -ForegroundColor Yellow 