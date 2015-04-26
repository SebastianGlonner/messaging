var config = require('../setup.js');

require(config.DIR.TESTS_LIB + 'minjector');

define.config({
  baseUrl: config.DIR.ROOT,
  noGlobalAmdProperty: true
});


/**
 * Configuration
 * @type {Object}
 */
module.exports = config;
