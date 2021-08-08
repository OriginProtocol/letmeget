const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')

 module.exports = merge(common, {
  mode: 'production',
  optimization: {
    minimize: true,
    /* don't work?
    usedExports: true,
    sideEffects: true,*/
  },
})
