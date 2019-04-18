/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');
const NgAnnotatePlugin = require('ng-annotate-webpack-plugin');
const TapWebpackPlugin = require('tap-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  //target: 'node',
  entry: './client/app/app.js',
  /*entry: {
    app: './client/app/app.js',
    vendor: ['jquery', 'angular', 'lodash', 'moment', 'angular-ui-bootstrap', 'angular-route', 'bootstrap', 'angular-resource', 'angular-sanitize', 'angular-translate'],
  },*/
  output: {
    path: path.resolve(__dirname, 'client/build'),
    filename: 'app.bundle.js',
  },
  plugins: [
    new CopyWebpackPlugin([{ from: './client/app/index.html', to: 'index.html' }]),
    new webpack.ProvidePlugin({ // eslint-disable-line no-undef
      $: 'jquery',
      // 'window.jQuery': 'jquery',
    }),
    new webpack.optimize.CommonsChunkPlugin({ name: 'vendor', filename: 'vendor.bundle.js'}/*, Infinity*/),
    /*new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      mangle: false,
      comments: false,
      sourceMap: false,
    }),*/
    //new webpack.SourceMapDevToolPlugin(),
    new NgAnnotatePlugin({
      add: true,
    }),
    //new TapWebpackPlugin(),
    new webpack.IgnorePlugin(/cptable/),
  ],
  node: {
    fs: 'empty',
  },
  externals: [
    { './cptable': 'var cptable', './jszip': 'jszip' },
  ],
  module: {
    rules: [
      { test: /jquery\.js$/, loader: 'expose-loader?jQuery!expose-loader?$' },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        /*query: {
          presets: ['env'],
        },*/
      },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
      /*{ test: /\.scss$/, loaders: ['style-loader', 'css-loader?sourceMap', 'sass?sourceMap'] },*/
      //{ test: /\.html$/, loader: 'raw' },
      {
        test: /\.html$/,
        loader: 'html-loader',
        query: {
          minimize: true,
        },
      },
      /*{ test: /\.jade$/, loader: 'jade-loader' },*/
      // inline base64 URLs for <=8k images, direct URLs for the rest
      { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192' },
      // helps to load bootstrap's css.
      { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&minetype=application/font-woff' },
      { test: /\.woff2$/,
        loader: 'url-loader?limit=10000&minetype=application/font-woff' },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&minetype=application/octet-stream' },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader' },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&minetype=image/svg+xml' },
      /*{
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'ng-annotate?add=true!babel',
      },*/
    ],
  },
  /*htmlLoader: {
    //ignoreCustomFragments: [/\{\{.*?}}/],
    root: path.resolve(__dirname, 'client/assets/img'),
    attrs: ['img:src', 'link:href'],
  },*/
};
