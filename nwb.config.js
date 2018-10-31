var LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

module.exports = {
  type: 'react-component',
  npm: {
    umd: {
      global: 'WhyDidYouUpdate',
      externals: {
        'react': 'React'
      }
    }
  },
  webpack: {
    extra: {
      plugins: [new LodashModuleReplacementPlugin()],
    },
  },
  babel: {
    plugins: [
      'babel-plugin-lodash'
    ]
  }
};
