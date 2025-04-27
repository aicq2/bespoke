// webpack.config.js
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/main.js',
  output: {
    filename: "main.min.js",
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js'],
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