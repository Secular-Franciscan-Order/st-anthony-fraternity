import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { workerBuildConfig } from '../lib/worker-build-config.ts';

const config = workerBuildConfig(process.env);
const manifest = JSON.parse(
  await readFile('dist/server/vinext-prerender.json', 'utf8'),
) as {
  routes: { route: string; status: string }[];
};
if (
  !manifest.routes.some(
    (route) => route.route === '/' && route.status === 'rendered',
  ) ||
  manifest.routes.some((route) => route.status !== 'rendered')
) {
  throw new Error(
    'Static export is incomplete; every required route must be rendered.',
  );
}
await Promise.all(
  ['index.html', 'index.rsc', '404.html'].map((file) =>
    access(`dist/client/${file}`),
  ),
);
await mkdir('dist/server', { recursive: true });
await writeFile(
  'dist/server/wrangler.json',
  `${JSON.stringify(config, null, 2)}\n`,
);
console.log('Static export verified; generated contact Worker configuration.');
