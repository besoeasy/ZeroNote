# ===== Stage 1: Build Vite app (multi-arch) =====
FROM --platform=$BUILDPLATFORM docker.io/oven/bun:alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build production assets
RUN bun run build

# ===== Stage 2: Serve with Nginx (multi-arch) =====
FROM docker.io/library/nginx:alpine

# Remove default site
RUN rm -rf /usr/share/nginx/html/*

# Copy built Vite assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx.conf (server block)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy custom global nginx.conf (rootless support)
COPY nginx-global.conf /etc/nginx/nginx.conf

# Support running as arbitrary user which belogs to the root group
RUN chmod g+rwx /var/cache/nginx /var/run /var/log/nginx && \
    chgrp -R root /var/cache/nginx && \
    addgroup nginx root

# Expose HTTP
EXPOSE 8000

# Switch to non-root user
USER nginx

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
