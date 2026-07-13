/**
 * Standalone embed entry point. Bundled by `widgets/build.mjs` (esbuild)
 * into `public/widgets/comparison-table.js`, a single dependency-free
 * script (bundles its own React copy) served statically at
 * `https://app.securbank.com/widgets/comparison-table.js`.
 *
 * Defines `<sb-widget-comparison-table>`, a custom element that any page —
 * most importantly an EDS page that never runs the Next.js app itself —
 * can drop in and get the live, interactive comparison table. See
 * `kynetic-trust/blocks/nextjs-widget/nextjs-widget.js` for the EDS-side
 * loader that creates this element.
 *
 * Shadow DOM keeps the widget's markup/styles isolated from the host
 * page's CSS (and vice versa) — the only thing that crosses the boundary
 * on purpose is CSS custom properties (design tokens), which pierce shadow
 * boundaries by spec, so the widget still reads the host page's Kinetic
 * Trust color tokens where they overlap.
 */
import { createRoot, type Root } from 'react-dom/client';
import ComparisonWidget from '../components/ComparisonWidget';

const TAG_NAME = 'sb-widget-comparison-table';
const DEFAULT_API_BASE = 'https://app.securbank.com';

class ComparisonTableElement extends HTMLElement {
  #root: Root | null = null;

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    const mount = document.createElement('div');
    shadow.append(mount);

    const dataset = (this.dataset.datasetId === 'accounts' ? 'accounts' : 'tiers') as 'tiers' | 'accounts';
    const apiBase = this.dataset.apiBase || DEFAULT_API_BASE;

    this.#root = createRoot(mount);
    this.#root.render(
      <ComparisonWidget
        apiBase={apiBase}
        dataset={dataset}
        onReady={() => this.dispatchEvent(new CustomEvent('sb-widget-ready', { bubbles: true, composed: true }))}
      />,
    );
  }

  disconnectedCallback() {
    this.#root?.unmount();
    this.#root = null;
  }
}

if (!customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, ComparisonTableElement);
}
