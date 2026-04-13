FROM node:22-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json tsconfig.json tsup.config.ts ./
COPY src/ ./src/
RUN npm ci && npm run build

FROM node:22-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Install supergateway to expose stdio MCP as HTTP (same as Pi setup)
RUN npm install -g supergateway

COPY --from=builder /app/build ./build/

ENV NODE_ENV=production

EXPOSE 8080

CMD ["supergateway", "--stdio", "node build/index.js", "--outputTransport", "streamableHttp", "--port", "8080", "--streamableHttpPath", "/mcp"]
