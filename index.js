var c = require('./lib/connector.js');
var config = require('./package.json').config;

if (!config) {
  throw new Error("config section is not defined in package.json");
}

c.listen(config.port);