# Use Node.js base image
FROM node:18-alpine AS node-builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Use Python base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy built application from node-builder
COPY --from=node-builder /app/.next ./.next
COPY --from=node-builder /app/node_modules ./node_modules
COPY --from=node-builder /app/package*.json ./
COPY --from=node-builder /app/public ./public
COPY --from=node-builder /app/next.config.js ./
COPY --from=node-builder /app/prisma ./prisma

# Copy Python webhook files
COPY webhook_payment ./webhook_payment
COPY webhook_esim ./webhook_esim
COPY requirements.txt ./

# Install Python dependencies
RUN pip install -r requirements.txt

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 