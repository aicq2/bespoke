// webpack.config.js
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/main.js',
  output: {
    filename: "main.min.js",
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      vendor: path.resolve(__dirname, 'vendor')
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/, /vendor/], // Exclude vendor files from being processed by babel
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      extractComments: false,
      terserOptions: {
        format: {
          comments: false,
        },
      },
    })],
  }
};