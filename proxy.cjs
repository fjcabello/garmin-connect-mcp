// Auth proxy: validates the API key (x-api-key header, or ?api_key= unless
// ALLOW_QUERY_API_KEY=false) before forwarding to the MCP HTTP server on port 8081
const http = require('http');
const crypto = require('crypto');

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.error('ERROR: API_KEY env var is required');
  process.exit(1);
}

// Query strings end up in logs; set ALLOW_QUERY_API_KEY=false once every client
// sends the x-api-key header.
const ALLOW_QUERY_API_KEY = (process.env.ALLOW_QUERY_API_KEY ?? 'true').toLowerCase() !== 'false';

// Constant-time comparison (hashing first gives equal-length buffers)
function validKey(provided) {
  const a = crypto.createHash('sha256').update(provided || '').digest();
  const b = crypto.createHash('sha256').update(API_KEY).digest();
  return crypto.timingSafeEqual(a, b);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const header = req.headers['x-api-key'];
  const provided = (Array.isArray(header) ? header[0] : header)
    || (ALLOW_QUERY_API_KEY ? url.searchParams.get('api_key') : null);

  if (!validKey(provided)) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return;
  }

  // Strip api_key before forwarding to the MCP server
  url.searchParams.delete('api_key');
  const forwardPath = url.pathname + (url.search || '');

  const headers = Object.assign({}, req.headers);
  headers['host'] = '127.0.0.1:8081';
  delete headers['x-api-key'];

  const options = {
    hostname: '127.0.0.1',
    port: 8081,
    path: forwardPath,
    method: req.method,
    headers,
  };

  const proxy = http.request(options, (upstream) => {
    res.writeHead(upstream.statusCode, upstream.headers);
    upstream.pipe(res, { end: true });
  });

  proxy.on('error', (err) => {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
    }
    res.end(JSON.stringify({ error: 'Bad Gateway', detail: err.message }));
  });

  req.pipe(proxy, { end: true });
});

server.listen(8080, '0.0.0.0', () => {
  console.log('Auth proxy listening on 0.0.0.0:8080');
});
