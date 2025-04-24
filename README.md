# Next.js esim Project with Material UI and Docker

This is a Next.js 14 project with TypeScript, TailwindCSS, and Material UI, containerized with Docker.

## Features

- Next.js 14
- TypeScript
- TailwindCSS
- Material UI
- Docker support
- Hot reloading in development

## Prerequisites

- Node.js 18 or later
- Docker and Docker Compose

## Getting Started

### Development with Docker

1. Build and start the development container:
```bash
docker-compose up
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Development without Docker

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

1. Build the Docker image:
```bash
docker build -t nextjs-app .
```

2. Run the container:
```bash
docker run -p 3000:3000 nextjs-app
```

## Project Structure

```
├── src/
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   └── lib/          # Utility functions and configurations
├── public/           # Static files
├── Dockerfile        # Production Docker configuration
└── docker-compose.yml # Development Docker configuration
```

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Material UI Documentation](https://mui.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

# eSIM Purchase Application

This application allows customers to purchase eSIMs online using an API provided by an eSIM provider.

## Database Setup for Local Development

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Setting Up the Database

1. Make sure PostgreSQL is installed and running on your machine.

2. Create a PostgreSQL database for the application:
   ```bash
   psql -U postgres
   CREATE DATABASE esim_db;
   ```

3. Update the `.env` file with your database connection string:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/esim_db?schema=public"
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Set up the database using the provided script:
   ```bash
   npm run db:setup
   ```

   This will:
   - Run Prisma migrations to create the database schema
   - Generate the Prisma client
   - Seed the database with initial data

### Database Schema

The application uses the following database tables:

- `all_packages`: Stores information about available eSIM packages
- `users`: Stores user account information
- `order_profiles`: Stores order information
- `data_usage_logs`: Logs data usage for eSIMs
- `validity_usage_logs`: Logs validity usage for eSIMs
- `esim_status_logs`: Logs eSIM status changes

## Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

## API Integration

The application integrates with an eSIM provider's API to:
- Fetch available eSIM packages
- Create orders
- Process payments
- Activate eSIMs
- Monitor usage and status

## Authentication

The application uses NextAuth.js for authentication with the following features:
- User registration
- Email verification
- Login/logout
- Password reset
- Protected routes 

# eSIM Management System

## Webhook Architecture

This project uses a dedicated webhook service to handle incoming webhooks from Redtea Mobile. The webhook service is deployed on Railway and is configured to process the following event types:

- `ORDER_STATUS`: Updates order status and queries eSIM profiles when needed
- `ESIM_STATUS`: Updates eSIM status information
- `DATA_USAGE`: Updates data usage statistics
- `VALIDITY_USAGE`: Updates validity and expiry information

### Webhook URL

The webhook URL is configured in the `.env.local` file:

```
WEBHOOK_URL=https://globlinkesimwebhook-production.up.railway.app/globlinkesimwebhook
```

All webhook requests from Redtea Mobile should be sent to this URL.

### Webhook Service

The webhook service is implemented in the `azure-webhook` directory and includes:

- Webhook endpoint for receiving events
- Event processing logic for different event types
- Database updates using Prisma
- Email notifications for important events
- Comprehensive logging

### Event Types

#### ORDER_STATUS

When an order status changes, the webhook service:

1. Updates the order status in the database
2. If the status is `GOT_RESOURCE` or `READY_FOR_DOWNLOAD`:
   - Queries the eSIM profile from Redtea Mobile API
   - Updates the order with QR code and profile details
   - Sends an email notification if the status is `READY_FOR_DOWNLOAD`

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

#### ESIM_STATUS

When an eSIM status changes, the webhook service:

1. Updates the eSIM status and SMDP status in the database

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

#### DATA_USAGE

When data usage information is updated, the webhook service:

1. Updates the data usage statistics in the database

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

#### VALIDITY_USAGE

When validity information is updated, the webhook service:

1. Updates the expiry date and days remaining in the database

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

## Development

### Running the Webhook Service Locally

To run the webhook service locally for testing:

1. Install dependencies:
   ```
   cd azure-webhook
   npm install
   ```

2. Start the service:
   ```
   ./start-webhook.ps1
   ```

3. Use ngrok to expose the local service:
   ```
   ngrok http 7071
   ```

4. Update the webhook URL in Redtea Mobile's dashboard with the ngrok URL.

## Deployment

The webhook service is deployed to Railway. To deploy updates:

1. Push changes to the repository
2. Railway will automatically deploy the changes

## Troubleshooting

If webhooks are not being processed:

1. Check the Railway logs for errors
2. Verify that the webhook URL is correctly configured in Redtea Mobile's dashboard
3. Ensure that the webhook secret is correctly configured in both the service and Redtea Mobile's dashboard 

# Globlink eSIM Management System

A comprehensive eSIM management platform built with Next.js, TypeScript, and Material-UI that allows users to purchase, manage, and monitor their eSIMs.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Authentication Flow](#authentication-flow)
- [eSIM Management Flow](#esim-management-flow)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

Globlink eSIM Management System is a web application that enables users to purchase and manage eSIMs for international travel. The platform provides a seamless experience for users to browse available packages, make purchases, and monitor their eSIM usage.

## Features

- User authentication and account management
- Browse and search for eSIM packages by region
- Purchase eSIMs with secure payment processing
- View and manage active eSIMs
- Monitor data usage and remaining validity
- QR code generation for eSIM installation
- Responsive design for mobile and desktop

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Material-UI
- **Backend**: Next.js API Routes
- **Database**: Prisma ORM with PostgreSQL
- **Authentication**: NextAuth.js
- **Payment Processing**: Stripe
- **eSIM Integration**: RedteaGO API

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database
- RedteaGO API credentials

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/globlink-esim.git
   cd globlink-esim
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables (see [Environment Variables](#environment-variables))

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/globlink"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# RedteaGO API
REDTEA_API_URL="https://api.redteago.com"
REDTEA_API_KEY="your-api-key"
REDTEA_API_SECRET="your-api-secret"

# Stripe
STRIPE_PUBLIC_KEY="your-stripe-public-key"
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
```

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
globlink-esim/
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── api/         # API routes
│   │   ├── auth/        # Authentication pages
│   │   ├── account/     # User account pages
│   │   └── ...          # Other pages
│   ├── components/      # React components
│   ├── lib/             # Utility functions and API clients
│   ├── types/           # TypeScript type definitions
│   └── styles/          # Global styles
├── prisma/              # Prisma schema and migrations
├── .env.local           # Environment variables (not in repo)
├── .gitignore           # Git ignore file
├── next.config.js       # Next.js configuration
├── package.json         # Project dependencies
└── tsconfig.json        # TypeScript configuration
```

## API Documentation

### Authentication

- `POST /api/auth/signin` - Sign in with email and password
- `POST /api/auth/signup` - Register a new user
- `GET /api/auth/session` - Get the current session

### Orders

- `GET /api/orders` - Get all orders for the current user
- `POST /api/orders` - Create a new order
- `GET /api/orders/[orderNo]` - Get a specific order
- `POST /api/update-order` - Update order details

### eSIM Profiles

- `GET /api/fetch-order-profile-single` - Get eSIM profile for an order
- `GET /api/packages` - Get all available eSIM packages
- `GET /api/packages/[packageCode]` - Get a specific package

### Payment

- `POST /api/create-payment-intent` - Create a Stripe payment intent
- `POST /api/webhooks/stripe` - Handle Stripe webhooks

## Authentication Flow

1. User navigates to the sign-in page
2. User enters email and password
3. NextAuth.js validates credentials against the database
4. Upon successful authentication, a session is created
5. User is redirected to the account page

## eSIM Management Flow

1. User browses available eSIM packages
2. User selects a package and proceeds to checkout
3. User completes payment via Stripe
4. System creates an order and initiates eSIM provisioning
5. User receives eSIM details and QR code
6. User can view and manage their eSIMs from their account

## Database Schema

The application uses the following main tables:

- `User` - User account information
- `Order` - Order details including package and payment information
- `Package` - Available eSIM packages
- `Profile` - eSIM profile information

## Deployment

1. Set up a PostgreSQL database
2. Configure environment variables for production
3. Build the application:
   ```bash
   npm run build
   # or
   yarn build
   ```
4. Deploy to your preferred hosting platform (Vercel, AWS, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 