/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/MEDTRACK',
  assetPrefix: '/MEDTRACK/',
  images: {
    unoptimized: true
  }
};

export default nextConfig;