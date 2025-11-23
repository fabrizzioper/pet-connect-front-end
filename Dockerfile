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

# Production stage with Nginx
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/repo/dist /usr/share/nginx/html

# Copy nginx configuration from builder
COPY --from=builder /app/repo/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

