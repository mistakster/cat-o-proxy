var os = require('os');
var path = require('path');
var fs = require('fs');


var DIR = "cat-o-proxy";


function name(dir) {
  var time = process.hrtime();
  return path.join(dir, time[0] + "-" + time[1] + ".tmp");
}

exports.createTempName = function (callback) {

  var dir = path.join(os.tmpDir(), DIR);

  fs.exists(dir, function (exists) {
    if (!exists) {
      fs.mkdir(dir, function () {
        callback(name(dir));
      });
    } else {
      callback(name(dir));
    }
  });

};
