/**
 * Standalone widget entry — bundled into public/widgets/registration-flow.js.
 *
 * Defines <sb-widget-registration-flow>. Wraps RegistrationFlow in a Shadow
 * DOM so the wizard styles are isolated from the host EDS page, while still
 * inheriting CSS custom property tokens (they pierce shadow boundaries).
 *
 * The EDS /register page authors a nextjs-widget block whose static fallback
 * is the step-1 account-type cards as a plain EDS block. Once this widget
 * mounts and fires sb-widget-ready, the nextjs-widget loader swaps out the
 * static fallback for the live React wizard.
 */
import { createRoot, type Root } from 'react-dom/client';
import RegistrationFlow from '../components/RegistrationFlow';

const TAG_NAME = 'sb-widget-registration-flow';

class RegistrationFlowElement extends HTMLElement {
  #root: Root | null = null;

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    const mount = document.createElement('div');
    mount.style.cssText = 'min-height: 600px; padding: 48px 0;';
    shadow.append(mount);

    this.#root = createRoot(mount);
    this.#root.render(
      <RegistrationFlow
        onComplete={() => {
          // Dashboard redirect handled inside the component; nothing extra needed here.
        }}
      />,
    );

    // Signal ready — no async data, so it fires immediately
    this.dispatchEvent(new CustomEvent('sb-widget-ready', { bubbles: true, composed: true }));
  }

  disconnectedCallback() {
    this.#root?.unmount();
    this.#root = null;
  }
}

if (!customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, RegistrationFlowElement);
}
