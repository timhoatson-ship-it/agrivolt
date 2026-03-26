FROM node:20-slim

WORKDIR /app

# Copy shared types first (needed by server build)
COPY shared/ ./shared/

# Copy server package files and install deps
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --production=false

# Copy server source and build
COPY server/ .
RUN npx tsc && npx tsc-alias

# Prune dev dependencies for smaller image
RUN npm prune --production

# Production settings
ENV NODE_ENV=production

# Railway injects PORT, DATABASE_URL, CORS_ORIGIN at runtime
EXPOSE ${PORT:-3001}

CMD ["node", "dist/server/src/index.js"]
