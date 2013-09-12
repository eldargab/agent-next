var Agent = require('./lib/agent')
var Request = require('./lib/request')
var Response = require('./lib/response')
var Url = require('./lib/url')
var send = require('./lib/send')

exports = module.exports = function(opts) {
  opts = opts || {}
  var a = exports.basic(opts)

  function use(name) {
    if (opts[name] === false) return
    a.use(exports[name](opts[name]))
  }

  use('cookies')
  use('redirects')
  use('unzip')
  use('parser')
  use('serialize')

  return a
}

exports.basic = function(opts) {
  opts = opts || {}
  return new Agent(function(req, cb) {
    send(req, opts, cb)
  })
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