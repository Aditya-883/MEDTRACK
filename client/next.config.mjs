/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: "/MEDTRACK",
  assetPrefix: "/MEDTRACK/",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
