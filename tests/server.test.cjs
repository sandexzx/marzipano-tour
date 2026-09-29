'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { startServer } = require('../electron/server.cjs');

test('offline server serves only tour files on a loopback address', async t => {
  const { server, origin } = await startServer(path.join(__dirname, '..'));
  t.after(() => new Promise(resolve => server.close(resolve)));
  assert.equal(server.address().address, '127.0.0.1');
  for (const file of ['', 'index.js', 'tour.js', 'style.css', 'vendor/marzipano.js',
    'assets/план.jpg', ...Array.from({ length: 5 }, (_, i) => `assets/6_${i + 1} - Панорама.jpg`)]) {
    const response = await fetch(origin + '/' + file);
    assert.equal(response.status, 200, file);
    assert.ok((await response.arrayBuffer()).byteLength > 0, file);
    assert.ok(response.headers.get('content-security-policy').includes("script-src 'self'"));
  }
  for (const file of ['package.json', 'electron/main.cjs', '.git/config', 'assets/../package.json', '%2e%2e%2fpackage.json']) {
    const response = await fetch(origin + '/' + file);
    assert.equal(response.status, 404, file);
    await response.arrayBuffer();
  }
  assert.equal((await fetch(origin + '/%zz')).status, 400);
  assert.equal((await fetch(origin + '/', { method: 'POST' })).status, 405);
  const head = await fetch(origin + '/', { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal((await head.arrayBuffer()).byteLength, 0);
});
