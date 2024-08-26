/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/page/application/create/internal',
        destination: '/page/application/create/internal', // Redirect to the internal application creation page
      },
      {
        source: '/page/scholarships/:id',
        destination: '/page/scholarships/:id', // Dynamic route for detail page
      },
      {
        source: '/page/application/detail/:id',
        destination: '/application/:id', // Dynamic route for application detail page
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/:path*', // Match all paths
        has: [{ type: 'query', key: 'notFound', value: 'true' }], // Only if the path is not found
        permanent: false,
        destination: '/error', // Redirect to custom error page
      },
    ];
  },
};

module.exports = nextConfig;
