'use client';

import { useState, useEffect } from 'react';
import LineChart from '../../../components/charts/LineChart';
import DonutChart from '../../../components/charts/DonutChart';
import type { PortfolioData } from '@/lib/dashboard-data';

const eyebrow: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--color-primary)',
};

const sectionHeading: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontWeight: 900,
  fontSize: 22,
  color: 'var(--color-on-surface)',
  margin: 0,
};

export default function PortfolioPage() {
  const [data, setData] = useState<PortfolioData | null>(null);

  useEffect(() => {
    fetch('/api/portfolio')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <div style={{ padding: 32, color: 'var(--color-on-surface-variant)' }}>Loading…</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ ...eyebrow, marginBottom: 6 }}>Portfolio Overview</div>
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-heading)',
              fontWeight: 900,
              fontSize: 36,
              color: 'var(--color-on-surface)',
              letterSpacing: '-0.03em',
            }}
          >
            Your Holdings
          </h1>
          <p style={{ margin: '8px 0 0', color: 'var(--color-on-surface-variant)', fontSize: 14 }}>
            Algorithmic performance tracking and asset distribution analysis.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.1em',
              color: 'var(--color-on-surface-variant)',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            Net Liquidity
          </div>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 900,
              fontSize: 28,
              color: 'var(--color-on-surface)',
              letterSpacing: '-0.03em',
            }}
          >
            {data.netLiquidity}
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: 'rgb(235 255 169 / 12%)',
              color: 'var(--color-tertiary)',
              padding: '3px 10px',
              borderRadius: 4,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.06em',
              marginTop: 6,
            }}
          >
            {data.ytd}
          </div>
        </div>
      </div>

      {/* ── Main 2-col grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>

        {/* Growth Projection */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <div>
              <h2 style={{ ...sectionHeading, fontSize: 18, marginBottom: 4 }}>Growth Projection</h2>
              <div style={{ ...eyebrow, marginBottom: 8 }}>ALGORITHM PERFORMANCE (S-TIER)</div>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 14,
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.06em',
                color: 'var(--color-on-surface-variant)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ display: 'inline-block', width: 16, height: 2, background: '#00dbe9', borderRadius: 1 }} />
                Realized
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: 16,
                    height: 2,
                    background: 'rgb(255 255 255 / 35%)',
                    borderRadius: 1,
                    backgroundImage: 'repeating-linear-gradient(to right, rgb(255 255 255 / 35%) 0 5px, transparent 5px 9px)',
                  }}
                />
                Projected
              </span>
            </div>
          </div>
          <LineChart realized={data.realized} projected={data.projected} labels={data.chartLabels} />
        </div>

        {/* Allocation */}
        <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h2 style={{ ...sectionHeading, fontSize: 18, marginBottom: 4 }}>Allocation</h2>
            <div style={eyebrow}>ASSET DISTRIBUTION</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <DonutChart segments={data.allocations} size={180} thickness={30} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.allocations.map((item) => (
              <div
                key={item.label}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: item.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-on-surface-variant)' }}>
                    {item.label}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--color-on-surface)',
                  }}
                >
                  {item.valueFmt}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Core Holdings table ── */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div
          style={{
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--color-outline-variant)',
          }}
        >
          <h2 style={{ ...sectionHeading, fontSize: 18 }}>Core Holdings</h2>
          <div style={{ display: 'flex', gap: 12 }}>
            <span className="material-symbol" aria-hidden="true" style={{ color: 'var(--color-on-surface-variant)', fontSize: 18, cursor: 'pointer' }}>
              filter_list
            </span>
            <span className="material-symbol" aria-hidden="true" style={{ color: 'var(--color-on-surface-variant)', fontSize: 18, cursor: 'pointer' }}>
              download
            </span>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgb(255 255 255 / 6%)' }}>
              {['Asset', 'Quantity', 'Avg. Price', 'Market Value', 'P/L'].map((col) => (
                <th
                  key={col}
                  style={{
                    padding: '12px 24px',
                    textAlign: col === 'P/L' || col === 'Market Value' || col === 'Quantity' || col === 'Avg. Price'
                      ? 'right'
                      : 'left',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--color-on-surface-variant)',
                    fontWeight: 400,
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.holdings.map((h, i) => (
              <tr
                key={h.ticker}
                style={{
                  borderBottom: i < data.holdings.length - 1 ? '1px solid rgb(255 255 255 / 4%)' : 'none',
                }}
              >
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-on-surface)', fontWeight: 600 }}>
                    {h.name}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 3 }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        background: 'rgb(0 219 233 / 10%)',
                        color: 'var(--color-primary)',
                        padding: '2px 6px',
                        borderRadius: 3,
                        letterSpacing: '0.06em',
                      }}
                    >
                      {h.ticker}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        color: 'var(--color-on-surface-variant)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {h.exchange}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-on-surface-variant)' }}>
                  {h.qty}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-on-surface)' }}>
                  {h.avgPrice}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--color-on-surface)' }}>
                  {h.marketValue}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: h.positive ? 'var(--color-primary)' : 'var(--color-error)' }}>
                    {h.pl}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: h.positive ? 'var(--color-primary)' : 'var(--color-error)', opacity: 0.8, marginTop: 2 }}>
                    {h.plPct}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ padding: '16px 24px', textAlign: 'center', borderTop: '1px solid rgb(255 255 255 / 5%)' }}>
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.08em',
              color: 'var(--color-primary)',
              textTransform: 'uppercase',
            }}
          >
            LOAD FULL HOLDINGS REPORT ▼
          </button>
        </div>
      </div>
    </div>
  );
}
