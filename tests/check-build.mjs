import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

// Use the simulator already pinned by Wrangler; no test dependency or live service.
const require = createRequire(import.meta.url);
const wranglerRequire = createRequire(require.resolve('wrangler/package.json'));
const { Miniflare } = wranglerRequire('miniflare');
const serverRoot = path.resolve('dist/server');
const config = JSON.parse(
  await readFile(path.join(serverRoot, 'wrangler.json'), 'utf8'),
);

assert.deepEqual(
  config.routes,
  [
    'stanthonytucson.org',
    'www.stanthonytucson.org',
    'stanthonyfraternity.endian.dev',
  ].map((pattern) => ({ pattern, custom_domain: true })),
);
assert.deepEqual(config.send_email, [
  {
    name: 'CONTACT_EMAIL',
    allowed_destination_addresses: [
      'benjamin.saenz@gmail.com',
      'milly.rivera14@gmail.com',
    ],
    allowed_sender_addresses: ['contact@stanthonytucson.org'],
  },
]);
assert.equal(config.main, 'index.js');
assert.equal(config.assets.run_worker_first, undefined);

async function inspectClient(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) await inspectClient(filename);
    else if (/\.(js|html|json|map)$/.test(entry.name)) {
      const source = await readFile(filename, 'utf8');
      assert.doesNotMatch(
        source,
        /TURNSTILE_SECRET_KEY|TEST_SECRET_ONLY|CONTACT_EMAIL|milly\.rivera14@gmail\.com/,
        `Server-only data in ${filename}`,
      );
    }
  }
}
await inspectClient(path.resolve('dist/client'));

let outboundRequests = 0;
const moduleFiles = await readdir(serverRoot, { recursive: true });
const modules = [
  config.main,
  ...moduleFiles.filter(
    (filename) => filename.endsWith('.js') && filename !== config.main,
  ),
].map((filename) => ({
  type: 'ESModule',
  path: path.join(serverRoot, filename),
}));
const worker = new Miniflare({
  name: config.name,
  modules,
  modulesRoot: serverRoot,
  compatibilityDate: config.compatibility_date,
  compatibilityFlags: config.compatibility_flags,
  cf: false,
  // Deliberately no email binding or Turnstile secret. All network I/O is denied.
  outboundService: () => {
    outboundRequests++;
    return new Response('Unexpected network request', { status: 502 });
  },
  assets: {
    directory: path.resolve(serverRoot, config.assets.directory),
    binding: config.assets.binding,
    routerConfig: {
      has_user_worker: true,
      invoke_user_worker_ahead_of_assets: false,
    },
    assetConfig: { not_found_handling: config.assets.not_found_handling },
  },
});

try {
  const request = (url, init) =>
    worker.dispatchFetch(url, { redirect: 'manual', ...init });
  for (const hostname of [
    'stanthonytucson.org',
    'stanthonyfraternity.endian.dev',
    'version-st-anthony.workers.dev',
  ]) {
    const production = hostname === 'stanthonytucson.org';
    const response = await request(`https://${hostname}/`);
    assert.equal(response.status, 200);
    assert.equal(
      response.headers.get('X-Robots-Tag'),
      production ? null : 'noindex, nofollow',
    );
    const html = await response.text();
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
    assert.equal(new URL(canonical).href, 'https://stanthonytucson.org/');
    assert.match(html, /name="robots" content="index, follow"/);
    assert.match(html, /name="phone"/);
    assert.doesNotMatch(html, /Mockup form/);
    const assetPaths = [
      ...new Set(
        [...html.matchAll(/(?:href|src)="(\/_next\/static\/[^"?]+)"/g)].map(
          (match) => match[1],
        ),
      ),
    ];
    assert.ok(assetPaths.length > 0);
    for (const assetPath of assetPaths) {
      const asset = await request(`https://${hostname}${assetPath}`);
      assert.equal(asset.status, 200, `Missing generated asset: ${assetPath}`);
      assert.equal(
        asset.headers.get('X-Robots-Tag'),
        production ? null : 'noindex, nofollow',
        `Wrong asset indexing: ${hostname}${assetPath}`,
      );
      const contentType = asset.headers.get('Content-Type') ?? '';
      assert.ok(
        assetPath.endsWith('.css')
          ? contentType.includes('text/css')
          : contentType.includes('javascript'),
        `Wrong asset content type: ${assetPath}`,
      );
      await asset.arrayBuffer();
    }
    const robots = await request(`https://${hostname}/robots.txt`);
    assert.equal(
      await robots.text(),
      production
        ? 'User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: https://stanthonytucson.org/sitemap.xml\n'
        : 'User-agent: *\nDisallow: /\n',
    );
  }
  for (const pathname of ['/?from=test', '/quiet?from=test']) {
    const response = await request(
      `https://www.stanthonytucson.org${pathname}`,
    );
    assert.equal(response.status, 308);
    assert.equal(
      response.headers.get('Location'),
      `https://stanthonytucson.org${pathname}`,
    );
  }
  const oldRoutes = {
    '/pilgrim': '/',
    '/quiet': '/',
    '/quiet/come-and-see': '/#come-and-see',
    '/quiet/franciscan-life': '/#the-way',
    '/quiet/questions': '/#questions',
    '/quiet/who-we-are': '/#who-we-are',
  };
  for (const [pathname, destination] of Object.entries(oldRoutes)) {
    const response = await request(`https://stanthonytucson.org${pathname}`);
    assert.equal(response.status, 308);
    assert.equal(
      new URL(response.headers.get('Location'), 'https://stanthonytucson.org')
        .href,
      `https://stanthonytucson.org${destination}`,
    );
  }
  assert.equal(
    (await request('https://stanthonytucson.org/favicon.svg')).status,
    200,
  );
  assert.match(
    await (await request('https://stanthonytucson.org/sitemap.xml')).text(),
    /<loc>https:\/\/stanthonytucson\.org\/<\/loc>/,
  );
  for (const method of ['GET', 'OPTIONS', 'PUT', 'PATCH', 'DELETE']) {
    const response = await request('https://stanthonytucson.org/api/contact', {
      method,
    });
    assert.equal(response.status, 405);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
  }
  for (const [hostname, status] of [
    ['stanthonytucson.org', 503],
    ['stanthonyfraternity.endian.dev', 403],
    ['version-st-anthony.workers.dev', 403],
  ]) {
    const response = await request(`https://${hostname}/api/contact`, {
      method: 'POST',
      headers: { Origin: 'https://stanthonytucson.org' },
      body: new URLSearchParams({
        email: 'synthetic@example.com',
        message: 'Local test only',
        'cf-turnstile-response': 'test-token',
      }),
    });
    assert.equal(response.status, status);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
  }
  assert.equal(outboundRequests, 0);
  console.log(
    'Built Worker checks passed: native API routes, mail guard, canonical/indexing, assets, old links, bindings and client privacy. No external calls or mail.',
  );
} finally {
  await worker.dispose();
}
