#!/bin/bash

# Add Python bin to PATH
export PATH="/usr/local/bin:$PATH"

# Function to start a server and check if it's running
start_server() {
    local name=$1
    local command=$2
    echo "Starting $name server..."
    $command &
    local pid=$!
    sleep 5  # Give it time to start
    if ps -p $pid > /dev/null; then
        echo "$name server started successfully (PID: $pid)"
    else
        echo "Failed to start $name server"
        exit 1
    fi
}

# Start the payment webhook server
start_server "Payment Webhook" "python3 webhook_payment/main.py"

# Start the eSIM webhook server
start_server "eSIM Webhook" "python3 webhook_esim/main.py"

# Start the Next.js server (this will be the main process)
echo "Starting Next.js server..."
npm run start 