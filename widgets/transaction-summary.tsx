/**
 * Standalone embed entry point for the transaction summary widget.
 * Bundled by `widgets/build.mjs` into `public/widgets/transaction-summary.js`.
 *
 * Defines `<sb-widget-transaction-summary>`, a custom element used by the EDS
 * nextjs-widget block. The widget renders three glass metric cards (Inflow /
 * Outflow / Net Liquidity) when the customer is authenticated, and returns null
 * otherwise. Shadow DOM isolates styles; CSS custom properties pierce the
 * boundary so Neon Vault tokens are still available inside.
 */
import { createRoot, type Root } from 'react-dom/client';
import TransactionSummary from '../components/TransactionSummary';

const TAG_NAME = 'sb-widget-transaction-summary';
const DEFAULT_API_BASE = 'https://app.securbank.com';

class TransactionSummaryElement extends HTMLElement {
  #root: Root | null = null;

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    const mount = document.createElement('div');
    shadow.append(mount);

    const apiBase = this.dataset.apiBase || DEFAULT_API_BASE;

    this.#root = createRoot(mount);
    this.#root.render(
      <TransactionSummary
        apiBase={apiBase}
        onReady={() =>
          this.dispatchEvent(
            new CustomEvent('sb-widget-ready', { bubbles: true, composed: true }),
          )
        }
      />,
    );
  }

  disconnectedCallback() {
    this.#root?.unmount();
    this.#root = null;
  }
}

if (!customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, TransactionSummaryElement);
}
