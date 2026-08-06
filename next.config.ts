import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/japanese-ai-assessment',
  assetPrefix: '/japanese-ai-assessment/',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
