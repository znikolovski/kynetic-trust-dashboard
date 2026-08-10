import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'data', 'rates.json');
    const data = JSON.parse(readFileSync(filePath, 'utf8')) as Record<string, string>;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Could not load rates' }, { status: 500 });
  }
}
