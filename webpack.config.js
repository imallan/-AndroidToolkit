var webpack = require('webpack')

module.exports = {
  context: __dirname + '/app',
  entry: './app.js',

  output: {
    filename: 'bundle.js',
    path: __dirname + '/build',
    publicPath: 'http://localhost:8080/build/'
  },

  target: "electron",

  module: {
    loaders: [
      { 
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react', 'stage-0'],
          plugins: ['transform-decorators-legacy' ]
        }
      }
    ]
  }

}
