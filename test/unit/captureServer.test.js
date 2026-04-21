// Unit tests for captureServer utility functions that don't require a
// running Chromium instance. The CDP-dependent code paths (capture,
// cross-origin iframes, responsive capture) are exercised end-to-end
// by the example-percy-maestro integration runs and not unit-mocked here.

const { startServer } = require('../../percy/server/captureServer');

describe('captureServer.startServer', () => {
  let server;
  afterEach(async () => { if (server) await new Promise((r) => server.close(r)); });

  it('serves a healthcheck endpoint', async () => {
    server = await startServer({ port: 0 });
    const actualPort = server.address().port;

    const result = await new Promise((resolve, reject) => {
      require('http').get(`http://localhost:${actualPort}/healthcheck`, (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
      }).on('error', reject);
    });

    expect(result.status).toBe(200);
    const parsed = JSON.parse(result.body);
    expect(parsed.ok).toBe(true);
    expect(parsed.service).toBe('percy-maestro capture');
  });

  it('returns 404 on unknown routes', async () => {
    server = await startServer({ port: 0 });
    const actualPort = server.address().port;

    const result = await new Promise((resolve, reject) => {
      require('http').get(`http://localhost:${actualPort}/nope`, (res) => {
        resolve({ status: res.statusCode });
      }).on('error', reject);
    });

    expect(result.status).toBe(404);
  });
});
