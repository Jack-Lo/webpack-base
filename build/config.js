const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const friendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const notifier = require('node-notifier')
const _ = require('lodash')

const { dev, build, alias } = require('./setting.js')

var entries = {
  index: ['./src/index.js']
}

module.exports = (env, argv) => {
  var { production: prod } = env

  if (prod && build.vendor && build.vendor.length > 0) {
    entries.vendor = build.vendor
  }

  var entry = prod ? entries : _.mapValues(entries, (o) => {
    o.unshift('./build/client.js')
    return o
  })

  var output = {
    filename: prod ? '[name].js?[chunkhash]' : '[name].js',
    path: path.resolve(__dirname, '../dist'),
    publicPath: prod ? build.publicPath : '/'
  }

  var module = {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['env']
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: prod ? ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        }) : ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: prod ? '[path][name].[ext]?[hash]' : '[path][name].[ext]',
              context: path.resolve(__dirname, '../src')
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: prod ? '[path][name].[ext]?[hash]' : '[path][name].[ext]',
              context: path.resolve(__dirname, '../src')
            }
          }
        ]
      },
      {
        test: /\.html$/,
        use: prod ? ['html-loader'] : ['html-loader', path.resolve(__dirname, './change-loader.js')]
      }
    ]
  }

  var resolve = {
    alias
  }

  var devtool = prod ? (build.sourceMap ? 'source-map' : false) : 'cheap-module-source-map'

  var plugins = prod ? [
    new CleanWebpackPlugin(['dist'], {
      root: path.resolve(__dirname, '..')
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
    new UglifyJSPlugin({
      sourceMap: !!build.sourceMap
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'runtime'
    }),
    new ExtractTextPlugin({
      filename: 'assets/style/style.css?[contenthash]'
    }),
    new webpack.optimize.ModuleConcatenationPlugin()
  ] : [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
    new webpack.HotModuleReplacementPlugin(),
    new friendlyErrorsPlugin({
      compilationSuccessInfo: {
        messages: [`You application is running here http://localhost:${dev.port}`]
      },
      onErrors: (severity, errors) => {
        if (severity !== 'error') {
          return
        }

        const error = errors[0]

        notifier.notify({
          title: 'Webpack error',
          message: severity + ': ' + error.name,
          subtitle: error.file || ''
        })
      }
    })
  ]

  return {
    entry,
    output,
    module,
    resolve,
    devtool,
    plugins
  }
}
