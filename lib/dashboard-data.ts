/**
 * Typed mock data for all four dashboard feature areas (dashboard overview,
 * markets, portfolio, and transactions).
 *
 * In production each getter calls process.env.DASHBOARD_API_URL; for now every
 * function returns in-process mock data so the app runs standalone during the
 * design phase — exactly the same pattern as lib/aem-content-fragments.ts.
 *
 * Swap the mock return values for real fetch calls once DASHBOARD_API_URL is set.
 */

// ── Types ────────────────────────────────────────────────────────

export interface DashboardSummary {
  balance: string;
  change: string;
  direction: 'up' | 'down';
  marketPulseData: number[];
}

export interface AccountAllocation {
  label: string;
  balance: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  icon: string;
  accentColor: string;
}

export interface ActivityRow {
  id: string;
  entity: string;
  timestamp: string;
  amount: string;
  positive: boolean;
  status: string;
  statusColor: string;
  statusBg: string;
}

export interface WatchlistItem {
  ticker: string;
  name: string;
  price: string;
  change: string;
  positive: boolean;
}

export interface HeatmapDot {
  x: number;
  y: number;
  r: number;
  opacity: number;
}

export interface NewsItem {
  source: string;
  sourceBg: string;
  headline: string;
  meta: string;
  gradientFrom: string;
  gradientTo: string;
}

export interface AllocationSegment {
  /** Percentage share of the donut (0–100). */
  value: number;
  color: string;
  label: string;
  /** Human-readable formatted value shown in the legend (e.g. "$7.4M"). */
  valueFmt: string;
}

export interface Holding {
  name: string;
  ticker: string;
  exchange: string;
  qty: string;
  avgPrice: string;
  marketValue: string;
  pl: string;
  plPct: string;
  positive: boolean;
}

export interface PortfolioData {
  netLiquidity: string;
  ytd: string;
  realized: number[];
  projected: number[];
  chartLabels: string[];
  allocations: AllocationSegment[];
  holdings: Holding[];
}

export interface TransactionMetrics {
  label: string;
  value: string;
  change: string | null;
  positive: boolean;
  direction: 'up' | 'down' | 'wave';
  color: string;
}

export type TxType = 'TRADE' | 'TRANSFER' | 'YIELD';
export type TxStatus = 'COMPLETED' | 'PENDING' | 'SETTLED';

export interface Transaction {
  id: string;
  entity: string;
  entityAbbr: string;
  entityColor: string;
  date: string;
  type: TxType;
  amount: string;
  amountPositive: boolean;
  status: TxStatus;
}

export interface TransactionsResponse {
  items: Transaction[];
  total: number;
  page: number;
  perPage: number;
}

// ── Mock data constants (private) ────────────────────────────────

const MOCK_MARKET_PULSE_DATA: number[] = [42, 68, 55, 78, 65, 88, 75, 92, 80];

const MOCK_ACCOUNTS: AccountAllocation[] = [
  {
    label: 'Personal Account',
    balance: '$1,102,400.00',
    badge: 'ACTIVE',
    badgeColor: '#00ff80',
    badgeBg: 'rgb(0 255 128 / 12%)',
    icon: 'person',
    accentColor: 'var(--color-primary)',
  },
  {
    label: 'Institutional',
    balance: '$2,845,720.00',
    badge: 'ACTIVE',
    badgeColor: '#00ff80',
    badgeBg: 'rgb(0 255 128 / 12%)',
    icon: 'business',
    accentColor: 'var(--color-secondary)',
  },
  {
    label: 'Yield Savings',
    balance: '$341,000.00',
    badge: 'SECURED',
    badgeColor: 'var(--color-tertiary)',
    badgeBg: 'rgb(235 255 169 / 12%)',
    icon: 'savings',
    accentColor: 'var(--color-tertiary)',
  },
];

