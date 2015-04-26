var path = require('path');
var PATH_SEP = path.sep,
    dir_root = __dirname + PATH_SEP,
    dir_bin = dir_root + 'bin' + PATH_SEP,
    dir_public = dir_root + 'public' + PATH_SEP,
    dir_tests = dir_root + 'tests' + PATH_SEP;

// var config = require('./config.js');
var config = {};


/**
 * Directories
 * @type {Object}
 */
config.DIR = {
  ROOT: dir_root,
  BIN: dir_bin,
  TESTS: dir_tests,
  TESTS_LIB: dir_tests + 'lib' + PATH_SEP,
  TESTS_DATA: dir_tests + 'data' + PATH_SEP
};


/**
 * Configuration
 * @type {Object}
 */
module.exports = config;
