import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

const DASHBOARD_REPO = 'znikolovski/kynetic-trust-dashboard';
const RATES_FILE_PATH = 'data/rates.json';

export async function GET() {
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
      if (res.ok) {
        const data = (await res.json()) as Record<string, string>;
        return NextResponse.json(data);
      }
    } catch {
      // fall through to filesystem fallback
    }
  }

  // Fallback: read the build-time copy (used locally or if GitHub API is unavailable)
  try {
    const filePath = join(process.cwd(), 'data', 'rates.json');
    const data = JSON.parse(readFileSync(filePath, 'utf8')) as Record<string, string>;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Could not load rates' }, { status: 500 });
  }
}
