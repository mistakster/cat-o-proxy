var gm = require('gm');
var imageMagick = gm.subClass({ imageMagick: true });

var fs = require('fs');

var samples = [
  "./samples/1.jpg",
  "./samples/2.jpg",
  "./samples/3.jpg",
  "./samples/4.jpg",
  "./samples/5.jpg",
  "./samples/6.jpg"
];


exports = module.exports = function (proxy, request, response) {

  var proxyRequest = proxy.request(request.method, request.url, request.headers);

  var name = createFileName();
  var out = createWriteStream(name);

  proxyRequest.addListener('response', function (proxyResponse) {
    proxyResponse.addListener('data', function(chunk) {
      out.write(chunk);
    });
    proxyResponse.addListener('end', function() {
      out.end();
      transform(name, response);
    });
    response.writeHead(proxyResponse.statusCode);
  });

  request.addListener('data', function(chunk) {
    proxyRequest.write(chunk, 'binary');
  });

  request.addListener('end', function() {
    proxyRequest.end();
  });

};

function createFileName() {
  var time = process.hrtime();
  var dir = process.env.TEMP + "/cat-o-proxy";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  return dir + "/" + time[0] + time[1];
}

function createWriteStream(name) {
  return fs.createWriteStream(name);
}


function transform(name, response) {
  var image = imageMagick(name).identify(function (err, value) {

    if (!value || !value.size || value.size.width < 30 || value.size.height < 30) {
      drain(name, response, function () {
        fs.unlinkSync(name);
      });
      return;
    }

    var stub = samples.shift();
    samples.push(stub);

    var sample = imageMagick(stub)
      .scale(value.size.width, value.size.height, "^")
      .crop(value.size.width, value.size.height)
      .setFormat(value.format)
      .type(value.Type);

    if (value.color) {
      sample.colors(value.color);
    }

    var processed = name + "-p." + value.format.toLowerCase();

    sample.write(processed, function () {
      drain(processed, response, function () {
        fs.unlinkSync(processed);
        fs.unlinkSync(name);
      });
    });

  });
}

function drain(name, response, end) {
  if (end) {
    response.on("finish", function () {
      process.nextTick(end);
    });
  }
  var input = fs.createReadStream(name);
  input.pipe(response);
}