'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type ComparisonFeature = { feature: string; values: string[] };
type ComparisonDataset = {
  id: string;
  tiers: { name: string; monthlyPrice: number; ctaHref: string }[];
  features: ComparisonFeature[];
  ratesByTier: number[];
};

export type ComparisonWidgetProps = {
  /** Origin the widget fetches data from, e.g. "https://app.securbank.com". */
  apiBase: string;
  /** Which AEM-authored comparison dataset to render. */
  dataset: 'tiers' | 'accounts';
  /** Fired once data has loaded, so an embedding host (the EDS block) can
   *  hide its static fallback table. Never fires on error, so the fallback
   *  stays visible if this widget can't load — that's the point. */
  onReady?: () => void;
  /** Starting balance/loan amount for the live rate estimator, in whole units. */
  initialEstimate?: number;
};

const TRUE_VALUES = new Set(['yes', 'true', 'check']);
const isAffirmative = (v: string) => TRUE_VALUES.has(v.trim().toLowerCase());

const colors = {
  bg: 'rgb(255 255 255 / 3%)',
  border: 'rgb(255 255 255 / 15%)',
  onSurface: '#e2e2e8',
  onSurfaceVariant: '#b9cacb',
  primary: '#00dbe9',
  primaryContainer: '#00f0ff',
  tertiary: '#ebffa9',
  outline: '#849495',
  mono: "'JetBrains Mono', ui-monospace, monospace",
  heading: "'Hanken Grotesk', system-ui, sans-serif",
  body: "Geist, system-ui, sans-serif",
};

export default function ComparisonWidget({
  apiBase, dataset, onReady, initialEstimate = 25000,
}: ComparisonWidgetProps) {
  const [data, setData] = useState<ComparisonDataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [estimate, setEstimate] = useState(initialEstimate);
  const readyFired = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${apiBase}/api/compare?dataset=${dataset}`)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json();
      })
      .then((json: ComparisonDataset) => {
        if (cancelled) return;
        setData(json);
      })
      .catch((err) => {
        if (!cancelled) setError(String(err));
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase, dataset]);

  // Fire onReady after React commits the rows to the DOM — not inside the
  // fetch .then(), which runs before React's reconciler has updated the DOM.
  useEffect(() => {
    if (data && !readyFired.current) {
      readyFired.current = true;
      onReady?.();
    }
  }, [data, onReady]);

  const bestTierIndex = useMemo(() => {
    if (!data) return -1;
    // naive "best for you" heuristic: highest projected annual yield on the
    // visitor's estimated balance, net of the tier's monthly fee.
    let best = 0;
    let bestValue = -Infinity;
    data.ratesByTier.forEach((rate, i) => {
      const projected = (estimate * rate) / 100 - (data.tiers[i]?.monthlyPrice ?? 0) * 12;
      if (projected > bestValue) { bestValue = projected; best = i; }
    });
    return best;
  }, [data, estimate]);

  if (error) return null; // let the static EDS fallback stand
  if (!data) {
    return (
      <div style={{ padding: 32, color: colors.onSurfaceVariant, fontFamily: colors.body }}>
        Loading live rates…
      </div>
    );
  }

  return (
    <div style={{ fontFamily: colors.body, color: colors.onSurface }}>
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16,
        padding: '20px 24px', background: colors.bg, border: `1px solid ${colors.border}`,
        borderRadius: '0.5rem 0.5rem 0 0', borderBottom: 'none',
      }}
      >
        <label htmlFor="sb-compare-estimate" style={{
          fontFamily: colors.mono, fontSize: 12, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: colors.primary,
        }}
        >
          Estimate your balance
        </label>
        <input
          id="sb-compare-estimate"
          type="range"
          min={1000}
          max={500000}
          step={1000}
          value={estimate}
          onChange={(e) => setEstimate(Number(e.target.value))}
          style={{ flex: '1 1 160px', accentColor: colors.primary }}
        />
        <span style={{ fontFamily: colors.mono, fontWeight: 700 }}>
          {estimate.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
        </span>
      </div>

      <div style={{ overflowX: 'auto', border: `1px solid ${colors.border}`, borderRadius: '0 0 0.5rem 0.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgb(255 255 255 / 5%)' }}>
              <th style={{
                padding: '16px 20px', fontFamily: colors.mono, fontSize: 12,
                letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.onSurfaceVariant,
              }}
              >
                Feature
              </th>
              {data.tiers.map((tier, i) => (
                <th
                  key={tier.name}
                  style={{
                    padding: '16px 20px', fontFamily: colors.heading, fontWeight: 700,
                    color: i === bestTierIndex ? colors.primary : colors.onSurface,
                    textAlign: 'center',
                  }}
                >
                  {tier.name}
                  {i === bestTierIndex && (
                    <span style={{
                      display: 'block', fontFamily: colors.mono, fontSize: 10,
                      fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                      color: colors.tertiary, marginTop: 4,
                    }}
                    >
                      Best for you
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.features.map((row) => (
              <tr key={row.feature} style={{ borderTop: `1px solid ${colors.border}` }}>
                <th scope="row" style={{ padding: '14px 20px', fontWeight: 600, color: colors.onSurfaceVariant }}>
                  {row.feature}
                </th>
                {row.values.map((value, i) => (
                  <td
                    key={`${row.feature}-${data.tiers[i]?.name ?? i}`}
                    style={{
                      padding: '14px 20px', textAlign: 'center', fontFamily: colors.mono,
                      fontSize: 14, background: i === bestTierIndex ? 'rgb(0 219 233 / 6%)' : 'transparent',
                    }}
                  >
                    {isAffirmative(value) ? (
                      <span style={{ color: colors.tertiary, fontSize: 18 }} aria-label="Included">✓</span>
                    ) : value.trim().toLowerCase() === 'no' ? (
                      <span style={{ color: colors.outline }} aria-hidden="true">—</span>
                    ) : value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{
        marginTop: 12, fontFamily: colors.mono, fontSize: 11, color: colors.outline,
        letterSpacing: '0.04em',
      }}
      >
        Estimate is illustrative only and does not account for compounding or fees.
      </p>
    </div>
  );
}
