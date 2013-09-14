#agent-next

This project came out of experience with
[superagent](https://github.com/visionmedia/superagent) which while
establishes a good vein still has quite wide and controversal API surface as
well as some implementation quirks. Another thing which I constantly missed is
an agent abstraction not only as a cookie storage but as a general request
processing steps setup.

With `agent-next` all non-basic features (like redirects, gzip, etc)
are delivered via simple functions with `(req, send, cb)` signature (aka middlewares)
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
(internally backed by core http module) and just apply required functionality on top.
Simple as that.

In addition request-response objects (those returned and accepted by basic `send()`)
are greatly simplified. The Request is just `.method`, `.url`, `.headers`
and `.body`. The Response is just `.status`, `.headers`, `.body` + some sugar getters
(like `res.ok`, `res.mime`)