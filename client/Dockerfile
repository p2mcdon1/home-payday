# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Using the ARG/ENV pattern we discussed for your backend
ARG API_URL_ARG=http://payroll-api.home
ENV REACT_APP_API_URL=$API_URL_ARG
RUN npm run build

# Stage 2: Serve
FROM nginx:stable-alpine
# 1. Remove the default Nginx config
RUN rm /etc/nginx/conf.d/default.conf
# 2. Copy your custom config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# 3. Copy the build files
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]