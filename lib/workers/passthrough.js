var http = require('http');
var url = require('url');

exports = module.exports = function (request, response) {

  var options = url.parse(request.url);
  options.method = request.method;
  options.headers = request.headers;

  var proxyRequest = http.request(options);

  proxyRequest.on('response', function (proxyResponse) {
    response.setHeader("via", "cat-o-proxy");
    response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
    proxyResponse.pipe(response);
  });

  proxyRequest.on('error', function (err) {
    console.log(err);
  });

  request.pipe(proxyRequest);

};
