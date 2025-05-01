import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  crossOrigin: "use-credentials",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: 'http://localhost:5150/api/:path*'
      }
    ]
  },  
};

export default nextConfig;
