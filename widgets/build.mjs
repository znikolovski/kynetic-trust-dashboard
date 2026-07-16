// Bundles each entry in widgets/ into a content-hashed script under
// public/widgets/, plus a manifest.json mapping widget name -> current
// filename + build metadata. The manifest is the sync point between this
// repo and the EDS site: kynetic-trust/blocks/nextjs-widget resolves it at
// runtime instead of hardcoding a filename, so a new widget build becomes
// live for EDS visitors as soon as this deploy finishes — no cross-repo
// step, no manual copy. See ARCHITECTURE.md §3.5 for the full release
// process, including the CI smoke test that gates what this manifest is
// allowed to point at.
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, basename, extname } from 'node:path';
import { writeFileSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '..', 'public', 'widgets');

const entries = [
  'comparison-table.tsx',
  'login-modal.tsx',
  'registration-flow.tsx',
  'mortgage-calculator.tsx',
  'transaction-summary.tsx',
];

function gitSha() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: __dirname }).toString().trim();
  } catch {
    return 'local';
  }
}

const result = await build({
  entryPoints: entries.map((e) => resolve(__dirname, e)),
  outdir: outDir,
  entryNames: '[name]-[hash]',
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2020',
  jsx: 'automatic',
  loader: { '.tsx': 'tsx' },
  define: { 'process.env.NODE_ENV': '"production"' },
  metafile: true,
});

const builtAt = new Date().toISOString();
const buildId = `${process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? gitSha()}-${Date.now()}`;

const widgets = {};
for (const [outPath, info] of Object.entries(result.metafile.outputs)) {
  if (!info.entryPoint) continue;
  const name = basename(info.entryPoint, extname(info.entryPoint));
  widgets[name] = { file: `/widgets/${basename(outPath)}`, builtAt };
}

// Read the previous manifest (if any) so a partial/failed build never wipes
// out widgets it didn't touch in this run.
let previous = { widgets: {} };
try {
  previous = JSON.parse(readFileSync(resolve(outDir, 'manifest.json'), 'utf8'));
} catch {
  // no previous manifest — first build
}

const manifest = {
  buildId,
  builtAt,
  widgets: { ...previous.widgets, ...widgets },
};

writeFileSync(resolve(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

// eslint-disable-next-line no-console
console.log(`Built ${entries.length} widget bundle(s), manifest buildId=${buildId}`);
