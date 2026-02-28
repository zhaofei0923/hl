# ==========================================
# Stage 1: Build client (Vue 3 + Vant)
# ==========================================
FROM node:20-alpine AS build-client

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build

# ==========================================
# Stage 2: Build admin (Vue 3 + Element Plus)
# ==========================================
FROM node:20-alpine AS build-admin

WORKDIR /app/admin
COPY admin/package*.json ./
RUN npm ci
COPY admin/ .
RUN npm run build

# ==========================================
# Stage 3: Production nginx
# ==========================================
FROM nginx:alpine AS production

# Copy client build
COPY --from=build-client /app/client/dist /usr/share/nginx/html

# Copy admin build
COPY --from=build-admin /app/admin/dist /usr/share/nginx/admin

# Copy nginx configuration
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
