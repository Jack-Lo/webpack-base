var path = require('path')
var url = require('url')

module.exports = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@a': path.resolve(__dirname, '../src/assets')
    },
    extensions: [
      '.js', '.json', '.css'
    ]
  },
  build: {
    vendor: [],
    publicPath: './',
    sourceMap: true
  },
  dev: {
    port: 8080,
    nativeNotifier: true,
    proxyTable: {},
    mockTable: {}
  }
}

function rsv(pathName) {
  return path.resolve(__dirname, '../src')
}
