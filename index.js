var Agent = require('./lib/agent')
var Request = require('./lib/request')
var Response = require('./lib/response')
var Url = require('./lib/url')
var send = require('./lib/send')

exports = module.exports = function(opts) {
  opts = opts || {}
  var a = exports.basic()

  function use(name, optional) {
    if (opts[name] === false) return
    if (optional && !opts[name]) return
    a.use(exports[name](opts[name]))
  }

  use('timeout', true)
  use('cookies', true)
  use('redirects')
  use('unzip')

  if (typeof opts.parser == 'function')
    a.use(opts.parser)
  else
    use('parser')

  use('serialize')
  use('handler')

  return a
}

/**
 * Create a "basic" agent
 *
 * @api public
 */

exports.basic = function() {
  return new Agent(send)
}

exports.Url = Url

exports.Agent = Agent

exports.Request = Request

exports.Response = Response

// export middlewares
require('fs')
.readdirSync(require('path').join(__dirname, 'lib/middlewares'))
.forEach(function(file) {
  exports[file.slice(0, file.length - 3)] = require('./lib/middlewares/' + file)
})