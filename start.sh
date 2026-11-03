#!/bin/sh
set -e

# Start garmin-connect-mcp as a persistent HTTP server on port 8081
MCP_HTTP_PORT=8081 node /app/build/index.js &
MCP_PID=$!

# Wait until the MCP server accepts connections before exposing port 8080.
# Fly routes the request that woke the machine as soon as 8080 listens, so
# opening it earlier makes that request fail with the proxy's 502.
i=0
until node -e "require('net').connect(8081, '127.0.0.1').on('connect', () => process.exit(0)).on('error', () => process.exit(1))"; do
  if ! kill -0 "$MCP_PID" 2>/dev/null; then
    echo "ERROR: MCP server exited before listening on 8081" >&2
    exit 1
  fi
  i=$((i + 1))
  if [ "$i" -ge 150 ]; then
    echo "ERROR: MCP server not listening on 8081 after 30s" >&2
    exit 1
  fi
  sleep 0.2
done

# Start auth proxy on port 8080 (foreground, exposed to internet)
exec node /app/proxy.cjs
