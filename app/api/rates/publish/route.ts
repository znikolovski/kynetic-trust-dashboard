import { NextRequest, NextResponse } from 'next/server';

interface RateEntry {
  key: string;
  display: string;
}

interface SavePayload {
  rates: RateEntry[];
}

const DA_SOURCE = 'https://admin.da.live/source/znikolovski/kynetic-trust/placeholders.json';
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
  const daToken = process.env.DA_TOKEN;
  if (!daToken) {
    return NextResponse.json({ error: 'DA_TOKEN not configured' }, { status: 503 });
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

  const sheetData = {
    total: rates.length,
    offset: 0,
    limit: rates.length,
    data: rates.map(r => ({ Key: r.key, Value: r.display })),
    ':type': 'sheet',
  };

  const formData = new FormData();
  formData.append(
    'data',
    new Blob([JSON.stringify(sheetData)], { type: 'application/json' }),
  );

  const daRes = await fetch(DA_SOURCE, {
    method: 'POST',
    headers: { Authorization: `Bearer ${daToken}` },
    body: formData,
  });

  if (!daRes.ok) {
    const detail = await daRes.text().catch(() => '');
    return NextResponse.json(
      { error: `DA write failed: HTTP ${daRes.status}`, detail },
      { status: 502 },
    );
  }

  const githubPat = process.env.GITHUB_PAT;
  let ratesCommitted = false;
  let syncTriggered = false;

  if (githubPat) {
    // Persist new rates to data/rates.json in this repo (triggers Vercel redeploy)
    try {
      await commitRatesToGitHub(githubPat, ratesMap);
      ratesCommitted = true;
    } catch {
      // non-fatal — DA write succeeded; rates.json will be stale until next manual push
    }

    // Dispatch sync-rates workflow to preview+publish to AEM CDN
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
      // non-fatal
    }
  }

  return NextResponse.json({ ok: true, stored: rates.length, ratesCommitted, syncTriggered });
}
