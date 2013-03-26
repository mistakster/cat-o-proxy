var http = require('http');
var url = require('url');

var workers = {
  'passthrough': require('./workers/passthrough.js'),
  'image': require('./workers/image.js')
};

var connector = http.createServer(function(request, response) {
  var requestUrl = url.parse(request.url);

  var proxy = http.createClient(requestUrl.port, requestUrl.hostname);

  if (/.*(jpeg|jpg|png|gif)$/.test(requestUrl.pathname)) {
    workers.image(proxy, request, response);
  } else {
    workers.passthrough(proxy, request, response);
  }

});

exports = module.exports = connector;
