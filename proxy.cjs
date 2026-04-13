// Auth proxy: validates ?api_key= before forwarding to supergateway on port 8081
const http = require('http');

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.error('ERROR: API_KEY env var is required');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const provided = url.searchParams.get('api_key');

  if (provided !== API_KEY) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return;
  }

  // Strip api_key before forwarding to supergateway
  url.searchParams.delete('api_key');
  const forwardPath = url.pathname + (url.search || '');

  const headers = Object.assign({}, req.headers);
  headers['host'] = '127.0.0.1:8081';

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
