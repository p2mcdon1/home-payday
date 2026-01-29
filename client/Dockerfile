# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json* ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the app (outputs to ./build)
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install serve to run the static build
RUN npm install -g serve

# Copy built assets from builder
COPY --from=builder /app/build ./build

# Default port for serve
EXPOSE 3000

# Serve the static site; -s for SPA fallback to index.html
CMD ["serve", "-s", "build", "-l", "3000"]
