import { NextRequest, NextResponse } from 'next/server';

interface RateEntry {
  key: string;
  display: string;
}

interface SavePayload {
  rates: RateEntry[];
}

const DASHBOARD_REPO = 'znikolovski/kynetic-trust-dashboard';
const RATES_FILE_PATH = 'data/rates.json';

async function commitRatesToGitHub(
  pat: string,
  ratesMap: Record<string, string>,
): Promise<void> {
  const fileUrl = `https://api.github.com/repos/${DASHBOARD_REPO}/contents/${RATES_FILE_PATH}`;
  const ghHeaders = {
    Authorization: `Bearer ${pat}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };

  const currentRes = await fetch(fileUrl, { headers: ghHeaders });
  const currentFile = currentRes.ok ? await currentRes.json() : null;

  const content = Buffer.from(
    JSON.stringify(ratesMap, null, 2) + '\n',
  ).toString('base64');

  await fetch(fileUrl, {
    method: 'PUT',
    headers: ghHeaders,
    body: JSON.stringify({
      message: 'chore(rates): update published rates',
      content,
      ...(currentFile?.sha ? { sha: currentFile.sha } : {}),
    }),
  });
}

export async function POST(req: NextRequest) {
  const githubPat = process.env.GITHUB_PAT;
  if (!githubPat) {
    return NextResponse.json({ error: 'GITHUB_PAT not configured' }, { status: 503 });
  }

  let body: SavePayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { rates } = body;
  if (!Array.isArray(rates) || rates.length === 0) {
    return NextResponse.json({ error: 'rates must be a non-empty array' }, { status: 400 });
  }

  const ratesMap = Object.fromEntries(rates.map(r => [r.key, r.display]));

  // 1. Commit data/rates.json to this repo — makes the dashboard the source of truth
  //    and triggers a Vercel redeploy so /api/rates serves the updated values.
  try {
    await commitRatesToGitHub(githubPat, ratesMap);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'GitHub commit failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }

  // 2. Dispatch the sync-rates workflow in kynetic-trust — it reads from /api/rates,
  //    writes to DA, and triggers EDS preview+live. DA_TOKEN is not needed here.
  let syncTriggered = false;
  try {
    const dispatchRes = await fetch(
      'https://api.github.com/repos/znikolovski/kynetic-trust/actions/workflows/sync-rates.yml/dispatches',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${githubPat}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ref: 'main' }),
      },
    );
    syncTriggered = dispatchRes.ok;
  } catch {
    // non-fatal — rates are committed; sync will run on next schedule
  }

  return NextResponse.json({ ok: true, stored: rates.length, ratesCommitted: true, syncTriggered });
}
