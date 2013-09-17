var should = require('should')
var Agent = require('../index')

describe('cookies', function() {
  var test

  beforeEach(function() {
    test = new Test
  })

  it('Should accept single cookie', function() {
    test.set('http://example.com', 'foo=bar').expect('http://example.com', 'foo=bar')
  })

  it('Should accept multiple cookies', function() {
    test.set('http://example.com', ['foo=bar', 'bar=baz']).expect('http://example.com', 'foo=bar; bar=baz')
  })
})


function Test() {
  this.cookies = Agent.cookies()
}

Test.prototype.set = function(url, cookies) {
  var req = {url: new Agent.Url(url), headers: {}}
  this.cookies(req, function(req, cb) {
    var headers = {}
    cb(null, {status: 200, headers: {'set-cookie': cookies}})
  }, function(err) {
    if (err) throw err
  })
  return this
}

Test.prototype.expect = function(url, cookies) {
  var req = {url: new Agent.Url(url), headers: {}}
  this.cookies(req, function(req, cb) {
    req.headers.should.have.property('cookie').equal(cookies)
  }, function(err) {
    if (err) throw err
  })
  return this
}