# St. Anthony Fraternity website mockups

This repository contains two review-ready website directions for the St. Anthony Fraternity of the Secular Franciscan Order:

- `/quiet` — a calm, editorial direction inspired by the St. Margaret of Cortona Fraternity site.
- `/pilgrim` — a warmer, more expressive direction inspired by Style A from the design templates repository.

The root page lets reviewers compare both directions. Contact controls are intentionally non-sending during the mockup phase and explain that behavior when used.

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

Cloudflare Workers Builds is the intended deployment path:

- GitHub repository: `Secular-Franciscan-Order/st-anthony-fraternity`
- Production branch: `main`
- Build command: `pnpm build`
- Deploy command: `pnpm deploy`
- Public review domain: `stanthonyfraternity.endian.dev`

The Worker name and custom domain are declared in `vite.config.ts`. The build generates `dist/server/wrangler.json`, which `pnpm deploy` publishes. Pushes to `main` should therefore rebuild and update the public review site after the repository is connected in Cloudflare Workers Builds.
