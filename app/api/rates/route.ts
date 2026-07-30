import { NextRequest, NextResponse } from 'next/server';
import { RATES } from '@/lib/rates';
import { corsHeaders } from '@/lib/cors';
import { verifyRatesApiKey } from '@/lib/rates-auth';

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get('origin')) });
}

export async function GET(req: NextRequest) {
  if (!verifyRatesApiKey(req)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const headers = {
    ...corsHeaders(req.headers.get('origin')),
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
  };
  return NextResponse.json(
    { rates: RATES, lastUpdated: '2026-07-01T00:00:00Z', currency: 'USD' },
    { headers },
  );
}
