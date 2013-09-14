var qs = require('qs')
var mix = require('mixobjects')
var util = require('../util')

module.exports = function(types) {
  types = mix({'application/x-www-form-urlencoded': qs.stringify}, types)

  return function(req, send, cb) {
    if (req.body
      && typeof req.body == 'object'
      && !Buffer.isBuffer(req.body)
      && !util.isStream(req.body)) {

      var type = (req.headers['content-type'] || '').split(/ *; */)[0]
      var serialize = types[type] || JSON.stringify

      try {
        req.body = serialize(req.body)
      } catch(e) {
        return cb(e)
      }

      if (!type) req.headers['content-type'] = 'application/json'
    }
    send(req, cb)
  }
}