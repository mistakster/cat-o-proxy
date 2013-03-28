var http = require('http');
var url = require('url');
var gm = require('gm');


var samples = [
  "./samples/1.jpg",
  "./samples/2.jpg",
  "./samples/3.jpg",
  "./samples/4.jpg",
  "./samples/5.jpg",
  "./samples/6.jpg"
];


exports = module.exports = function (request, response) {

  var options = url.parse(request.url);
  options.method = request.method;
  options.headers = request.headers;

  var proxyRequest = http.request(request.url);

  proxyRequest.on('response', function (proxyResponse) {
    response.setHeader("via", "cat-o-proxy");
    if (proxyResponse.statusCode == 200) {
      transform(proxyResponse, response);
    } else {
      response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
      proxyResponse.pipe(response);
    }
  });

  request.pipe(proxyRequest);

};


function transform(input, response) {

  var image = gm(input);

  image.identify(function (err, value) {

    if (err || !value.size) {
      response.writeHead(500);
      response.write(JSON.stringify(err || "unknown image size"));
      response.end();
      return;
    }

    var stub = samples.shift();
    samples.push(stub);

    var sample = gm(stub)
      .scale(value.size.width, value.size.height, "^")
      .crop(value.size.width, value.size.height)
      .type(value.Type);

    if (value.color) {
      sample.colors(value.color);
    }

    sample.stream(value.format, function (stdin, stderr) {
      if (stdin) {
        stdin.pipe(response);
      }
      if (stderr) {
        stderr.pipe(response);
      }
    });

  });
}
