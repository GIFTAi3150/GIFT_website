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
    ];
  },
};

module.exports = nextConfig;
