/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/medtrack",
  assetPrefix: "/medtrack/",

  // Suppress browser extension hydration warnings
  reactStrictMode: false,

  // Required for static export — no Next.js image optimization server
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "gateway.pinata.cloud" },
      { protocol: "https", hostname: "ipfs.io" },
      { protocol: "https", hostname: "dweb.link" },
      { protocol: "https", hostname: "cloudflare-ipfs.com" },
    ],
  },

  // Note: async headers() is not supported in static export mode
  // CORS headers are handled by the browser and backend CORS config instead
};

export default nextConfig;
