import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages 向け静的書き出し
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // export モードでは PPR / Cache Components と併用不可
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
