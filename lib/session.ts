/**
 * Session helpers for the SecurBank dashboard.
 *
 * These functions form the single seam between the UI (LoginModal,
 * dashboard middleware) and the identity provider. For the demo the
 * implementation calls the public FakeAuth Adobe I/O Runtime action and
 * stores the result in localStorage — exactly mirroring the securbank
 * source repo's auth.js pattern while being structured for a one-file swap.
 *
 * TODO (real IdP): replace the `MOCK_AUTH_ENDPOINT` fetch with a call to
 * your real identity provider (IMS, OAuth PKCE, or a Next.js API route that
 * sets HttpOnly/Secure/SameSite=Strict cookies). The callers (LoginModal,
 * middleware, getCurrentCustomerId) never need to change — only this file.
 *
 * Security notes on the mock:
 * - Credentials are sent over TLS to an HTTPS endpoint; never logged.
 * - The returned token goes into localStorage for this demo. Production:
 *   use an HttpOnly cookie set by a /api/auth route instead.
 * - Error messages surfaced to the UI are always generic — never expose
 *   which field failed (username vs password) to avoid user enumeration.
 */

const MOCK_AUTH_ENDPOINT =
  'https://28538-authfake.adobeio-static.net/api/v1/web/FakeAuth/generic';
const MOCK_VERIFY_ENDPOINT =
  'https://28538-authfake.adobeio-static.net/api/v1/web/FakeAuth/verify';
const MOCK_CREATE_ENDPOINT =
  'https://28538-authfake.adobeio-static.net/api/v1/web/FakeAuth/create';

export type UserInfo = {
  token: string;
  email?: string;
  name?: string;
  [key: string]: unknown;
};

/** Thrown by authenticate() on any failure. Message is always generic. */
export class AuthError extends Error {
  constructor() {
    super('Incorrect email or password.');
    this.name = 'AuthError';
  }
}

/** Thrown by register() with a user-surfaceable reason (e.g. email already taken). */
export class RegistrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RegistrationError';
  }
}

export type RegistrationData = {
  identifier: string;
  password: string;
  firstName: string;
  lastName: string;
};

/**
 * Create a new account via FakeAuth /create.
 * Throws RegistrationError with a safe message on failure.
 *
 * SEAM: replace with your real IdP's registration endpoint.
 */
export async function register(data: RegistrationData): Promise<void> {
  let response: Response;
  try {
    response = await fetch(MOCK_CREATE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: data.identifier.trim(),
        password: data.password,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
      }),
    });
  } catch {
    throw new RegistrationError('Network error — please try again.');
  }

  if (!response.ok) {
    let reason = 'Registration failed — please try again.';
    try {
      const text = await response.text();
      if (text.toLowerCase().includes('already exists')) {
        reason = 'An account with this email already exists.';
      }
    } catch { /* ignore */ }
    throw new RegistrationError(reason);
  }
}

/**
 * Authenticate with email + password. Returns UserInfo on success.
 * Throws AuthError on any failure (bad credentials, network, server error).
 *
 * SEAM: Replace this function body to swap the mock for a real IdP.
 */
export async function authenticate(email: string, password: string): Promise<UserInfo> {
  let response: Response;
  try {
    response = await fetch(MOCK_AUTH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: email.trim(), password }),
    });
  } catch {
    throw new AuthError();
  }

  if (!response.ok) throw new AuthError();

  const userInfo = await response.json() as UserInfo;
  if (!userInfo?.token) throw new AuthError();

  if (typeof window !== 'undefined') {
    localStorage.setItem('auth', JSON.stringify(userInfo));
  }
  return userInfo;
}

/**
 * Validate the stored session token. Returns true if still valid.
 *
 * SEAM: For a real IdP, exchange the cookie/token with a /api/session
 * route or call the IdP's token-introspection endpoint.
 */
export async function validateSession(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const raw = localStorage.getItem('auth');
  if (!raw) return false;
  try {
    const { token } = JSON.parse(raw) as { token: string };
    if (!token) return false;
    const res = await fetch(MOCK_VERIFY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Returns the current session's customer id, or null if not authenticated. */
export function getSessionUserInfo(): UserInfo | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('auth');
    return raw ? (JSON.parse(raw) as UserInfo) : null;
  } catch {
    return null;
  }
}

/** Sign out: clear session and dispatch sb-auth-change. */
export function signOut(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth');
  window.dispatchEvent(new CustomEvent('sb-auth-change', { detail: { authenticated: false } }));
}

/** For RSC / server-side routes — reads demo customer id. */
export async function getCurrentCustomerId(): Promise<string> {
  return 'demo-customer-001';
}
