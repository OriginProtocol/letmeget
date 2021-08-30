const path = require("path")
const webpack = require("webpack")
const CopyPlugin = require("copy-webpack-plugin")

module.exports = {
  target: "web", // es5
  entry: {
    letmeget: `${__dirname}/src/index.tsx`,
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "letmeget.js",
  },
  resolve: {
    alias: {
      //'web-encoding': path.resolve(__dirname, 'node_modules/web-encoding/src/lib.js')
      //'web-encoding': path.resolve(__dirname, 'node_modules/web-encoding/src/lib.js')
      //'ethers': path.resolve(__dirname, 'node_modules/web-encoding/src/lib.js')
    },
    //fallback: { "util": require.resolve("util/") },
    extensions: [".ts", ".tsx", ".js", ".json"],
    //mainFields: ["main", "module"],
    //mainFields: ["module", "main"],
    /*aliasFields: ['browser', 'main', 'module'],
    mainFields: ['browser', 'main', 'module'],
    importsFields: ['browser', 'main', 'module'],*/
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "ts-loader",
        },
      },
      {
        test: /\.s?[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
      {
        test: /\.(ttf|eot|woff|woff2|svg)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name].[ext]",
            outputPath: "static/fonts/",
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      DEBUG: process.env.DEBUG || "",
    }),
    new CopyPlugin({
      patterns: [
        { from: `./src/index.html`, to: "index.html" },
        { from: `./src/artifacts` },
        { from: `./src/static/fonts` },
        ...["heart.png", "offer-hand.png", "accept-hand.png", "redx.svg"].map(
          (fname) => ({
            from: `./src/static/images/${fname}`,
            to: `static/images/${fname}`,
          })
        ),
      ],
    }),
  ],
}
