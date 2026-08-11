const ALLOWED_ORIGINS = (process.env.WIDGET_ALLOWED_ORIGINS ?? 'https://www.securbank.com')
  .split(',')
  .map((o) => {
    const t = o.trim();
    return t.includes('://') ? t : `https://${t}`;
  });

// AEM EDS CDN hostnames always allowed for widget embedding.
// run.place is the AEM EDS branded-domain service (same trust level as *.aem.page).
function isAemOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return (
      hostname.endsWith('.aem.page')
      || hostname.endsWith('.aem.live')
      || hostname.endsWith('.hlx.page')
      || hostname.endsWith('.hlx.live')
      || hostname.endsWith('.run.place')
    );
  } catch {
    return false;
  }
}

function isAllowedOrigin(origin: string): boolean {
  return ALLOWED_ORIGINS.includes(origin) || isAemOrigin(origin);
}

export function corsHeaders(origin: string | null) {
  const allowOrigin = origin && isAllowedOrigin(origin) ? origin : (ALLOWED_ORIGINS[0] ?? '*');
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}
