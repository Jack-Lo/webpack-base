const webpack = require('webpack')
const config = require('./config.js')({production: true})
const compiler = webpack(config)
const _ = require('lodash')

compiler.plugin('compilation', function(compilation) {
  compilation.plugin('html-webpack-plugin-after-html-processing', (data, cb) => {
    var tplArgs = data.plugin.options.tplArgs
    
    if (tplArgs) {    
      data.html = _.template(data.html)(tplArgs)
    }

    cb(null, data)
  })
})

compiler.run((err, stats) => {
  if (err) {
    console.error(err.stack || err)

    if (err.details) {
      console.error(err.details)
    }

    return
  }

  if (stats.hasErrors()) {
    console.log(stats.toString('errors-only'))

    return
  }

  if (stats.hasWarnings()) {
    //
  }

  console.log(stats.toString({
    chunks: false,
    colors: true
  }))
})