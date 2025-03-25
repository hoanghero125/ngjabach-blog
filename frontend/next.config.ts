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
};

export default nextConfig;