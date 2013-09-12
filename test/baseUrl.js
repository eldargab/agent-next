var should = require('should')
var Agent = require('../index')

describe('baseUrl(base) middleware', function() {
  var cb = 'cb'

  function test(given, expected) {
    var req = new Agent.Request('GET', given)
    var m = Agent.baseUrl('http://example.com/hello/hi')
    var called = false
    m(req, function(r, c) {
      r.should.be.equal(req)
      c.should.be.equal(cb)
      r.url.toString().should.be.equal(expected)
      called = true
    }, cb)
    called.should.be.true
  }

  it('Should resolve request urls relative to given base', function() {
    test('world', 'http://example.com/hello/world')
    test('/index', 'http://example.com/index')
    test('http://github.com', 'http://github.com/')
  })
})