import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dl.imgdrop.io',
      },
    ],
  },
  transpilePackages: ['@uiw/react-markdown-preview', '@uiw/react-md-editor']
};

export default nextConfig;