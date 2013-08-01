var Agent = require('./lib/agent')
var Request = require('./lib/request')
var Response = require('./lib/response')
var util = require('./util')

exports = module.exports = new Agent()
  .onRequest(util.serialize())
  .onResponse(util.bodyParser())

exports.basic = function() {
  return new Agent
}

exports.Agent = Agent

exports.Request = Request

exports.Response = Response
