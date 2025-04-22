@echo off
echo Starting ngrok to get your webhook URL...

REM Check if ngrok is running
tasklist /FI "IMAGENAME eq ngrok.exe" 2>NUL | find /I /N "ngrok.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ngrok is already running. You can find the URL in the ngrok window.
) else (
    REM Start ngrok in a new window
    echo Starting ngrok in a new window...
    start cmd /k "ngrok http 7071"
    
    REM Wait for ngrok to start
    echo Waiting for ngrok to start...
    timeout /t 5 /nobreak > nul
)

REM Instructions for using the webhook URL
echo.
echo Instructions:
echo 1. Look for the ngrok URL in the ngrok window (it should look like https://xxxx-xx-xx-xxx-xx.ngrok.io)
echo 2. Your webhook URL will be: https://[ngrok-url]/api/redteamobile-webhook
echo 3. Use this URL in your Redtea Mobile webhook configuration
echo 4. Make sure your Azure Function is running (use 'npm start' in the azure-webhook directory)
echo 5. Make sure your .env.local file is in the parent directory with the correct database URL
echo.
echo Press any key to exit...
pause > nul 