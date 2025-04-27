// webpack.config.js
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/main.js',
  output: {
    filename: "test.js", // Use a different name to avoid caching issues
    path: path.resolve(__dirname, 'dist')
  },
  devtool: 'source-map'
};