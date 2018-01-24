var LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

module.exports = {
  type: 'react-component',
  npm: {
    umd: {
      externals: {
        'react': 'React'
      },
      global: 'WhyDidYouUpdate',
    }
  },
  webpack: {
    extra: {
      plugins: [
        new LodashModuleReplacementPlugin
      ]
    }
  }
}
