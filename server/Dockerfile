# Production image
FROM node:20-alpine

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy application code
COPY . .

# Default port (override with PORT env at runtime)
EXPOSE 3001

# Run the server
CMD ["node", "index.js"]
