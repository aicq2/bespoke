// webpack.config.js
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/main.js',
  output: {
    filename: "main.min.js",
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      // This makes the imports work correctly
      vendor: path.resolve(__dirname, 'vendor/')
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
  devtool: 'source-map',
  optimization: {
    minimize: false
  }
};