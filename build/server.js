const express = require('express')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const proxyMiddleware = require('proxy-middleware')

const app = express()
const config = require('./config.js')({production: false})
const compiler = webpack(config)
const { dev, build } = require('./setting.js')
const { port, proxyTable, mockTable } = dev
const hotMiddleware = webpackHotMiddleware(compiler, {
  log: false
})
const devMiddleware = webpackDevMiddleware(compiler, {
  quiet: true,
  publicPath: config.output.publicPath,
  stats: {
    chunks: false,
    colors: true
  }
})
const lastLoaderSubscribe = require('./change-loader.js').subscribe

lastLoaderSubscribe(() => {
  hotMiddleware.publish({
    action: 'change'
  })
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

// Serve the files on port 3000.
app.listen(port, () => {
  // console.log(`Server listening on port ${port}!\n`)
})