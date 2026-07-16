'use client';

import { useEffect, useRef, useState } from 'react';
import { getSessionUserInfo } from '../lib/session';
import MiniTrend from './charts/MiniTrend';
import type { TransactionMetrics } from '../lib/dashboard-data';

const WIDGET_CSS = `
  :host { display: block; }
  .ts-wrap {
    max-width: 1280px;
    margin: 0 auto;
    padding: 24px 20px;
  }
  @media (min-width: 900px) {
    .ts-wrap { padding: 28px 64px; }
  }
  .ts-grid {
    display: grid;
    gap: 12px;
    grid-template-columns: 1fr;
  }
  @media (min-width: 600px) {
    .ts-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (min-width: 900px) {
    .ts-grid { grid-template-columns: repeat(3, 1fr); }
  }
  .ts-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px 24px;
    background: var(--glass-bg, rgba(255, 255, 255, 0.03));
    border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.10));
    border-radius: var(--radius-xl, 24px);
    backdrop-filter: blur(12px);
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }
  .ts-card--active {
    border-color: rgba(0, 219, 233, 0.35);
    box-shadow: 0 0 24px -4px rgba(0, 219, 233, 0.30);
  }
  @media (prefers-reduced-motion: reduce) {
    .ts-card { transition: none; }
  }
  .ts-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .ts-label {
    font-family: var(--mono-font-family, 'JetBrains Mono', ui-monospace, monospace);
    font-size: var(--font-size-badge, 10px);
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-on-surface-variant, #b9cacb);
    line-height: 1.2;
    margin-top: 2px;
  }
  .ts-value {
    font-family: var(--heading-font-family, 'Hanken Grotesk', 'Helvetica Neue', sans-serif);
    font-size: clamp(28px, 4vw, 36px);
    font-weight: 900;
    letter-spacing: -0.03em;
    line-height: 1;
    color: var(--color-on-surface, #e2e2e8);
  }
  .ts-change {
    font-family: var(--mono-font-family, 'JetBrains Mono', ui-monospace, monospace);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.04em;
  }
  .ts-change--pos { color: var(--color-status-completed, #00ff80); }
  .ts-change--neg { color: var(--color-error, #ffb4ab); }
`;

type Props = {
  apiBase?: string;
  onReady: () => void;
};

export default function TransactionSummary({
  apiBase = 'https://app.securbank.com',
  onReady,
}: Props) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!getSessionUserInfo(),
  );
  const [metrics, setMetrics] = useState<TransactionMetrics[]>([]);
  const readyFired = useRef(false);

  // Track auth state driven by sb-auth-change events (EDS header fires these)
  useEffect(() => {
    const handler = (e: Event) => {
      const { authenticated } = (e as CustomEvent<{ authenticated: boolean }>).detail;
      setIsAuthenticated(authenticated);
    };
    window.addEventListener('sb-auth-change', handler);
    return () => window.removeEventListener('sb-auth-change', handler);
  }, []);

  // Fetch metrics whenever auth becomes true
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`${apiBase}/api/transactions?page=1`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { metrics?: TransactionMetrics[] } | null) => {
        if (data?.metrics?.length) setMetrics(data.metrics);
      })
      .catch(() => {});
  }, [isAuthenticated, apiBase]);

  // Fire onReady exactly once so the EDS mount div becomes visible and the
  // 6-second READY_TIMEOUT_MS is cleared. The section has padding: 0, so when
  // this component renders null the section is truly invisible (0 height).
  useEffect(() => {
    if (readyFired.current) return;
    readyFired.current = true;
    onReady();
  }, [onReady]);

  if (!isAuthenticated || metrics.length === 0) return null;

  return (
    <>
      <style>{WIDGET_CSS}</style>
      <div className="ts-wrap">
        <div className="ts-grid">
          {metrics.map((card, i) => (
            <div
              key={card.label}
              className={`ts-card${i === 1 ? ' ts-card--active' : ''}`}
            >
              <div className="ts-header">
                <span className="ts-label">{card.label}</span>
                <MiniTrend direction={card.direction} color={card.color} />
              </div>
              <div className="ts-value">{card.value}</div>
              {card.change && (
                <div className={`ts-change ts-change--${card.positive ? 'pos' : 'neg'}`}>
                  {card.change} this period
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
