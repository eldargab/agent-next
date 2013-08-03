var http = require('http')

module.exports = function(app) {
  var server = http.createServer(app)
  server.listen(0)
  return 'http://127.0.0.1:' + server.address().port
}
