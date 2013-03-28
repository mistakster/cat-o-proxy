var http = require('http');
var url = require('url');
var transform = require('./transform.js');


var pathNamePattern = /.+\.(png|gif|jpg|jpeg)$/;

function extractType(pathname) {
  var m = (pathname || "").match(pathNamePattern);
  return (m && m.length == 2) ? m[1] : null;
}

exports = module.exports = http.createServer(function(request, response) {

  var options = url.parse(request.url);
  options.method = request.method;
  options.headers = request.headers;

  var imageType = extractType(options.pathname);

  var proxyRequest = http.request(options);

  proxyRequest.on('response', function (proxyResponse) {
    response.setHeader("via", "cat-o-proxy");
    if (imageType && proxyResponse.statusCode == 200) {
      transform(proxyResponse, response);
    } else {
      response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
      proxyResponse.pipe(response);
    }
  });

  proxyRequest.on('error', function (err) {
    console.error(err);
    response.writeHead(500);
    response.end();
  });

  request.pipe(proxyRequest);

});
