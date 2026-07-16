'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { authenticate, AuthError } from '../lib/session';

export type LoginModalProps = {
  /** Called after a successful login. Default: dispatch sb-auth-change and close. */
  onSuccess?: (token: string) => void;
  /** Ref to the trigger element — focus returns here on close. */
  triggerRef?: React.RefObject<HTMLElement | null>;
};

const colors = {
  obsidian: '#0a0c10',
  surface: '#111318',
  surfaceContainer: '#1e2024',
  onSurface: '#e2e2e8',
  onSurfaceVariant: '#b9cacb',
  primary: '#00dbe9',
  primaryContainer: '#00f0ff',
  outline: '#849495',
  outlineVariant: '#3b494b',
  error: '#ffb4ab',
  mono: "'JetBrains Mono', ui-monospace, monospace",
  heading: "'Hanken Grotesk', system-ui, sans-serif",
  body: "Geist, system-ui, sans-serif",
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgb(255 255 255 / 5%)',
  border: `1px solid ${colors.outlineVariant}`,
  borderRadius: '0.125rem',
  padding: '14px 16px',
  color: colors.onSurface,
  fontFamily: colors.body,
  fontSize: 16,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

export default function LoginModal({ onSuccess, triggerRef }: LoginModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const firstFocusRef = useRef<HTMLElement | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = () => {
    dialogRef.current?.showModal();
    setTimeout(() => emailRef.current?.focus(), 50);
  };

  const close = useCallback(() => {
    dialogRef.current?.close();
    const trigger = (triggerRef?.current ?? firstFocusRef.current) as HTMLElement | null;
    trigger?.focus();
  }, [triggerRef]);

  useEffect(() => {
    const onOpen = () => {
      dialogRef.current?.showModal();
      setTimeout(() => emailRef.current?.focus(), 50);
    };
    window.addEventListener('sb-login-open', onOpen);
    return () => window.removeEventListener('sb-login-open', onOpen);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleBackdrop = (e: MouseEvent) => {
      const rect = dialog.getBoundingClientRect();
      if (
        e.clientX < rect.left || e.clientX > rect.right ||
        e.clientY < rect.top || e.clientY > rect.bottom
      ) {
        close();
      }
    };
    dialog.addEventListener('click', handleBackdrop);
    return () => dialog.removeEventListener('click', handleBackdrop);
  }, [close]);

  // Focus trap
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button, input, a[href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute('disabled'));
      if (!focusable.length) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    dialog.addEventListener('keydown', handleKeydown);
    return () => dialog.removeEventListener('keydown', handleKeydown);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const info = await authenticate(email, password);
      if (onSuccess) {
        onSuccess(info.token);
      } else {
        window.dispatchEvent(new CustomEvent('sb-auth-change', { detail: { authenticated: true, info } }));
        close();
      }
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError('Incorrect email or password.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-label="Sign in to SecurBank"
      style={{
        padding: 0,
        border: 'none',
        borderRadius: '0.5rem',
        background: 'transparent',
        maxWidth: 440,
        width: 'calc(100vw - 48px)',
        overflow: 'visible',
      }}
    >
      <style>{`
        dialog::backdrop {
          background: rgb(0 0 0 / 70%);
          backdrop-filter: blur(4px);
        }
        .sb-modal-input:focus {
          border-color: #00dbe9 !important;
          box-shadow: 0 0 0 1px #00dbe9;
        }
        .sb-modal-input::placeholder { color: #849495; }
        .sb-modal-pw-toggle { background: none; border: none; cursor: pointer; padding: 0 4px; }
        .sb-modal-submit:hover:not(:disabled) { filter: brightness(1.1); }
        .sb-modal-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .sb-modal-close:hover { color: #e2e2e8; }
        .sb-modal-link:hover { text-decoration: underline; }
      `}</style>

      <div
        style={{
          background: colors.surface,
          border: '1px solid rgb(255 255 255 / 10%)',
          borderRadius: '0.5rem',
          backdropFilter: 'blur(12px)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Cyan top accent line */}
        <div style={{ height: 2, background: `linear-gradient(90deg, ${colors.primaryContainer}, ${colors.primary})` }} />

        <div style={{ padding: '32px 36px 36px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
            <div>
              <div style={{ fontFamily: colors.mono, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.primaryContainer, marginBottom: 8 }}>
                SecurBank
              </div>
              <h2 style={{ margin: 0, fontFamily: colors.heading, fontWeight: 800, fontSize: 28, color: colors.onSurface, letterSpacing: '-0.02em' }}>
                Sign In
              </h2>
            </div>
            <button
              className="sb-modal-close"
              onClick={close}
              aria-label="Close sign in dialog"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.outline, fontSize: 24, lineHeight: 1, padding: 4, marginTop: -4 }}
            >
              ✕
            </button>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              aria-live="polite"
              style={{
                background: 'rgb(255 180 171 / 10%)',
                border: '1px solid rgb(255 180 171 / 30%)',
                borderRadius: '0.125rem',
                padding: '12px 16px',
                marginBottom: 20,
                color: colors.error,
                fontFamily: colors.body,
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label
                htmlFor="sb-login-email"
                style={{ display: 'block', fontFamily: colors.mono, fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', color: colors.primaryContainer, marginBottom: 8 }}
              >
                Email Address
              </label>
              <input
                ref={emailRef}
                id="sb-login-email"
                className="sb-modal-input"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                style={inputStyle}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <label
                htmlFor="sb-login-password"
                style={{ display: 'block', fontFamily: colors.mono, fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', color: colors.primaryContainer, marginBottom: 8 }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="sb-login-password"
                  className="sb-modal-input"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: 48 }}
                />
                <button
                  type="button"
                  className="sb-modal-pw-toggle"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: colors.outline }}
                >
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Remember me + forgot */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: colors.body, fontSize: 14, color: colors.onSurfaceVariant }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: colors.primaryContainer, width: 16, height: 16 }}
                />
                Remember me
              </label>
              <a
                href="/login/forgot"
                className="sb-modal-link"
                style={{ fontFamily: colors.body, fontSize: 14, color: colors.primaryContainer, textDecoration: 'none' }}
              >
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="sb-modal-submit"
              disabled={submitting}
              style={{
                width: '100%',
                background: colors.primaryContainer,
                color: '#00363a',
                border: 'none',
                borderRadius: '0.125rem',
                padding: '16px 24px',
                fontFamily: colors.body,
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                transition: 'filter 0.15s',
                boxShadow: '0 0 24px rgb(0 240 255 / 20%)',
              }}
            >
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Register link */}
          <p style={{ marginTop: 24, textAlign: 'center', fontFamily: colors.body, fontSize: 14, color: colors.onSurfaceVariant }}>
            No account?{' '}
            <a
              href="/register"
              className="sb-modal-link"
              style={{ color: colors.primaryContainer, textDecoration: 'none', fontWeight: 600 }}
            >
              Join SecurBank
            </a>
          </p>
        </div>
      </div>
    </dialog>
  );
}
