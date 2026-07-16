'use client';

import { useState, useEffect } from 'react';
import type { WatchlistItem, HeatmapDot, NewsItem } from '@/lib/dashboard-data';

interface MarketsResponse {
  watchlist: WatchlistItem[];
  heatmapDots: HeatmapDot[];
  news: NewsItem[];
}

const eyebrow: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--color-primary)',
};

export default function MarketsPage() {
  const [heatmapTab, setHeatmapTab] = useState<'EQUITIES' | 'FOREX'>('EQUITIES');
  const [newsTab, setNewsTab] = useState<'LATEST' | 'MACRO' | 'EQUITIES' | 'CRYPTO'>('LATEST');
  const [data, setData] = useState<MarketsResponse | null>(null);

  useEffect(() => {
    fetch('/api/markets')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <div style={{ padding: 32, color: 'var(--color-on-surface-variant)' }}>Loading…</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* ── Hero ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-heading)',
              fontWeight: 900,
              fontSize: 'clamp(44px, 6vw, 72px)',
              color: 'var(--color-primary)',
              letterSpacing: '-0.04em',
              lineHeight: 0.95,
            }}
          >
            GLOBAL<br />MARKETS
          </h1>
          <p
            style={{
              marginTop: 16,
              color: 'var(--color-on-surface-variant)',
              fontSize: 14,
              maxWidth: 540,
              lineHeight: 1.6,
            }}
          >
            Real-time liquidity monitoring and institutional execution across 42 sovereign exchanges.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div
            className="glass-card"
            style={{
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff80', boxShadow: '0 0 6px #00ff80' }} />
            <span style={{ ...eyebrow, color: 'var(--color-on-surface-variant)' }}>
              SYSTEM STATUS · ULTRA-LOW LATENCY
            </span>
          </div>
          <div
            className="glass-card"
            style={{
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', boxShadow: '0 0 6px var(--color-primary)' }} />
            <span style={{ ...eyebrow, color: 'var(--color-on-surface-variant)' }}>
              SESSION · NYSE ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* ── Main 2-col grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Liquidity Heatmap */}
        <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2
              style={{
                margin: 0,
                fontFamily: 'var(--font-heading)',
                fontWeight: 900,
                fontSize: 18,
                color: 'var(--color-on-surface)',
              }}
            >
              Liquidity Heatmap
            </h2>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['EQUITIES', 'FOREX'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setHeatmapTab(tab)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 4,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.06em',
                    background: heatmapTab === tab ? 'rgb(0 219 233 / 18%)' : 'rgb(255 255 255 / 4%)',
                    color: heatmapTab === tab ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div style={eyebrow}>CROSS-BORDER CAPITAL FLOWS · 24H DELTA</div>

          {/* Scatter SVG */}
          <svg
            viewBox="0 0 100 100"
            width="100%"
            style={{ display: 'block', aspectRatio: '2 / 1', background: 'rgb(255 255 255 / 2%)', borderRadius: 6 }}
            aria-hidden="true"
          >
            {/* Grid */}
            {[20, 40, 60, 80].map((v) => (
              <g key={v}>
                <line x1={v} y1={0} x2={v} y2={100} stroke="rgb(255 255 255 / 6%)" strokeWidth={0.4} />
                <line x1={0} y1={v} x2={100} y2={v} stroke="rgb(255 255 255 / 6%)" strokeWidth={0.4} />
              </g>
            ))}
            {data.heatmapDots.map((d, i) => (
              <circle
                key={i}
                cx={d.x}
                cy={d.y}
                r={d.r * 0.6}
                fill={`rgb(0 219 233 / ${d.opacity * 40}%)`}
                stroke={`rgb(0 219 233 / ${d.opacity * 70}%)`}
                strokeWidth={0.4}
              />
            ))}
          </svg>

          <div style={{ display: 'flex', gap: 20 }}>
            <div>
              <div style={eyebrow}>PEAK VELOCITY</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 16, color: 'var(--color-on-surface)', marginTop: 4 }}>
                1.2ms
              </div>
            </div>
            <div>
              <div style={eyebrow}>DAILY VOL (AGG)</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 16, color: 'var(--color-on-surface)', marginTop: 4 }}>
                $42.8T
              </div>
            </div>
          </div>
        </div>

        {/* Watchlist */}
        <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2
              style={{
                margin: 0,
                fontFamily: 'var(--font-heading)',
                fontWeight: 900,
                fontSize: 18,
                color: 'var(--color-on-surface)',
              }}
            >
              Watchlist
            </h2>
            <span className="material-symbol" aria-hidden="true" style={{ color: 'var(--color-on-surface-variant)', fontSize: 18 }}>
              filter_list
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {data.watchlist.map((item) => (
              <div
                key={item.ticker}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid rgb(255 255 255 / 5%)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      letterSpacing: '0.08em',
                      background: 'rgb(0 219 233 / 10%)',
                      color: 'var(--color-primary)',
                      padding: '2px 6px',
                      borderRadius: 3,
                      display: 'inline-block',
                    }}
                  >
                    {item.ticker}
                  </span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-on-surface-variant)' }}>
                    {item.name}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14, color: 'var(--color-on-surface)' }}>
                    {item.price}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      color: item.positive ? '#00ff80' : 'var(--color-error)',
                    }}
                  >
                    {item.change}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <a
            href="#"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.08em',
              color: 'var(--color-primary)',
              textDecoration: 'none',
              textTransform: 'uppercase',
              marginTop: 'auto',
              alignSelf: 'flex-end',
            }}
          >
            VIEW FULL EXCHANGE →
          </a>
        </div>
      </div>

      {/* ── Intelligence Stream ── */}
      <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2
            style={{
              margin: 0,
              fontFamily: 'var(--font-heading)',
              fontWeight: 900,
              fontSize: 20,
              color: 'var(--color-on-surface)',
            }}
          >
            Intelligence Stream
          </h2>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['LATEST', 'MACRO', 'EQUITIES', 'CRYPTO'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setNewsTab(tab)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 4,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.06em',
                  background: newsTab === tab ? 'rgb(0 219 233 / 18%)' : 'rgb(255 255 255 / 4%)',
                  color: newsTab === tab ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {data.news.map((item) => (
            <div
              key={item.source}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
                borderRadius: 8,
                overflow: 'hidden',
                background: 'rgb(255 255 255 / 2%)',
                border: '1px solid rgb(255 255 255 / 7%)',
                cursor: 'pointer',
              }}
            >
              {/* Image placeholder */}
              <div
                style={{
                  height: 160,
                  background: `linear-gradient(135deg, ${item.gradientFrom} 0%, ${item.gradientTo} 100%)`,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '12px 14px',
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(ellipse at 70% 30%, rgb(0 219 233 / 5%) 0%, transparent 60%)`,
                  }}
                />
                <span
                  style={{
                    background: item.sourceBg,
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    letterSpacing: '0.1em',
                    padding: '3px 7px',
                    borderRadius: 3,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {item.source}
                </span>
              </div>
              {/* Content */}
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p
                  style={{
                    margin: 0,
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    fontSize: 13,
                    color: 'var(--color-on-surface)',
                    lineHeight: 1.5,
                  }}
                >
                  {item.headline}
                </p>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.06em',
                    color: 'var(--color-on-surface-variant)',
                  }}
                >
                  {item.meta}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
