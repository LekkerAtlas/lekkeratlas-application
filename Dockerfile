# Stage 1: Base
FROM node:20 AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
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
CMD ["nginx", "-g", "daemon off;"]