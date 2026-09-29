'use strict';

const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const publicFiles = new Set(['index.html', 'index.js', 'tour.js', 'style.css', 'vendor/marzipano.js',
  'assets/план.jpg', ...Array.from({ length: 5 }, (_, i) => `assets/6_${i + 1} - Панорама.jpg`)]);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.jpg': 'image/jpeg' };

async function startServer(root) {
  const server = http.createServer(async (request, response) => {
    try {
      if (!['GET', 'HEAD'].includes(request.method)) {
        response.writeHead(405, { Allow: 'GET, HEAD' });
        response.end();
        return;
      }
      const url = new URL(request.url, 'http://localhost');
      const filename = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
      // Only serve the tour assets, never arbitrary files from the app directory.
      if (!publicFiles.has(filename)) {
        response.writeHead(404);
        response.end();
        return;
      }
      const data = await fs.readFile(path.join(root, filename));
      response.writeHead(200, {
        'Content-Type': types[path.extname(filename)],
        'Content-Length': data.length,
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; frame-src 'none'; base-uri 'none'",
        'Cache-Control': 'no-cache'
      });
      response.end(request.method === 'HEAD' ? undefined : data);
    } catch (error) {
      response.writeHead(error instanceof URIError ? 400 : 500);
      response.end();
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  return { server, origin: `http://127.0.0.1:${server.address().port}` };
}

module.exports = { startServer };
