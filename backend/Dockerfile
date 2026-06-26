# Build stage
FROM node:18-alpine

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy source files
COPY . .

# Expose server port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start application
CMD ["node", "server.js"]
