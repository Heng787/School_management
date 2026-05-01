FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# We assume there might be a build step or we just copy files. If backend uses esbuild, we'd run build here.
# RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
# COPY --from=builder /app/dist ./dist
# If no dist folder, just copy src
COPY --from=builder /app/src ./src
COPY package*.json ./
EXPOSE 3000
USER node
CMD ["node", "src/index.js"]
