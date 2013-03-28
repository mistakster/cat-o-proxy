var http = require('http');
var gm = require('gm');
var os = require('os');
var path = require('path');
var fs = require('fs');
var Promise = require('promise');


var samples = [
  "./samples/1.jpg",
  "./samples/2.jpg",
  "./samples/3.jpg",
  "./samples/4.jpg",
  "./samples/5.jpg",
  "./samples/6.jpg"
];


exports = module.exports = function transform(input, response) {

  new Promise(function (resolver) {

    var image = gm(input);

    identifyImage(image).then(function (value) {

      var stub = samples.shift();
      samples.push(stub);

      var sample = gm(stub)
        .scale(value.size.width, value.size.height, "^")
        .crop(value.size.width, value.size.height)
        .setFormat(value.format);

      if (value.color) {
        sample.colors(value.color);
      }

      renderImage(sample).then(resolver.fulfill, resolver.reject);

    }, function (err) {
      resolver.reject(err);
    });

  }).then(function (file) {
      // cleanup temporary file
      response.on('finish', function () {
        process.nextTick(function () {
          if (fs.existsSync(file.name)) {
            fs.unlinkSync(file.name);
          }
        });
      });
      // send all headers
      if (input.headers) {
        Object.keys(input.headers).forEach(function (key) {
          response.setHeader(key, input.headers[key]);
        });
      }
      // send new content length
      response.setHeader("content-length", file.size);
      // drain stream
      fs.createReadStream(file.name).pipe(response);

    }, function (err) {
      // handle all errors
      console.error(err);
      response.writeHead(500);
      response.end();
    });

};



function identifyImage(image) {
  return new Promise(function (resolver) {
    image.identify(function (err, value) {
      if (err) {
        resolver.reject(err);
      } else if (value.size) {
        resolver.reject(new Error("unknown image size"));
      } else {
        resolver.fulfill(value);
      }
    });
  });
}

function createTempName() {
  var time = process.hrtime();
  return path.join(os.tmpDir(), "catoproxy-" + time[0] + "-" + time[1] + ".tmp");
}

function renderImage(image) {

  var name = createTempName();

  return new Promise(function (resolser) {

    image.write(name, function (err) {
      if (err) {
        resolser.reject(err);
        return;
      }
      fs.stat(name, function (err, stats) {
        if (err) {
          resolser.reject(err);
          return;
        }
        resolser.fulfill({
          name: name,
          size: stats.size
        });
      });
    });

  });

}