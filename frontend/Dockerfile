
# Build the React (Vite) Application
ARG NODE_VERSION=22-alpine
# Frontend Dockerfile - React/Vite with Tailwind
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies as root (required for npm)
RUN npm ci

# Copy source code
COPY . .

# Ensure the "node" user owns the application files
RUN chown -R node:node /app

# Build the application as node user
USER node
RUN npm run build

# Runtime stage - serve with nginx
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Fix permissions for nginx user
#RUN chown -R nginx:nginx /usr/share/nginx/html && \
#    chown -R nginx:nginx /var/cache/nginx && \
##    chown -R nginx:nginx /var/log/nginx && \
#    touch /var/run/nginx.pid && \
#    chown nginx:nginx /var/run/nginx.pid

# Switch to non-root user
#USER nginx

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
