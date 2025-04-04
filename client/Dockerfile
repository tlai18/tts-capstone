# Build Stage
FROM node:20.18.0-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ARG REACT_APP_IP_ADDRESS

ENV REACT_APP_IP_ADDRESS $REACT_APP_IP_ADDRESS

RUN npm run build
 
# Production Stage
FROM nginx:alpine AS production
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]