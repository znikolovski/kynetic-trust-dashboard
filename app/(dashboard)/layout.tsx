import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/accounts', label: 'Accounts', icon: 'account_balance_wallet' },
  { href: '/cards', label: 'Cards', icon: 'credit_card' },
  { href: '/savings', label: 'Savings', icon: 'savings' },
  { href: '/compare', label: 'Compare', icon: 'compare_arrows' },
];

// Side-rail shell matching the "Side Rail Architecture" variant from the
// Kinetic Trust navigation design system (components_navigation_bars).
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside
        className="glass-card"
        style={{
          width: 88, margin: 16, padding: 16, display: 'flex',
          flexDirection: 'column', gap: 16, alignItems: 'center',
        }}
      >
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, color: 'var(--color-primary)' }}>SB</div>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href as any}
            style={{
              width: 48, height: 48, display: 'flex', alignItems: 'center',
              justifyContent: 'center', borderRadius: 12,
              background: 'rgb(0 219 233 / 8%)', color: 'var(--color-primary)',
            }}
            aria-label={item.label}
          >
            {item.label.slice(0, 1)}
          </Link>
        ))}
      </aside>
      <main style={{ flex: 1, padding: 32 }}>{children}</main>
    </div>
  );
}
