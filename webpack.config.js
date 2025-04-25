const path = require('path');

module.exports = {
  entry: {
    shared: './src/shared/index.js',
    home: './src/pages/home.js',
    projects: './src/pages/projects.js',
    about: './src/pages/about.js',
    services: './src/pages/services.js',
    startProject: './src/pages/start-project.js',
    cmsTemplate: './src/pages/cms-template.js'
  },
  output: {
    filename: '[name].min.js',
    path: path.resolve(__dirname, 'dist')
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      // This will automatically extract common dependencies into a separate bundle
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
}