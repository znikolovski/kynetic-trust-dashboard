import { NextRequest, NextResponse } from 'next/server';
import { getTransactionMetrics, getTransactions } from '@/lib/dashboard-data';
import { corsHeaders } from '@/lib/cors';

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
