module.exports = {
  // Performance optimizations
  reactStrictMode: false, // Disable for production to avoid double-rendering
  swcMinify: true, // Use SWC for faster minification
  compress: true, // Enable gzip compression
  
  // Vercel deployment optimization
  output: 'standalone',
  
  // Transpile packages
  transpilePackages: ["@optiaxiom/react"],
  
  // Turbopack configuration (dev only)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'pixabay.com',
      },
    ],
  },
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['@optiaxiom/react', '@tabler/icons-react'],
  },
}