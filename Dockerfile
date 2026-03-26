FROM node:20-slim

WORKDIR /app

# Copy all package files needed for npm ci
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY shared/package.json ./shared/

# Install all workspace dependencies
RUN npm ci

# Copy shared types (needed by server TypeScript build)
COPY shared/ ./shared/

# Copy server source
COPY server/ ./server/

# Build the server
WORKDIR /app/server
RUN npx tsc && npx tsc-alias

# Production settings
ENV NODE_ENV=production

# Railway injects PORT, DATABASE_URL at runtime
CMD ["node", "dist/server/src/index.js"]
