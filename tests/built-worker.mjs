import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

// Keep the test tools local; never load remote bindings or install dependencies.
process.env.WRANGLER_WRITE_LOGS = 'false';
process.env.WRANGLER_SEND_METRICS = 'false';
const require = createRequire(import.meta.url);
const wranglerRequire = createRequire(require.resolve('wrangler/package.json'));
const { Miniflare } = wranglerRequire('miniflare');
const { build } = wranglerRequire('esbuild');
const { unstable_getMiniflareWorkerOptions } = await import('wrangler');

export async function createBuiltWorker() {
  const configPath = path.resolve('dist/server/wrangler.json');
  const config = JSON.parse(await readFile(configPath, 'utf8'));
  // Translate the real generated Wrangler config. Do not recreate asset routing
  // by hand: that could silently test different routing from deployment.
  const { workerOptions } = unstable_getMiniflareWorkerOptions(configPath);
  assert.equal(
    Object.keys(workerOptions.bindings ?? {}).length,
    0,
    'Built checks require an environment without runtime variables or secrets',
  );
  const directory = path.resolve('.wrangler/check-build');
  await mkdir(directory, { recursive: true });
  const scriptPath = path.join(directory, 'worker.js');
  await build({
    stdin: {
      contents: `import worker from ${JSON.stringify(path.resolve(path.dirname(configPath), config.main))};
export default { async fetch(request, env, ctx) {
  await env.__TEST_INVOCATION.fetch('https://local.test/invoked');
  return worker.fetch(request, env, ctx);
} };`,
      resolveDir: process.cwd(),
      sourcefile: 'built-worker-probe.ts',
      loader: 'ts',
    },
    outfile: scriptPath,
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
  });
  let invocations = 0;
  let outbound = 0;
  const worker = new Miniflare({
    ...workerOptions,
    name: config.name,
    modules: true,
    modulesRoot: directory,
    scriptPath,
    cf: false,
    // Configuration is asserted separately; never give this runtime a sender.
    email: undefined,
    serviceBindings: {
      ...workerOptions.serviceBindings,
      __TEST_INVOCATION: () => {
        invocations++;
        return new Response(null);
      },
    },
    outboundService: () => {
      outbound++;
      return new Response('Unexpected network request', { status: 502 });
    },
  });
  return {
    config,
    worker,
    invocations: () => invocations,
    outbound: () => outbound,
  };
}
