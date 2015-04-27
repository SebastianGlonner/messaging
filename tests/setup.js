var config = require('../setup.js');

require(config.DIR.LIB + 'minjector');

define.config({
  baseUrl: config.DIR.ROOT,
  globalAmdProperty: false
});


/**
 * Configuration
 * @type {Object}
 */
module.exports = config;
