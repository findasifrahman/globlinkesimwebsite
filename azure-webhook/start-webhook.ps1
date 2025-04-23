# Start the webhook service
Write-Host "Starting Globlink eSIM Webhook Service..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Node.js is not installed. Please install Node.js v18 or later." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm -v
    Write-Host "npm version: $npmVersion" -ForegroundColor Cyan
} catch {
    Write-Host "npm is not installed. Please install npm." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Generate Prisma client
Write-Host "Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

# Start the service
Write-Host "Starting webhook service..." -ForegroundColor Green
npm start 