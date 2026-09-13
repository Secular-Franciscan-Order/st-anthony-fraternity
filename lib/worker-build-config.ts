import { contactBuildConfig } from './contact-build-config.ts';
import {
  productionHostname,
  stagingHostname,
  wwwHostname,
} from './site-hosting.ts';

// Paths are relative to the generated dist/server/wrangler.json.
export function workerBuildConfig(
  environment: Record<string, string | undefined>,
) {
  return {
    name: 'st-anthony-fraternity',
    main: '../../worker.ts',
    compatibility_date: '2026-05-15',
    compatibility_flags: ['nodejs_compat'],
    preview_urls: true,
    routes: [productionHostname, wwwHostname, stagingHostname].map(
      (pattern) => ({ pattern, custom_domain: true }),
    ),
    ...contactBuildConfig(environment),
    assets: {
      directory: '../client',
      not_found_handling: '404-page',
      run_worker_first: ['/api/contact'],
    },
  };
}
