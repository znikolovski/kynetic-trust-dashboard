import { NextRequest, NextResponse } from 'next/server';
import { getTransactionMetrics, getTransactions } from '@/lib/dashboard-data';

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
  const page = Number(req.nextUrl.searchParams.get('page') ?? 1);
  const filtersParam = req.nextUrl.searchParams.get('filters');
  const filters = filtersParam ? filtersParam.split(',').filter(Boolean) : [];
  const headers = corsHeaders(req.headers.get('origin'));

  const [metrics, txData] = await Promise.all([
    getTransactionMetrics(),
    getTransactions(page, filters),
  ]);

  return NextResponse.json({ metrics, ...txData }, { headers });
}
