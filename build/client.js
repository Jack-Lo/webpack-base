var client = require('webpack-hot-middleware/client?noInfo=true&reload=true')

client.subscribeAll(function(event) {
  if (event.action === 'change') {
    setTimeout(() => {
      window.location.reload()
    }, 200)
  }
})

if (module.hot) {
  console.log('%c[Hot Module Replacement enabled]', 'font-weight:bold')
}