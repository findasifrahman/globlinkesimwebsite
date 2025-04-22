# Globlink eSIM Webhook Service

This service handles webhook events from Redtea Mobile for the Globlink eSIM application.

## Features

- Processes webhook events from Redtea Mobile
- Updates order statuses in the database
- Queries eSIM profiles when needed
- Sends email notifications to users
- Comprehensive logging

## Prerequisites

- Node.js v18 or later
- npm or yarn
- PostgreSQL database
- Access to Redtea Mobile API

## Setup

1. Clone the repository
2. Navigate to the webhook service directory:
   ```
   cd azure-webhook
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Create a `.env.local` file in the parent directory with the following variables:
   ```
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/globlink?schema=public"
   
   # Redtea Mobile API
   REDTEA_API_URL="https://api.redteamobile.com"
   REDTEA_ACCESS_KEY="your_access_key"
   ESIM_SECRET_KEY="your_secret_key"
   ESIM_WEBHOOK_SECRET="your_webhook_secret"
   
   # Email
   SMTP_HOST="smtp.example.com"
   SMTP_PORT=587
   SMTP_USER="your_smtp_username"
   SMTP_PASSWORD="your_smtp_password"
   SMTP_FROM="noreply@globlink.com"
   
   # Server
   PORT=7071
   ```

5. Generate Prisma client:
   ```
   npx prisma generate
   ```

## Running Locally

1. Start the webhook service:
   ```
   npm start
   ```

2. For development with auto-restart:
   ```
   npm run dev
   ```

3. Use ngrok to expose the local service:
   ```
   ngrok http 7071
   ```

4. Update the webhook URL in Redtea Mobile's dashboard with the ngrok URL.

## Webhook Endpoints

### Main Webhook Endpoint

```
POST /globlinkesimwebhook
```

This endpoint receives webhook events from Redtea Mobile.

### Health Check Endpoint

```
GET /health
```

This endpoint returns a 200 OK response if the service is running.

## Webhook Event Types

### ORDER_STATUS

Updates order status and queries eSIM profiles when needed.

Example payload:
```json
{
  "notifyType": "ORDER_STATUS",
  "content": {
    "orderNo": "B23072016497499",
    "orderStatus": "GOT_RESOURCE"
  }
}
```

### ESIM_STATUS

Updates eSIM status information.

Example payload:
```json
{
  "notifyType": "ESIM_STATUS",
  "content": {
    "orderNo": "B25042019250004",
    "esimTranNo": "25042019250004",
    "transactionId": "TXN-1745177119849-sldrdwp",
    "iccid": "8910300000019910827",
    "esimStatus": "CANCEL",
    "smdpStatus": "RELEASED"
  }
}
```

### DATA_USAGE

Updates data usage statistics.

Example payload:
```json
{
  "notifyType": "DATA_USAGE",
  "content": {
    "orderNo": "B23072016497499",
    "totalVolume": 10000,
    "usedVolume": 2500,
    "remainingVolume": 7500
  }
}
```

### VALIDITY_USAGE

Updates validity and expiry information.

Example payload:
```json
{
  "notifyType": "VALIDITY_USAGE",
  "content": {
    "orderNo": "B23072016497499",
    "totalValidity": 30,
    "usedValidity": 5,
    "remainingValidity": 25,
    "expiryDate": "2023-08-20T00:00:00Z"
  }
}
```

## Deployment

The webhook service is deployed to Railway. To deploy updates:

1. Push changes to the repository
2. Railway will automatically deploy the changes

## Troubleshooting

If webhooks are not being processed:

1. Check the Railway logs for errors
2. Verify that the webhook URL is correctly configured in Redtea Mobile's dashboard
3. Ensure that the webhook secret is correctly configured in both the service and Redtea Mobile's dashboard 