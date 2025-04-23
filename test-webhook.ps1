# Get the ngrok URL from the environment or prompt for it
$ngrokUrl = $env:NGROK_URL
if (-not $ngrokUrl) {
    $ngrokUrl = Read-Host "Enter your ngrok URL (e.g., https://xxxx-xx-xxx-xxx-xxx.ngrok-free.app)"
}

# Test data for different webhook types
$webhooks = @(
    @{
        type = "ORDER_STATUS"
        orderNo = "B1234567890"
        transactionId = "TXN123456"
        status = "GOT_RESOURCE"
        notifyType = "ORDER_STATUS"
    },
    @{
        type = "ESIM_STATUS"
        orderNo = "B1234567890"
        transactionId = "TXN123456"
        esimStatus = "IN_USE"
        smdpStatus = "ENABLED"
        qrCode = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
    },
    @{
        type = "DATA_USAGE"
        orderNo = "B1234567890"
        transactionId = "TXN123456"
        dataRemaining = 1000000000  # 1GB in bytes
        dataUsed = 500000000       # 500MB in bytes
    },
    @{
        type = "VALIDITY_USAGE"
        orderNo = "B1234567890"
        transactionId = "TXN123456"
        expiryDate = "2024-05-19T00:00:00Z"
        daysRemaining = 30
    }
)

# Function to send webhook
function Send-Webhook {
    param (
        [Parameter(Mandatory=$true)]
        [hashtable]$Data
    )
    
    $webhookUrl = "$ngrokUrl/api/webhook"
    $jsonBody = $Data | ConvertTo-Json
    
    Write-Host "Sending webhook to $webhookUrl"
    Write-Host "Payload: $jsonBody"
    
    try {
        $response = Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $jsonBody -ContentType "application/json"
        Write-Host "Response: $($response | ConvertTo-Json)"
        Write-Host "Webhook sent successfully!" -ForegroundColor Green
    }
    catch {
        Write-Host "Error sending webhook: $_" -ForegroundColor Red
    }
    
    # Add a small delay between requests
    Start-Sleep -Seconds 2
}

# Send all test webhooks
foreach ($webhook in $webhooks) {
    Send-Webhook -Data $webhook
} 