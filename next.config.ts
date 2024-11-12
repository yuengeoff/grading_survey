import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['turks-dataset.s3.amazonaws.com'], // Add your image domain here
  },
};

export default nextConfig;
