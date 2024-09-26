/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['localhost', 'system-fund.vercel.app', 'system-fund']
  },
  async headers() {
    return [
      {
        // Matching all API routes for CORS
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // Change "*" to your specific origin if needed
          { key: "Access-Control-Allow-Methods", value: "GET, DELETE, PATCH, POST, PUT" },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/page/application/create/internal",
        destination: "/page/application/create/internal", // Rewrite to internal application creation page
      },
      {
        source: "/page/scholarships/:id",
        destination: "/page/scholarships/:id", // Dynamic route rewrite for scholarship detail page
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*", // Match all paths
        has: [{ type: "query", key: "notFound", value: "true" }], // Redirect only if not found
        permanent: false,
        destination: "/error", // Redirect to a custom error page
      },
    ];
  },
};

module.exports = nextConfig;
