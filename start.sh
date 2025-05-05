#!/bin/bash

# Add Python bin to PATH
export PATH="/usr/local/bin:$PATH"

# Function to start a server and check if it's running
start_server() {
    local name=$1
    local command=$2
    local port=$3
    
    echo "Starting $name server on port $port..."
    $command &
    local pid=$!
    
    # Wait for the server to start
    for i in {1..30}; do
        if curl -s http://localhost:$port > /dev/null; then
            echo "$name server started successfully (PID: $pid)"
            return 0
        fi
        sleep 1
    done
    
    echo "Failed to start $name server"
    return 1
}

# Start the webhook server
start_server "Webhook" "cd webhooks && PORT=3001 python3 main.py" 3001 || exit 1

# Start the Next.js app
echo "Starting Next.js server..."
PORT=3000 npm run start

# Start the payment webhook server
start_server "Payment Webhook" "python3 webhook_payment/main.py" 3002 || exit 1

# Start the eSIM webhook server
start_server "eSIM Webhook" "python3 webhook_esim/main.py" 3003 || exit 1

# Keep the script running
wait $NEXT_PID 