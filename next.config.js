/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 301 redirects from the old WordPress URLs to the new site structure.
  // Preserves SEO value (rankings, backlinks) after the domain cutover.
  async headers() {
    // `immutable` is a prod-only optimization. In dev the same /video/*.mp4
    // path can be served with different bytes across re-encodes / dev-server
    // restarts; combined with the byte-range requests <video> issues, the
    // browser's disk cache hits an inconsistency mid-stitch and logs
    // ERR_CACHE_OPERATION_NOT_SUPPORTED. Returning short, revalidating
    // headers in dev avoids that whole class of error.
    if (process.env.NODE_ENV !== 'production') {
      return [
        {
          source: '/videos/:path*',
          headers: [
            { key: 'Accept-Ranges', value: 'bytes' },
            { key: 'Cache-Control', value: 'no-store' },
          ],
        },
      ];
    }
    return [
      {
        source: '/videos/:path*',
        headers: [
          { key: 'Accept-Ranges', value: 'bytes' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  async redirects() {
    return [
      { source: '/about', destination: '/company', permanent: true },
      { source: '/about/', destination: '/company', permanent: true },
      { source: '/lstep', destination: '/services/aiops', permanent: true },
      { source: '/lstep/', destination: '/services/aiops', permanent: true },
      { source: '/lsteprpa', destination: '/services/aiops', permanent: true },
      { source: '/lsteprpa/', destination: '/services/aiops', permanent: true },
      { source: '/services/dx-consulting', destination: '/services/aiops', permanent: true },
      { source: '/services/dx-consulting/:path*', destination: '/services/aiops/:path*', permanent: true },
      { source: '/privacypolicy', destination: '/privacy', permanent: true },
      { source: '/privacypolicy/', destination: '/privacy', permanent: true },

      // Routes retired from the public site (2026-08-26). The page files stay
      // in the repo, but redirects() runs *before* filesystem routing, so
      // these URLs are unreachable in production no matter what is on disk.
      //
      // Google had them indexed via sitemap.ts, which is how a visitor landed
      // on /member/kyo from a search result. Each one points at the closest
      // live page rather than / — a blanket redirect to the homepage gets
      // classified as a soft 404 and the URL is dropped instead of folded in.
      //
      // Deliberately NOT added to robots.ts: a disallowed URL can't be
      // crawled, so Google would never see the redirect and the old pages
      // would sit in the index indefinitely.
      { source: '/member', destination: '/company', permanent: true },
      { source: '/member/', destination: '/company', permanent: true },
      { source: '/member/:path*', destination: '/company', permanent: true },
      { source: '/recruit', destination: '/company', permanent: true },
      { source: '/recruit/', destination: '/company', permanent: true },
      { source: '/recruit/:path*', destination: '/company', permanent: true },
      { source: '/achievements', destination: '/company', permanent: true },
      { source: '/achievements/', destination: '/company', permanent: true },
      { source: '/services/callcenter', destination: '/services/aiops', permanent: true },
      { source: '/services/callcenter/', destination: '/services/aiops', permanent: true },
      { source: '/services/callcenter/:path*', destination: '/services/aiops', permanent: true },
      { source: '/services/finance-consulting', destination: '/services/aiops', permanent: true },
      { source: '/services/finance-consulting/', destination: '/services/aiops', permanent: true },
      { source: '/services/finance-consulting/:path*', destination: '/services/aiops', permanent: true },
      { source: '/news', destination: '/', permanent: true },
      { source: '/news/', destination: '/', permanent: true },
      { source: '/news/:path*', destination: '/', permanent: true },
      { source: '/style-preview', destination: '/', permanent: true },
      { source: '/style-preview/', destination: '/', permanent: true },
      { source: '/dev', destination: '/', permanent: true },
      { source: '/dev/:path*', destination: '/', permanent: true },
    ];
  },
};

module.exports = nextConfig;
