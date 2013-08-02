var Agent = require('./lib/agent')
var Request = require('./lib/request')
var Response = require('./lib/response')
var util = require('./lib/util')

exports = module.exports = new Agent()
  .onRequest(util.serialize())
  .onResponse(util.bodyParser())

exports.basic = function() {
  return new Agent
}

exports.Url = util.Url

exports.bodyParser = util.bodyParser

exports.serialize = util.serialize

exports.Agent = Agent

exports.Request = Request

exports.Response = Response
