import { NextRequest, NextResponse } from 'next/server';

interface RateEntry {
  key: string;
  display: string;
}

interface SavePayload {
  rates: RateEntry[];
}

const DA_SOURCE = 'https://admin.da.live/source/znikolovski/kynetic-trust/placeholders.json';

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

  // Optionally dispatch the sync-rates GitHub Action so preview+live happen immediately.
  // Requires GITHUB_PAT env var with actions:write permission on znikolovski/kynetic-trust.
  let syncTriggered = false;
  const githubPat = process.env.GITHUB_PAT;
  if (githubPat) {
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
      // non-fatal — rates are saved in DA regardless
    }
  }

  return NextResponse.json({ ok: true, stored: rates.length, syncTriggered });
}
