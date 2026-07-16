import { NextResponse } from 'next/server';
import {
  getDashboardSummary,
  getAccountAllocations,
  getRecentActivity,
} from '@/lib/dashboard-data';

export async function GET() {
  const [summary, accounts, activity] = await Promise.all([
    getDashboardSummary(),
    getAccountAllocations(),
    getRecentActivity(),
  ]);
  return NextResponse.json({ summary, accounts, activity });
}
