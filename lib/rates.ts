export interface Rate {
  key: string;
  display: string;
  numeric: number;
  category: 'savings' | 'checking' | 'mortgage' | 'rewards';
  effectiveDate: string;
}

export const RATES: Rate[] = [
  { key: 'standard-apy',           display: '2.45%',       numeric: 2.45, category: 'savings',  effectiveDate: '2026-07-01' },
  { key: 'high-yield-apy',         display: '5.15%',       numeric: 5.15, category: 'savings',  effectiveDate: '2026-07-01' },
  { key: 'institutional-apy',      display: '6.40%',       numeric: 6.40, category: 'savings',  effectiveDate: '2026-07-01' },
  { key: 'premium-monthly-fee',    display: '$49',         numeric: 49,   category: 'checking', effectiveDate: '2026-07-01' },
  { key: 'institutional-monthly-fee', display: '$499',     numeric: 499,  category: 'checking', effectiveDate: '2026-07-01' },
  { key: 'cashback-standard',      display: '1.0%',        numeric: 1.0,  category: 'rewards',  effectiveDate: '2026-07-01' },
  { key: 'cashback-premium',       display: 'Up to 4.5%', numeric: 4.5,  category: 'rewards',  effectiveDate: '2026-07-01' },
  { key: 'mortgage-rate-30yr',     display: '6.85%',       numeric: 6.85, category: 'mortgage', effectiveDate: '2026-07-01' },
  { key: 'mortgage-rate-15yr',     display: '6.25%',       numeric: 6.25, category: 'mortgage', effectiveDate: '2026-07-01' },
];

export function getRateByKey(key: string): Rate {
  const rate = RATES.find((r) => r.key === key);
  if (!rate) throw new Error(`Unknown rate key: "${key}"`);
  return rate;
}

export function getRatesMap(): Record<string, string> {
  return Object.fromEntries(RATES.map((r) => [r.key, r.display]));
}

export function getNumericRatesMap(): Record<string, number> {
  return Object.fromEntries(RATES.map((r) => [r.key, r.numeric]));
}
