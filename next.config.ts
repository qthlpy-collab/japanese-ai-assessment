import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DEV_DIR || '.next',
  ...(process.env.GITHUB_PAGES === 'true' ? {
    output: 'export',
    distDir: '.next-pages',
    basePath: '/japanese-ai-assessment',
    assetPrefix: '/japanese-ai-assessment/'
  } : {}),
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
