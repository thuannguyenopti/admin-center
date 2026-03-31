import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  compress: true,
  output: "standalone",
  transpilePackages: ["@optiaxiom/react"],
  experimental: {
    optimizePackageImports: ["@tabler/icons-react"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "images.pexels.com", pathname: "/**" },
      { protocol: "https", hostname: "pixabay.com", pathname: "/**" },
    ],
  },
  turbopack: {
    root: __dirname,
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

    const assetRule = config.module.rules.find((rule: any) => rule?.test?.test?.(".svg"));
    if (assetRule) {
      assetRule.exclude = /\.svg$/i;
    }

    config.module.rules.push(
      {
        ...assetRule,
        test: /\.svg$/i,
        resourceQuery: /url/,
      },
      {
        test: /\.svg$/i,
        issuer: assetRule?.issuer,
        resourceQuery: { not: [/url/] },
        use: ["@svgr/webpack"],
      }
    );

    return config;
  },
};

export default nextConfig;
