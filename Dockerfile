# Stage 1: Base
FROM node:26 AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Development Stage 2: Serve hot reloaded content
FROM base AS development
CMD ["npm", "run", "development"]

# Production Stage 2: Build
FROM base AS builder
RUN npm run build

# Production Stage 3: Serve
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN cat > /docker-entrypoint.d/10-generate-runtime-config.sh <<'EOF' \
  && chmod +x /docker-entrypoint.d/10-generate-runtime-config.sh
#!/bin/sh
set -eu

cat > /usr/share/nginx/html/config.js <<EOF_CONFIG
globalThis.__APP_CONFIG__ = {
  AUTH_AUTHORITY: "${AUTH_AUTHORITY}",
  AUTH_CLIENT_ID: "${AUTH_CLIENT_ID}",
  AUTH_REDIRECT_URI: "${AUTH_REDIRECT_URI}",
  AUTH_POST_LOGOUT_REDIRECT_URI: "${AUTH_POST_LOGOUT_REDIRECT_URI}",
  API_BASE_URL: "${API_BASE_URL}"
};
EOF_CONFIG
EOF

CMD ["nginx", "-g", "daemon off;"]
