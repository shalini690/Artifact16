/**
 * server.js - Express HTTP entry point for the Artifact16 tutorial server.
 *
 * Endpoints (both unauthenticated, body-less GET requests returning static text):
 *   GET /              -> "Hello world"   (existing baseline endpoint, preserved)
 *   GET /good-evening  -> "Good evening"  (new endpoint)
 *
 * Security posture (preventative supply-chain hardening - see AAP Section 0.5.2):
 *   - Express is pinned to a patched release (^5.2.1 in package.json) so the
 *     transitive tree carries no known CVEs (npm audit => 0 vulnerabilities).
 *   - Framework fingerprinting is disabled (the x-powered-by header is removed).
 *   - Minimal attack surface: only the two GET routes are registered and no
 *     request-body parsing is enabled, so the URL-encoded DoS class
 *     (CVE-2024-45590) is not reachable.
 *   - No custom error handler is added; Express 5's default handler does not
 *     leak stack traces to clients.
 *
 * Module shape:
 *   - Exports the configured Express `app` (module.exports) so it can be
 *     imported in-process by the test suite without binding a port.
 *   - Binds a listening port only when run directly (require.main === module),
 *     so `node server.js` / `npm start` behavior is unchanged.
 */

'use strict';

const express = require('express');

const app = express();

// Security: do not advertise the framework in responses (reduces fingerprinting).
// Set before any route is registered so the x-powered-by header is never emitted.
app.disable('x-powered-by');

// Existing baseline endpoint - returns the verbatim "Hello world" string.
app.get('/', (req, res) => {
  res.send('Hello world');
});

// New endpoint - returns the verbatim "Good evening" string.
app.get('/good-evening', (req, res) => {
  res.send('Good evening');
});

// Bind to the configured port (PORT environment variable) or fall back to 3000.
const PORT = process.env.PORT || 3000;

// Only bind a port when this file is executed directly (e.g. `node server.js`
// or `npm start`). When the module is require()'d (e.g. by tests/server.test.js),
// the configured app is exported WITHOUT auto-binding, allowing callers to
// listen on an ephemeral port and tear it down cleanly. The runtime behavior of
// the entry point is therefore unchanged.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

// Export the configured Express app for in-process testing and reuse.
module.exports = app;
