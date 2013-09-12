var should = require('should')
var express = require('express')
var agent = require('../index')()
var start = require('./util/start')

var app = express()

app.set('json spaces', 0)

app.use(express.compress({
  filter: function(req) { return true },
  threshold: 0
}))

app.post('/', function echo(req, res) {
  res.type(req.get('Content-Type'))
  req.pipe(res)
})

var u = start(app)

describe('Default agent', function() {
  it('test', function(done) {
    agent
    .post(u)
    .send({foo: 'bar'})
    .end(function(err, res) {
      if (err) return done(err)
      debugger
      res.headers.should.have.property('content-encoding').equal('gzip')
      res.text.should.equal('{"foo":"bar"}')
      res.body.should.eql({foo: 'bar'})
      done()
    })
  })
})
