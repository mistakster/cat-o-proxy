var http = require('http');

exports = module.exports = function (request, response) {

  var proxyRequest = http.request(request.url);

  proxyRequest.addListener('response', function (proxyResponse) {
    proxyResponse.addListener('data', function(chunk) {
      response.write(chunk, 'binary');
    });
    proxyResponse.addListener('end', function() {
      response.end();
    });
    response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
  });

  request.addListener('data', function(chunk) {
    proxyRequest.write(chunk, 'binary');
  });

  request.addListener('end', function() {
    proxyRequest.end();
  });

};
