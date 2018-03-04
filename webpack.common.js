const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: [
    './public/app.js',
  ],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: [{
        loader: 'babel-loader'
      }]
    },
    {
      test: /\.css$/,
      use:
        // ['style-loader', 'css-loader']
        ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        })
    },
    {
      test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
      loader: 'url-loader',
      options: {
        limit: 10000
      }
    },
    {
      test: /\.html$/,
      loader: 'html-loader'
    }]
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.ProvidePlugin({
      jQuery: 'jquery',
      $: 'jquery',
      'window.jQuery': 'jquery',
    }),
    new HtmlWebpackPlugin({
      template: 'public/components/main/index.html',
    }),
    new ExtractTextPlugin({
      filename: '[name].css',
      allChunks: true,
    })
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          chunks: "all"
        }
      }
    }
  },
};
