/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    transpilePackages: ['@uiw/react-markdown-preview', '@uiw/react-md-editor']
  },
};

module.exports = nextConfig;

