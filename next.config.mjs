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
  experimental: {
    // Bundle public/widgets/* into the Lambda so the /widgets/[file] Route
    // Handler can read them at runtime. The @vercel/next adapter does not
    // bundle gitignored public/ files via its static output; the Route
    // Handler is the reliable serving path (and owns the CORS headers too).
    outputFileTracingIncludes: {
      '/widgets/[file]': ['./public/widgets/**'],
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      // /widgets/* CORS and Cache-Control are set directly in
      // app/widgets/[file]/route.ts — no static-file headers() entry needed.
    ];
  },
};

export default nextConfig;
