var Agent = require('./lib/agent')
var Request = require('./lib/request')
var Response = require('./lib/response')
var Url = require('./lib/url')
var m = require('./lib/middlewares')

exports = module.exports = new Agent()
  .onRequest(m.serialize())
  .onResponse(m.bodyParser())

exports.basic = function() {
  return new Agent
}

exports.Url = Url

exports.bodyParser = m.bodyParser

exports.serialize = m.serialize

exports.unzip = m.unzip

exports.Agent = Agent

exports.Request = Request

exports.Response = Response
