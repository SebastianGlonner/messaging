var Builder = new (require('./Builder'))();
var ErrorCodes = require('./Codes.js');

var Serializer = new (require('./Serializer.js'))();
var Parser = new (require('./Parser.js'))();

/**
 * Process messages of JSON format.
 * Try calling the appropriate command from the local api.
 * @param {object} messageHandler Object which handles the messages.
 * @param {object} parser Object parsing the messages.
 * @param {object} serializer Object serializing the result object.
 * @return {object}
 */
var Processor = function(messageHandler, parser, serializer) {
  if (parser === undefined) {
    parser = Parser;
  }

  if (serializer === undefined) {
    serializer = Serializer;
  }

  var builder = Builder;

  return {


    processAsync: function(message, callback) {

    }
  };
};

module.exports = Processor;
