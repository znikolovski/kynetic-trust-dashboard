'use client';

import { useEffect, useRef, useState } from 'react';
import { register, RegistrationError } from '../lib/session';

export type RegistrationFlowProps = {
  /** Called when the user completes the final step ("Enter Dashboard"). */
  onComplete?: () => void;
  /** Called when the user wants to go back to the landing page. */
  onCancel?: () => void;
};

type AccountType = 'personal' | 'credit-card' | 'mortgage';

type Step2Data = {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  dob: string;
  ssn: string;
  consent: boolean;
};

type Step3Data = {
  password: string;
  confirmPassword: string;
  twoFactorMethod: 'app' | 'sms';
};

const COLORS = {
  obsidian: '#0a0c10',
  surface: '#111318',
  surfaceContainer: '#1e2024',
  surfaceContainerHigh: '#282a2e',
  onSurface: '#e2e2e8',
  onSurfaceVariant: '#b9cacb',
  primary: '#00dbe9',
  primaryContainer: '#00f0ff',
  secondary: '#dfb7ff',
  secondaryContainer: '#9d05ff',
  tertiary: '#ebffa9',
  tertiaryContainer: '#beea00',
  outline: '#849495',
  outlineVariant: '#3b494b',
  error: '#ffb4ab',
  mono: "'JetBrains Mono', ui-monospace, monospace",
  heading: "'Hanken Grotesk', system-ui, sans-serif",
  body: "Geist, system-ui, sans-serif",
};

type MotionFn = (value: string) => string | undefined;

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgb(255 255 255 / 5%)',
  border: `1px solid ${COLORS.outlineVariant}`,
  borderRadius: '0.125rem',
  padding: '14px 16px',
  color: COLORS.onSurface,
  fontFamily: COLORS.body,
  fontSize: 16,
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: COLORS.mono,
  fontSize: 11,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: COLORS.primaryContainer,
  marginBottom: 8,
};

function checkPasswordRules(pw: string) {
  return {
    length: pw.length >= 12,
    uppercase: /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    symbol: /[^A-Za-z0-9]/.test(pw),
  };
}

function RuleCheck({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <span style={{ color: ok ? COLORS.tertiaryContainer : COLORS.outline, fontFamily: COLORS.mono, fontSize: 12 }}>
        {ok ? '✓' : '○'}
      </span>
      <span style={{ fontFamily: COLORS.body, fontSize: 13, color: ok ? COLORS.onSurface : COLORS.onSurfaceVariant }}>
        {label}
      </span>
    </div>
  );
}

