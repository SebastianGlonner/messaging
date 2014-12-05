/**
 * JSON serializer
 */
define(function() {
  var Parser = {};


  /**
   * Do serialze to JSON string.
   * @param {string} message The message to parse.
   * @return {mixed} Parsed object
   */
  Parser.parse = function(message) {
    return JSON.parse(message);
  };


  return Parser;
});
