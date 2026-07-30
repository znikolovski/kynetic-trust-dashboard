import { type NextRequest, NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { corsHeaders } from '@/lib/cors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;

  // Reject anything that isn't a safe widget filename
  if (!/^[\w-]+\.(js|json)$/.test(file)) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const origin = request.headers.get('origin');
  const { 'Access-Control-Allow-Origin': allowOrigin } = corsHeaders(origin);

  try {
    const content = await readFile(
      resolve(process.cwd(), 'public', 'widgets', file),
    );
    const isJson = file.endsWith('.json');
    return new NextResponse(content, {
      headers: {
        'Content-Type': isJson
          ? 'application/json; charset=utf-8'
          : 'application/javascript; charset=utf-8',
        'Access-Control-Allow-Origin': allowOrigin,
        // manifest: short TTL so EDS always sees new builds promptly
        // hashed bundles: immutable — the hash changes on every rebuild
        'Cache-Control': isJson
          ? 'public, max-age=60, stale-while-revalidate=300'
          : 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Not Found', { status: 404 });
  }
}