const MOCK_RECENT_ACTIVITY: ActivityRow[] = [
  {
    id: '#SB-9821-XF',
    entity: 'Vanguard Global Equity',
    timestamp: 'Oct 24, 2024 · 14:22:01',
    amount: '+$42,000.00',
    positive: true,
    status: 'COMPLETED',
    statusColor: '#00ff80',
    statusBg: 'rgb(0 255 128 / 12%)',
  },
  {
    id: '#SB-7742-ML',
    entity: 'Capital Transfer Out',
    timestamp: 'Oct 24, 2024 · 11:05:44',
    amount: '-$125,500.00',
    positive: false,
    status: 'SETTLED',
    statusColor: 'var(--color-primary)',
    statusBg: 'rgb(0 219 233 / 12%)',
  },
  {
    id: '#SB-1029-QQ',
    entity: 'Institutional Yield Div.',
    timestamp: 'Oct 23, 2024 · 09:12:30',
    amount: '+$8,240.11',
    positive: true,
    status: 'COMPLETED',
    statusColor: '#00ff80',
    statusBg: 'rgb(0 255 128 / 12%)',
  },
];

const MOCK_WATCHLIST: WatchlistItem[] = [
  { ticker: 'SPX.IDX', name: 'S&P 500', price: '5,211.49', change: '+0.42%', positive: true },
  { ticker: 'BTC.USD', name: 'Bitcoin', price: '68,432.21', change: '+2.84%', positive: true },
  { ticker: 'UKX.IDX', name: 'FTSE 100', price: '7,935.09', change: '-0.15%', positive: false },
  { ticker: 'ETH.USD', name: 'Ethereum', price: '3,521.12', change: '+1.12%', positive: true },
];

const MOCK_HEATMAP_DOTS: HeatmapDot[] = [
  { x: 12, y: 78, r: 10, opacity: 0.9 },
  { x: 22, y: 35, r: 7, opacity: 0.7 },
  { x: 38, y: 62, r: 14, opacity: 0.8 },
  { x: 48, y: 20, r: 6, opacity: 0.6 },
  { x: 55, y: 48, r: 11, opacity: 0.85 },
  { x: 63, y: 72, r: 8, opacity: 0.65 },
  { x: 70, y: 30, r: 13, opacity: 0.9 },
  { x: 78, y: 55, r: 9, opacity: 0.75 },
  { x: 85, y: 18, r: 5, opacity: 0.55 },
  { x: 88, y: 68, r: 12, opacity: 0.8 },
  { x: 30, y: 85, r: 7, opacity: 0.6 },
  { x: 42, y: 10, r: 9, opacity: 0.7 },
  { x: 58, y: 88, r: 6, opacity: 0.65 },
  { x: 72, y: 42, r: 15, opacity: 0.95 },
  { x: 18, y: 55, r: 8, opacity: 0.72 },
];

const MOCK_NEWS: NewsItem[] = [
  {
    source: 'REUTERS',
    sourceBg: '#c84b11',
    headline: 'Fed Signals Potential Rate Cut Amidst Global Tech Surplus',
    meta: '4 MIN AGO · 12K READS',
    gradientFrom: '#1a0a05',
    gradientTo: '#2a1008',
  },
  {
    source: 'BLOOMBERG',
    sourceBg: '#006b6e',
    headline: 'SecurBank Unveils Quantum-Ready Execution Engine',
    meta: '18 MIN AGO · 8K READS',
    gradientFrom: '#051a1a',
    gradientTo: '#082828',
  },
  {
    source: 'FINANCIAL TIMES',
    sourceBg: '#b34a2e',
    headline: 'European Markets Bracing for CBDC Implementation Trial',
    meta: '42 MIN AGO · 21K READS',
    gradientFrom: '#1a0d08',
    gradientTo: '#261510',
  },
];

