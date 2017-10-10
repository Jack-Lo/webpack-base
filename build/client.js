var client = require('webpack-hot-middleware/client?noInfo=true&reload=true')

client.subscribeAll(function(event) {
  if (event.action === 'reload') {
    window.location.reload()
  }
})

if (module.hot) {
  console.log('%c[Hot Module Replacement enabled]', 'font-weight:bold')
}