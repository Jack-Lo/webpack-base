var prevSource = ''
var options = {}

module.exports = function(source) {
  if (prevSource !== source) {
    options.onChange && options.onChange()
    prevSource = source
  }

  return source
}

module.exports.subscribe = function(handler) {
  options.onChange = handler
}