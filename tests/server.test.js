/**
 * tests/server.test.js - Regression + security smoke tests for the Artifact16
 * Express server (AAP Sections 0.6.1, 0.8.1).
 *
 * Design notes (security-aligned):
 *   - Uses ONLY Node.js built-in modules (node:test, node:assert, node:http).
 *     No test framework, no supertest, no new dependency is added, so the
 *     audited "0 vulnerabilities" supply-chain posture is preserved.
 *   - Imports the configured Express app in-process from ../server.js, which
 *     exports `app` without binding a port. Each run starts the app on an
 *     ephemeral port (port 0) bound to loopback, issues a real HTTP request,
 *     asserts the response, then tears the listener down - making the suite
 *     deterministic and free of fixed-port conflicts.
 *
 * Run with: `node --test`  (or `npm test`).
 */

'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const app = require('../server');

let server;
let port;

before(async () => {
  await new Promise((resolve, reject) => {
    server = app.listen(0, '127.0.0.1', () => {
      port = server.address().port;
      resolve();
    });
    server.on('error', reject);
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

/**
 * Issue a GET request against the test server and resolve with the status
 * code, headers, and decoded body.
 * @param {string} path request path (e.g. "/")
 * @returns {Promise<{statusCode:number, headers:object, body:string}>}
 */
function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { host: '127.0.0.1', port, path, method: 'GET' },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, headers: res.headers, body });
        });
      },
    );
    req.on('error', reject);
    req.end();
  });
}

test('GET / returns exactly "Hello world"', async () => {
  const res = await get('/');
  assert.equal(res.statusCode, 200);
  assert.equal(res.body, 'Hello world');
});

test('GET /good-evening returns exactly "Good evening"', async () => {
  const res = await get('/good-evening');
  assert.equal(res.statusCode, 200);
  assert.equal(res.body, 'Good evening');
});

test('x-powered-by header is absent (framework fingerprinting disabled)', async () => {
  const res = await get('/');
  assert.equal(res.headers['x-powered-by'], undefined);
});

test('unknown route returns 404 without leaking internals/stack traces', async () => {
  const res = await get('/this-route-does-not-exist');
  assert.equal(res.statusCode, 404);
  // The default Express 5 404 body must not expose stack frames or file paths.
  const leaks = /\n\s+at\s|node_modules|server\.js:\d+/;
  assert.ok(!leaks.test(res.body), 'response body must not leak internal details');
});
