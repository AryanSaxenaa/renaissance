FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY fixtures ./fixtures
COPY data ./data
COPY src/server/store/migrations ./dist/server/store/migrations
RUN mkdir -p /app/.data && chown -R node:node /app/.data
USER node
CMD ["node", "dist/server/index.js"]
