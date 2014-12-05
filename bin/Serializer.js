/**
 * JSON serializer
 */
define(function() {
  var Serializer = {};

  /**
   * Do serialze to JSON string.
   * @param {mixed} obj The obj to serialize.
   * @return {string} Serialized object
   */
  Serializer.serialize = function(obj) {
    return JSON.stringify(obj);
  };


  /** */
  return Serializer;
});
