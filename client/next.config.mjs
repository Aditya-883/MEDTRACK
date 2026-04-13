/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress browser extension hydration warnings
  reactStrictMode: false,

  // Allow IPFS gateway images
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "gateway.pinata.cloud" },
      { protocol: "https", hostname: "ipfs.io" },
      { protocol: "https", hostname: "dweb.link" },
      { protocol: "https", hostname: "cloudflare-ipfs.com" },
    ],
  },

  // Allow cross-origin for IPFS content
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
        ],
      },
    ];
  },
};

export default nextConfig;
