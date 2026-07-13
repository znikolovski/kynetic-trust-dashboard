/**
 * Minimal session helper. In production this validates the SecurBank
 * identity/auth session (IMS or the bank's own IdP — NOT AEM/EDS, which
 * stay fully unauthenticated/public) and returns the customer id used to
 * key AEM Content Fragment queries and any core-banking API calls.
 *
 * The EDS site never needs a customer id: it is 100% anonymous, cacheable,
 * publicly delivered marketing/content. Only this Next.js app carries
 * session state, which is why it — not EDS — is the right home for the
 * "logged-in dashboard" experience.
 */
export async function getCurrentCustomerId(): Promise<string> {
  return 'demo-customer-001';
}
