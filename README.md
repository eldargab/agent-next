#agent-next

The idea is simple:

  1. Lets create a function `send(req, cb)`.
  2. Lets say that request is `.url`, `.headers` and `.body`
  3. Lets say that response is `.status`, `.headers` and `.body`.

Given that:

```javascript
// cookie support? Easy!
function agent(req, cb) {
  setCookies(req)
  send(req, function(err, res) {
    saveCookies(res)
    cb(err, res)
  })
}

// redirects? Easy!
function aagent(req, cb) {
  agent(req, function(err, res) {
    if (isRedirect(res)) return aagent(redirectRequest(req, res), cb)
    cb(err, res)
  })
}

// Everything is easy.
```

## What this project gives?

1) Middlewares

  * cookies
  * redirects
  * unzip
  * body parser
  * serialize (support for JSON request bodies)
  * timeout
  * baseUrl (setup base url for all requests)
  * handler (normalize results, i.e. attach `req` to errors, etc)

2) `Request`, `Response` prototypes in the vein of [superagent](https://github.com/visionmedia/superagent)

3) `Agent` abstraction as an easy way to setup your `send` function and issueing requests with it.

## What advantages it has over other libs (like request or superagent)?

It is tremendously simpler and far more flexible.
For example, you can swap entire http implementation and still have
all advanced functionality available.

## Examples

basic

```javascript
var agent = require('agent-next')()
agent
.get('http://google.com/search/q=hello+world')
.end(function(err, res) {
  console.log(err || res.body)
})
```

advanced

```javascript
// Setup an agent specifically for the Github API from scratch
var Agent = require('agent-next')
var github = Agent.basic()
  .use(Agent.redirects(10))
  .use(Agent.unzip())
  .use(Agent.parser())
  .use(Agent.serialize())
  .use(Agent.baseUrl('https://api.github.com'))
  .use(function(req, send, cb) {
    req.headers['user-agent'] = 'test application'
    req.headers['accept'] = 'application/vnd.github.preview'
    send(req, function(err, res) {
      if (err) return cb(err)
      if (res.ok) return cb(null, res.body)
      cb(new Error(res.body.message))
    })
  })

// get some info about agent-next
github
.get('/repos/eldargab/agent-next')
.end(function(err, msg) {
  console.log(err || msg.description)
})
```

setup with options

```javascript
var Agent = require('agent-next')

// superagent like
var agent = Agent()

// tweak
var agent = Agent({
  cookies: true, // enable cookies
  unzip: false, // disable gzip support
  parser: fn, // set custom body parser
  timeout: 30000,
  baseUrl: 'http://example.com'
})
```

## Notes

  * Basic `send` function accepts strings, buffers and
  [simple streams](https://github.com/eldargab/stream-simple)
  as an request body.
  * Response body is a simple stream (if not overrided by middleware)
  * `req.url` must be an instance of `Agent.Url` object, not a string or an arbitrary map.
  * You must always either consume, abort or dump response body, usually via middlewares.
  * Middlewares should always pass the response object, even on errors, i.e.
  always do `cb(err, res)`, not just `cb(err)`.

## Installation

via npm

```
npm install agent-next
```

## License

(The MIT License)

Copyright (c) 2013 Eldar Gabdullin <eldargab@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the 'Software'), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
