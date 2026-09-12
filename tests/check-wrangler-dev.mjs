import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
process.env.WRANGLER_WRITE_LOGS = 'false';
process.env.WRANGLER_SEND_METRICS = 'false';
const { unstable_startWorker } = await import('wrangler');
let outbound = 0;
const worker = await unstable_startWorker({
  config: 'dist/server/wrangler.json',
  envFiles: [],
  sendMetrics: false,
  dev: {
    remote: false,
    persist: false,
    watch: false,
    inspector: false,
    generateTypes: false,
    logLevel: 'error',
    server: { hostname: '127.0.0.1', port: 0 },
    origin: { hostname: 'stanthonytucson.org', secure: true },
    outboundService: () => {
      outbound++;
      return new Response('Blocked', { status: 502 });
    },
  },
});
try {
  await worker.ready;
  const response = await worker.fetch('https://stanthonytucson.org/');
  assert.equal(response.status, 200);
  assert.equal(
    await response.text(),
    await readFile('dist/client/index.html', 'utf8'),
  );
  const missing = await worker.fetch('https://stanthonytucson.org/missing.js');
  assert.equal(missing.status, 404);
  await missing.arrayBuffer();
  const post = await worker.fetch('https://stanthonytucson.org/api/contact', {
    method: 'POST',
    headers: { Origin: 'https://stanthonytucson.org' },
    body: new URLSearchParams({
      email: 'synthetic@example.com',
      message: 'Local only',
      'cf-turnstile-response': 'dummy',
    }),
  });
  assert.equal(post.status, 503);
  await post.arrayBuffer();
  assert.equal(outbound, 0);
  console.log(
    'Actual Wrangler dev passed generated config: exact exported homepage, asset404 and guarded contact503; outbound0.',
  );
} finally {
  await worker.dispose();
}
