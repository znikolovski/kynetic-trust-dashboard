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
 */
import { chromium } from 'playwright';

const baseUrl = process.argv[2];
if (!baseUrl) {
  console.error('Usage: smoke-test-widget.mjs <deployed base URL>');
  process.exit(1);
}

const READY_TIMEOUT_MS = 10_000;

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('pageerror', (err) => consoleErrors.push(String(err)));

  // Same-origin navigation so manifest.json / the widget bundle / the API
  // route all load without needing to fake cross-origin CORS in the test.
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

  const result = await page.evaluate(async ({ timeoutMs }) => {
    const res = await fetch('/widgets/manifest.json');
    if (!res.ok) throw new Error(`manifest.json ${res.status}`);
    const manifest = await res.json();
    const entry = manifest.widgets?.['comparison-table'];
    if (!entry?.file) throw new Error('manifest missing comparison-table entry');

    await new Promise((res2, rej2) => {
      const script = document.createElement('script');
      script.src = entry.file;
      script.onload = res2;
      script.onerror = () => rej2(new Error(`failed to load ${entry.file}`));
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
    return { becameReady, rowCount, manifestBuildId: manifest.buildId };
  }, { timeoutMs: READY_TIMEOUT_MS });

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

  console.log(`OK: comparison-table widget ready with ${result.rowCount} rows (manifest buildId=${result.manifestBuildId})`);
} finally {
  await browser.close();
}
