import ComparisonWidget from '@/components/ComparisonWidget';

// Same component that gets bundled into widgets/comparison-table.tsx and
// embedded back into the public EDS /compare page — proof that the
// interactive logic is written once and rendered in two contexts: natively
// here (inside the authenticated Next.js shell, same-origin, no widget
// bundling needed) and as a mounted custom element on the anonymous EDS
// page (see kynetic-trust/blocks/nextjs-widget).
export default function ComparePage() {
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900 }}>Compare tiers</h1>
      <ComparisonWidget apiBase="" dataset="tiers" />
    </div>
  );
}
