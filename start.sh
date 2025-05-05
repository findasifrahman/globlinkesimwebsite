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

# Start the Next.js server first (this will be the main process)
echo "Starting Next.js server on port 3000..."
npm run start &
NEXT_PID=$!

# Wait for Next.js to start
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null; then
        echo "Next.js server started successfully (PID: $NEXT_PID)"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "Failed to start Next.js server"
        exit 1
    fi
    sleep 1
done

# Start the payment webhook server
start_server "Payment Webhook" "python3 webhook_payment/main.py" 3001 || exit 1

# Start the eSIM webhook server
start_server "eSIM Webhook" "python3 webhook_esim/main.py" 3002 || exit 1

# Keep the script running
wait $NEXT_PID 