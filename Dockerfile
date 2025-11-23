# Build stage
FROM node:20-alpine AS builder

# Install git
RUN apk add --no-cache git

WORKDIR /app

# Build arguments for repository URL and environment variables
ARG REPO_URL=https://github.com/fabrizzioper/pet-connect-front-end.git
ARG REPO_BRANCH=main
ARG VITE_API_URL=http://localhost:3000/api
ARG VITE_APP_NAME=PetConnect
ARG VITE_APP_VERSION=1.0.0

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_VERSION=$VITE_APP_VERSION

# Clone repository
RUN git clone --depth 1 --branch ${REPO_BRANCH} ${REPO_URL} repo

WORKDIR /app/repo

# Install dependencies
RUN npm ci

# Build the application
RUN npm run build

# Create nginx.conf if it doesn't exist in the repo
RUN if [ ! -f nginx.conf ]; then \
      cat > nginx.conf << 'EOF' \
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Handle React Router (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Don't cache HTML
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
    }
}
EOF
    fi

# Production stage with Nginx
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/repo/dist /usr/share/nginx/html

# Copy nginx configuration from builder (will use created one if repo doesn't have it)
COPY --from=builder /app/repo/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

