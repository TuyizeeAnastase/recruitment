import type { NextConfig } from "next";

function actionOrigins() {
  const origins = new Set<string>();
  for (const raw of [process.env.APP_URL, process.env.SERVER_ACTION_ORIGINS]) {
    if (!raw) continue;
    for (const part of raw.split(",")) {
      const value = part.trim();
      if (!value) continue;
      try {
        origins.add(new URL(value).host);
      } catch {
        origins.add(value.replace(/^https?:\/\//, ""));
      }
    }
  }
  return [...origins];
}

const nextConfig: NextConfig = {
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
      allowedOrigins: actionOrigins(),
    },
  },
};

export default nextConfig;
