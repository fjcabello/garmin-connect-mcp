#!/bin/sh
set -e

# Start supergateway on internal port 8081 (not exposed)
supergateway \
  --stdio "node /app/build/index.js" \
  --outputTransport streamableHttp \
  --port 8081 \
  --host 127.0.0.1 \
  --streamableHttpPath /mcp &

# Wait for supergateway to be ready
sleep 2

# Start auth proxy on port 8080 (foreground, exposed to internet)
exec node /app/proxy.cjs
