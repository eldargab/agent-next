var should = require('should')
var Agent = require('../index')

describe('base(url) middleware', function() {
  var cb = 'cb'

  function test(b, given, expected) {
    var req = new Agent.Request('GET', given)
    var m = Agent.base(b)
    var called = false
    m(req, function(r, c) {
      r.should.be.equal(req)
      c.should.be.equal(cb)
      r.url.toString().should.be.equal(expected)
      called = true
    }, cb)
    called.should.be.true
  }

  it('Should resolve request urls relative to the given base', function() {
    var b = 'http://example.com/hello'
    test(b, 'world', 'http://example.com/hello/world')
    test(b, '/world', 'http://example.com/world')
    test(b, '', 'http://example.com/hello')
    test(b, null, 'http://example.com/hello')
    test(b, '/index', 'http://example.com/index')
    test(b, '//github.com', '//github.com')
  })
})