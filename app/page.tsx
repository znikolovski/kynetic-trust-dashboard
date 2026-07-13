import Link from 'next/link';

// Unauthenticated entry point. Real sign-in delegates to SecurBank's
// identity provider; on success it redirects into the (dashboard) route
// group. Marketing content (rates, product pages, "why SecurBank") lives
// on the EDS site at securbank.com, not here — this app starts at sign-in.
export default function SignInPage() {
  return (
    <main style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 24, padding: 24,
    }}
    >
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 40, fontWeight: 900 }}>
        SECURBANK
      </h1>
      <p style={{ color: 'var(--color-on-surface-variant)', maxWidth: 360, textAlign: 'center' }}>
        Sign in to view your accounts, cards, and savings goals.
      </p>
      <Link
        href="/accounts"
        className="glass-card"
        style={{
          padding: '14px 32px', background: 'var(--color-primary-container)',
          color: 'var(--color-on-primary)', fontWeight: 700, borderRadius: 9999,
        }}
      >
        Continue to demo dashboard
      </Link>
    </main>
  );
}
