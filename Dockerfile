# Stage 1: Base
FROM node:24 AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=true

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Development Stage
FROM base AS development

CMD ["pnpm", "run", "development"]

# Build Stage
FROM base AS builder

RUN pnpm run build

# Production Stage
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