const MOCK_PORTFOLIO_DATA: PortfolioData = {
  netLiquidity: '$12,482,904.32',
  ytd: '+14.2% YTD',
  realized: [20, 28, 35, 38, 44, 52, 58, 63, 68, 72, 75],
  projected: [20, 26, 30, 34, 38, 42, 45, 48, 52, 55, 58],
  chartLabels: ['JAN 24', 'MAR 24', 'MAY 24', 'JUL 24', 'SEP 24', 'NOV 24'],
  allocations: [
    { value: 60, color: '#00dbe9', label: 'Tech Equities', valueFmt: '$7.4M' },
    { value: 25, color: '#dfb7ff', label: 'Crypto Assets', valueFmt: '$3.1M' },
    { value: 15, color: '#ebffa9', label: 'Structured Fixed', valueFmt: '$1.9M' },
  ],
  holdings: [
    {
      name: 'NVIDIA CORP',
      ticker: 'NVDA',
      exchange: 'NASDAQ',
      qty: '1,240.00',
      avgPrice: '$452.12',
      marketValue: '$1,482,904.32',
      pl: '+$248,390.10',
      plPct: '+22.4%',
      positive: true,
    },
    {
      name: 'BITCOIN',
      ticker: 'BTC',
      exchange: 'BINANCE',
      qty: '14.821000',
      avgPrice: '$58,290.00',
      marketValue: '$942,012.82',
      pl: '+$112,042.33',
      plPct: '+13%',
      positive: true,
    },
    {
      name: 'BLACKROCK ETF',
      ticker: 'IVV',
      exchange: 'NYSEARCA',
      qty: '4,100.00',
      avgPrice: '$512.44',
      marketValue: '$2,100,992.12',
      pl: '-$12,400.92',
      plPct: '-0.6%',
      positive: false,
    },
    {
      name: 'ETHEREUM',
      ticker: 'ETH',
      exchange: 'COINBASE',
      qty: '320.000000',
      avgPrice: '$2,840.11',
      marketValue: '$1,114,821.00',
      pl: '+$42,100.00',
      plPct: '+3.8%',
      positive: true,
    },
  ],
};

const MOCK_TRANSACTION_METRICS: TransactionMetrics[] = [
  {
    label: 'Total Inflow',
    value: '$412.8M',
    change: '+12.4%',
    positive: true,
    direction: 'up',
    color: '#00dbe9',
  },
  {
    label: 'Total Outflow',
    value: '$208.3M',
    change: '-2.1%',
    positive: false,
    direction: 'down',
    color: '#ffb4ab',
  },
  {
    label: 'Net Liquidity Change',
    value: '+$204.5M',
    change: null,
    positive: true,
    direction: 'wave',
    color: '#ebffa9',
  },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'TX-990422-XDA',
    entity: 'Goldman Sachs Int.',
    entityAbbr: 'GS',
    entityColor: '#1a3a5c',
    date: 'Oct 24, 14:02 UTC',
    type: 'TRADE',
    amount: '$12,400,000.00',
    amountPositive: true,
    status: 'COMPLETED',
  },
  {
    id: 'TX-990418-LQA',
    entity: 'BlackRock Treasury',
    entityAbbr: 'BR',
    entityColor: '#1a1a4a',
    date: 'Oct 24, 13:45 UTC',
    type: 'TRANSFER',
    amount: '$45,000,000.00',
    amountPositive: true,
    status: 'PENDING',
  },
  {
    id: 'TX-990415-YLD',
    entity: 'Yield Protocol Hub',
    entityAbbr: 'YP',
    entityColor: '#1a3a2a',
    date: 'Oct 23, 23:59 UTC',
    type: 'YIELD',
    amount: '+$1,245,600.00',
    amountPositive: true,
    status: 'SETTLED',
  },
  {
    id: 'TX-990412-FXC',
    entity: 'Morgan Stanley FX',
    entityAbbr: 'MS',
    entityColor: '#3a1a1a',
    date: 'Oct 23, 18:20 UTC',
    type: 'TRADE',
    amount: '$8,900,000.00',
    amountPositive: true,
    status: 'COMPLETED',
  },
  {
    id: 'TX-990399-BTC',
    entity: 'Coinbase Institutional',
    entityAbbr: 'CB',
    entityColor: '#2a1a0a',
    date: 'Oct 23, 15:10 UTC',
    type: 'TRADE',
    amount: '$22,000,000.00',
    amountPositive: true,
    status: 'SETTLED',
  },
];

// ── Getter functions (public) ─────────────────────────────────────

/** Dashboard overview: total balance, change indicator, and market-pulse chart data. */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  if (process.env.DASHBOARD_API_URL) {
    // TODO: replace with real API call
    const res = await fetch(`${process.env.DASHBOARD_API_URL}/dashboard/summary`);
    if (!res.ok) throw new Error(`Dashboard summary API failed: ${res.status}`);
    return res.json() as Promise<DashboardSummary>;
  }
  return {
    balance: '$4,289,120.00',
    change: '+12.4%',
    direction: 'up',
    marketPulseData: MOCK_MARKET_PULSE_DATA,
  };
}

