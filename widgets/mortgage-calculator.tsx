/**
 * Standalone widget entry — bundled into public/widgets/mortgage-calculator.js.
 *
 * Defines <sb-widget-mortgage-calculator>. Renders MortgageCalculator in a
 * Shadow DOM for style isolation. Fires sb-widget-ready immediately (no async
 * data fetch — all computation is client-side).
 *
 * The EDS /mortgages page authors a nextjs-widget block whose static fallback
 * is a representative rate/term/payment table block. Once mounted and ready,
 * the nextjs-widget loader replaces the fallback with the live calculator.
 */
import { createRoot, type Root } from 'react-dom/client';
import MortgageCalculator from '../components/MortgageCalculator';

const TAG_NAME = 'sb-widget-mortgage-calculator';

class MortgageCalculatorElement extends HTMLElement {
  #root: Root | null = null;

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    const mount = document.createElement('div');
    shadow.append(mount);

    this.#root = createRoot(mount);
    this.#root.render(
      <MortgageCalculator
        onReady={() => {
          this.dispatchEvent(new CustomEvent('sb-widget-ready', { bubbles: true, composed: true }));
        }}
      />,
    );
  }

  disconnectedCallback() {
    this.#root?.unmount();
    this.#root = null;
  }
}

if (!customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, MortgageCalculatorElement);
}
