@echo off



echo Starting ngrok tunnels...
start cmd /k "ngrok http --config=ngrok.yml 3000"
start cmd /k "ngrok http --config=ngrok.yml 3001"
start cmd /k "ngrok http --config=ngrok.yml 3002"

echo Services are running on:
echo - Next.js app: http://localhost:3000
echo - Payment webhook: http://localhost:3001
echo - eSIM webhook: http://localhost:3002
echo.
echo Ngrok tunnels are being created. Check the ngrok dashboard for public URLs.
echo.
echo To stop all services, close all command windows. 