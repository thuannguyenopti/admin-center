module.exports = {
  transpilePackages: ["@optiaxiom/react"],
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
}