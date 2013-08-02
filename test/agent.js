var express = require('express')
var should = require('should')

var app = express()

app.get('/hello', function(req, res) {
  res.set('X-Hello', 'world')
  res.send('hello')
})

app.post('/echo', function(req, res) {
  res.writeHead(200, req.headers)
  req.pipe(res)
})

var server = app.listen(0)
var u = 'http://localhost:' + server.address().port

describe('Basic agent', function() {
  var agent = require('../index').basic()

  describe('response', function() {
    it('Should have `.headers`', function(done) {
      agent.get(u + '/hello').end(function(err, res) {
        if (err) return done(err)
        res.should.have.property('headers').be.an.instanceOf(Object)
        res.headers.should.have.property('content-length').equal('5')
        res.headers.should.have.property('x-hello').equal('world')
        done()
      })
    })

    it('Should have `.status`', function(done) {
      agent.get(u + '/hello').end(function(err, res) {
        if (err) return done(err)
        res.should.have.property('status').equal(200)
        done()
      })
    })

    it('Should have `.body` simple stream', function(done) {
      agent.get(u + '/hello').end(function(err, res) {
        if (err) return done(err)
        res.body.consume('utf8', function(err, text) {
          if (err) return done(err)
          text.should.equal('hello')
          done()
        })
      })
    })
  })
})
