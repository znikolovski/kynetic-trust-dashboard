'use client';

import { useState } from 'react';

type ThemeOption = 'obsidian' | 'light' | 'contrast';
type DeliveryMethod = 'Email' | 'SMS' | 'Webhook';

const MEMBERS = [
  { name: 'Sarah Chen', email: 'sarah.c@securbank.io', role: 'ADMIN', roleColor: '#00ff80', roleBg: 'rgb(0 255 128 / 12%)', initials: 'SC' },
  { name: 'Marcus Thorne', email: 'm.thorne@securbank.io', role: 'TRADER', roleColor: 'var(--color-primary)', roleBg: 'rgb(0 219 233 / 12%)', initials: 'MT' },
  { name: 'Elena Rodriguez', email: 'e.rodriguez@securbank.io', role: 'AUDITOR', roleColor: 'var(--color-secondary)', roleBg: 'rgb(223 183 255 / 12%)', initials: 'ER' },
];

const THEME_OPTIONS: { id: ThemeOption; label: string; icon: string }[] = [
  { id: 'obsidian', label: 'Obsidian Dark', icon: '🌙' },
  { id: 'light', label: 'Kinetic Light', icon: '☀' },
  { id: 'contrast', label: 'High Contrast', icon: '⊟' },
];

const eyebrow: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--color-primary)',
};

const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontWeight: 900,
  fontSize: 20,
  color: 'var(--color-on-surface)',
  margin: '8px 0 0',
};

