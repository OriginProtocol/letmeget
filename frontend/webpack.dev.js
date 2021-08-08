const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  target: "web", // es5
  mode: 'development',
  devtool: "eval-cheap-module-source-map",
  devServer: {
     historyApiFallback: true,
     port: 8000,
  },
})
