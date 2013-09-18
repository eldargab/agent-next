var should = require('should')
var Agent = require('../index')

describe('cookies', function() {
  var test

  beforeEach(function() {
    test = new Test
  })

  it('Should accept single cookie', function() {
    test
    .set('http://example.com', 'foo=bar')
    .expect('http://example.com', 'foo=bar')
  })

  it('Should accept multiple cookies', function() {
    test
    .set('http://example.com', ['foo=bar', 'bar=baz'])
    .expect('http://example.com', 'foo=bar; bar=baz')
  })

  it('Should ignore malformed cookies', function() {
    test
    .set('http://example.com', 'a=b;')
    .expect('http://example.com', null)
  })

  it('Should not send cookies of foreign host', function() {
    test
    .set('http://example.com', 'foo=bar')
    .expect('http://foo.com', null)
  })

  it('Should not send cookies of foreign path', function() {
    test
    .set('http://example.com', ['a=b; Path=/1', 'c=d; Path=/2'])
    .expect('http://example.com/2', 'c=d')
  })

  it('Should reject cookies with illegal Domain', function() {
    test
    .set('http://foo.com', 'c=d; Domain=.example.com')
    .expect('http://example.com', null)
    .expect('http://foo.com', null)
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
    if (cookies)
      req.headers.should.have.property('cookie').equal(cookies)
    else
      req.headers.should.not.have.property('cookie')
  }, function(err) {
    if (err) throw err
  })
  return this
}