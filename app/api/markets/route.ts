import { NextResponse } from 'next/server';
import { getWatchlist, getHeatmapDots, getNewsItems } from '@/lib/dashboard-data';

export async function GET() {
  const [watchlist, heatmapDots, news] = await Promise.all([
    getWatchlist(),
    getHeatmapDots(),
    getNewsItems(),
  ]);
  return NextResponse.json({ watchlist, heatmapDots, news });
}
