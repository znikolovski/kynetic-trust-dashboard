#!/usr/bin/env node
/**
 * Post-deploy contract check: loads the ACTUAL deployed manifest.json,
 * mounts the comparison-table widget the same way the EDS
 * `nextjs-widget` block does, and asserts it reaches `sb-widget-ready`
 * with real rendered rows within a few seconds.
 *
 * This is what makes the manifest-based release process (see
 * ARCHITECTURE.md §3.5) trustworthy: EDS pages resolve whatever
 * manifest.json currently says, so this check has to run against the real
 * deployment BEFORE that deployment is considered "the one EDS should
 * track" (i.e. before promoting a Vercel preview to the production alias).
 *
 * Usage: node scripts/smoke-test-widget.mjs https://app.securbank.com
 *
 * Set VERCEL_AUTOMATION_BYPASS_SECRET to bypass Vercel Deployment Protection
 * on preview deployments.
 */
import { chromium } from 'playwright';

const baseUrl = process.argv[2];
if (!baseUrl) {
  console.error('Usage: smoke-test-widget.mjs <deployed base URL>');
  process.exit(1);
}

const READY_TIMEOUT_MS = 10_000;
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const bypassHeaders = bypassSecret ? { 'x-vercel-protection-bypass': bypassSecret } : {};

if (!bypassSecret) {
  console.warn(
    'WARNING: VERCEL_AUTOMATION_BYPASS_SECRET is not set. ' +
    'Requests to Vercel preview deployments with Standard Protection enabled ' +
    'will be intercepted by Vercel\'s auth wall and return HTML instead of JSON. ' +
    'Add the secret in: Vercel project → Settings → Deployment Protection → ' +
    'Automation Bypass Secret, then add it as a GitHub secret named ' +
    'VERCEL_AUTOMATION_BYPASS_SECRET.',
  );
}

// Fetch the manifest in Node.js so we can attach bypass headers and get
// clear error messages before spinning up a browser.
const manifestUrl = `${baseUrl}/widgets/manifest.json`;
const manifestRes = await fetch(manifestUrl, { headers: bypassHeaders });
if (!manifestRes.ok) {
  console.error(`FAIL: manifest.json ${manifestRes.status} at ${manifestUrl}`);
  process.exit(1);
}
const contentType = manifestRes.headers.get('content-type') ?? '';
if (!contentType.includes('json')) {
  const preview = (await manifestRes.text()).slice(0, 300);
  const likelyProtectionWall = preview.includes('data-dpl-id') || preview.includes('vercel');
  console.error(`FAIL: manifest.json has unexpected content-type: ${contentType}`);
  if (likelyProtectionWall && !bypassSecret) {
    console.error(
      'DIAGNOSIS: The response looks like Vercel\'s Deployment Protection wall. ' +
      'Set VERCEL_AUTOMATION_BYPASS_SECRET as a GitHub secret (see warning above).',
    );
  }
  console.error(`Body preview: ${preview}`);
  process.exit(1);
}
const manifest = await manifestRes.json();
const entry = manifest.widgets?.['comparison-table'];
if (!entry?.file) {
  console.error('FAIL: manifest missing comparison-table entry');
  console.error('manifest:', JSON.stringify(manifest));
  process.exit(1);
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('pageerror', (err) => consoleErrors.push(String(err)));

  // Bypass Deployment Protection for all browser requests (page nav + widget fetch).
  if (bypassSecret) {
    await page.setExtraHTTPHeaders(bypassHeaders);
  }

  // Same-origin navigation so the widget bundle / the API route all load
  // without needing to fake cross-origin CORS in the test.
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

  const result = await page.evaluate(async ({ timeoutMs, widgetFile }) => {
    await new Promise((res2, rej2) => {
      const script = document.createElement('script');
      script.src = widgetFile;
      script.onload = res2;
      script.onerror = () => rej2(new Error(`failed to load ${widgetFile}`));
      document.head.append(script);
    });

    const el = document.createElement('sb-widget-comparison-table');
    el.dataset.datasetId = 'tiers';
    el.dataset.apiBase = window.location.origin;

    const ready = new Promise((res2) => {
      el.addEventListener('sb-widget-ready', () => res2(true), { once: true });
      setTimeout(() => res2(false), timeoutMs);
    });
    document.body.append(el);

    const becameReady = await ready;
    const rowCount = el.shadowRoot?.querySelectorAll('tbody tr').length ?? 0;
    return { becameReady, rowCount };
  }, { timeoutMs: READY_TIMEOUT_MS, widgetFile: entry.file });

  if (consoleErrors.length) {
    console.error('Page errors during smoke test:', consoleErrors);
  }

  if (!result.becameReady) {
    console.error(`FAIL: comparison-table widget never fired sb-widget-ready within ${READY_TIMEOUT_MS}ms`);
    process.exit(1);
  }
  if (result.rowCount < 1) {
    console.error(`FAIL: widget claimed ready but rendered ${result.rowCount} table rows`);
    process.exit(1);
  }

  console.log(`OK: comparison-table widget ready with ${result.rowCount} rows (manifest buildId=${manifest.buildId})`);
} finally {
  await browser.close();
}
