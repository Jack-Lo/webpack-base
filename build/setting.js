var path = require('path')
var { proxyMap, mockMap } = require('./data.js')

module.exports = {
  entries: {
    index: ['./src/index.js']
  },
  resolve: {
    alias: {
      '@': rsv('../src'),
      '@a': rsv('../src/assets')
    },
    extensions: [
      '.js', '.json', '.css'
    ],
    modules: [rsv('../src'), 'node_modules']
  },
  build: {
    pages: getPages(),
    vendor: [],
    publicPath: '/',
    sourceMap: true
  },
  dev: {
    pages: getPages(true),
    port: 8080,
    hmr: true,
    nativeNotifier: true,
    proxyMap,
    mockMap
  }
}

function getPages(dev) {
  return [
    {
      filename: 'index.html',
      template: 'index.html',
      chunks: ['manifest', 'vendor', 'index'],
      inject: true,
      tplArgs: {
        title: 'index'
      }
    }
  ]
}

function rsv(pathName) {
  return path.resolve(__dirname, pathName)
}
