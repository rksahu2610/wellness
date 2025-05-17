import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
    images: {
        unoptimized: true,
    },
    compress: true,
    experimental: {
       optimizePackageImports: ["lucide-react"]
    }
};

export default nextConfig;
