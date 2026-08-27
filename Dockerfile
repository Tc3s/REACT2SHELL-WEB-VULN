FROM node:20-alpine AS base

# Install OpenSSL for Prisma and curl for healthchecks
RUN apk add --no-cache openssl libc6-compat curl

WORKDIR /app

# Copy package manifests & Prisma schema
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install dependencies (requires legacy-peer-deps due to React 19 RC)
RUN npm install --legacy-peer-deps

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start in development or standard Next.js mode
CMD ["npm", "run", "dev"]
