// webpack.config.js
const path = require('path');

module.exports = {
  entry: './src/main.js',
  output: {
    filename: "[name].min.js",
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    alias: {
      // Create aliases for easier imports
      '@': path.resolve(__dirname, 'src/'),
      'vendor': path.resolve(__dirname, 'src/vendor/')
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [
          /node_modules/,
          // Exclude vendor files from babel transpilation since they're already minified
          path.resolve(__dirname, 'src/vendor')
        ],
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
    // Increase size limits to avoid warnings with minified vendor files
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },
  optimization: {
    // Basic optimizations
    minimize: true
  }
};