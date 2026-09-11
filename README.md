# St. Anthony Fraternity website

This repository contains the selected single-page website for the St. Anthony Fraternity of the Secular Franciscan Order in Tucson, Arizona.

The site is served at `/`. Previous `/pilgrim` and `/quiet` review links permanently redirect to the selected site so existing bookmarks continue to work. The contact form remains intentionally non-sending during the mockup phase and explains that behavior when used.

## Local development

```sh
pnpm install
pnpm dev
```

Run the project checks with:

```sh
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

## Deployment

Cloudflare Workers Builds is the deployment path:

- GitHub repository: `Secular-Franciscan-Order/st-anthony-fraternity`
- Production branch: `main`
- Build command: `pnpm build`
- Deploy command: `pnpm deploy`
- Public staging domain: `stanthonyfraternity.endian.dev`

The Worker name and custom domain are declared in `vite.config.ts`. The build generates `dist/server/wrangler.json`, which `pnpm deploy` publishes. Pushes to `main` rebuild and update the staging site through Cloudflare Workers Builds.
