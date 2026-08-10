'use client';

import { useState, useEffect, useCallback } from 'react';

type ValueMap = Record<string, string>;
type StepStatus = 'idle' | 'running' | 'ok' | 'error';

interface PublishStep {
  id: string;
  label: string;
  status: StepStatus;
  error?: string;
}

interface CategoryGroup {
  id: string;
  title: string;
  eyebrow: string;
  items: { key: string; label: string }[];
}

const CATEGORIES: CategoryGroup[] = [
  {
    id: 'savings',
    title: 'Savings & Deposit',
    eyebrow: 'APY Rates',
    items: [
      { key: 'standard-apy', label: 'Standard APY' },
      { key: 'high-yield-apy', label: 'High-Yield APY' },
      { key: 'institutional-apy', label: 'Institutional APY' },
    ],
  },
  {
    id: 'credit',
    title: 'Credit & Rewards',
    eyebrow: 'Cashback',
    items: [
      { key: 'cashback-standard', label: 'Standard Cashback' },
      { key: 'cashback-premium', label: 'Premium Cashback' },
    ],
  },
  {
    id: 'mortgage',
    title: 'Mortgage',
    eyebrow: 'Fixed Rates',
    items: [
      { key: 'mortgage-rate-30yr', label: '30-Year Fixed' },
      { key: 'mortgage-rate-15yr', label: '15-Year Fixed' },
    ],
  },
  {
    id: 'fees',
    title: 'Fees',
    eyebrow: 'Monthly',
    items: [
      { key: 'premium-monthly-fee', label: 'Premium Monthly Fee' },
      { key: 'institutional-monthly-fee', label: 'Institutional Monthly Fee' },
    ],
  },
];

const BLANK_STEPS: PublishStep[] = [
  { id: 'validate', label: 'Validating rates', status: 'idle' },
  { id: 'write', label: 'Writing to DA content source', status: 'idle' },
  { id: 'sync', label: 'Dispatching sync workflow', status: 'idle' },
];

const AEM_URL = 'https://main--kynetic-trust--znikolovski.aem.live/placeholders.json';

const mono10: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
};

const eyebrowStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--color-primary)',
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontWeight: 900,
  fontSize: 20,
  color: 'var(--color-on-surface)',
  margin: '6px 0 0',
};

function StepIcon({ status }: { status: StepStatus }) {
  if (status === 'ok') {
    return (
      <span className="material-symbol" aria-hidden="true" style={{ fontSize: 20, color: 'var(--color-status-completed)', flexShrink: 0 }}>
        check_circle
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="material-symbol" aria-hidden="true" style={{ fontSize: 20, color: 'var(--color-error)', flexShrink: 0 }}>
        cancel
      </span>
    );
  }
  if (status === 'running') {
    return (
      <span className="material-symbol sb-spin" aria-hidden="true" style={{ fontSize: 20, color: 'var(--color-primary)', flexShrink: 0 }}>
        sync
      </span>
    );
  }
  return (
    <span className="material-symbol" aria-hidden="true" style={{ fontSize: 20, color: 'var(--color-outline-variant)', flexShrink: 0 }}>
      radio_button_unchecked
    </span>
  );
}

