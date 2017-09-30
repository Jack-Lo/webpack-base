const webpack = require('webpack')
const config = require('./config.js')({production: true})
const compiler = webpack(config)

compiler.run((err, stats) => {
  if (err) {
    console.error(err.stack || err)

    if (err.details) {
      console.error(err.details)
    }

    return
  }

  const info = stats.toJson()

  if (stats.hasErrors()) {
    console.error(info.errors)
    return
  }

  if (stats.hasWarnings()) {
    console.warn(info.warnings)
    return
  }

  console.log(stats.toString({
    chunks: false,
    colors: true
  }))
})