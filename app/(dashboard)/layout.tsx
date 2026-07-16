'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/markets', label: 'Markets', icon: 'trending_up' },
  { href: '/portfolio', label: 'Portfolio', icon: 'grid_view' },
  { href: '/transactions', label: 'Transactions', icon: 'receipt_long' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-obsidian)' }}>
      <aside
        style={{
          width: 220,
          minHeight: '100vh',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
          background: 'var(--color-surface-container-lowest, #0c0e12)',
          borderRight: '1px solid var(--color-outline-variant)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          flexShrink: 0,
        }}
      >
        {/* Logo block */}
        <Link
          href={'/' as any}
          style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
        >
          <Image src="/securbank-logo.svg" alt="SecurBank" width={32} height={32} />
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 900,
              fontSize: 18,
              color: 'var(--color-on-surface)',
              letterSpacing: '-0.02em',
            }}
          >
            SecurBank
          </span>
        </Link>

        {/* User profile block */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            padding: '12px 14px',
            background: 'rgb(0 219 233 / 6%)',
            border: '1px solid rgb(0 219 233 / 15%)',
            borderRadius: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span className="material-symbol" aria-hidden="true" style={{ fontSize: 16, color: 'var(--color-primary)' }}>
              security
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.1em',
                color: 'var(--color-primary)',
                textTransform: 'uppercase',
              }}
            >
              GLOBAL OPS
            </span>
          </div>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              color: 'var(--color-on-surface-variant)',
            }}
          >
            Tier 1 Access
          </span>
        </div>

        {/* Nav list */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href as any}
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  paddingTop: 10,
                  paddingBottom: 10,
                  paddingLeft: isActive ? 14 : 16,
                  paddingRight: 16,
                  borderRadius: 6,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  transition: 'background 0.15s, color 0.15s',
                  ...(isActive
                    ? {
                        background: 'rgb(0 219 233 / 12%)',
                        borderLeft: '2px solid var(--color-primary)',
                        color: 'var(--color-primary)',
                      }
                    : {
                        color: 'var(--color-on-surface-variant)',
                      }),
                }}
              >
                <span className="material-symbol" aria-hidden="true" style={{ fontSize: 18 }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* New Trade button */}
        <button
          type="button"
          style={{
            width: '100%',
            background: 'var(--color-primary)',
            color: '#00363a',
            border: 'none',
            borderRadius: 6,
            padding: '12px 16px',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <span className="material-symbol" aria-hidden="true" style={{ fontSize: 16, color: '#00363a' }}>
            add
          </span>
          New Trade
        </button>
      </aside>

      <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