/** Account allocation cards shown on the dashboard overview. */
export async function getAccountAllocations(): Promise<AccountAllocation[]> {
  if (process.env.DASHBOARD_API_URL) {
    // TODO: replace with real API call
    const res = await fetch(`${process.env.DASHBOARD_API_URL}/dashboard/accounts`);
    if (!res.ok) throw new Error(`Account allocations API failed: ${res.status}`);
    return res.json() as Promise<AccountAllocation[]>;
  }
  return MOCK_ACCOUNTS;
}

/** Recent activity rows for the dashboard ledger preview. */
export async function getRecentActivity(): Promise<ActivityRow[]> {
  if (process.env.DASHBOARD_API_URL) {
    // TODO: replace with real API call
    const res = await fetch(`${process.env.DASHBOARD_API_URL}/dashboard/activity`);
    if (!res.ok) throw new Error(`Recent activity API failed: ${res.status}`);
    return res.json() as Promise<ActivityRow[]>;
  }
  return MOCK_RECENT_ACTIVITY;
}

/** Watchlist items for the markets page. */
export async function getWatchlist(): Promise<WatchlistItem[]> {
  if (process.env.DASHBOARD_API_URL) {
    // TODO: replace with real API call
    const res = await fetch(`${process.env.DASHBOARD_API_URL}/markets/watchlist`);
    if (!res.ok) throw new Error(`Watchlist API failed: ${res.status}`);
    return res.json() as Promise<WatchlistItem[]>;
  }
  return MOCK_WATCHLIST;
}

/** Heatmap scatter dots for the liquidity heatmap. */
export async function getHeatmapDots(): Promise<HeatmapDot[]> {
  if (process.env.DASHBOARD_API_URL) {
    // TODO: replace with real API call
    const res = await fetch(`${process.env.DASHBOARD_API_URL}/markets/heatmap`);
    if (!res.ok) throw new Error(`Heatmap API failed: ${res.status}`);
    return res.json() as Promise<HeatmapDot[]>;
  }
  return MOCK_HEATMAP_DOTS;
}

/** News / intelligence stream items. */
export async function getNewsItems(): Promise<NewsItem[]> {
  if (process.env.DASHBOARD_API_URL) {
    // TODO: replace with real API call
    const res = await fetch(`${process.env.DASHBOARD_API_URL}/markets/news`);
    if (!res.ok) throw new Error(`News API failed: ${res.status}`);
    return res.json() as Promise<NewsItem[]>;
  }
  return MOCK_NEWS;
}

/** Full portfolio dataset: growth projection, allocation segments, and core holdings. */
export async function getPortfolioData(): Promise<PortfolioData> {
  if (process.env.DASHBOARD_API_URL) {
    // TODO: replace with real API call
    const res = await fetch(`${process.env.DASHBOARD_API_URL}/portfolio`);
    if (!res.ok) throw new Error(`Portfolio API failed: ${res.status}`);
    return res.json() as Promise<PortfolioData>;
  }
  return MOCK_PORTFOLIO_DATA;
}

/** Summary metrics for the transactions header (inflow, outflow, net liquidity). */
export async function getTransactionMetrics(): Promise<TransactionMetrics[]> {
  if (process.env.DASHBOARD_API_URL) {
    // TODO: replace with real API call
    const res = await fetch(`${process.env.DASHBOARD_API_URL}/transactions/metrics`);
    if (!res.ok) throw new Error(`Transaction metrics API failed: ${res.status}`);
    return res.json() as Promise<TransactionMetrics[]>;
  }
  return MOCK_TRANSACTION_METRICS;
}

/**
 * Paginated transaction ledger. The mock implementation ignores `page` and
 * `filters` and always returns the same 5 items with total: 1284.
 */
export async function getTransactions(
  page: number = 1,
  filters: string[] = [],
): Promise<TransactionsResponse> {
  if (process.env.DASHBOARD_API_URL) {
    // TODO: replace with real API call
    const params = new URLSearchParams({ page: String(page) });
    if (filters.length) params.set('filters', filters.join(','));
    const res = await fetch(`${process.env.DASHBOARD_API_URL}/transactions?${params}`);
    if (!res.ok) throw new Error(`Transactions API failed: ${res.status}`);
    return res.json() as Promise<TransactionsResponse>;
  }
  // Mock: page and filters are acknowledged but not applied
  void page;
  void filters;
  return { items: MOCK_TRANSACTIONS, total: 1284, page: 1, perPage: 5 };
}
