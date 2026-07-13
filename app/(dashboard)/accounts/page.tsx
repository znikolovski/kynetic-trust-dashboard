import { getAccountSummaries, getPersonalizedOffers } from '@/lib/aem-content-fragments';
import { getCurrentCustomerId } from '@/lib/session';

// Server Component: fetches on the server, ships zero client JS for the
// data itself — good for both TTFB and Lighthouse Performance in the app
// shell, mirroring the "budget for Core Web Vitals" discipline used on
// the EDS side.
export default async function AccountsPage() {
  const customerId = await getCurrentCustomerId();
  const [accounts, offers] = await Promise.all([
    getAccountSummaries(customerId),
    getPersonalizedOffers(customerId),
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900 }}>Accounts</h1>
      <section style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {accounts.map((account) => (
          <article key={account.id} className="glass-card" style={{ padding: 24 }}>
            <p style={{
              margin: 0, fontFamily: 'var(--font-mono)', fontSize: 12,
              letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-primary)',
            }}
            >
              {account.type}
            </p>
            <h2 style={{ margin: '8px 0', fontSize: 20 }}>{account.nickname}</h2>
            <p style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 800 }}>
              {account.balance.toLocaleString('en-US', { style: 'currency', currency: account.currency })}
            </p>
            {account.apy && (
              <p style={{ margin: '4px 0 0', color: 'var(--color-on-surface-variant)', fontSize: 13 }}>
                {account.apy}
                % APY
              </p>
            )}
          </article>
        ))}
      </section>

      {offers.length > 0 && (
        <section>
          <h2 style={{ fontSize: 20 }}>Offers for you</h2>
          {offers.map((offer) => (
            <div key={offer.id} className="glass-card" style={{ padding: 24 }}>
              <p style={{
                margin: 0, fontFamily: 'var(--font-mono)', fontSize: 12,
                color: 'var(--color-secondary)', textTransform: 'uppercase',
              }}
              >
                {offer.eyebrow}
              </p>
              <h3 style={{ margin: '8px 0' }}>{offer.heading}</h3>
              <p style={{ color: 'var(--color-on-surface-variant)' }}>{offer.body}</p>
              <a href={offer.ctaHref} style={{ fontWeight: 700 }}>{offer.ctaLabel}</a>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
