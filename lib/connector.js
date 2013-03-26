var http = require('http');
var url = require('url');

var workers = {
  'passthrough': require('./workers/passthrough.js'),
  'image': require('./workers/image.js')
};

var connector = http.createServer(function(request, response) {
  var requestUrl = url.parse(request.url);

  if (/.*(jpeg|jpg|png|gif)$/.test(requestUrl.pathname)) {
    workers.image(request, response);
  } else {
    workers.passthrough(request, response);
  }

});

exports = module.exports = connector;
