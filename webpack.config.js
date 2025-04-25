// webpack.config.js
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production', // Set mode explicitly to production for minification
  entry: './src/main.js',
  output: {
    filename: "main.min.js", // Fixed filename instead of [name].min.js for simplicity
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js'], // Add file extensions to resolve
    alias: {
      // Fix the vendor alias path - it should point to vendor directory at the root
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
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false, // Don't extract comments to separate file
        terserOptions: {
          format: {
            comments: false, // Remove comments
          },
          compress: {
            drop_console: false, // Keep console.logs for debugging
          }
        }
      })
    ]
  }
};