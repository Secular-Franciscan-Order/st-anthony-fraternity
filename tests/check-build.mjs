import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { createBuiltWorker } from './built-worker.mjs';

const runtime = await createBuiltWorker();
const { config, worker } = runtime;
try {
  assert.deepEqual(
    config.routes,
    [
      'stanthonytucson.org',
      'www.stanthonytucson.org',
      'stanthonyfraternity.endian.dev',
    ].map((pattern) => ({ pattern, custom_domain: true })),
  );
  assert.deepEqual(
    config.send_email ?? [],
    process.argv.includes('--preview')
      ? []
      : [
          {
            name: 'CONTACT_EMAIL',
            allowed_destination_addresses: [
              'benjamin.saenz@gmail.com',
              'milly.rivera14@gmail.com',
            ],
            allowed_sender_addresses: ['contact@stanthonytucson.org'],
          },
        ],
  );
  assert.equal(config.main, '../../worker.ts');
  assert.deepEqual(config.assets, {
    directory: '../client',
    not_found_handling: '404-page',
    run_worker_first: ['/api/contact'],
  });
  const client = path.resolve('dist/client');
  for (const filename of await readdir(client, { recursive: true })) {
    if (!/\.(js|html|json|map)$/.test(filename)) continue;
    const source = await readFile(path.join(client, filename), 'utf8');
    assert.doesNotMatch(
      source,
      /TURNSTILE_SECRET_KEY|TEST_SECRET_ONLY|CONTACT_EMAIL|milly\.rivera14@gmail\.com/,
      `Server-only data in ${filename}`,
    );
  }
  const html = await readFile(path.join(client, 'index.html'), 'utf8');
  assert.match(html, /name="phone"/);
  assert.match(html, /name="robots" content="index, follow"/);
  assert.equal(
    new URL(html.match(/rel="canonical" href="([^"]+)"/)?.[1]).href,
    'https://stanthonytucson.org/',
  );
  assert.doesNotMatch(html, /\/(?:_next|_vinext)\/image\?/);
  assert.match(await readFile(path.join(client, '404.html'), 'utf8'), /404/);
  const assets = [
    ...new Set(
      [...html.matchAll(/(?:href|src)="(\/_next\/static\/[^"?]+)"/g)].map(
        (match) => match[1],
      ),
    ),
  ];
  assert.ok(
    assets.some((asset) => asset.endsWith('.css')) &&
      assets.some((asset) => asset.endsWith('.js')),
  );
  const request = (url, init) =>
    worker.dispatchFetch(url, { redirect: 'manual', ...init });
  async function staticRequest(url, init) {
    const before = runtime.invocations();
    const response = await request(url, init);
    assert.equal(
      runtime.invocations(),
      before,
      `Static request invoked the Worker: ${url}`,
    );
    return response;
  }
  for (const host of [
    'stanthonytucson.org',
    'stanthonyfraternity.endian.dev',
    'version-st-anthony.workers.dev',
  ]) {
    const production = host === 'stanthonytucson.org';
    for (const pathname of [
      '/',
      '/index.rsc',
      '/favicon.svg',
      '/images/saint-francis.jpg',
      '/robots.txt',
      '/sitemap.xml',
      ...assets,
    ]) {
      const response = await staticRequest(`https://${host}${pathname}`);
      assert.equal(response.status, 200, pathname);
      assert.equal(
        response.headers.get('X-Robots-Tag'),
        production ? null : 'noindex, nofollow',
      );
      if (pathname.endsWith('.css'))
        assert.match(response.headers.get('Content-Type'), /text\/css/);
      if (pathname.endsWith('.js'))
        assert.match(response.headers.get('Content-Type'), /javascript/);
      if (pathname.endsWith('.jpg'))
        assert.match(response.headers.get('Content-Type'), /image\/jpeg/);
      const body = await response.text();
      if (pathname === '/')
        assert.equal(
          body,
          html,
          'Homepage must be the exported file, not runtime HTML',
        );
      if (pathname === '/robots.txt')
        assert.equal(
          body,
          'User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: https://stanthonytucson.org/sitemap.xml\n',
        );
      if (pathname === '/sitemap.xml')
        assert.match(body, /<loc>https:\/\/stanthonytucson\.org\/<\/loc>/);
    }
  }
  for (const [pathname, destination] of Object.entries({
    '/pilgrim': '/',
    '/quiet': '/',
    '/quiet/come-and-see': '/#come-and-see',
    '/quiet/franciscan-life': '/#the-way',
    '/quiet/questions': '/#questions',
    '/quiet/who-we-are': '/#who-we-are',
  })) {
    for (const suffix of ['', '/']) {
      for (const query of ['', '?from=bookmark']) {
        const response = await staticRequest(
          `https://stanthonytucson.org${pathname}${suffix}${query}`,
        );
        const expected = new URL(destination, 'https://stanthonytucson.org');
        expected.search = query;
        assert.equal(response.status, 308);
        assert.equal(
          new URL(
            response.headers.get('Location'),
            'https://stanthonytucson.org',
          ).href,
          expected.href,
        );
      }
    }
  }
  for (const pathname of ['/missing', '/missing.js', '/api/contact/']) {
    for (const headers of [
      {},
      { 'sec-fetch-mode': 'navigate', accept: 'text/html' },
    ]) {
      const response = await staticRequest(
        `https://stanthonytucson.org${pathname}`,
        { headers },
      );
      assert.equal(response.status, 404);
      await response.arrayBuffer();
    }
  }
  for (const method of ['HEAD', 'POST', 'OPTIONS']) {
    const response = await staticRequest(
      'https://stanthonytucson.org/missing',
      { method },
    );
    assert.equal(response.status, method === 'HEAD' ? 404 : 405);
    await response.arrayBuffer();
  }
  assert.equal(
    runtime.invocations(),
    0,
    'Browsing must not execute the contact Worker',
  );
  for (const method of ['GET', 'HEAD', 'OPTIONS', 'PUT', 'PATCH', 'DELETE']) {
    const before = runtime.invocations();
    const response = await request('https://stanthonytucson.org/api/contact', {
      method,
    });
    assert.equal(runtime.invocations(), before + 1);
    assert.equal(response.status, 405);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    await response.arrayBuffer();
  }
  for (const [hostname, status] of [
    ['stanthonytucson.org', 503],
    ['stanthonyfraternity.endian.dev', 403],
    ['version-st-anthony.workers.dev', 403],
  ]) {
    const before = runtime.invocations();
    const response = await request(`https://${hostname}/api/contact`, {
      method: 'POST',
      headers: { Origin: 'https://stanthonytucson.org' },
      body: new URLSearchParams({
        email: 'synthetic@example.com',
        message: 'Local test only',
        'cf-turnstile-response': 'test-token',
      }),
    });
    assert.equal(runtime.invocations(), before + 1);
    assert.equal(response.status, status);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    await response.arrayBuffer();
  }
  assert.equal(runtime.outbound(), 0);
  console.log(
    `Built checks passed using Wrangler's generated routing: static page/assets/404s/old links, ${runtime.invocations()} guarded contact requests, bindings, indexing and client privacy. No mail or external calls.`,
  );
} finally {
  await worker.dispose();
}

// Also exercise the installed Wrangler dev pipeline with this generated config.
await import('./check-wrangler-dev.mjs');
