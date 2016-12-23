/**
 * Copyright © 2016 Grid Dynamics (info@griddynamics.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* global __dirname */
var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
/* global process */
var clientDir = path.resolve(__dirname + '/../client');

var config = {
  devtool: process.env.NODE_ENV == 'production' ? null : 'inline-source-map',
  context: clientDir,
  resolveLoader:{root:path.join(path.resolve(__dirname + '/..'), 'node_modules')},
  entry: process.env.NODE_ENV == 'production' ? [
    './index'
  ] : [
    'webpack-hot-middleware/client',
    './index'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.[hash].js',
    publicPath: '/virtual/'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: clientDir+'/index.html'
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env':{
        'NODE_ENV': process.env.NODE_ENV ? JSON.stringify(process.env.NODE_ENV) : '"development"'
      }
    })
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel'],
        exclude: /node_modules/,
        include: clientDir
      },
      {
        test: /\.styl|\.css?$/,
        loaders: ['style', 'css-loader', 'resolve-url', 'stylus', 'postcss'],
        include: clientDir
      },
      {
        test: /\.css?$/,
        loaders: ['style', 'css-loader', 'resolve-url'],
        include: path.join(path.resolve(__dirname + '/..'), 'node_modules')
      },
      {
        test: /\.(png|ttf|eot|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader'
      },
      {
        test: /\.(svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'svg-url-loader'
      }
    ]
  },
  postcss: [ require('autoprefixer')({ browsers: ['last 2 versions'] }) ]
};
if (process.env.NODE_ENV == 'production'){
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  );
}
module.exports = config;
