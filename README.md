# St. Anthony Fraternity website

The selected single-page website for the St. Anthony Fraternity of the Secular Franciscan Order in Tucson, Arizona. Launch work is tracked in [issue #1](https://github.com/Secular-Franciscan-Order/st-anthony-fraternity/issues/1).

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

`pnpm test` uses Node's built-in test runner with mocked verification and email. `pnpm check:build` runs the generated Worker in Wrangler's installed Miniflare, with no email binding or Turnstile secret and with outbound requests denied. It checks native API dispatch, domain redirects, indexing, old review links, assets, the exact email binding and server-only data exclusion from the client bundle. Miniflare requires local loopback-port access. The generated `worker-configuration.d.ts` describes non-secret bindings; regenerate after configuration changes.

For browser-only local testing, set the **public** `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in ignored `.env.local` before starting/building. Cloudflare's documented dummy key is `1x00000000000000000000AA`; use it only for local/mocked tests. The production key must be a real dedicated St. Anthony widget key. No key means the UI visibly disables sending. Localhost may display the widget, but the server still rejects non-production requests: intercept `/api/contact` with a mock to test accepted/failure UI states. Do not weaken the server host check or use remote email bindings for local QA.

## Contact form

The React form preserves the selected design, full name and optional phone field. Email and message are required. It shows pending, verification-expired, accepted and failure states, retains entries on failure, and prevents simultaneous submits. The existing visible phone/email fallback remains available.

`app/api/contact/route.ts` uses the existing native Vinext Worker entry and `env` from `cloudflare:workers`. `lib/contact.ts` adapts the approved [St. Margaret Worker source](https://github.com/Secular-Franciscan-Order/st-margaret-of-cortona-fraternity/blob/87ab38e36c59e315ccb159a86cf7ddeb78307f65/src/worker.ts), with full-name/optional-phone mapping for this form. There is no shared package or additional service.

Every accepted submission uses a server-owned message with:

- To: **both** `benjamin.saenz@gmail.com` and `milly.rivera14@gmail.com`.
- From: `St. Anthony Fraternity <contact@stanthonytucson.org>`.
- Reply-To: the visitor's validated email address.

The `CONTACT_EMAIL` binding restricts destinations to those two addresses and sender to that one address. Browser input cannot change routing. This sends no visitor auto-reply and creates no mailbox or forwarding rule. Success indicates provider acceptance; actual inbox receipt must be verified separately in both inboxes.

Protections include an exact production HTTPS destination and Origin check, a 10,000-byte streamed request limit even without truthful Content-Length, bounded fields without silent truncation, a honeypot, server-side Turnstile verification of hostname **and** `contact` action, HTML escaping, and no-store responses. The application neither stores submissions nor logs their contents, addresses, tokens, phone numbers or provider errors. Name is limited to 200 characters, email 250, phone 50 and message 5,000; the total byte limit also applies.

## Deployment configuration

Cloudflare Workers Builds remains the deployment path:

- Repository: `Secular-Franciscan-Order/st-anthony-fraternity`.
- Production branch: `main`.
- Build command: `pnpm build`.
- Deploy command: `pnpm deploy`.
- Worker: `st-anthony-fraternity`.
- Custom domains: `stanthonytucson.org`, `www.stanthonytucson.org`, `stanthonyfraternity.endian.dev`.

`vite.config.ts` generates `dist/server/wrangler.json`; never edit the generated file as configuration. It preserves domains and the restricted email binding across normal deployments. Cloudflare serves immutable assets before the Worker, as required by the existing Vinext entry. Page and API requests pass through `proxy.ts` for the host policy; `public/_headers` applies noindex to static assets on aliases and removes that header on the production apex. robots and sitemap endpoints describe the single public page.

Before **any implementation-branch push**, inspect Workers Builds Branch Control and the non-production command. The September 12 inventory showed non-production builds enabled with `pnpm exec wrangler versions upload --config dist/server/wrangler.json`. A version upload is not a main deployment, but it would still capture the production email binding. Independent review requires owner approval to turn off **Builds for non-production branches**, then confirmation it is off, before the first implementation push. Do not change this setting without that approval. Unknown-host requests cannot send even with a forged production Origin. Do not deploy a branch to the live Worker.

Required production settings, after approval of the concrete rollout:

| Setting                          | Location                             | Required value/readiness                                                                                  |
| -------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Workers Builds public build variable | Dedicated St. Anthony widget public key, present before `pnpm build`; rebuild when changed                |
| `TURNSTILE_SECRET_KEY`           | Worker runtime secret                | Matching widget secret, entered through authenticated tooling; never source/build variables/client bundle |
| Turnstile hostname restrictions  | Dedicated widget                     | Approved apex/www and staging hostnames; server mail permission remains apex-only                         |
| `CONTACT_EMAIL`                  | Generated Worker binding             | Exactly the two verified destinations and one allowed sender above                                        |
| Email Routing/domain setup       | Cloudflare active zone               | Provider-issued root MX/SPF/DKIM records and sender eligibility ready; both destination owners verified   |

Missing runtime configuration returns a truthful unavailable response; the form never reports acceptance when the provider rejects a send. No credential belongs in source, issues, PRs or logs.

## Rollout gates and recovery

Code review and PR approval do not activate DNS, mail, secrets or production. Merging `main` deploys automatically, so all dependencies must be ready first. The owner-approved preparatory exception is creating/reusing one **inactive Free** Cloudflare zone after issue creation, with draft public DNS. It does not authorize cutover or live settings.

1. Record the current main commit, deployed Worker version, assigned Cloudflare nameservers and a DNS/settings export. Present the exact changes, controlled test-send scope and recovery actions for production approval.
2. Preserve registrar ownership at Porkbun. The authenticated September 12 inventory found two parking records: apex **ALIAS** to `pixie.porkbun.com` (TTL 600), and wildcard **CNAME** `*.stanthonytucson.org` to `pixie.porkbun.com` (TTL 600). There was no explicit `www` CNAME. Review the apex replacement and wildcard disposition explicitly; do not remove unrelated records. Recheck records before cutover. The same inventory showed DNSSEC off/no DS, URL forwarding unset and no configured mail/forwarding service; recheck these too.
3. Activate Cloudflare DNS through the reviewed Porkbun nameserver change and wait for authoritative/zone activation. If DNSSEC has since changed, handle the old DS and TTL before the nameserver switch. Preserve existing mail service if any is discovered. Apply only the approved provider-issued email DNS records; these affect inbound mail for the entire domain and create no mailbox. Do not invent MX/SPF/DKIM values or create a catch-all.
4. Include a Free Cloudflare Redirect Rule in the approved rollout: match `http.host eq "www.stanthonytucson.org"`, redirect with status 308 to `concat("https://stanthonytucson.org", http.request.uri.path)`, preserving the query string. This covers asset URLs as well as pages without forcing asset requests through Vinext. The application proxy also handles page/API redirects. Do not use `_redirects` for host redirects; Cloudflare does not support domain-level rules there.
5. Verify both destination inboxes, prepare the dedicated Turnstile widget/build key/runtime secret, remove only the approved parking conflicts immediately before custom-domain attachment, and merge through the existing Builds path after explicit rollout approval.
6. Check apex and www HTTPS/certificates, redirects, public assets, canonical/indexing and old links. Send only the approved synthetic test, confirm arrival in **both** inboxes (including spam check), Reply-To and optional phone. Do not declare launch complete from the API response alone.

Prefer an approved Worker version/application rollback while retaining healthy DNS. A prior version may restore the noindex/mockup behavior. If the form fails, disable it with a truthful temporary notice and preserve direct contact details. DNS rollback uses the recorded nameservers/records and correct DS state; propagation is not immediate. Obtain approval for recovery actions unless already included in the rollout authorization. Never change other OFS deployments.

### Cost and framework limitation

[Verified-destination sending is free on all Cloudflare plans](https://developers.cloudflare.com/email-service/platform/pricing/); arbitrary-recipient sending and visitor auto-replies are outside this scope. The [structured sending API](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/) is Beta, and the existing site pins Vinext `1.0.0-beta.5`.

The account was confirmed on Workers Free. The September 12 inventory of the existing deployment showed zero errors but CPU quantiles above the documented Free per-invocation limit. This is a **separate unresolved hosting gate**, not evidence that contact email needs a paid plan. Recheck representative deployed runtime usage before launch and obtain an owner decision if it cannot meet the current plan.

A bounded local `vinext build --prerender-all` experiment generated homepage HTML/RSC, but the current Worker did not consume those artifacts: they sit outside `dist/client` and a marker inserted into generated prerender HTML was absent from Worker responses. Merely enabling native prerender is therefore not a verified CPU remedy for this deployment. No custom adapter, cache, framework migration or paid-plan change is included here. Local wall-clock tests are not edge CPU measurements.
