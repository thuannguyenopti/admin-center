import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  compress: true,
  output: "standalone",
  transpilePackages: ["@optiaxiom/react"],
  experimental: {
    optimizePackageImports: ["@optiaxiom/react", "@tabler/icons-react"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "images.pexels.com", pathname: "/**" },
      { protocol: "https", hostname: "pixabay.com", pathname: "/**" },
    ],
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  webpack: (config, { isServer }) => {
    // Ensure PapaParse is only bundled for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@optimizely/axiom-icons": require("path").resolve(__dirname, "app/lib/axiom-icons.tsx"),
    };

    return config;
  },
};

export default nextConfig;
