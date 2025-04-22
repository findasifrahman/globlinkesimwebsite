# Base stage for dependencies
FROM node:18-alpine AS base
WORKDIR /app

# Install OpenSSL, libc6-compat, and curl
RUN apk add --no-cache openssl libc6-compat curl

# Dependencies stage
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate

# Builder stage
FROM deps AS builder
COPY . .
RUN npm run build

# Runner stage
FROM base AS runner
ENV NODE_ENV=production

# Install production dependencies only
RUN apk add --no-cache openssl libc6-compat

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME "0.0.0.0"

CMD ["npm", "start"]

ENV DATABASE_URL="postgresql://postgres:postgres@db:5432/esim_db" 