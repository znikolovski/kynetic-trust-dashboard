'use client';

import { useState, useEffect } from 'react';
import MiniTrend from '../../../components/charts/MiniTrend';
import type { TransactionMetrics, Transaction, TxType, TxStatus } from '@/lib/dashboard-data';

type FilterChip = 'LAST 30 DAYS' | 'HIGH VALUE (>$1M)' | 'ASSET CLASS: FX' | 'ASSET CLASS: CRYPTO';

interface TransactionsPageData {
  metrics: TransactionMetrics[];
  items: Transaction[];
  total: number;
  page: number;
  perPage: number;
}

const TYPE_STYLES: Record<TxType, { color: string; bg: string }> = {
  TRADE: { color: 'var(--color-primary)', bg: 'rgb(0 219 233 / 10%)' },
  TRANSFER: { color: 'var(--color-secondary)', bg: 'rgb(223 183 255 / 10%)' },
  YIELD: { color: 'var(--color-tertiary)', bg: 'rgb(235 255 169 / 10%)' },
};

const STATUS_STYLES: Record<TxStatus, { color: string; bg: string }> = {
  COMPLETED: { color: '#00ff80', bg: 'rgb(0 255 128 / 12%)' },
  PENDING: { color: 'var(--color-tertiary)', bg: 'rgb(235 255 169 / 12%)' },
  SETTLED: { color: 'var(--color-primary)', bg: 'rgb(0 219 233 / 12%)' },
};

const ALL_FILTERS: FilterChip[] = ['LAST 30 DAYS', 'HIGH VALUE (>$1M)', 'ASSET CLASS: FX', 'ASSET CLASS: CRYPTO'];

const eyebrow: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--color-primary)',
};

export default function TransactionsPage() {
  const [activeFilters, setActiveFilters] = useState<string[]>(['LAST 30 DAYS']);
  const [data, setData] = useState<TransactionsPageData | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({ page: '1' });
    if (activeFilters.length) params.set('filters', activeFilters.join(','));
    fetch(`/api/transactions?${params}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, [activeFilters]);

  if (!data) return <div style={{ padding: 32, color: 'var(--color-on-surface-variant)' }}>Loading…</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ ...eyebrow, marginBottom: 6 }}>Institutional Ledger</div>
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
            Transactions
          </h1>
          <p style={{ margin: '8px 0 0', color: 'var(--color-on-surface-variant)', fontSize: 14 }}>
            Complete record of institutional capital movements and settlements.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgb(255 255 255 / 4%)',
              border: '1px solid var(--color-outline-variant)',
              borderRadius: 6,
              padding: '8px 14px',
            }}
          >
            <span className="material-symbol" aria-hidden="true" style={{ fontSize: 16, color: 'var(--color-on-surface-variant)' }}>search</span>
            <input
              placeholder="Search transactions…"
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                color: 'var(--color-on-surface)',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                width: 200,
              }}
            />
          </div>
          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgb(0 219 233 / 10%)',
              border: '1px solid rgb(0 219 233 / 25%)',
              borderRadius: 6,
              padding: '8px 14px',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.08em',
              color: 'var(--color-primary)',
              textTransform: 'uppercase',
            }}
          >
            <span className="material-symbol" aria-hidden="true" style={{ fontSize: 15, color: 'var(--color-primary)' }}>download</span>
            Export
          </button>
        </div>
      </div>

      {/* ── Metric cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {data.metrics.map((m) => (
          <div key={m.label} className="glass-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--color-on-surface-variant)',
                    marginBottom: 8,
                  }}
                >
                  {m.label}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 900,
                    fontSize: 24,
                    color: 'var(--color-on-surface)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {m.value}
                </div>
              </div>
              <MiniTrend direction={m.direction} color={m.color} />
            </div>
            {m.change && (
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: m.positive ? '#00ff80' : 'var(--color-error)',
                  letterSpacing: '0.04em',
                }}
              >
                {m.change} this period
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.08em',
            color: 'var(--color-on-surface-variant)',
            textTransform: 'uppercase',
          }}
        >
          FILTERS:
        </span>
        {ALL_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() =>
              setActiveFilters((prev) =>
                prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
              )
            }
            style={{
              padding: '5px 12px',
              borderRadius: 4,
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              transition: 'background 0.15s, color 0.15s, border-color 0.15s',
              ...(activeFilters.includes(f)
                ? {
                    background: 'rgb(0 219 233 / 15%)',
                    border: '1px solid rgb(0 219 233 / 40%)',
                    color: 'var(--color-primary)',
                  }
                : {
                    background: 'rgb(255 255 255 / 3%)',
                    border: '1px solid var(--color-outline-variant)',
                    color: 'var(--color-on-surface-variant)',
                  }),
            }}
          >
            {f}
          </button>
        ))}
        <button
          type="button"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.06em',
            color: 'var(--color-primary)',
            textTransform: 'uppercase',
            marginLeft: 4,
          }}
        >
          ADVANCED FILTERS →
        </button>
      </div>

      {/* ── Transaction table ── */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
              {['Transaction ID', 'Entity', 'Date', 'Type', 'Amount', 'Status'].map((col) => (
                <th
                  key={col}
                  style={{
                    padding: '12px 20px',
                    textAlign: col === 'Amount' ? 'right' : 'left',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--color-on-surface-variant)',
                    fontWeight: 400,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.items.map((tx, i) => {
              const typeStyle = TYPE_STYLES[tx.type];
              const statusStyle = STATUS_STYLES[tx.status];
              return (
                <tr
                  key={tx.id}
                  style={{
                    borderBottom: i < data.items.length - 1 ? '1px solid rgb(255 255 255 / 4%)' : 'none',
                  }}
                >
                  <td
                    style={{
                      padding: '14px 20px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      color: 'var(--color-on-surface-variant)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tx.id}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 6,
                          background: tx.entityColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          fontWeight: 700,
                          color: 'var(--color-on-surface)',
                          flexShrink: 0,
                        }}
                      >
                        {tx.entityAbbr}
                      </div>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-on-surface)', whiteSpace: 'nowrap' }}>
                        {tx.entity}
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: '14px 20px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: 'var(--color-on-surface-variant)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tx.date}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span
                      style={{
                        background: typeStyle.bg,
                        color: typeStyle.color,
                        border: `1px solid ${typeStyle.color.replace('var(--color-primary)', 'rgb(0 219 233 / 35%)').replace('var(--color-secondary)', 'rgb(223 183 255 / 35%)').replace('var(--color-tertiary)', 'rgb(235 255 169 / 35%)')}`,
                        padding: '3px 8px',
                        borderRadius: 4,
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        letterSpacing: '0.08em',
                      }}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '14px 20px',
                      textAlign: 'right',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      fontWeight: 700,
                      color: tx.amountPositive ? 'var(--color-primary)' : 'var(--color-error)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tx.amount}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span
                      style={{
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        letterSpacing: '0.06em',
                      }}
                    >
                      {tx.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer */}
        <div
          style={{
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgb(255 255 255 / 5%)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--color-on-surface-variant)',
              letterSpacing: '0.04em',
            }}
          >
            Showing {data.items.length} of {data.total.toLocaleString()} entries
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {['PREVIOUS', 'NEXT'].map((label) => (
              <button
                key={label}
                type="button"
                style={{
                  background: 'rgb(255 255 255 / 4%)',
                  border: '1px solid var(--color-outline-variant)',
                  borderRadius: 4,
                  padding: '6px 14px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.08em',
                  color: 'var(--color-on-surface-variant)',
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
