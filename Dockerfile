# ==========================================
# STAGE 1: Build & Compilation Stage
# ==========================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package manifests for dependency resolution caching
COPY package*.json ./

# Install all dependencies including devDependencies for compilation
RUN npm ci

# Copy full application codebase
COPY . .

# Compile Frontend (Vite) and Backend (esbuild bundle server.ts -> dist/server.cjs)
RUN npm run build

# Prune node_modules to keep only production-grade runtime dependencies
RUN npm prune --production

# ==========================================
# STAGE 2: Secure Production Runner Stage
# ==========================================
FROM node:18-alpine AS runner

# Set secure environment variables
ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# Create a dedicated system group and user to run the container without root privileges (Defense in Depth)
RUN addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nodejs -G nodejs

# Copy compiled assets, production dependencies, and package configurations
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

# Switch execution context to the unprivileged nodejs user
USER nodejs

# Expose the standard container ingress port (hardcoded reverse proxy standard)
EXPOSE 3000

# Add a native Docker health check to monitor container health in orchestration platforms
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Boot the unified bundled CommonJS backend server
CMD ["npm", "start"]
