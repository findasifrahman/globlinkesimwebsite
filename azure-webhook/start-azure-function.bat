@echo off
echo Starting Azure Function...
echo Make sure you have the .env.local file in the parent directory with the correct database URL and other settings.

REM Start the Azure Function
cd %~dp0
npm start

REM Keep the window open
pause 