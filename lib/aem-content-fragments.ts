/**
 * Thin client for AEM Cloud Service's headless GraphQL endpoint.
 *
 * The dashboard reads *personalized* structured data (account summaries,
 * balances, offers eligible for the signed-in customer) from AEM Content
 * Fragments — the SAME AEM Cloud Service instance that backs the EDS
 * marketing site's Universal Editor authoring, so product/marketing/legal
 * teams manage copy, disclosures and offer eligibility rules in one place
 * (Experience Workspace), regardless of which surface renders them.
 *
 * In production this calls a *persisted query* (never an inline query, per
 * AEM Cloud Service headless best practice) against:
 *   https://{aem-author-or-publish}/graphql/execute.json/securbank/{queryName}
 *
 * This file stubs that call so the app runs standalone during the design
 * phase; swap `mockFetchContentFragment` for `fetchPersistedQuery` once an
 * AEM Cloud Service GraphQL endpoint + IMS service credentials exist.
 */

export type AccountSummary = {
  id: string;
  nickname: string;
  type: 'checking' | 'savings' | 'credit';
  balance: number;
  currency: string;
  apy?: number;
};

export type PersonalizedOffer = {
  id: string;
  eyebrow: string;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
};

export type ComparisonFeature = {
  feature: string;
  /** one value per tier, in the same order as `tiers` on the parent dataset */
  values: string[];
};

export type ComparisonDataset = {
  id: string;
  tiers: { name: string; monthlyPrice: number; ctaHref: string }[];
  features: ComparisonFeature[];
  /** APY (or equivalent headline rate) per tier, used by the widget's live rate estimator */
  ratesByTier: number[];
};

const TRUE_VALUES = new Set(['yes', 'true', 'check']);

const MOCK_COMPARISON_DATASETS: Record<string, ComparisonDataset> = {
  tiers: {
    id: 'tiers',
    tiers: [
      { name: 'Standard', monthlyPrice: 0, ctaHref: '/join?tier=standard' },
      { name: 'Premium', monthlyPrice: 49, ctaHref: '/join?tier=premium' },
      { name: 'Institutional', monthlyPrice: 499, ctaHref: '/join?tier=institutional' },
    ],
    ratesByTier: [2.45, 5.15, 6.4],
    features: [
      { feature: 'Instant Settlement', values: ['yes', 'yes', 'yes'] },
      { feature: 'Priority Execution', values: ['no', 'yes', 'yes'] },
      { feature: 'Algorithmic API Access', values: ['no', 'Limited', 'yes'] },
      { feature: 'White-Glove Support', values: ['no', 'Business Hrs', 'yes'] },
      { feature: 'Max Transfer Limit', values: ['$100k/day', '$5M/day', 'Unlimited'] },
      { feature: 'Cold Storage Custody', values: ['no', 'Optional', 'yes'] },
    ],
  },
  accounts: {
    id: 'accounts',
    tiers: [
      { name: 'Standard', monthlyPrice: 0, ctaHref: '/join' },
      { name: 'SecurBank Premium', monthlyPrice: 0, ctaHref: '/join?product=premium-savings' },
    ],
    ratesByTier: [2.45, 5.15],
    features: [
      { feature: 'Monthly Service Fee', values: ['$0.00', '$0.00'] },
      { feature: 'High Yield APY', values: ['2.45%', '5.15%'] },
      { feature: 'Debit Card Cashback', values: ['1.0%', 'Up to 4.5%'] },
      { feature: 'Global ATM Access', values: ['Domestic Only', 'Global Unrestricted'] },
      { feature: 'Support Tier', values: ['Standard Digital', 'Dedicated Concierge'] },
    ],
  },
};

const AEM_GRAPHQL_ENDPOINT = process.env.AEM_GRAPHQL_ENDPOINT
  ?? 'https://author-pXXXXX-eYYYYYY.adobeaemcloud.com/graphql/execute.json/securbank';

async function fetchPersistedQuery<T>(queryName: string, params: Record<string, string> = {}): Promise<T> {
  const search = new URLSearchParams(params).toString();
  const res = await fetch(`${AEM_GRAPHQL_ENDPOINT}/${queryName}${search ? `;${search}` : ''}`, {
    headers: { Authorization: `Bearer ${process.env.AEM_SERVICE_TOKEN ?? ''}` },
    // AEM Content Fragments change infrequently relative to request volume —
    // cache at the edge and revalidate in the background.
    next: { revalidate: 60, tags: [queryName] },
  });
  if (!res.ok) throw new Error(`AEM GraphQL query "${queryName}" failed: ${res.status}`);
  const json = await res.json();
  return json.data as T;
}

const MOCK_ACCOUNTS: AccountSummary[] = [
  { id: 'acc-001', nickname: 'Everyday Checking', type: 'checking', balance: 18420.55, currency: 'USD' },
  { id: 'acc-002', nickname: 'High-Yield Savings', type: 'savings', balance: 92310.12, currency: 'USD', apy: 5.15 },
  { id: 'acc-003', nickname: 'SecurBank Infinite', type: 'credit', balance: -2140.32, currency: 'USD' },
];

const MOCK_OFFERS: PersonalizedOffer[] = [
  {
    id: 'offer-mortgage',
    eyebrow: 'Mortgage Loans',
    heading: 'You are pre-qualified for a SecurBank mortgage',
    body: 'Based on your account history, you qualify for our institutional-grade rate.',
    ctaLabel: 'View offer',
    ctaHref: '/mortgages',
  },
];

/** Account summaries for the signed-in customer. */
export async function getAccountSummaries(customerId: string): Promise<AccountSummary[]> {
  if (process.env.AEM_GRAPHQL_ENDPOINT) {
    return fetchPersistedQuery<AccountSummary[]>('accounts-by-customer', { customerId });
  }
  return MOCK_ACCOUNTS;
}

/** Personalized offers authored by marketing in AEM, targeted via Target/Journey Optimizer segments. */
export async function getPersonalizedOffers(customerId: string): Promise<PersonalizedOffer[]> {
  if (process.env.AEM_GRAPHQL_ENDPOINT) {
    return fetchPersistedQuery<PersonalizedOffer[]>('offers-by-customer', { customerId });
  }
  return MOCK_OFFERS;
}

/**
 * Comparison-table data. This backs BOTH the server-rendered EDS
 * `comparison-table` block content (authored directly in da.live, see
 * `kynetic-trust/content/compare.html`) AND the live `ComparisonWidget`
 * embedded back into that same EDS page — see `app/api/compare/route.ts`.
 * Editorial authors still own the copy (feature names, tier names) via AEM;
 * this just adds the numeric rate data the interactive widget needs for its
 * live "estimate your rate" calculator, which a static table can't provide.
 */
export async function getComparisonDataset(datasetId: 'tiers' | 'accounts'): Promise<ComparisonDataset> {
  if (process.env.AEM_GRAPHQL_ENDPOINT) {
    return fetchPersistedQuery<ComparisonDataset>('comparison-dataset', { datasetId });
  }
  const dataset = MOCK_COMPARISON_DATASETS[datasetId];
  if (!dataset) throw new Error(`Unknown comparison dataset "${datasetId}"`);
  return dataset;
}

/** Shared truthy-value parsing so the EDS block and the widget render checks identically. */
export function isAffirmativeFeatureValue(value: string): boolean {
  return TRUE_VALUES.has(value.trim().toLowerCase());
}
