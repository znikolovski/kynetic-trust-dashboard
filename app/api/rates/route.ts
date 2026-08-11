import { NextRequest, NextResponse } from 'next/server';
import { RATES, type Rate } from '@/lib/rates';
import { corsHeaders } from '@/lib/cors';
import { verifyRatesApiKey } from '@/lib/rates-auth';
import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

const DASHBOARD_REPO = 'znikolovski/kynetic-trust-dashboard';
const RATES_FILE_PATH = 'data/rates.json';

async function getLiveRatesMap(): Promise<Record<string, string>> {
  const githubPat = process.env.GITHUB_PAT;
  if (githubPat) {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${DASHBOARD_REPO}/contents/${RATES_FILE_PATH}`,
        {
          headers: {
            Authorization: `Bearer ${githubPat}`,
            Accept: 'application/vnd.github.raw+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
          cache: 'no-store',
        },
      );
      if (res.ok) return (await res.json()) as Record<string, string>;
    } catch {
      // fall through
    }
  }
  try {
    const filePath = join(process.cwd(), 'data', 'rates.json');
    return JSON.parse(readFileSync(filePath, 'utf8')) as Record<string, string>;
  } catch {
    return {};
  }
}

function parseNumeric(display: string): number {
  return parseFloat(display.replace(/[^0-9.]/g, '')) || 0;
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, { status: 204, headers: corsHeaders(req.headers.get('origin')) });
}

export async function GET(req: NextRequest) {
  if (!verifyRatesApiKey(req)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const liveMap = await getLiveRatesMap();

  const rates: Rate[] = RATES.map((r) => {
    const liveDisplay = liveMap[r.key];
    if (!liveDisplay) return r;
    return {
      ...r,
      display: liveDisplay,
      numeric: parseNumeric(liveDisplay),
      effectiveDate: new Date().toISOString().split('T')[0],
    };
  });

  const headers = {
    ...corsHeaders(req.headers.get('origin')),
    'Cache-Control': 'no-store',
  };
  return NextResponse.json(
    { rates, lastUpdated: new Date().toISOString(), currency: 'USD' },
    { headers },
  );
}
