# 1) Build stage
FROM node:20-alpine AS build
ARG APP_VERSION=dev
ENV APP_VERSION=$APP_VERSION
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build  # bouwt naar /app/dist

# 2) Runtime stage (statisch serveren)
FROM nginx:alpine
ARG APP_VERSION
ENV APP_VERSION=$APP_VERSION
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]