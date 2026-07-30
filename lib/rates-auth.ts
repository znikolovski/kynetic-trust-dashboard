import { timingSafeEqual } from 'node:crypto';

function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
  } catch {
    return false;
  }
}

/**
 * Verifies the Bearer token on an incoming request against the RATES_API_KEY
 * environment variable. Returns false if the env var is unset (fail-closed).
 *
 * Uses a timing-safe comparison so the handler runtime doesn't leak key length
 * information to an attacker probing response latency.
 */
export function verifyRatesApiKey(request: Pick<Request, 'headers'>): boolean {
  const expected = process.env.RATES_API_KEY;
  if (!expected) return false;

  const auth = (request.headers as Headers).get('authorization') ?? '';
  if (!auth.startsWith('Bearer ')) return false;

  return timingSafeCompare(auth.slice(7), expected);
}
