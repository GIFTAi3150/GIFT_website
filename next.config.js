/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 301 redirects from the old WordPress URLs to the new site structure.
  // Preserves SEO value (rankings, backlinks) after the domain cutover.
  async redirects() {
    return [
      { source: '/about', destination: '/company', permanent: true },
      { source: '/about/', destination: '/company', permanent: true },
      { source: '/lstep', destination: '/services/dx-consulting', permanent: true },
      { source: '/lstep/', destination: '/services/dx-consulting', permanent: true },
      { source: '/lsteprpa', destination: '/services/dx-consulting', permanent: true },
      { source: '/lsteprpa/', destination: '/services/dx-consulting', permanent: true },
      { source: '/privacypolicy', destination: '/privacy', permanent: true },
      { source: '/privacypolicy/', destination: '/privacy', permanent: true },
    ];
  },
};

module.exports = nextConfig;
