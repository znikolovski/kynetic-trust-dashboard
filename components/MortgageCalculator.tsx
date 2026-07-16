'use client';

import { useMemo, useState } from 'react';

export type MortgageCalculatorProps = {
  /** Fired once the component has mounted and is ready. */
  onReady?: () => void;
};

const COLORS = {
  surface: '#111318',
  surfaceContainer: '#1e2024',
  surfaceContainerHigh: '#282a2e',
  onSurface: '#e2e2e8',
  onSurfaceVariant: '#b9cacb',
  primary: '#00dbe9',
  primaryContainer: '#00f0ff',
  outline: '#849495',
  outlineVariant: '#3b494b',
  mono: "'JetBrains Mono', ui-monospace, monospace",
  heading: "'Hanken Grotesk', system-ui, sans-serif",
  body: "Geist, system-ui, sans-serif",
};

/** Standard amortization: P * [r(1+r)^n] / [(1+r)^n - 1] */
function monthlyPayment(principal: number, annualRatePercent: number, termYears: number): number {
  const r = annualRatePercent / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function formatCurrency(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

const TERMS = [10, 15, 20, 30] as const;
type Term = typeof TERMS[number];

// Slider: thumb styled via CSS var trick since React doesn't support ::thumb inline
const SLIDER_STYLES = `
  .sb-mort-range { -webkit-appearance: none; appearance: none; width: 100%; height: 4px; border-radius: 2px; outline: none; cursor: pointer; }
  .sb-mort-range::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #00f0ff; cursor: pointer; box-shadow: 0 0 12px rgb(0 240 255 / 50%); }
  .sb-mort-range::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: #00f0ff; border: none; cursor: pointer; box-shadow: 0 0 12px rgb(0 240 255 / 50%); }
  .sb-mort-cta:hover { filter: brightness(1.1); }
  .sb-mort-term:hover { border-color: rgb(0 240 255 / 40%) !important; }
  .sb-mort-term.active { border-color: #00f0ff !important; background: rgb(0 240 255 / 8%) !important; color: #00f0ff !important; }
  .sb-mort-input:focus { border-color: #00dbe9 !important; outline: none; }
`;

export default function MortgageCalculator({ onReady }: MortgageCalculatorProps) {
  const [homeValue, setHomeValue] = useState(750_000);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [annualRate, setAnnualRate] = useState(4.25);
  const [term, setTerm] = useState<Term>(30);

  // Fire onReady once — this widget doesn't need an async data fetch,
  // so it signals ready immediately after mount via the effect pattern.
  const [, setMounted] = useState(() => { setTimeout(() => onReady?.(), 0); return true; });

  const loanAmount = homeValue * (1 - downPaymentPct / 100);
  const payment = useMemo(() => monthlyPayment(loanAmount, annualRate, term), [loanAmount, annualRate, term]);
  const totalPaid = payment * term * 12;
  const totalInterest = totalPaid - loanAmount;

  return (
    <div style={{ fontFamily: COLORS.body, color: COLORS.onSurface }}>
      <style>{SLIDER_STYLES}</style>

      <div
        style={{
          background: 'rgb(255 255 255 / 3%)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgb(255 255 255 / 10%)',
          borderRadius: '0.5rem',
          padding: 32,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Cyan glow orb */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgb(0 240 255 / 4%)', filter: 'blur(60px)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <span style={{ fontFamily: COLORS.mono, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.primaryContainer }}>
              Interactive Modeler
            </span>
            <span style={{ color: COLORS.onSurfaceVariant, fontSize: 18 }}>⚙</span>
          </div>

          {/* Home Value slider */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <label htmlFor="sb-mort-value" style={{ fontFamily: COLORS.body, fontWeight: 500, color: COLORS.onSurface }}>
                Home Value
              </label>
              <span style={{ fontFamily: COLORS.mono, fontWeight: 700, color: COLORS.primaryContainer, fontSize: 18 }}>
                {formatCurrency(homeValue)}
              </span>
            </div>
            <input
              id="sb-mort-value"
              className="sb-mort-range"
              type="range"
              min={100_000}
              max={2_000_000}
              step={10_000}
              value={homeValue}
              onChange={(e) => setHomeValue(Number(e.target.value))}
              aria-valuetext={formatCurrency(homeValue)}
              style={{ background: `linear-gradient(to right, ${COLORS.primaryContainer} ${((homeValue - 100_000) / 1_900_000) * 100}%, ${COLORS.surfaceContainerHigh} 0%)` }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontFamily: COLORS.mono, fontSize: 10, color: COLORS.outline }}>$100K</span>
              <span style={{ fontFamily: COLORS.mono, fontSize: 10, color: COLORS.outline }}>$2M</span>
            </div>
          </div>

          {/* Down payment slider */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <label htmlFor="sb-mort-down" style={{ fontFamily: COLORS.body, fontWeight: 500, color: COLORS.onSurface }}>
                Down Payment
              </label>
              <span style={{ fontFamily: COLORS.mono, fontWeight: 700, color: COLORS.primaryContainer, fontSize: 18 }}>
                {downPaymentPct}% ({formatCurrency(homeValue * downPaymentPct / 100)})
              </span>
            </div>
            <input
              id="sb-mort-down"
              className="sb-mort-range"
              type="range"
              min={3}
              max={50}
              step={1}
              value={downPaymentPct}
              onChange={(e) => setDownPaymentPct(Number(e.target.value))}
              aria-valuetext={`${downPaymentPct}%`}
              style={{ background: `linear-gradient(to right, ${COLORS.primaryContainer} ${((downPaymentPct - 3) / 47) * 100}%, ${COLORS.surfaceContainerHigh} 0%)` }}
            />
          </div>

          {/* Rate + Term inline */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <div style={{ fontFamily: COLORS.mono, fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase', color: COLORS.onSurfaceVariant, marginBottom: 8 }}>
                Interest Rate
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  className="sb-mort-input"
                  type="number"
                  min={0.5}
                  max={15}
                  step={0.05}
                  value={annualRate}
                  onChange={(e) => setAnnualRate(Math.max(0.5, Math.min(15, Number(e.target.value))))}
                  aria-label="Annual interest rate"
                  style={{
                    width: 72,
                    background: 'rgb(255 255 255 / 5%)',
                    border: `1px solid ${COLORS.outlineVariant}`,
                    borderRadius: '0.125rem',
                    padding: '10px 12px',
                    color: COLORS.onSurface,
                    fontFamily: COLORS.mono,
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                />
                <span style={{ fontFamily: COLORS.mono, color: COLORS.onSurface, fontSize: 18, fontWeight: 700 }}>%</span>
              </div>
            </div>
            <div>
              <div style={{ fontFamily: COLORS.mono, fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase', color: COLORS.onSurfaceVariant, marginBottom: 8 }}>
                Loan Term
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {TERMS.map((t) => (
                  <button
                    key={t}
                    className={`sb-mort-term${term === t ? ' active' : ''}`}
                    onClick={() => setTerm(t)}
                    aria-pressed={term === t}
                    style={{
                      padding: '8px 10px',
                      background: 'rgb(255 255 255 / 3%)',
                      border: `1px solid ${term === t ? COLORS.primaryContainer : COLORS.outlineVariant}`,
                      borderRadius: '0.125rem',
                      color: term === t ? COLORS.primaryContainer : COLORS.onSurfaceVariant,
                      fontFamily: COLORS.mono,
                      fontSize: 12,
                      cursor: 'pointer',
                      transition: 'border-color 0.15s, color 0.15s, background 0.15s',
                    }}
                  >
                    {t}yr
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary divider */}
          <div style={{ borderTop: `1px solid ${COLORS.outlineVariant}`, paddingTop: 24, marginTop: 8 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontFamily: COLORS.body, fontSize: 13, color: COLORS.onSurfaceVariant, marginBottom: 8 }}>
                Estimated Monthly Payment
              </div>
              <div style={{ fontFamily: COLORS.heading, fontWeight: 900, fontSize: 'clamp(40px, 6vw, 56px)', color: COLORS.onSurface, letterSpacing: '-0.03em', lineHeight: 1 }}>
                {formatCurrency(payment)}
              </div>
            </div>

            {/* Loan breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Loan Amount', value: formatCurrency(loanAmount) },
                { label: 'Total Interest', value: formatCurrency(totalInterest) },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: '12px 14px', background: 'rgb(255 255 255 / 3%)', border: `1px solid ${COLORS.outlineVariant}`, borderRadius: '0.125rem' }}>
                  <div style={{ fontFamily: COLORS.mono, fontSize: 10, letterSpacing: '0.04em', textTransform: 'uppercase', color: COLORS.onSurfaceVariant, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontFamily: COLORS.mono, fontWeight: 700, color: COLORS.onSurface, fontSize: 15 }}>{value}</div>
                </div>
              ))}
            </div>

            <a
              href="/register?type=mortgage"
              className="sb-mort-cta"
              style={{
                display: 'block',
                width: '100%',
                background: COLORS.primaryContainer,
                color: '#00363a',
                border: 'none',
                borderRadius: '0.125rem',
                padding: '16px 24px',
                fontFamily: COLORS.body,
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                textAlign: 'center',
                textDecoration: 'none',
                cursor: 'pointer',
                boxShadow: '0 0 24px rgb(0 240 255 / 20%)',
                transition: 'filter 0.15s',
                boxSizing: 'border-box',
              }}
            >
              Apply With This Rate
            </a>

            <p style={{ marginTop: 12, fontFamily: COLORS.mono, fontSize: 10, color: COLORS.outline, letterSpacing: '0.04em', textAlign: 'center' }}>
              Illustrative only · Does not include taxes, insurance, or PMI · Rates subject to change
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
