// webpack.config.js
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'development', // Use development mode for better debugging
  entry: './src/main.js',
  output: {
    filename: "main.min.js",
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      '@': path.resolve(__dirname, 'src/'),
      'vendor': path.resolve(__dirname, 'vendor/')
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  performance: {
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },
  // Use source maps for better debugging
  devtool: 'source-map',
  optimization: {
    minimize: false, // Disable minification for debugging
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          format: {
            comments: false,
          },
          compress: {
            drop_console: false,
          }
        }
      })
    ]
  }
};