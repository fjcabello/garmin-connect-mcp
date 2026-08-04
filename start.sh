#!/bin/sh
set -e

# Start garmin-connect-mcp as a persistent HTTP server on port 8081
MCP_HTTP_PORT=8081 node /app/build/index.js &

# Wait for the server to be ready
sleep 2

# Start auth proxy on port 8080 (foreground, exposed to internet)
exec node /app/proxy.cjs
