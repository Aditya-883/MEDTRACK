/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: "/MEDTRACK",        // ← add this
  assetPrefix: "/MEDTRACK/",    // ← and this
  images: {
    unoptimized: true,
  },
};

export default nextConfig;