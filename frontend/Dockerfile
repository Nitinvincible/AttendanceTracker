# ── Frontend Dockerfile (multi-stage) ───────────────────────────────
# Stage 1: Build React/Vite app
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (cached unless package.json changes)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
# VITE_API_URL can be overridden at build time:
#   docker build --build-arg VITE_API_URL=http://your-backend:8000 .
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# ────────────────────────────────────────────────────────────────────
# Stage 2: Serve the built files with nginx
FROM nginx:alpine

# Remove default nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx config that handles React Router (client-side routing)
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
    try_files $uri $uri/ /index.html;\n\
    }\n\
    }\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
