/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  images: {
    // AEM Cloud Service Dynamic Media / DAM asset delivery domain(s) go here
    remotePatterns: [
      { protocol: 'https', hostname: '*.adobeaemcloud.com' },
      { protocol: 'https', hostname: 'delivery-*.adobeaemcloud.com' },
    ],
  },
  async headers() {
    // widgetOrigins should match app/api/compare/route.ts's
    // WIDGET_ALLOWED_ORIGINS. Static /public files can't read env vars at
    // request time the way a Route Handler can, so this list is set at
    // build time via next.config.mjs itself — keep the two in sync (or
    // move both to a shared config module once there's a third widget).
    const widgetOrigin = process.env.WIDGET_ALLOWED_ORIGINS?.split(',')[0]?.trim()
      ?? 'https://www.securbank.com';

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // manifest.json and the hashed widget bundles are fetched
        // cross-origin, directly from the EDS page's browser context.
        source: '/widgets/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: widgetOrigin },
          { key: 'Cache-Control', value: 'public, max-age=60, stale-while-revalidate=300' },
        ],
      },
    ];
  },
};

export default nextConfig;
