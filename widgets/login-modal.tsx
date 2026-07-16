/**
 * Standalone widget entry point — bundled by widgets/build.mjs into
 * public/widgets/login-modal.js (content-hashed), served from the
 * Next.js app origin.
 *
 * Defines <sb-widget-login-modal> — a zero-argument custom element.
 * The element mounts once, appends the <LoginModal> dialog to document.body
 * as a portal, and listens for the global sb-login-open CustomEvent to open
 * it. The EDS header block dispatches that event when the "Sign In" nav link
 * is clicked, so the element can live anywhere in the DOM (or even outside
 * the EDS block tree).
 *
 * Shadow DOM is NOT used here: the <dialog> element must be a direct child
 * of <body> for showModal() + ::backdrop to work correctly in all browsers.
 */
import { createRoot, type Root } from 'react-dom/client';
import LoginModal from '../components/LoginModal';

const TAG_NAME = 'sb-widget-login-modal';

class LoginModalElement extends HTMLElement {
  #root: Root | null = null;
  #portal: HTMLDivElement | null = null;

  connectedCallback() {
    if (this.#root) return; // already mounted

    const portal = document.createElement('div');
    portal.id = 'sb-login-modal-portal';
    document.body.append(portal);
    this.#portal = portal;

    this.#root = createRoot(portal);
    this.#root.render(
      <LoginModal />,
    );

    // Signal to the EDS loader that we're ready
    this.dispatchEvent(new CustomEvent('sb-widget-ready', { bubbles: true, composed: true }));
  }

  disconnectedCallback() {
    this.#root?.unmount();
    this.#root = null;
    this.#portal?.remove();
    this.#portal = null;
  }
}

if (!customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, LoginModalElement);
}
