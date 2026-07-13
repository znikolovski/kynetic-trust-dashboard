export default function CardsPage() {
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900 }}>Cards</h1>
      <p style={{ color: 'var(--color-on-surface-variant)' }}>
        Card controls (freeze, limits, virtual card issuance) render here,
        reading real-time data from the core banking API — not AEM. AEM
        Content Fragments still supply the marketing copy for card upsell
        offers shown alongside, via
        {' '}
        <code>getPersonalizedOffers</code>
        .
      </p>
    </div>
  );
}
