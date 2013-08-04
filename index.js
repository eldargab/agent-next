var Agent = require('./lib/agent')
var Request = require('./lib/request')
var Response = require('./lib/response')
var Url = require('./lib/url')
var m = require('./lib/middlewares')

exports = module.exports = function(opts) {
  opts = opts || {}
  var a = new Agent

  if (opts.unzip !== false) {
    a.onResponse(m.unzip(opts.unzip))
    a.onRequest(m.acceptEncoding('gzip,deflate'))
  }

  if (opts.parser !== false) {
    a.onResponse(m.parser(opts.parser))
  }

  if (opts.serialize !== false) {
    a.onRequest(m.serialize(opts.serialize))
  }

  return a
}

exports.basic = function() {
  return new Agent
}

exports.parser = m.parser

exports.serialize = m.serialize

exports.unzip = m.unzip

exports.Url = Url

exports.Agent = Agent

exports.Request = Request

exports.Response = Response
