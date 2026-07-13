# SecurBank Dashboard (Next.js)

Replaces `securbank-ue.vercel.app`. This is the **authenticated, interactive**
half of the SecurBank experience — accounts, cards, savings goals. The
**public, anonymous** marketing/content pages (home, mortgages, credit cards
marketing, savings marketing, editorial insights) live on the EDS site in
`../kynetic-trust`, not here. See `../ARCHITECTURE.md` for the full rationale.

## Why this exists as a separate Next.js app instead of more EDS blocks

EDS pages are pre-rendered, cached, and anonymous by design — that's exactly
why they can hit a 100 Lighthouse score, but it also means they are the wrong
place for session-bound, per-customer, frequently-changing data (live
balances, transaction history, card controls). Next.js (App Router + React
Server Components) gives that experience a real server runtime, session
handling, and co-location with the core banking APIs, while still sharing:

- the Kinetic Trust design tokens (`app/globals.css`, kept in sync with
  `../kynetic-trust/styles/styles.css`)
- the same AEM Cloud Service instance as a headless content source, via
  GraphQL persisted queries (`lib/aem-content-fragments.ts`), so marketing
  copy, offer eligibility text, and legal disclosures are authored once in
  Experience Workspace / Universal Editor and rendered on both surfaces.

## This app also powers a live widget embedded back into the EDS site

`components/ComparisonWidget.tsx` is used two ways from one implementation:

1. Natively, same-origin, inside this app at `/compare`
   (`app/(dashboard)/compare/page.tsx`) — no widget bundling involved.
2. Bundled standalone by `widgets/build.mjs` (esbuild) into
   `public/widgets/comparison-table.js`, served statically at
   `{this app's origin}/widgets/comparison-table.js`, and mounted as a
   `<sb-widget-comparison-table>` custom element (Shadow DOM-isolated) by
   the EDS site's `blocks/nextjs-widget` block on the public `/compare`
   page. That's the "blend more Next.js into the website" piece — see
   `../kynetic-trust/README-KINETIC-TRUST.md` for how the EDS side loads it.

It fetches its data from `app/api/compare/route.ts`, a public, CORS-scoped
JSON endpoint — the one route in this app that intentionally accepts
cross-origin, anonymous requests from the EDS origin
(`WIDGET_ALLOWED_ORIGINS` env var, also mirrored in `next.config.mjs`'s
`headers()` for the static `/widgets/*` files). Every other route in
`app/(dashboard)` stays session-bound and same-origin only.

Only add new widgets here when a page genuinely needs live, personalized,
client-computed behavior a static EDS block can't provide (this comparison
table's live rate estimator, for example). Default to a plain EDS block
otherwise — every widget adds a script fetch, a data fetch, and a fallback
to maintain.

### Publishing a widget change (no manual step, and no isolated release)

`npm run build:widgets` (wired into `npm run build`) writes a content-hashed
`comparison-table-<hash>.js` plus `public/widgets/manifest.json`. What
happens next is a full cross-repo release, not just a build:

1. `.github/workflows/deploy.yml` builds and deploys on every push (preview
   per PR, production on `main`), then runs
   `scripts/smoke-test-widget.mjs <deployed URL>` — a same-origin Playwright
   check that the new build actually reaches `sb-widget-ready` with real
   rows.
2. On `main`, once that passes, the `release-to-eds` job reads the deployed
   `manifest.json` and fires a `repository_dispatch` at
   `znikolovski/kynetic-trust` (the EDS repo) with the new file, build id,
   and this commit's SHA. Requires an `EDS_DISPATCH_TOKEN` secret here — a
   fine-grained PAT scoped to Contents + Pull Requests on that repo only.
3. The EDS repo opens its own PR updating its committed `widgets.json`, and
   its own CI (`widget-preview-check`) loads that PR's real `aem.live`
   preview and verifies the widget mounts **genuinely cross-origin**
   against this app's real API — the one thing this repo's own smoke test
   can't check on its own. That job reports a commit status back onto
   *this* commit (needs a `DASHBOARD_REPO_TOKEN` secret over there, scoped
   to write statuses on this repo), so this repo's commit/PR visibly shows
   whether the EDS integration passed.
4. The EDS PR auto-merges once green (or waits for human review, per that
   repo's branch protection) — **that merge is the actual release** to
   `securbank.com` visitors, not this app's own deploy.

This is deliberately not "instant, no gate" propagation: this app can
deploy to production as often as it likes (old and new hashed bundles
coexist fine), but nothing reaches EDS visitors until the corresponding EDS
PR merges. See `ARCHITECTURE.md` §3.5 for the full flow and the trade-off
against a simpler always-latest manifest resolution.

## Running locally

```bash
npm install
npm run dev
```

The app runs fully on mock data (`lib/aem-content-fragments.ts`) until
`AEM_GRAPHQL_ENDPOINT` and `AEM_SERVICE_TOKEN` are set, so it's usable before
an AEM Cloud Service GraphQL endpoint exists.

## What's stubbed vs. real

| Concern | This scaffold | Production |
|---|---|---|
| Auth/session | `lib/session.ts` returns a hardcoded customer id | SecurBank IdP / IMS, session cookie validated in middleware |
| Account & offer data | Mocked in `lib/aem-content-fragments.ts` | AEM Cloud Service GraphQL persisted queries + core banking API |
| Core banking actions (transfers, card freeze) | Not implemented | Dedicated core-banking service, called directly from Route Handlers — never through AEM |
| Deployment | None (no hosting credentials in this session) | Vercel or Adobe App Builder, behind the same edge/CDN as the EDS site for a unified domain |
| Widget bundle + manifest (`public/widgets/*`) | Not built — `esbuild`/`playwright` aren't installable in this sandbox (no npm registry access); source + build config are complete | Runs automatically via `.github/workflows/deploy.yml` once `VERCEL_TOKEN`/`VERCEL_ORG_ID`/`VERCEL_PROJECT_ID` secrets exist |
| `WIDGET_ALLOWED_ORIGINS` | Defaults to `https://www.securbank.com` in `app/api/compare/route.ts` and `next.config.mjs` | Set to the real EDS production + preview origins |
| CI smoke test (`scripts/smoke-test-widget.mjs`) | Written, not run (no npm/Playwright access here) | Runs in CI after every deploy on this app |
| `EDS_DISPATCH_TOKEN` secret | Not provisioned | Fine-grained PAT: Contents (write) + Pull requests (write) on `znikolovski/kynetic-trust` only |
| Cross-repo release (`release-to-eds` job → EDS's `widget-release.yml`) | Written, not exercised — needs a real deploy URL and the token above | Fires automatically on every `main` push once the token and the EDS-side workflows are in place |
