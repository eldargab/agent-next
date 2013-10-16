var should = require('should')
var express = require('express')
var start = require('./util/start')
var Agent = require('../index')

var app = express()

app.all('/0', function(req, res) {
  res.redirect(301, '/1')
})

app.get('/1', function(req, res) {
  res.redirect(302, '../2')
})

app.get('/2', function(req, res) {
  res.redirect(303, '/3')
})

app.get('/3', function(req, res) {
  res.send(req.method)
})

describe('redirects(max) middleware', function() {
  var u = start(app)

  describe('in case of redirect', function() {
    var agent = Agent
      .basic()
      .use(Agent.redirects())
      .use(Agent.parser())

    it('Should follow it', function(done) {
      agent.get(u + '/0').end(function(err, res) {
        if (err) return done(err)
        res.text.should.equal('GET')
        done()
      })
    })

    it('Should set res.redirects to the list of followed locations', function(done) {
      agent.get(u + '/0').end(function(err, res) {
        if (err) return done(err)
        res.redirects.should.eql(['/1', '/1/../2', '/3'])
        done()
      })
    })

    it('Should change the method to GET if it is not a HEAD', function(done) {
      agent.post(u + '/0').end(function(err, res) {
        if (err) return done(err)
        res.text.should.equal('GET')
        done()
      })
    })

    it('Should not change HEAD method', function(done) {
      agent.head(u + '/0').end(function(err, res) {
        if (err) return done(err)
        res.text.should.equal('')
        done()
      })
    })
  })

  describe('if max redirects count exceeded', function() {
    var agent = Agent.basic().use(Agent.redirects(1))

    it('Should yield an error', function(done) {
      agent.get(u + '/0').end(function(err, res) {
        should.exist(err)
        should.exist(res)
        err.message.should.equal('Max redirects count (1) exceeded.')
        err.redirects.should.eql(['/1', '/1/../2'])
        done()
      })
    })

    it('Should treat max redirects count 0 as - redirects are not allowed', function(done) {
      Agent
      .basic()
      .use(Agent.redirects(0))
      .get(u + '/0')
      .end(function(err, res) {
        should.exist(err)
        should.exist(res)
        err.message.should.equal('Max redirects count (0) exceeded.')
        err.redirects.should.eql(['/1'])
        done()
      })
    })
  })
})