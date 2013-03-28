var http = require('http');
var url = require('url');
var gm = require('gm');
var os = require('os');
var path = require('path');
var fs = require('fs');


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

  proxyRequest.on('error', function (err) {
    console.log(err);
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
      .setFormat(value.format);

    if (value.color) {
      sample.colors(value.color);
    }

    writeImage(sample, response);

  });
}


function writeImage(image, output) {
  var time = process.hrtime();
  var name = path.join(os.tmpDir(), "catoproxy-" + time[0] + "-" + time[1] + ".tmp");

  image.write(name, function (err) {
    if (err) {
      console.log(err);
      output.end();
    }

    output.on('finish', function () {
      process.nextTick(function () {
        fs.unlinkSync(name);
      });
    });

    fs.createReadStream(name).pipe(output);
  });

}