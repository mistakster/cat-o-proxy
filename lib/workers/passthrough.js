exports = module.exports = function (proxy, request, response) {

  var proxyRequest = proxy.request(request.method, request.url, request.headers);

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
