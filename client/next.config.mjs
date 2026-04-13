/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  // basePath and assetPrefix are set via NEXT_PUBLIC_BASE_PATH at build time
  // so the GitHub Actions workflow can inject /MEDTRACK without double-applying it here
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH ? `${process.env.NEXT_PUBLIC_BASE_PATH}/` : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
