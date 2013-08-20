var express = require('express')
var consume = require('simple-binary-consume')
var start = require('./util/start')
var Agent = require('../index')

var app = express()

app.use(express.compress({
  filter: function(){ return true },
  threshold: 0
}))

app.get('/', function(req, res) {
  res.send('hello')
})

describe('unzip middleware', function() {
  var u = start(app)
  var agent = Agent.basic().onResponse(Agent.unzip())

  it('Should decode gzip', function(done) {
    agent
    .get(u)
    .set('Accept-Encoding', 'gzip')
    .end(function(err, res) {
      if (err) return done(err)
      res.headers.should.have.property('content-encoding').equal('gzip')
      consume(res.body, 'utf8', function(err, text) {
        if (err) return done(err)
        text.should.equal('hello')
        done()
      })
    })
  })

  it('Should decode deflate', function(done) {
    agent
    .get(u)
    .set('Accept-Encoding', 'deflate')
    .end(function(err, res) {
      if (err) return done(err)
      res.headers.should.have.property('content-encoding').equal('deflate')
      consume(res.body, 'utf8', function(err, text) {
        if (err) return done(err)
        text.should.equal('hello')
        done()
      })
    })
  })
})
