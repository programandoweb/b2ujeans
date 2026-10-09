import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  output: "standalone",
  images: {
    formats: ["image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    qualities: [60, 70, 75, 80],
    remotePatterns: [
      { protocol: "https", hostname: "www.b2ujean.com", pathname: "/**" },
      { protocol: "https", hostname: "b2ujean.com", pathname: "/**" },
      { protocol: "https", hostname: "demo.pereira.expert", pathname: "/**" },
      { protocol: "https", hostname: "backend-demo.pereira.expert", pathname: "/**" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:year(\\d{4})/gaspro-notas/:slug",
        destination: "/gaspro-notas/:slug",
        permanent: true,
      },
      {
        source: "/:year(\\d{4})/productos/categoria/:slug",
        destination: "/productos/categoria/:slug",
        permanent: true,
      },
      {
        source: "/:year(\\d{4})/productos/:slug",
        destination: "/productos/:slug",
        permanent: true,
      },
      {
        source: "/:year(\\d{4})/productos",
        destination: "/productos",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/reset-password",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
