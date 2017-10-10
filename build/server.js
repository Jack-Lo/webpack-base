const express = require('express')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const proxyMiddleware = require('proxy-middleware')
const _ = require('lodash')

const app = express()
const config = require('./config.js')({production: false})
const compiler = webpack(config)
const { dev, build } = require('./setting.js')
const { port, proxyTable, mockTable } = dev
var hotMiddleware = null
var devMiddleware = null
var htmlCache = {}

compiler.plugin('compilation', function(compilation) {
  compilation.plugin('html-webpack-plugin-after-html-processing', (data, cb) => {
    var file = data.outputName
    var tplArgs = data.plugin.options.tplArgs
    
    if (tplArgs) {    
      data.html = _.template(data.html)(tplArgs)
    }

    if (htmlCache[file] !== data.html) {
      hotMiddleware.publish({
        action: 'reload'
      })

      htmlCache[file] = data.html
    }

    cb(null, data)
  })
})

hotMiddleware = webpackHotMiddleware(compiler, {
  log: false
})

devMiddleware = webpackDevMiddleware(compiler, {
  quiet: true,
  publicPath: config.output.publicPath,
  stats: {
    chunks: false,
    colors: true
  }
})

// proxy api requests
Object.keys(proxyTable).forEach((context) => {
  var options = proxyTable[context]
  app.use(context, proxyMiddleware(options))
})

// mock api requests
Object.keys(mockTable).forEach((context) => {
  app.use(context, mockTable[context])
})

app.use(hotMiddleware)

app.use(devMiddleware)

app.listen(port)