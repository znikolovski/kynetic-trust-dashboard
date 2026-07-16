'use client';

import { useState, useEffect } from 'react';
import BarChart from '../../../components/charts/BarChart';
import MortgageCalculator from '../../../components/MortgageCalculator';
import type { DashboardSummary, AccountAllocation, ActivityRow } from '@/lib/dashboard-data';

interface DashboardResponse {
  summary: DashboardSummary;
  accounts: AccountAllocation[];
  activity: ActivityRow[];
}

const TIME_FILTERS = ['1D', '1W', '1M', 'ALL'] as const;
type TimeFilter = typeof TIME_FILTERS[number];

const QUICK_ACTIONS = [
  { label: 'Open Account', icon: 'credit_card', id: 'account' },
  { label: 'Mortgages', icon: 'home', id: 'mortgage' },
  { label: 'Transfer Funds', icon: 'swap_horiz', id: 'transfer' },
  { label: 'Security Vault', icon: 'security', id: 'vault' },
] as const;

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

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('1W');
  const [showMortgage, setShowMortgage] = useState(false);
  const [data, setData] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <div style={{ padding: 32, color: 'var(--color-on-surface-variant)' }}>Loading…</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Section 1: Balance + Market Pulse ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>

        {/* Balance card */}
        <div
          className="glass-card"
          style={{
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at 30% 0%, rgb(0 219 233 / 8%) 0%, transparent 65%)',
              pointerEvents: 'none',
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="material-symbol" aria-hidden="true" style={{ color: 'var(--color-primary)', fontSize: 18 }}>
                account_balance
              </span>
              <span style={eyebrow}>Total Combined Balance</span>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 900,
                fontSize: 32,
                color: 'var(--color-on-surface)',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                marginBottom: 12,
              }}
            >
              {data.summary.balance}
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: 'rgb(0 255 128 / 12%)',
                color: '#00ff80',
                padding: '4px 10px',
                borderRadius: 4,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.06em',
              }}
            >
              <span className="material-symbol" aria-hidden="true" style={{ fontSize: 14, color: '#00ff80' }}>
                {data.summary.direction === 'up' ? 'arrow_upward' : 'arrow_downward'}
              </span>
              {data.summary.change} vs last month
            </div>
          </div>
        </div>

        {/* Market Pulse card */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <div>
              <h2 style={{ ...sectionHeading, fontSize: 20, marginBottom: 4 }}>Market Pulse</h2>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--color-on-surface-variant)' }}>
                Live portfolio trajectory and performance analytics
              </p>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {TIME_FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFilter(f)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 4,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    letterSpacing: '0.06em',
                    transition: 'background 0.15s, color 0.15s',
                    background: activeFilter === f ? 'rgb(0 219 233 / 18%)' : 'rgb(255 255 255 / 4%)',
                    color: activeFilter === f ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <BarChart data={data.summary.marketPulseData} height={130} />
        </div>
      </div>

      {/* ── Section 2: Asset Allocation + Quick Actions ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Asset Allocation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={sectionHeading}>Asset Allocation</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.accounts.map((acct) => (
              <div
                key={acct.label}
                className="glass-card"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: `color-mix(in srgb, ${acct.accentColor} 14%, transparent)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span
                    className="material-symbol"
                    aria-hidden="true"
                    style={{ fontSize: 18, color: acct.accentColor }}
                  >
                    {acct.icon}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-on-surface-variant)', marginBottom: 2 }}>
                    {acct.label}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize: 16,
                      color: 'var(--color-on-surface)',
                    }}
                  >
                    {acct.balance}
                  </div>
                </div>
                <div
                  style={{
                    background: acct.badgeBg,
                    color: acct.badgeColor,
                    padding: '3px 8px',
                    borderRadius: 4,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.08em',
                    flexShrink: 0,
                  }}
                >
                  {acct.badge}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={sectionHeading}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => {
                  if (action.id === 'mortgage') setShowMortgage((v) => !v);
                }}
                className="glass-card"
                style={{
                  padding: '20px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 10,
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                  background: action.id === 'mortgage' && showMortgage
                    ? 'rgb(0 219 233 / 10%)'
                    : 'rgb(255 255 255 / 3%)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgb(255 255 255 / 6%)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    action.id === 'mortgage' && showMortgage
                      ? 'rgb(0 219 233 / 10%)'
                      : 'rgb(255 255 255 / 3%)';
                }}
              >
                <span
                  className="material-symbol"
                  aria-hidden="true"
                  style={{ fontSize: 24, color: 'var(--color-primary)' }}
                >
                  {action.icon}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    letterSpacing: '0.06em',
                    color: 'var(--color-on-surface)',
                    textTransform: 'uppercase',
                  }}
                >
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 3: Mortgage Calculator (conditional) ── */}
      {showMortgage && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={sectionHeading}>Mortgage Calculator</h2>
            <button
              type="button"
              onClick={() => setShowMortgage(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-on-surface-variant)',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span className="material-symbol" aria-hidden="true" style={{ fontSize: 16 }}>close</span>
              Close
            </button>
          </div>
          <MortgageCalculator />
        </div>
      )}

      {/* ── Section 4: Recent Activity ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={sectionHeading}>Recent Activity</h2>
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
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span className="material-symbol" aria-hidden="true" style={{ fontSize: 14, color: 'var(--color-primary)' }}>download</span>
            Download Report
          </button>
        </div>

        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                {['Transaction ID', 'Entity', 'Timestamp', 'Amount', 'Status'].map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: '12px 20px',
                      textAlign: 'left',
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
              {data.activity.map((row, i) => (
                <tr
                  key={row.id}
                  style={{
                    borderBottom: i < data.activity.length - 1 ? '1px solid rgb(255 255 255 / 5%)' : 'none',
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
                    {row.id}
                  </td>
                  <td
                    style={{
                      padding: '14px 20px',
                      fontFamily: 'var(--font-body)',
                      fontSize: 13,
                      color: 'var(--color-on-surface)',
                    }}
                  >
                    {row.entity}
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
                    {row.timestamp}
                  </td>
                  <td
                    style={{
                      padding: '14px 20px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      fontWeight: 700,
                      color: row.positive ? 'var(--color-primary)' : 'var(--color-error)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {row.amount}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span
                      style={{
                        background: row.statusBg,
                        color: row.statusColor,
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        letterSpacing: '0.06em',
                      }}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
