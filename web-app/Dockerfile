# Etapa de build: compila la SPA de Angular.
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa final: sirve los archivos estáticos con nginx.
FROM nginx:alpine
COPY --from=build /app/dist/taller-observabilidad/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
