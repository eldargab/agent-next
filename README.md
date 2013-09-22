#agent-next

This project came out of experience with
[superagent](https://github.com/visionmedia/superagent) which while
establishes a good vein still has quite wide and controversal API surface as
well as some implementation quirks. Another thing which I constantly missed is
an agent abstraction not only as a cookie storage but as a general request
processing steps setup.

With `agent-next` all non-basic features (like redirects, gzip, etc)
are delivered via simple, highly focused functions with `(req, send, cb)` signature (aka middlewares)
and the agent itself is just:

```javascript
function Agent(send) {
  this.send = send
}

Agent.prototype.use = function(middleware) {
  var send = this.send
  this.send = function(req, cb) {
    middleware(req, send, cb)
  }
  return this
}
```

That's it. You have a basic `send(req, cb)` function
(internally backed by the core http module) and just apply required functionality on top.

In addition request-response objects (those returned and accepted by the basic `send()`)
are greatly simplified. The Request is just `method`, `url`, `headers`
and `body`. The Response is just `status`, `headers`, `body` + some sugar getters
(like `res.ok`, `res.mime`)

Streaming is fully supported. `res.body` is a [simple-stream](https://github.com/eldargab/stream-simple).
`req.body` can also be a simple-stream.

All above makes `agent-next` simple, flexible, fun to use solution.

##Example

Agent created from scratch specifically for the Github API.

```javascript
var Agent = require('agent-next')
var github = Agent.basic()
  .use(Agent.redirects(10))
  .use(Agent.parser())
  .use(Agent.serialize())
  .use(Agent.baseUrl('https://api.github.com'))
  .use(function(req, send, cb) {
    req.headers['user-agent'] = 'test application'
    req.headers['Accept'] = 'application/vnd.github.preview'
    send(req, function(err, res) {
      if (err) return cb(err)
      if (res.ok) return cb(null, res.body)
      err = new Error(res.body.message)
      err.req = req
      err.res = res
      cb(err)
    })
  })

// Now we can use it

// get some info about agent-next
github
.get('/repos/eldargab/agent-next')
.end(function(err, msg) {
  console.log(err || msg.description)
})

// look for alternatives
github
.get('/search/repositories')
.query({
  q: 'agent+language:javascript',
  sort: 'starts'
})
.end(function(err, msg) {
  if (err) return console.log(err)
  msg.items.forEach(function(repo) {
    console.log(repo.full_name)
  })
})
```