export default function SettingsPage() {
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>('obsidian');
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryMethod>('Email');
  const [volatilityThreshold, setVolatilityThreshold] = useState(2.5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Header ── */}
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
          Settings
        </h1>
        <p style={{ margin: '8px 0 0', color: 'var(--color-on-surface-variant)', fontSize: 14 }}>
          Manage your institutional configurations and security parameters.
        </p>
      </div>

      {/* ── Top 2-col grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>

        {/* Account Security */}
        <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={eyebrow}>Account Security</div>
              <h2 style={sectionTitle}>Encryption &amp; Authentication</h2>
            </div>
            <div
              style={{
                background: 'rgb(235 255 169 / 12%)',
                color: 'var(--color-tertiary)',
                padding: '4px 10px',
                borderRadius: 4,
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                flexShrink: 0,
              }}
            >
              HIGH SECURITY TIER
            </div>
          </div>

          {/* MFA toggle row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              padding: '16px 18px',
              background: 'rgb(255 255 255 / 3%)',
              border: '1px solid var(--color-outline-variant)',
              borderRadius: 8,
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--color-on-surface)', marginBottom: 4 }}>
                Multi-Factor Authentication (MFA)
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-on-surface-variant)' }}>
                Recommended: Hardware keys or Biometric TOTP.
              </div>
            </div>
            {/* Toggle switch */}
            <button
              type="button"
              role="switch"
              aria-checked={mfaEnabled}
              onClick={() => setMfaEnabled((v) => !v)}
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                background: mfaEnabled ? 'var(--color-primary)' : 'var(--color-outline-variant)',
                position: 'relative',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 3,
                  left: mfaEnabled ? 23 : 3,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 4px rgb(0 0 0 / 30%)',
                }}
              />
            </button>
          </div>

          {/* API Key + IP Whitelist */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-on-surface-variant)',
                  marginBottom: 6,
                }}
              >
                Production API Key
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  value="sk_prod_••••••••••••••••••••"
                  readOnly
                  style={{
                    width: '100%',
                    background: 'rgb(255 255 255 / 4%)',
                    border: '1px solid var(--color-outline-variant)',
                    borderRadius: 6,
                    padding: '10px 40px 10px 12px',
                    color: 'var(--color-on-surface)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  aria-label="Copy API key"
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-on-surface-variant)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <span className="material-symbol" aria-hidden="true" style={{ fontSize: 16 }}>content_copy</span>
                </button>
              </div>
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-on-surface-variant)',
                  marginBottom: 6,
                }}
              >
                IP Whitelist
              </label>
              <input
                type="text"
                placeholder="192.168.1.1, 10.0.0.5"
                style={{
                  width: '100%',
                  background: 'rgb(255 255 255 / 4%)',
                  border: '1px solid var(--color-outline-variant)',
                  borderRadius: 6,
                  padding: '10px 12px',
                  color: 'var(--color-on-surface)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </div>

        {/* Interface / Theme */}
        <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={eyebrow}>Interface</div>
            <h2 style={sectionTitle}>System Theme</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {THEME_OPTIONS.map((opt) => {
              const isSelected = selectedTheme === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedTheme(opt.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: isSelected
                      ? '1px solid rgb(0 219 233 / 40%)'
                      : '1px solid var(--color-outline-variant)',
                    background: isSelected ? 'rgb(0 219 233 / 8%)' : 'rgb(255 255 255 / 2%)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                >
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      border: isSelected
                        ? '5px solid var(--color-primary)'
                        : '2px solid var(--color-outline-variant)',
                      background: isSelected ? 'var(--color-primary)' : 'transparent',
                      flexShrink: 0,
                      transition: 'border 0.15s',
                    }}
                  />
                  <span style={{ fontSize: 14 }}>{opt.icon}</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 13,
                      color: isSelected ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)',
                    }}
                  >
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>

          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              fontStyle: 'italic',
              color: 'var(--color-on-surface-variant)',
              opacity: 0.7,
            }}
          >
            Preference synced across 4 devices.
          </p>
        </div>
      </div>

      {/* ── Bottom 2-col grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Team Access */}
        <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={eyebrow}>Team Access</div>
              <h2 style={sectionTitle}>Member Roles</h2>
            </div>
            <button
              type="button"
              style={{
                background: 'none',
                border: '1px solid var(--color-outline-variant)',
                borderRadius: 6,
                padding: '6px 12px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.08em',
                color: 'var(--color-on-surface-variant)',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span className="material-symbol" aria-hidden="true" style={{ fontSize: 14 }}>person_add</span>
              Invite Member
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {MEMBERS.map((m) => (
              <div
                key={m.email}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 0',
                  borderBottom: '1px solid rgb(255 255 255 / 4%)',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'var(--color-surface-container)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--color-on-surface)',
                    flexShrink: 0,
                  }}
                >
                  {m.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--color-on-surface)' }}>
                    {m.name}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: 'var(--color-on-surface-variant)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {m.email}
                  </div>
                </div>
                <span
                  style={{
                    background: m.roleBg,
                    color: m.roleColor,
                    padding: '3px 8px',
                    borderRadius: 4,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.08em',
                    flexShrink: 0,
                  }}
                >
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={eyebrow}>Alerts</div>
            <h2 style={sectionTitle}>Notification Thresholds</h2>
          </div>

          {/* Volatility slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-on-surface)' }}>
                Transaction Volatility Alert
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>
                &gt; {volatilityThreshold.toFixed(1)}%
              </span>
            </div>
            <style>{`
              .sb-settings-range { -webkit-appearance: none; appearance: none; width: 100%; height: 4px; border-radius: 2px; outline: none; cursor: pointer; }
              .sb-settings-range::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #00f0ff; cursor: pointer; box-shadow: 0 0 10px rgb(0 219 233 / 50%); }
              .sb-settings-range::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: #00f0ff; border: none; cursor: pointer; }
            `}</style>
            <input
              className="sb-settings-range"
              type="range"
              min={0.1}
              max={5.0}
              step={0.1}
              value={volatilityThreshold}
              onChange={(e) => setVolatilityThreshold(Number(e.target.value))}
              aria-label="Volatility alert threshold"
              style={{
                background: `linear-gradient(to right, #00f0ff ${((volatilityThreshold - 0.1) / 4.9) * 100}%, var(--color-surface-container-high) 0%)`,
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-on-surface-variant)' }}>0.1%</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-on-surface-variant)' }}>5.0%</span>
            </div>
          </div>

          {/* Smart Alerts toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--color-on-surface)', marginBottom: 2 }}>
                Smart Alerts
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-on-surface-variant)', letterSpacing: '0.04em' }}>
                AI-driven anomaly detection
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={alertsEnabled}
              onClick={() => setAlertsEnabled((v) => !v)}
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                background: alertsEnabled ? 'var(--color-primary)' : 'var(--color-outline-variant)',
                position: 'relative',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 3,
                  left: alertsEnabled ? 23 : 3,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 4px rgb(0 0 0 / 30%)',
                }}
              />
            </button>
          </div>

          {/* Delivery methods */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-on-surface-variant)',
                marginBottom: 10,
              }}
            >
              Delivery Methods
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['Email', 'SMS', 'Webhook'] as DeliveryMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setSelectedDelivery(method)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 4,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    letterSpacing: '0.06em',
                    transition: 'background 0.15s, color 0.15s',
                    background: selectedDelivery === method
                      ? 'var(--color-primary)'
                      : 'rgb(255 255 255 / 5%)',
                    color: selectedDelivery === method ? '#00363a' : 'var(--color-on-surface-variant)',
                    fontWeight: selectedDelivery === method ? 700 : 400,
                  }}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer actions ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12,
          paddingTop: 4,
        }}
      >
        <button
          type="button"
          style={{
            background: 'none',
            border: '1px solid var(--color-outline-variant)',
            borderRadius: 6,
            padding: '10px 20px',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            letterSpacing: '0.08em',
            color: 'var(--color-on-surface-variant)',
            textTransform: 'uppercase',
          }}
        >
          Reset to Default
        </button>
        <button
          type="button"
          style={{
            background: 'var(--color-primary)',
            border: 'none',
            borderRadius: 6,
            padding: '10px 24px',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: '#00363a',
            textTransform: 'uppercase',
            boxShadow: '0 0 20px rgb(0 219 233 / 20%)',
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
