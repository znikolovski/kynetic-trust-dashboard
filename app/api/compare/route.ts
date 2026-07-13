import { NextRequest, NextResponse } from 'next/server';
import { getComparisonDataset } from '@/lib/aem-content-fragments';

/**
 * Public, unauthenticated JSON endpoint that powers the `ComparisonWidget`
 * embedded back into the EDS site (see kynetic-trust/blocks/nextjs-widget).
 * This is the one place in the app that intentionally serves cross-origin,
 * anonymous traffic — everything else in `app/(dashboard)` is session-bound
 * and same-origin only.
 */

// Restrict to the actual EDS origins; widen with an env var per environment
// (preview .hlx.page / .aem.page domains during development).
const ALLOWED_ORIGINS = (process.env.WIDGET_ALLOWED_ORIGINS ?? 'https://www.securbank.com')
  .split(',')
  .map((o) => o.trim());

function corsHeaders(origin: string | null) {
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : (ALLOWED_ORIGINS[0] ?? '*');
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get('origin')) });
}

export async function GET(req: NextRequest) {
  const datasetId = req.nextUrl.searchParams.get('dataset') === 'accounts' ? 'accounts' : 'tiers';
  const headers = corsHeaders(req.headers.get('origin'));

  try {
    const dataset = await getComparisonDataset(datasetId);
    return NextResponse.json(dataset, {
      headers: { ...headers, 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' },
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 404, headers });
  }
}
