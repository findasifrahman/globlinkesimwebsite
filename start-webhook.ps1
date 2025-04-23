# Start ngrok in a new window
Start-Process powershell -ArgumentList "-NoExit -Command ngrok http 7071"

# Wait for ngrok to start
Start-Sleep -Seconds 5

# Start the Azure Function
func start 