function StepDot({ step, current, motion }: { step: number; current: number; motion: MotionFn }) {
  const done = step < current;
  const active = step === current;
  return (
    <div
      aria-current={active ? 'step' : undefined}
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: active || done ? COLORS.primaryContainer : COLORS.surfaceContainer,
        border: active || done ? 'none' : `1px solid ${COLORS.outlineVariant}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: COLORS.mono,
        fontWeight: 700,
        fontSize: 13,
        color: active || done ? '#00363a' : COLORS.onSurfaceVariant,
        boxShadow: active ? '0 0 15px rgb(0 240 255 / 50%)' : 'none',
        zIndex: 1,
        transition: motion('background-color 0.3s, border-color 0.3s, box-shadow 0.3s'),
        flexShrink: 0,
      }}
    >
      {done ? '✓' : step}
    </div>
  );
}

const TOTAL_STEPS = 5;
const STEP_NAMES = ['Choose Your Path', 'Security Setup', 'Account Details', 'Review & Confirm', 'Complete'];

export default function RegistrationFlow({ onComplete, onCancel }: RegistrationFlowProps) {
  const [reducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const motion: MotionFn = (value) => (reducedMotion ? undefined : value);

  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [step2, setStep2] = useState<Step2Data>({
    firstName: '', lastName: '', email: '', mobile: '', dob: '', ssn: '', consent: false,
  });
  const [step3, setStep3] = useState<Step3Data>({ password: '', confirmPassword: '', twoFactorMethod: 'app' });
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Inject global widget styles once; avoids duplicate <style> on re-render.
  useEffect(() => {
    if (document.getElementById('sb-reg-styles')) return;
    const style = document.createElement('style');
    style.id = 'sb-reg-styles';
    style.textContent = `
      .sb-reg-input:focus { border-color: #00dbe9 !important; box-shadow: 0 0 0 1px #00dbe9; }
      .sb-reg-input::placeholder { color: #849495; }
      .sb-reg-card:hover { border-color: rgb(0 240 255 / 40%) !important; transform: translateY(-4px); }
      .sb-reg-card.selected { border-color: #00f0ff !important; box-shadow: 0 0 20px rgb(0 240 255 / 20%); }
      .sb-2fa-btn.selected { border-color: #00f0ff !important; background: rgb(0 240 255 / 8%) !important; }
      @media (prefers-reduced-motion: reduce) {
        .sb-reg-card:hover { transform: none; }
      }
    `;
    document.head.append(style);
  }, []);

  // Move focus to heading on step change for accessibility.
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!step2.firstName.trim()) e.firstName = 'First name is required';
    if (!step2.lastName.trim()) e.lastName = 'Last name is required';
    if (!step2.email.trim() || !step2.email.includes('@')) e.email = 'Valid email is required';
    if (!step2.mobile.trim()) e.mobile = 'Mobile number is required';
    if (!step2.dob) e.dob = 'Date of birth is required';
    if (!step2.ssn.trim()) e.ssn = 'SSN/TIN is required';
    if (!step2.consent) e.consent = 'You must agree to continue';
    return e;
  };

  const validateStep3 = () => {
    const e: Record<string, string> = {};
    const rules = checkPasswordRules(step3.password);
    if (!rules.length || !rules.uppercase || !rules.number || !rules.symbol) {
      e.password = 'Password does not meet requirements';
    }
    if (step3.password !== step3.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleContinue = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (step === 2) {
      const errs = validateStep3();
      if (Object.keys(errs).length) { setErrors(errs); return; }
    }
    if (step === 3) {
      const errs = validateStep2();
      if (Object.keys(errs).length) { setErrors(errs); return; }
    }
    if (step === 4) {
      setSubmitting(true);
      setRegistrationError(null);
      try {
        await register({
          identifier: step2.email,
          password: step3.password,
          firstName: step2.firstName,
          lastName: step2.lastName,
        });
      } catch (err) {
        setRegistrationError(
          err instanceof RegistrationError ? err.message : 'Registration failed — please try again.',
        );
        setSubmitting(false);
        return;
      }
      setSubmitting(false);
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const pwRules = checkPasswordRules(step3.password);
  const pwComplete = pwRules.length && pwRules.uppercase && pwRules.number && pwRules.symbol;
  const completePct = Math.round(((step - 1) / (TOTAL_STEPS - 1)) * 100);

  const accountTypeCards: Array<{ type: AccountType; icon: string; label: string; description: string; accentColor: string }> = [
    {
      type: 'personal',
      icon: '⬡',
      label: 'Personal Account',
      description: 'High-yield savings and zero-fee checking with real-time AI insights.',
      accentColor: COLORS.primaryContainer,
    },
    {
      type: 'credit-card',
      icon: '◈',
      label: 'Credit Card',
      description: 'Premium rewards and industry-leading security for the way you live.',
      accentColor: COLORS.secondary,
    },
    {
      type: 'mortgage',
      icon: '⬒',
      label: 'Mortgage App',
      description: 'Fast-track home ownership with competitive rates and instant pre-approval.',
      accentColor: COLORS.tertiaryContainer,
    },
  ];

  return (
    <div style={{ fontFamily: COLORS.body, color: COLORS.onSurface, maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>

      {/* Step progress indicator */}
      <div style={{ marginBottom: 48, maxWidth: 320, margin: '0 auto 48px' }}>
        <div
          role="progressbar"
          aria-valuenow={completePct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`Step ${step} of ${TOTAL_STEPS}`}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}
        >
          {/* Background line */}
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgb(255 255 255 / 10%)', transform: 'translateY(-50%)' }} />
          {/* Progress line — scaleX avoids layout thrash */}
          <div style={{
            position: 'absolute', top: '50%', left: 0, height: 1,
            background: COLORS.primaryContainer,
            transformOrigin: 'left center',
            transform: `translateY(-50%) scaleX(${(step - 1) / (TOTAL_STEPS - 1)})`,
            transition: motion('transform 0.5s cubic-bezier(0.4,0,0.2,1)'),
            width: '100%',
          }} />
          {[1, 2, 3, 4, 5].map((s) => <StepDot key={s} step={s} current={step} motion={motion} />)}
        </div>
        <p style={{ textAlign: 'center', fontFamily: COLORS.mono, fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', color: COLORS.onSurfaceVariant, marginTop: 16 }}>
          Step {String(step).padStart(2, '0')} of {String(TOTAL_STEPS).padStart(2, '0')} — {STEP_NAMES[step - 1]}
        </p>
      </div>

      {/* ── Step 1: Account Type Picker ── */}
      {step === 1 && (
        <section aria-label="Choose account type">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h1
              ref={headingRef}
              tabIndex={-1}
              style={{ margin: '0 0 16px', fontFamily: COLORS.heading, fontWeight: 900, fontSize: 'clamp(36px, 5vw, 64px)', letterSpacing: '-0.04em', color: COLORS.onSurface, outline: 'none' }}
            >
              Choose your path to{' '}
              <span style={{ color: COLORS.primaryContainer }}>financial freedom</span>.
            </h1>
            <p style={{ color: COLORS.onSurfaceVariant, fontSize: 18, maxWidth: 520, margin: '0 auto' }}>
              Select the foundation of your future wealth. Every journey begins with a single, secure choice.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, marginBottom: 32 }}>
            {accountTypeCards.map(({ type, icon, label, description, accentColor }) => (
              <button
                key={type}
                className={`sb-reg-card${accountType === type ? ' selected' : ''}`}
                onClick={() => { setAccountType(type); handleContinue(); }}
                style={{
                  background: 'rgb(255 255 255 / 3%)',
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${accountType === type ? COLORS.primaryContainer : 'rgb(255 255 255 / 10%)'}`,
                  borderRadius: '0.5rem',
                  padding: 32,
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: COLORS.onSurface,
                  transition: motion('border-color 0.3s, box-shadow 0.3s'),
                }}
              >
                <div style={{ fontSize: 40, color: accentColor, marginBottom: 24, lineHeight: 1 }}>{icon}</div>
                <h3 style={{ margin: '0 0 8px', fontFamily: COLORS.heading, fontWeight: 700, fontSize: 20, color: COLORS.primary }}>{label}</h3>
                <p style={{ margin: '0 0 20px', fontFamily: COLORS.body, fontSize: 14, color: COLORS.onSurfaceVariant }}>{description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: COLORS.body, fontWeight: 700, color: accentColor, fontSize: 14 }}>
                  <span>{type === 'personal' ? 'Select Account' : type === 'credit-card' ? 'View Options' : 'Start Application'}</span>
                  <span>→</span>
                </div>
              </button>
            ))}
          </div>

          {onCancel && (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <button type="button" onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.onSurfaceVariant, fontFamily: COLORS.body, fontSize: 14 }}>
                ← Back
              </button>
            </div>
          )}

          <div style={{ paddingTop: 24, borderTop: `1px solid ${COLORS.outlineVariant}`, textAlign: 'center' }}>
            <p style={{ fontFamily: COLORS.mono, fontSize: 11, letterSpacing: '0.05em', color: COLORS.onSurfaceVariant, margin: 0 }}>
              FDIC INSURED · NMLS #123456 · EQUAL HOUSING LENDER · LICENSED IN 50 STATES
            </p>
          </div>
        </section>
      )}

      {/* ── Step 3: Account Details ── */}
      {step === 3 && (
        <section aria-label="Account details" style={{ maxWidth: 520, margin: '0 auto' }}>
          <div
            style={{
              background: 'rgb(255 255 255 / 3%)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgb(255 255 255 / 10%)',
              borderRadius: '0.5rem',
              padding: 40,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${COLORS.primaryContainer}, ${COLORS.primary})` }} />
            <h2 ref={headingRef} tabIndex={-1} style={{ margin: '0 0 8px', fontFamily: COLORS.heading, fontWeight: 800, fontSize: 32, color: COLORS.primary, letterSpacing: '-0.02em', outline: 'none' }}>
              Account Details
            </h2>
            <p style={{ margin: '0 0 32px', color: COLORS.onSurfaceVariant }}>Your personal details are protected with bank-grade encryption.</p>

            <form onSubmit={handleContinue}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle} htmlFor="sb-reg-firstname">First Name</label>
                  <input id="sb-reg-firstname" className="sb-reg-input" style={{ ...inputStyle, borderColor: errors.firstName ? COLORS.error : COLORS.outlineVariant }} type="text" value={step2.firstName} onChange={(e) => setStep2((d) => ({ ...d, firstName: e.target.value }))} placeholder="Jane" autoComplete="given-name" />
                  {errors.firstName && <p role="alert" style={{ color: COLORS.error, fontSize: 12, margin: '4px 0 0', fontFamily: COLORS.mono }}>{errors.firstName}</p>}
                </div>
                <div>
                  <label style={labelStyle} htmlFor="sb-reg-lastname">Last Name</label>
                  <input id="sb-reg-lastname" className="sb-reg-input" style={{ ...inputStyle, borderColor: errors.lastName ? COLORS.error : COLORS.outlineVariant }} type="text" value={step2.lastName} onChange={(e) => setStep2((d) => ({ ...d, lastName: e.target.value }))} placeholder="Doe" autoComplete="family-name" />
                  {errors.lastName && <p role="alert" style={{ color: COLORS.error, fontSize: 12, margin: '4px 0 0', fontFamily: COLORS.mono }}>{errors.lastName}</p>}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle} htmlFor="sb-reg-email">Email Address</label>
                <input id="sb-reg-email" className="sb-reg-input" style={{ ...inputStyle, borderColor: errors.email ? COLORS.error : COLORS.outlineVariant }} type="email" value={step2.email} onChange={(e) => setStep2((d) => ({ ...d, email: e.target.value }))} placeholder="name@domain.com" autoComplete="email" />
                {errors.email && <p role="alert" style={{ color: COLORS.error, fontSize: 12, margin: '4px 0 0', fontFamily: COLORS.mono }}>{errors.email}</p>}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle} htmlFor="sb-reg-mobile">Mobile Number</label>
                <input id="sb-reg-mobile" className="sb-reg-input" style={{ ...inputStyle, borderColor: errors.mobile ? COLORS.error : COLORS.outlineVariant }} type="tel" value={step2.mobile} onChange={(e) => setStep2((d) => ({ ...d, mobile: e.target.value }))} placeholder="+1 (555) 000-0000" autoComplete="tel" />
                {errors.mobile && <p role="alert" style={{ color: COLORS.error, fontSize: 12, margin: '4px 0 0', fontFamily: COLORS.mono }}>{errors.mobile}</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle} htmlFor="sb-reg-dob">Date of Birth</label>
                  <input id="sb-reg-dob" className="sb-reg-input" style={{ ...inputStyle, borderColor: errors.dob ? COLORS.error : COLORS.outlineVariant, colorScheme: 'dark' }} type="date" value={step2.dob} onChange={(e) => setStep2((d) => ({ ...d, dob: e.target.value }))} autoComplete="bday" />
                  {errors.dob && <p role="alert" style={{ color: COLORS.error, fontSize: 12, margin: '4px 0 0', fontFamily: COLORS.mono }}>{errors.dob}</p>}
                </div>
                <div>
                  <label style={labelStyle} htmlFor="sb-reg-ssn">SSN / TIN</label>
                  <input id="sb-reg-ssn" className="sb-reg-input" style={{ ...inputStyle, borderColor: errors.ssn ? COLORS.error : COLORS.outlineVariant }} type="password" value={step2.ssn} onChange={(e) => setStep2((d) => ({ ...d, ssn: e.target.value }))} placeholder="••• – •• – ••••" autoComplete="off" />
                  {errors.ssn && <p role="alert" style={{ color: COLORS.error, fontSize: 12, margin: '4px 0 0', fontFamily: COLORS.mono }}>{errors.ssn}</p>}
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 28, cursor: 'pointer' }}>
                <input type="checkbox" checked={step2.consent} onChange={(e) => setStep2((d) => ({ ...d, consent: e.target.checked }))} style={{ accentColor: COLORS.primaryContainer, marginTop: 2, width: 16, height: 16, flexShrink: 0 }} />
                <span style={{ fontFamily: COLORS.body, fontSize: 14, color: COLORS.onSurfaceVariant }}>
                  I agree to the <a href="/terms" style={{ color: COLORS.primaryContainer }}>Kinetic Trust Protocols</a> and Privacy Policy.
                </span>
              </label>
              {errors.consent && <p role="alert" style={{ color: COLORS.error, fontSize: 12, margin: '-20px 0 20px', fontFamily: COLORS.mono }}>{errors.consent}</p>}

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setStep(1)} style={{ flex: '0 0 auto', background: 'rgb(255 255 255 / 5%)', border: `1px solid ${COLORS.outlineVariant}`, borderRadius: '0.125rem', padding: '14px 20px', color: COLORS.onSurface, fontFamily: COLORS.body, fontWeight: 600, cursor: 'pointer' }}>
                  ← Back
                </button>
                <button type="submit" style={{ flex: 1, background: COLORS.primaryContainer, color: '#00363a', border: 'none', borderRadius: '0.125rem', padding: '14px 24px', fontFamily: COLORS.body, fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 0 24px rgb(0 240 255 / 20%)' }}>
                  Continue →
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* ── Step 2: Security Setup ── */}
      {step === 2 && (
        <section aria-label="Security setup" style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ background: 'rgb(255 255 255 / 3%)', backdropFilter: 'blur(12px)', border: '1px solid rgb(255 255 255 / 10%)', borderRadius: '0.5rem', padding: 40, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${COLORS.primaryContainer}, ${COLORS.secondary})` }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h2 ref={headingRef} tabIndex={-1} style={{ margin: 0, fontFamily: COLORS.heading, fontWeight: 800, fontSize: 32, color: COLORS.primary, letterSpacing: '-0.02em', outline: 'none' }}>
                Secure Your Access
              </h2>
              <span style={{ fontFamily: COLORS.mono, fontSize: 11, color: COLORS.tertiary, letterSpacing: '0.05em' }}>{completePct}% COMPLETE</span>
            </div>
            <p style={{ margin: '0 0 28px', color: COLORS.onSurfaceVariant }}>Create a master password and configure two-factor authentication.</p>

            <form onSubmit={handleContinue}>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle} htmlFor="sb-reg-pw">Master Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="sb-reg-pw"
                    className="sb-reg-input"
                    type={showPw ? 'text' : 'password'}
                    value={step3.password}
                    onChange={(e) => setStep3((d) => ({ ...d, password: e.target.value }))}
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    style={{ ...inputStyle, paddingRight: 48, borderColor: errors.password ? COLORS.error : COLORS.outlineVariant }}
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.outline }}>
                    <span className="material-symbol" aria-hidden="true">{showPw ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {errors.password && <p role="alert" style={{ color: COLORS.error, fontSize: 12, margin: '4px 0 0', fontFamily: COLORS.mono }}>{errors.password}</p>}

                {/* Live rule checklist */}
                <div style={{ marginTop: 16, padding: 16, background: 'rgb(255 255 255 / 3%)', border: `1px solid ${COLORS.outlineVariant}`, borderRadius: '0.125rem' }}>
                  <RuleCheck ok={pwRules.length} label="At least 12 characters" />
                  <RuleCheck ok={pwRules.uppercase} label="One uppercase letter" />
                  <RuleCheck ok={pwRules.number} label="One number" />
                  <RuleCheck ok={pwRules.symbol} label="One symbol" />
                </div>
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={labelStyle} htmlFor="sb-reg-confirmpw">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="sb-reg-confirmpw"
                    className="sb-reg-input"
                    type={showConfirmPw ? 'text' : 'password'}
                    value={step3.confirmPassword}
                    onChange={(e) => setStep3((d) => ({ ...d, confirmPassword: e.target.value }))}
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    style={{ ...inputStyle, paddingRight: 48, borderColor: errors.confirmPassword ? COLORS.error : COLORS.outlineVariant }}
                  />
                  <button type="button" onClick={() => setShowConfirmPw((v) => !v)} aria-label={showConfirmPw ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.outline }}>
                    <span className="material-symbol" aria-hidden="true">{showConfirmPw ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {errors.confirmPassword && <p role="alert" style={{ color: COLORS.error, fontSize: 12, margin: '4px 0 0', fontFamily: COLORS.mono }}>{errors.confirmPassword}</p>}
              </div>

              {/* 2FA Choice */}
              <div role="group" aria-labelledby="sb-reg-2fa-label" style={{ marginBottom: 28 }}>
                <p id="sb-reg-2fa-label" style={{ ...labelStyle, marginBottom: 12 }}>Two-Factor Authentication</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {(['app', 'sms'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      className={`sb-2fa-btn${step3.twoFactorMethod === method ? ' selected' : ''}`}
                      onClick={() => setStep3((d) => ({ ...d, twoFactorMethod: method }))}
                      aria-pressed={step3.twoFactorMethod === method}
                      style={{
                        background: step3.twoFactorMethod === method ? 'rgb(0 240 255 / 8%)' : 'rgb(255 255 255 / 3%)',
                        border: `1px solid ${step3.twoFactorMethod === method ? COLORS.primaryContainer : COLORS.outlineVariant}`,
                        borderRadius: '0.125rem',
                        padding: '16px 20px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: motion('border-color 0.2s, background-color 0.2s'),
                      }}
                    >
                      <div style={{ fontFamily: COLORS.mono, fontSize: 18, color: COLORS.primaryContainer, marginBottom: 6 }}>
                        {method === 'app' ? '📱' : '💬'}
                      </div>
                      <div style={{ fontFamily: COLORS.body, fontWeight: 600, color: COLORS.onSurface, fontSize: 14 }}>
                        {method === 'app' ? 'Authenticator App' : 'SMS Text'}
                      </div>
                      <div style={{ fontFamily: COLORS.body, fontSize: 12, color: COLORS.onSurfaceVariant, marginTop: 4 }}>
                        {method === 'app' ? 'Most secure' : 'Quick setup'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setStep(2)} style={{ flex: '0 0 auto', background: 'rgb(255 255 255 / 5%)', border: `1px solid ${COLORS.outlineVariant}`, borderRadius: '0.125rem', padding: '14px 20px', color: COLORS.onSurface, fontFamily: COLORS.body, fontWeight: 600, cursor: 'pointer' }}>
                  ← Back
                </button>
                <button type="submit" disabled={!pwComplete} style={{ flex: 1, background: pwComplete ? COLORS.primaryContainer : 'rgb(255 255 255 / 10%)', color: pwComplete ? '#00363a' : COLORS.onSurfaceVariant, border: 'none', borderRadius: '0.125rem', padding: '14px 24px', fontFamily: COLORS.body, fontWeight: 700, fontSize: 16, cursor: pwComplete ? 'pointer' : 'not-allowed', transition: motion('background-color 0.2s, color 0.2s') }}>
                  Continue →
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* ── Step 4: Review & Confirm ── */}
      {step === 4 && (
        <section aria-label="Review and confirm" style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ background: 'rgb(255 255 255 / 3%)', backdropFilter: 'blur(12px)', border: '1px solid rgb(255 255 255 / 10%)', borderRadius: '0.5rem', padding: 40, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${COLORS.primaryContainer}, ${COLORS.secondary})` }} />
            <h2 ref={headingRef} tabIndex={-1} style={{ margin: '0 0 8px', fontFamily: COLORS.heading, fontWeight: 800, fontSize: 32, color: COLORS.primary, letterSpacing: '-0.02em', outline: 'none' }}>
              Review & Confirm
            </h2>
            <p style={{ margin: '0 0 32px', color: COLORS.onSurfaceVariant }}>Verify your details before creating your account.</p>

            <form onSubmit={handleContinue}>
              {/* Account type badge */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: COLORS.mono, fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', color: COLORS.onSurfaceVariant, marginBottom: 8 }}>Account Type</div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '8px 16px',
                  borderRadius: '0.125rem',
                  border: `1px solid ${accountType === 'personal' ? COLORS.primaryContainer : accountType === 'credit-card' ? COLORS.secondary : COLORS.tertiaryContainer}`,
                  color: accountType === 'personal' ? COLORS.primaryContainer : accountType === 'credit-card' ? COLORS.secondary : COLORS.tertiaryContainer,
                  fontFamily: COLORS.mono,
                  fontSize: 13,
                  fontWeight: 700,
                }}>
                  {accountType === 'personal' ? 'Personal Account' : accountType === 'credit-card' ? 'Credit Card' : 'Mortgage App'}
                </div>
              </div>

              {/* Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                {[
                  { label: 'Name', value: `${step2.firstName} ${step2.lastName}`.trim() || '—' },
                  { label: 'Email', value: step2.email || '—' },
                  { label: '2FA Method', value: step3.twoFactorMethod === 'app' ? 'Authenticator App' : 'SMS Text' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontFamily: COLORS.mono, fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', color: COLORS.onSurfaceVariant, marginBottom: 4 }}>{label}</div>
                    <div style={{ fontFamily: COLORS.body, fontSize: 14, color: COLORS.onSurface }}>{value}</div>
                  </div>
                ))}
              </div>

              <p style={{ color: COLORS.onSurfaceVariant, fontSize: 13, marginBottom: 28 }}>
                By creating your account you agree to the{' '}
                <a href="/terms" style={{ color: COLORS.primaryContainer }}>Kinetic Trust Protocols</a>{' '}
                and <a href="/privacy" style={{ color: COLORS.primaryContainer }}>Privacy Policy</a>.
              </p>

              {registrationError && (
                <div
                  role="alert"
                  style={{
                    background: 'rgb(255 180 171 / 10%)',
                    border: '1px solid rgb(255 180 171 / 30%)',
                    borderRadius: '0.125rem',
                    padding: '12px 16px',
                    marginBottom: 20,
                    color: COLORS.error,
                    fontFamily: COLORS.body,
                    fontSize: 14,
                  }}
                >
                  {registrationError}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setStep(3)} disabled={submitting} style={{ flex: '0 0 auto', background: 'rgb(255 255 255 / 5%)', border: `1px solid ${COLORS.outlineVariant}`, borderRadius: '0.125rem', padding: '14px 20px', color: COLORS.onSurface, fontFamily: COLORS.body, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}>
                  ← Back
                </button>
                <button type="submit" disabled={submitting} style={{ flex: 1, background: submitting ? 'rgb(255 255 255 / 10%)' : COLORS.primaryContainer, color: submitting ? COLORS.onSurfaceVariant : '#00363a', border: 'none', borderRadius: '0.125rem', padding: '14px 24px', fontFamily: COLORS.body, fontWeight: 700, fontSize: 16, cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: submitting ? 'none' : '0 0 24px rgb(0 240 255 / 20%)', transition: motion('background-color 0.2s, color 0.2s') }}>
                  {submitting ? 'Creating account…' : 'Create Account →'}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* ── Step 5: Success ── */}
      {step === 5 && (
        <section aria-label="Registration complete" style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto', paddingTop: 20 }}>
          <div style={{ marginBottom: 48, position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 300, height: 300, background: 'rgb(0 240 255 / 15%)', filter: 'blur(80px)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ fontFamily: COLORS.heading, fontWeight: 900, fontSize: 20, letterSpacing: '-0.04em', color: COLORS.primaryContainer, marginBottom: 16 }}>
              SecurBank
            </div>
          </div>

          <h1
            ref={headingRef}
            tabIndex={-1}
            style={{ margin: '0 0 20px', fontFamily: COLORS.heading, fontWeight: 900, fontSize: 'clamp(40px, 6vw, 72px)', letterSpacing: '-0.04em', color: COLORS.primary, outline: 'none' }}
          >
            Welcome to the <span style={{ color: COLORS.primaryContainer }}>Future</span>.
          </h1>
          <p style={{ margin: '0 0 48px', color: COLORS.onSurfaceVariant, fontSize: 18, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            Your account is active. You have successfully integrated into the SecurBank ecosystem.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', marginBottom: 60 }}>
            <button
              onClick={() => { onComplete?.(); window.location.href = '/accounts'; }}
              style={{ background: COLORS.primaryContainer, color: '#00363a', border: 'none', borderRadius: '0.125rem', padding: '20px 48px', fontFamily: COLORS.body, fontWeight: 900, fontSize: 16, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 10px 40px rgb(0 240 255 / 35%)' }}
            >
              Enter Dashboard
            </button>
            <button
              onClick={() => { window.location.href = '/'; }}
              style={{ background: 'rgb(255 255 255 / 5%)', color: COLORS.primary, border: `1px solid ${COLORS.outlineVariant}`, borderRadius: '0.125rem', padding: '20px 48px', fontFamily: COLORS.body, fontWeight: 700, fontSize: 16, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer' }}
            >
              Explore Features
            </button>
          </div>

          {/* Status cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, maxWidth: 560, margin: '0 auto' }}>
            {[
              { label: 'Status', value: 'Verified', accent: COLORS.tertiaryContainer },
              { label: 'Encryption', value: 'AES-256 Encryption', accent: COLORS.primaryContainer },
              { label: 'Network', value: 'Active Sync', accent: COLORS.primaryContainer },
            ].map(({ label, value, accent }) => (
              <div key={label} style={{ background: 'rgb(255 255 255 / 3%)', backdropFilter: 'blur(12px)', border: '1px solid rgb(255 255 255 / 10%)', borderRadius: '0.25rem', padding: 20, textAlign: 'left' }}>
                <div style={{ fontFamily: COLORS.mono, fontSize: 11, color: accent, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
                <div style={{ fontFamily: COLORS.body, fontWeight: 700, color: COLORS.onSurface }}>{value}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
