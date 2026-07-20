'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import LoginModal from '../components/LoginModal';

export default function SignInPage() {
  const router = useRouter();
  const signInBtnRef = useRef<HTMLButtonElement>(null);

  function openLogin() {
    window.dispatchEvent(new CustomEvent('sb-login-open'));
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-obsidian)',
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow orbs */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 600,
          height: 400,
          background: 'radial-gradient(ellipse, rgb(0 219 233 / 8%) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: 400,
          height: 400,
          background: 'radial-gradient(ellipse, rgb(223 183 255 / 5%) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Card container */}
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 440,
          padding: '48px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: 'linear-gradient(90deg, var(--color-primary-container), var(--color-primary))',
            borderRadius: '0.5rem 0.5rem 0 0',
          }}
        />

        {/* Logo + brand */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <Image src="/securbank-logo.jpg" alt="SecurBank" width={56} height={56} />
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--color-primary)',
                marginBottom: 6,
              }}
            >
              Institutional Banking
            </div>
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
              SecurBank
            </h1>
          </div>
        </div>

        <p
          style={{
            margin: 0,
            color: 'var(--color-on-surface-variant)',
            fontSize: 14,
            textAlign: 'center',
            lineHeight: 1.6,
            maxWidth: 300,
          }}
        >
          Access your institutional accounts, markets, and portfolio analytics.
        </p>

        {/* Sign In button */}
        <button
          ref={signInBtnRef}
          type="button"
          onClick={openLogin}
          style={{
            width: '100%',
            background: 'var(--color-primary)',
            color: '#00363a',
            border: 'none',
            borderRadius: 6,
            padding: '16px 24px',
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: '0 0 32px rgb(0 219 233 / 25%)',
            transition: 'filter 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.1)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.filter = '';
          }}
        >
          Sign In
        </button>

        {/* Divider */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: 'var(--color-on-surface-variant)',
            fontSize: 12,
          }}
        >
          <div style={{ flex: 1, height: 1, background: 'var(--color-outline-variant)' }} />
          or
          <div style={{ flex: 1, height: 1, background: 'var(--color-outline-variant)' }} />
        </div>

        {/* Demo bypass */}
        <Link
          href={'/dashboard' as any}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            letterSpacing: '0.08em',
            color: 'var(--color-on-surface-variant)',
            textDecoration: 'none',
            textTransform: 'uppercase',
            borderBottom: '1px solid transparent',
            transition: 'color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-primary)';
            (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = 'var(--color-primary)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-on-surface-variant)';
            (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = 'transparent';
          }}
        >
          Continue as Demo
        </Link>
      </div>

      {/* Footer */}
      <p
        style={{
          marginTop: 24,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--color-on-surface-variant)',
          letterSpacing: '0.05em',
          opacity: 0.6,
          position: 'relative',
          zIndex: 1,
        }}
      >
        SECURBANK · TIER 1 INSTITUTIONAL ACCESS · FDIC INSURED
      </p>

      <LoginModal
        triggerRef={signInBtnRef}
        onSuccess={() => router.push('/dashboard' as any)}
      />
    </main>
  );
}
