#!/bin/bash

# Start the payment webhook server in the background
python3 webhook_payment/main.py &

# Start the eSIM webhook server in the background
python3 webhook_esim/main.py &

# Start the Next.js server (this will be the main process)
npm run start 