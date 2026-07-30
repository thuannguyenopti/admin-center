import type { NextConfig } from "next";

const nextConfig: NextConfig = {
<<<<<<< HEAD
=======
  allowedDevOrigins: ["10.102.254.88"],
>>>>>>> origin/main
  reactStrictMode: false,
  compress: true,
  output: "standalone",
  transpilePackages: ["@optiaxiom/react", "@optimizely/axiom-icons"],
  // These packages are client-only (editor/collab libs) but get incorrectly traced
  // as server-side dependencies through app/api/source-code/route.ts → CodeMirrorEditor.tsx.
  // Marking them as serverExternalPackages prevents Turbopack from trying to bundle
  // them in the App Route / server context.
  serverExternalPackages: [
    "@codemirror/state",
    "@codemirror/view",
    "@codemirror/commands",
    "@codemirror/lang-html",
    "@codemirror/lang-markdown",
    "@codemirror/lang-javascript",
    "@codemirror/lang-python",
    "@codemirror/theme-one-dark",
    "y-codemirror.next",
    "yjs",
    "@tiptap/react",
    "@tiptap/starter-kit",
    "@tiptap/extension-code-block-lowlight",
    "@tiptap/extension-collaboration",
    "@tiptap/extension-placeholder",
    "lowlight",
  ],
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
  // ⚠️ WARNING: Do NOT add custom SVG rule mutations here (config.module.rules.push/find).
  // Mutating webpack rules breaks Next.js's CSS extraction for transpilePackages,
  // causing @optiaxiom/react styles (borders, fills) to vanish in the Vercel build.
  // SVG support for dev is handled by the turbopack.rules block above.
  // Also: NEVER add --webpack to the build script in package.json for the same reason.
  webpack: (config, { isServer }) => {
    // Ensure PapaParse is only bundled for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;
