const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

// Get the repository name from package.json or use a default
const repoName = require('./package.json').name;

module.exports = {
  entry: {
    regionManager: './src/regionManager.js',
    locationDisplay: './src/locationDisplay.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: '[name]',
      type: 'var'
    },
    publicPath: process.env.NODE_ENV === 'production' 
      ? `/${repoName}/`  // GitHub Pages path
      : '/'              // Development path
  },
  mode: 'development',
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
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      inject: 'head'
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process'
    })
  ],
  resolve: {
    extensions: ['.js'],
    fallback: {
      "stream": false,
      "crypto": require.resolve("crypto-browserify"),
      "buffer": require.resolve("buffer/"),
      "vm": false,
      "assert": false,
      "process": false
    }
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 9000,
    allowedHosts: 'all',
    host: '0.0.0.0',
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
  }
}; 