export default function RatesPage() {
  const [liveValues, setLiveValues] = useState<ValueMap>({});
  const [editedValues, setEditedValues] = useState<ValueMap>({});
  const [fetchState, setFetchState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [fetchError, setFetchError] = useState('');

  const [showPublish, setShowPublish] = useState(false);
  const [steps, setSteps] = useState<PublishStep[]>(BLANK_STEPS.map(s => ({ ...s })));
  const [publishDone, setPublishDone] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const pendingCount = Object.keys(editedValues).filter(k => editedValues[k] !== liveValues[k]).length;

  const fetchRates = useCallback(async () => {
    setFetchState('loading');
    setFetchError('');
    try {
      const res = await fetch(AEM_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const items: Array<{ Key: string; Value: string }> = Array.isArray(json) ? json : (json.data ?? []);
      const map: ValueMap = {};
      for (const item of items) {
        if (item.Key) map[item.Key] = item.Value;
      }
      setLiveValues(map);
      setEditedValues(map);
      setLastSync(new Date());
      setFetchState('ok');
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Unknown error');
      setFetchState('error');
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const handleDiscard = () => {
    setEditedValues({ ...liveValues });
  };

  const handlePublish = async () => {
    setSteps(BLANK_STEPS.map(s => ({ ...s })));
    setPublishDone(false);
    setPublishSuccess(false);
    setShowPublish(true);

    setSteps(prev =>
      prev.map(s => {
        if (s.id === 'validate') return { ...s, status: 'ok' };
        if (s.id === 'write') return { ...s, status: 'running' };
        return s;
      })
    );

    const rates = Object.entries(editedValues).map(([key, display]) => ({ key, display }));

    try {
      const res = await fetch('/api/rates/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rates }),
      });
      const data = await res.json();

      if (!res.ok) {
        setSteps(prev =>
          prev.map(s =>
            s.id === 'write'
              ? { ...s, status: 'error', error: data.error ?? `HTTP ${res.status}` }
              : s
          )
        );
      } else {
        setSteps(prev =>
          prev.map(s => {
            if (s.id === 'write') return { ...s, status: 'ok' };
            if (s.id === 'sync')
              return {
                ...s,
                status: data.syncTriggered ? 'ok' : 'error',
                error: data.syncTriggered
                  ? undefined
                  : 'GITHUB_PAT not configured — sync will run on next schedule',
              };
            return s;
          })
        );
        setLiveValues({ ...editedValues });
        setPublishSuccess(true);
      }
    } catch {
      setSteps(prev =>
        prev.map(s =>
          s.id === 'write' ? { ...s, status: 'error', error: 'Network error' } : s
        )
      );
    } finally {
      setPublishDone(true);
    }
  };

  const handleClosePublish = () => {
    if (!publishDone) return;
    setShowPublish(false);
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <style>{`
        @keyframes sb-spin { to { transform: rotate(360deg); } }
        .sb-spin { display: inline-block; animation: sb-spin 1s linear infinite; }
        .sb-rate-input:focus { outline: none; border-color: var(--color-primary) !important; box-shadow: 0 0 0 3px rgb(0 219 233 / 15%); }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
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
              Rate Management
            </h1>
            <p style={{ margin: '8px 0 0', color: 'var(--color-on-surface-variant)', fontSize: 14, fontFamily: 'var(--font-body)' }}>
              Live product rates — edit values and publish directly to securbank.run.place
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, paddingTop: 6 }}>
            {fetchState === 'ok' && (
              <span
                style={{
                  ...mono10,
                  background: pendingCount > 0 ? 'rgb(235 255 169 / 12%)' : 'rgb(0 255 128 / 12%)',
                  color: pendingCount > 0 ? 'var(--color-tertiary)' : 'var(--color-status-completed)',
                  padding: '4px 10px',
                  borderRadius: 4,
                }}
              >
                {pendingCount > 0 ? 'PENDING CHANGES' : 'LIVE'}
              </span>
            )}
            {lastSync && (
              <span style={{ ...mono10, color: 'var(--color-on-surface-variant)', whiteSpace: 'nowrap' }}>
                synced {formatTime(lastSync)}
              </span>
            )}
            <button
              type="button"
              onClick={fetchRates}
              disabled={fetchState === 'loading'}
              aria-label="Refresh rates from AEM"
              style={{
                background: 'none',
                border: '1px solid var(--color-outline-variant)',
                borderRadius: 6,
                padding: '6px 8px',
                cursor: fetchState === 'loading' ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: 'var(--color-on-surface-variant)',
                opacity: fetchState === 'loading' ? 0.5 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              <span
                className={`material-symbol${fetchState === 'loading' ? ' sb-spin' : ''}`}
                aria-hidden="true"
                style={{ fontSize: 16 }}
              >
                refresh
              </span>
            </button>
          </div>
        </div>

        {/* ── Loading skeleton ── */}
        {fetchState === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[120, 100, 100, 100].map((h, i) => (
              <div
                key={i}
                className="glass-card"
                style={{ padding: 24, height: h, background: 'rgb(255 255 255 / 2%)', animation: 'none' }}
              />
            ))}
          </div>
        )}

        {/* ── Error state ── */}
        {fetchState === 'error' && (
          <div
            className="glass-card"
            style={{
              padding: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              borderColor: 'rgb(255 180 171 / 25%)',
            }}
          >
            <span className="material-symbol" aria-hidden="true" style={{ fontSize: 24, color: 'var(--color-error)', flexShrink: 0 }}>
              error
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--color-error)', marginBottom: 4 }}>
                Failed to load rates
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-on-surface-variant)' }}>
                {fetchError}
              </div>
            </div>
            <button
              type="button"
              onClick={fetchRates}
              style={{
                background: 'none',
                border: '1px solid var(--color-outline-variant)',
                borderRadius: 6,
                padding: '7px 14px',
                cursor: 'pointer',
                ...mono10,
                color: 'var(--color-on-surface-variant)',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Rate categories ── */}
        {fetchState === 'ok' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {CATEGORIES.map(cat => (
              <div key={cat.id} className="glass-card" style={{ padding: 24 }}>
                <div style={{ marginBottom: 20 }}>
                  <div style={eyebrowStyle}>{cat.eyebrow}</div>
                  <h2 style={sectionTitleStyle}>{cat.title}</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {cat.items.map(item => {
                    const live = liveValues[item.key] ?? '';
                    const edited = editedValues[item.key] ?? '';
                    const isDirty = edited !== live;

                    return (
                      <div
                        key={item.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '10px 14px',
                          background: isDirty ? 'rgb(0 219 233 / 4%)' : 'rgb(255 255 255 / 2%)',
                          border: `1px solid ${isDirty ? 'rgb(0 219 233 / 22%)' : 'var(--color-outline-variant)'}`,
                          borderRadius: 8,
                          transition: 'background 0.15s, border-color 0.15s',
                        }}
                      >
                        <div
                          style={{
                            flex: '0 0 200px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: 13,
                            color: 'var(--color-on-surface)',
                          }}
                        >
                          {item.label}
                        </div>

                        <div
                          style={{
                            flex: 1,
                            height: 1,
                            borderBottom: '1px dotted var(--color-outline-variant)',
                            opacity: 0.35,
                            minWidth: 16,
                          }}
                        />

                        {isDirty && (
                          <span
                            style={{
                              ...mono10,
                              color: 'var(--color-on-surface-variant)',
                              textDecoration: 'line-through',
                              opacity: 0.6,
                              flexShrink: 0,
                            }}
                          >
                            {live || '—'}
                          </span>
                        )}

                        <input
                          className="sb-rate-input"
                          type="text"
                          value={edited}
                          onChange={e =>
                            setEditedValues(prev => ({ ...prev, [item.key]: e.target.value }))
                          }
                          aria-label={`${item.label} value`}
                          style={{
                            width: 120,
                            background: 'rgb(255 255 255 / 4%)',
                            border: `1px solid ${isDirty ? 'var(--color-primary)' : 'var(--color-outline-variant)'}`,
                            borderRadius: 6,
                            padding: '7px 10px',
                            color: isDirty ? 'var(--color-primary)' : 'var(--color-on-surface)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: 13,
                            fontWeight: isDirty ? 700 : 400,
                            textAlign: 'right',
                            flexShrink: 0,
                            boxSizing: 'border-box',
                            transition: 'border-color 0.15s, color 0.15s',
                          }}
                        />

                        <span
                          title="Currently live on securbank.run.place"
                          style={{
                            ...mono10,
                            color: 'var(--color-on-surface-variant)',
                            background: 'rgb(255 255 255 / 3%)',
                            border: '1px solid var(--color-outline-variant)',
                            borderRadius: 4,
                            padding: '3px 8px',
                            flexShrink: 0,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          LIVE: {live || '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Sticky action bar ── */}
        <div
          aria-hidden={pendingCount === 0}
          style={{
            position: 'sticky',
            bottom: 0,
            zIndex: 10,
            marginTop: 4,
            padding: '16px 0 4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            background: 'linear-gradient(to bottom, rgb(10 12 16 / 0%) 0%, rgb(10 12 16 / 92%) 28%)',
            opacity: pendingCount > 0 ? 1 : 0,
            pointerEvents: pendingCount > 0 ? 'auto' : 'none',
            transition: 'opacity 0.2s',
          }}
        >
          <span
            style={{
              ...mono10,
              background: 'rgb(235 255 169 / 12%)',
              color: 'var(--color-tertiary)',
              padding: '4px 10px',
              borderRadius: 4,
            }}
          >
            {pendingCount} change{pendingCount !== 1 ? 's' : ''} pending
          </span>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={handleDiscard}
              style={{
                background: 'none',
                border: '1px solid var(--color-outline-variant)',
                borderRadius: 6,
                padding: '10px 20px',
                cursor: 'pointer',
                ...mono10,
                fontSize: 11,
                color: 'var(--color-on-surface-variant)',
              }}
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handlePublish}
              style={{
                background: 'var(--color-primary)',
                border: 'none',
                borderRadius: 6,
                padding: '10px 22px',
                cursor: 'pointer',
                ...mono10,
                fontSize: 11,
                fontWeight: 700,
                color: '#00363a',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 0 20px rgb(0 219 233 / 25%)',
              }}
            >
              <span className="material-symbol" aria-hidden="true" style={{ fontSize: 16, color: '#00363a' }}>
                save
              </span>
              Save to Source
            </button>
          </div>
        </div>
      </div>

      {/* ── Publishing overlay ── */}
      {showPublish && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgb(0 0 0 / 65%)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={publishDone ? handleClosePublish : undefined}
        >
          <div
            className="glass-card"
            style={{ width: 480, maxWidth: 'calc(100vw - 48px)', padding: 32, display: 'flex', flexDirection: 'column', gap: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ marginBottom: 24 }}>
              <div style={eyebrowStyle}>Saving</div>
              <h2 style={{ ...sectionTitleStyle, fontSize: 22, marginTop: 6 }}>
                Updating DA source
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {steps.map(step => (
                <div key={step.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <StepIcon status={step.status} />
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 14,
                        color:
                          step.status === 'ok'
                            ? 'var(--color-on-surface)'
                            : step.status === 'error'
                            ? 'var(--color-error)'
                            : step.status === 'running'
                            ? 'var(--color-primary)'
                            : 'var(--color-on-surface-variant)',
                      }}
                    >
                      {step.label}
                    </div>
                    {step.error && (
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 11,
                          color: 'var(--color-error)',
                          marginTop: 3,
                          opacity: 0.85,
                        }}
                      >
                        {step.error}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {publishDone && publishSuccess && (
              <div
                style={{
                  marginTop: 24,
                  padding: '14px 16px',
                  background: 'rgb(0 255 128 / 8%)',
                  border: '1px solid rgb(0 255 128 / 20%)',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <span className="material-symbol" aria-hidden="true" style={{ fontSize: 20, color: 'var(--color-status-completed)', flexShrink: 0 }}>
                  check_circle
                </span>
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--color-status-completed)', marginBottom: 2 }}>
                    Rates saved to DA source
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-on-surface-variant)', letterSpacing: '0.04em' }}>
                    The sync workflow will preview and publish to securbank.run.place
                  </div>
                </div>
              </div>
            )}

            {publishDone && !publishSuccess && steps.some(s => s.status === 'error') && (
              <div
                style={{
                  marginTop: 24,
                  padding: '12px 16px',
                  background: 'rgb(255 180 171 / 8%)',
                  border: '1px solid rgb(255 180 171 / 20%)',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <span className="material-symbol" aria-hidden="true" style={{ fontSize: 20, color: 'var(--color-error)', flexShrink: 0 }}>
                  error
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-error)' }}>
                  {steps.find(s => s.status === 'error')?.error ?? 'Publish failed — check console for details'}
                </span>
              </div>
            )}

            {publishDone && (
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleClosePublish}
                  style={{
                    background: publishSuccess ? 'var(--color-primary)' : 'none',
                    border: publishSuccess ? 'none' : '1px solid var(--color-outline-variant)',
                    borderRadius: 6,
                    padding: '10px 24px',
                    cursor: 'pointer',
                    ...mono10,
                    fontSize: 11,
                    fontWeight: publishSuccess ? 700 : 400,
                    color: publishSuccess ? '#00363a' : 'var(--color-on-surface-variant)',
                  }}
                >
                  {publishSuccess ? 'Done' : 'Close'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
