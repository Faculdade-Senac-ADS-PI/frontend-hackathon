import type { NextConfig } from "next";

const apiInterna = process.env.API_INTERNA ?? "http://127.0.0.1:5088";

const nextConfig: NextConfig = {
  images: {
    // O logo institucional do BNB é um SVG estático em /public
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
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
