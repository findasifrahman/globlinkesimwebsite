@echo off
echo Starting Azure Function...
echo Make sure you have the .env.local file in the parent directory with the correct database URL and other settings.

REM Start the Azure Function in a new window
start cmd /k "cd %~dp0 && npm start"

REM Wait for the function to start
echo Waiting for Azure Function to start...
timeout /t 10 /nobreak

REM Start ngrok tunnel for the Azure Function in a new window
echo Starting ngrok tunnel for Azure Function...
start cmd /k "ngrok http 7071"

echo Your webhook URL will be displayed in the ngrok window.
echo The webhook endpoint is at /api/redteamobile-webhook
echo Use this URL in your Redtea Mobile webhook configuration

REM Keep the window open
pause 