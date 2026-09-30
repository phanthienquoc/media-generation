FROM --platform=$BUILDPLATFORM node:22-alpine AS build
ARG TARGETPLATFORM
ARG BUILDPLATFORM
RUN echo "Building media backend for ${TARGETPLATFORM} on ${BUILDPLATFORM}"
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN test -f /app/dist/main.js

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node","dist/main.js"]
