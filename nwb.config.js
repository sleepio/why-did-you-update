const _ = require('lodash');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

module.exports = function({ command }) {
  const needsRHL = command.startsWith('serve');

  const mainConfig = {
    type: 'react-component',
    npm: {
      umd: {
        global: 'WhyDidYouUpdate',
        externals: {
          react: 'React',
        },
      },
    },
    webpack: {
      config(webpackConfig) {
        if (needsRHL) {
          webpackConfig.entry.unshift('react-hot-loader/patch');
        }
        webpackConfig.plugins.unshift(new LodashModuleReplacementPlugin());
        return webpackConfig;
      },
    },
    babel: {
      plugins: _.compact([
        needsRHL && 'react-hot-loader/babel',
        'babel-plugin-lodash',
      ]),
    },
  };

  return mainConfig;
};
