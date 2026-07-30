import { NextRequest, NextResponse } from 'next/server';
import { getComparisonDataset } from '@/lib/aem-content-fragments';
import { corsHeaders } from '@/lib/cors';

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
