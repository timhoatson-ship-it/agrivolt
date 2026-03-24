FROM node:20-slim

WORKDIR /app

# Copy shared types
COPY shared/ ./shared/

# Copy server and install
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --production=false

COPY server/ .
RUN npx tsc && npx tsc-alias

# Prune dev dependencies
RUN npm prune --production

# Production
ENV NODE_ENV=production
EXPOSE 3001

# Railway will inject DATABASE_URL, PORT, CORS_ORIGIN
CMD ["node", "dist/index.js"]
