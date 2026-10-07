import type { NextConfig } from "next";

const apiInterna = process.env.API_INTERNA ?? "http://127.0.0.1:5088";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiInterna}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
