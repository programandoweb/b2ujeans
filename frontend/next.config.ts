import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      {
        source: "/:year(\\d{4})/gaspro-notas/:slug",
        destination: "/gaspro-notas/:slug",
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
