var path = require('path')
var url = require('url')

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
    publicPath: './',
    sourceMap: true
  },
  dev: {
    pages: getPages(true),
    port: 8080,
    hmr: true,
    nativeNotifier: true,
    proxyTable: {},
    mockTable: {}
  }
}

function getPages(dev) {
  return {
    index: {
      filename: 'index.html',
      template: 'index.html',
      chunks: ['runtime', 'vendor', 'index'],
      inject: true,
      tplArgs: {
        title: 'index'
      }
    }
  }
}

function rsv(pathName) {
  return path.resolve(__dirname, pathName)
}
