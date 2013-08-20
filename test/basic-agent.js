var express = require('express')
var should = require('should')
var fs = require('fs')
var Simple = require('stream-simple')
var consume = require('simple-binary-consume')

var app = express()

app.get('/hello', function(req, res) {
  res.set('X-Hello', 'world')
  res.send('hello')
})

app.get('/to-hello', function(req, res) {
  res.redirect('/hello')
})

app.post('/echo', function(req, res) {
  res.writeHead(200, req.headers)
  req.pipe(res)
})


describe('Basic agent', function() {
  var u = require('./util/start')(app)
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
        consume(res.body, 'utf8', function(err, text) {
          if (err) return done(err)
          text.should.equal('hello')
          done()
        })
      })
    })
  })

  describe('request', function() {
    it('Should transfer req.headers', function(done) {
      agent
      .post(u + '/echo')
      .set('X-Requested-With', 'agent-next')
      .end(function(err, res) {
        res.headers.should.have.property('x-requested-with').be.equal('agent-next')
        done()
      })
    })

    describe('When req.body is a string', function() {
      it('Should transfer it', function(done) {
        agent
        .post(u + '/echo')
        .send('Привет')
        .end(function(err, res) {
          if (err) return done(err)
          consume(res.body, 'utf8', function(err, text) {
            if (err) return done(err)
            text.should.equal('Привет')
            done()
          })
        })
      })

      it('Should set Content-Length header', function(done) {
        agent
        .post(u + '/echo')
        .send('Привет')
        .end(function(err, res) {
          if (err) return done(err)
          res.headers.should.have.property('content-length').be.equal('12')
          res.body.abort()
          done()
        })
      })
    })

    describe('When req.body is a buffer', function() {
      it('Should transfer it', function(done) {
        agent
        .post(u + '/echo')
        .send(new Buffer([0, 1, 2]))
        .end(function(err, res) {
          if (err) return done(err)
          consume(res.body, function(err, buf) {
            if (err) return done(err)
            buf.length.should.equal(3)
            buf[0].should.equal(0)
            buf[1].should.equal(1)
            buf[2].should.equal(2)
            done()
          })
        })
      })

      it('Should set Content-Length header', function(done) {
        agent
        .post(u + '/echo')
        .send(new Buffer([0, 1, 2]))
        .end(function(err, res) {
          if (err) return done(err)
          res.headers.should.have.property('content-length').be.equal('3')
          res.body.abort()
          done()
        })
      })
    })

    describe('When req.body is a stream', function() {
      it('Should transfer it', function(done) {
        var stream = new Simple(fs.createReadStream(__filename))
        agent
        .post(u + '/echo')
        .send(stream)
        .end(function(err, res) {
          if (err) return done(err)
          consume(res.body, 'utf8', function(err, text) {
            if (err) return done(err)
            text.should.match(/Should transfer it/)
            done()
          })
        })
      })
    })
  })

  describe('Redirects', function() {
    it('Should follow redirects', function(done) {
      agent
      .get(u + '/to-hello')
      .end(function(err, res) {
        if (err) return done(err)
        res.headers['x-hello'].should.equal('world')
        res.body.abort()
        done()
      })
    })
  })
})
