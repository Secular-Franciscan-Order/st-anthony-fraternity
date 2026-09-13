# St. Anthony Fraternity website

The statically exported single-page website for the St. Anthony Fraternity of the Secular Franciscan Order in Tucson, Arizona. Launch work is tracked in [issue #1](https://github.com/Secular-Franciscan-Order/st-anthony-fraternity/issues/1).

The primary URL is `https://stanthonytucson.org`. `www` permanently redirects to the apex, preserving path and query. Previous `/pilgrim` and `/quiet` review links retain their existing destinations. The staging alias and generated version previews remain `noindex, nofollow`; only the exact production HTTPS origin can submit the contact form.

## Local development and validation

Use the Node and pnpm versions in `package.json` and the existing lockfile.

```sh
pnpm install
pnpm dev

pnpm lint
pnpm exec tsc --noEmit
pnpm test
pnpm build
pnpm types:worker
pnpm check:build
```

`pnpm build` uses Vinext's supported static export, verifies the homepage/RSC/404 artifacts and writes the contact Worker configuration. Export requires a local loopback prerender server. `pnpm test` uses Node's built-in runner with mocked verification/email. `pnpm check:build` translates the actual generated config through Wrangler into its installed Miniflare and counts every Worker invocation: pages/assets/old redirects/missing URLs must bypass the Worker; contact requests must enter it. It also checks indexing, exact binding restrictions and client privacy, then starts actual local Wrangler dev to verify the generated configuration. Tests have no secret, use local bindings and deny outbound calls; no real email is sent. Regenerate `worker-configuration.d.ts` after configuration changes using a main/local production config.

For browser-only local testing, set the **public** `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in ignored `.env.local` before starting/building. Cloudflare's documented dummy key is `1x00000000000000000000AA`; use it only for local/mocked tests. The production key must be a real dedicated St. Anthony widget key. No key means the UI visibly disables sending. Localhost may display the widget, but the server still rejects non-production requests: intercept `/api/contact` with a mock to test accepted/failure UI states. Do not weaken the server host check or use remote email bindings for local QA.

## Contact form

The React form preserves the selected design, full name and optional phone field. Email and message are required. It shows pending, verification-expired, accepted and failure states, retains entries on failure, and prevents simultaneous submits. The existing visible phone/email fallback remains available.

`worker.ts` dispatches the exact `/api/contact` path to `lib/contact.ts`, which adapts the approved [St. Margaret Worker source](https://github.com/Secular-Franciscan-Order/st-margaret-of-cortona-fraternity/blob/87ab38e36c59e315ccb159a86cf7ddeb78307f65/src/worker.ts), with full-name/optional-phone mapping for this form. There is no shared package or additional service.

Every accepted submission uses a server-owned message with:

- To at launch: **only** `benjamin.saenz@gmail.com`.
- From: `St. Anthony Fraternity <contact@stanthonytucson.org>`.
- Reply-To: the visitor's validated email address.

The `CONTACT_EMAIL` binding restricts destinations to Benjamin's address and sender to the address above. Browser input cannot change routing. This sends no visitor auto-reply and creates no mailbox or forwarding rule. Success indicates provider acceptance; actual receipt in Benjamin's inbox must be verified separately.

The owner approved this phased launch while Milly completes verification. Add `milly.rivera14@gmail.com` only after her destination is verified, using a reviewed follow-up change to `contactRecipients` and the exact-recipient assertions. The shared list supplies both the server send payload and generated production binding. Keep issue #1 open until that update and delivery to both inboxes are verified; Milly's pending verification does not block the Benjamin-only launch.

Protections include an exact production HTTPS destination and Origin check, a 10,000-byte streamed request limit even without truthful Content-Length, bounded fields without silent truncation, a honeypot, server-side Turnstile verification of hostname **and** `contact` action, HTML escaping, and no-store responses. The application neither stores submissions nor logs their contents, addresses, tokens, phone numbers or provider errors. Name is limited to 200 characters, email 250, phone 50 and message 5,000; the total byte limit also applies.

## Deployment configuration

Cloudflare Workers Builds remains the deployment path:

- Repository: `Secular-Franciscan-Order/st-anthony-fraternity`.
- Production branch: `main`.
- Build command: `pnpm build`.
- Deploy command: `pnpm deploy`.
- Worker: `st-anthony-fraternity`.
- Custom domains: `stanthonytucson.org`, `www.stanthonytucson.org`, `stanthonyfraternity.endian.dev`.

`next.config.ts` enables native static export; `app/page.tsx` explicitly requires a static page. `scripts/write-worker-config.ts` verifies the export and generates `dist/server/wrangler.json` from `lib/worker-build-config.ts`; never edit the generated file. Wrangler bundles `worker.ts` through the existing deploy/version-upload commands. The current dependency versions and lockfile are unchanged.

Cloudflare serves `dist/client` directly with `404-page` handling and `run_worker_first: ['/api/contact']`. HTML/RSC, CSS/JavaScript, images, favicon, robots, sitemap, old-link redirects and missing paths are served without running the contact Worker. The single portrait uses a standard image with explicit dimensions and loading priority; no runtime image optimization is needed. `public/_headers` applies noindex on aliases and removes it on the apex. Static robots permits crawling, disallows `/api/`, and references the apex sitemap on every hostname so preview crawlers can read their noindex header. Free zone rules must redirect www and HTTP apex requests, including assets; the small Worker also redirects those requests if they reach its API path.

Keep **Builds for non-production branches** enabled. The September 12 inventory showed the preview command `pnpm exec wrangler versions upload --config dist/server/wrangler.json`, which uploads a preview version without promoting production. `contactBuildConfig` uses Cloudflare's documented `WORKERS_CI_BRANCH`: `main` retains the exact email binding; every other branch omits it. CI without a branch fails the build before generating configuration. Ordinary local builds retain the production configuration for checks. Unknown-host requests still cannot send even with a forged production Origin. Do not deploy a branch to the live Worker.

Validate the actual outputs with `WORKERS_CI=1 WORKERS_CI_BRANCH=main pnpm build` followed by `pnpm check:build`, then `WORKERS_CI=1 WORKERS_CI_BRANCH=codex/preview pnpm build` followed by `pnpm check:build -- --preview` (or `node tests/check-build.mjs --preview`). A preview config may normalize the absent binding to an empty `send_email` array; it contains no email binding. This additional binding-isolation policy is our project choice, not a Cloudflare requirement to disable previews.

Required production settings, after approval of the concrete rollout:

| Setting                          | Location                             | Required value/readiness                                                                                  |
| -------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Workers Builds public build variable | Dedicated St. Anthony widget public key, present before `pnpm build`; rebuild when changed                |
| `TURNSTILE_SECRET_KEY`           | Worker runtime secret                | Matching widget secret, entered through authenticated tooling; never source/build variables/client bundle |
| Turnstile hostname restrictions  | Dedicated widget                     | Approved apex/www and staging hostnames; server mail permission remains apex-only                         |
| `CONTACT_EMAIL`                  | Generated Worker binding             | Exactly Benjamin's verified destination and the one allowed sender above                                   |
| Email Routing/domain setup       | Cloudflare active zone               | Provider-issued root MX/SPF/DKIM records and sender eligibility ready; Benjamin's destination verified      |

Missing runtime configuration returns a truthful unavailable response; the form never reports acceptance when the provider rejects a send. No credential belongs in source, issues, PRs or logs.

## Rollout gates and recovery

Code review and PR approval do not activate DNS, mail, secrets or production. Merging `main` deploys automatically, so all dependencies must be ready first. The owner-approved preparatory exception is creating/reusing one **inactive Free** Cloudflare zone after issue creation, with draft public DNS. It does not authorize cutover or live settings.

1. Record the current main commit, deployed Worker version, assigned Cloudflare nameservers and a DNS/settings export. Present the exact changes, controlled test-send scope and recovery actions for production approval.
2. Preserve registrar ownership at Porkbun. The authenticated September 12 inventory found two parking records: apex **ALIAS** to `pixie.porkbun.com` (TTL 600), and wildcard **CNAME** `*.stanthonytucson.org` to `pixie.porkbun.com` (TTL 600). There was no explicit `www` CNAME. Review the apex replacement and wildcard disposition explicitly; do not remove unrelated records. Recheck records before cutover. The same inventory showed DNSSEC off/no DS, URL forwarding unset and no configured mail/forwarding service; recheck these too.
3. Activate Cloudflare DNS through the reviewed Porkbun nameserver change and wait for authoritative/zone activation. If DNSSEC has since changed, handle the old DS and TTL before the nameserver switch. Preserve existing mail service if any is discovered. Apply only the approved provider-issued email DNS records; these affect inbound mail for the entire domain and create no mailbox. Do not invent MX/SPF/DKIM values or create a catch-all.
4. Include Free Cloudflare zone redirects in the approved rollout: send every www request and every HTTP apex request to the same path at `https://stanthonytucson.org`, with status 308 and query preserved. This covers assets and pages without Worker execution. Verify the complete rule expressions before applying them. `_redirects` handles only the six old review paths; Cloudflare does not support domain-level rules there.
5. Verify Benjamin's destination, prepare the dedicated Turnstile widget/build key/runtime secret, remove only the approved parking conflicts immediately before custom-domain attachment, and merge through the existing Builds path after explicit rollout approval. Milly remains excluded until the verified-recipient follow-up.
6. Check apex and www HTTPS/certificates, redirects, public assets, canonical/indexing and old links. Send only the approved synthetic test, confirm arrival in **Benjamin's** inbox (including spam check), Reply-To and optional phone. Do not declare launch complete from the API response alone. Keep issue #1 open for adding and testing Milly after verification.

Prefer an approved Worker version/application rollback while retaining healthy DNS. A prior version may restore the noindex/mockup behavior. If the form fails, disable it with a truthful temporary notice and preserve direct contact details. DNS rollback uses the recorded nameservers/records and correct DS state; propagation is not immediate. Obtain approval for recovery actions unless already included in the rollout authorization. Never change other OFS deployments.

### Cost and framework limitation

[Verified-destination sending is free on all Cloudflare plans](https://developers.cloudflare.com/email-service/platform/pricing/); arbitrary-recipient sending and visitor auto-replies are outside this scope. The [structured sending API](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/) is Beta, and the existing site pins Vinext `1.0.0-beta.5`.

The account was confirmed on Workers Free. The September 12 existing SSR deployment sample showed 49 Worker invocations, zero errors and Worker-execution CPU P50 of 26.13 ms; it was not a homepage profile or proof of an outage. The approved conversion now exports the informational site and leaves only contact handling dynamic. Actual Wrangler-derived local routing checks prove ordinary browsing and missing paths bypass the Worker. They do not measure edge CPU; check representative live usage after the separately approved rollout.

A prior prerender-only experiment generated files the SSR Worker did not serve. The final implementation instead uses supported `output: 'export'` and serves its generated client directory directly. An installed `next/image` export dependency error under pnpm was avoided by using a normal image for the one fixed portrait, preserving dimensions, alt text and responsive CSS. No framework rewrite, dependency upgrade, custom SSR adapter, cache or paid-plan change was required.
