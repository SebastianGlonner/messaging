/**
 * Builder for messages.
 * @param {object} ws
 */
define(['./codes'], function(codes) {
  var Builder = {};


  /**
   * Build and error message object
   * @param  {string} errorCode Error code.
   * @param  {mixed} err (Option) Error object.
   * @return {object}
   */
  Builder.composeError = function(errorCode, err, _id) {
    var obj = {}, error = codes[errorCode];
    if (error)
      obj.error = error;

    obj.code = errorCode;

    if (err instanceof Error) {
      console.error(err);
      obj.exception = {
        'name': err.name,
        'message': err.message,
        'stack' : err.stack
      };
    } else if (err !== undefined) {
      obj.exception = err;
    }

    obj._id = _id;

    return obj;
  };


  /**
   * Build and standard result message.
   * @param  {object} resultParam
   * @return {object}
   */
  Builder.composeResult = function(resultParam, _id) {
    return {
      result: resultParam,
      _id: _id
    };
  };


  /**
   * Build and standard result message.
   * @param  {object} resultParam
   * @return {object}
   */
  Builder.composeExecution = function(method, args, _id) {
    if (!Array.isArray(args))
      args = [args];

    return {
      _execute: method,
      _arguments: args,
      _id: _id
    };
  };

  return Builder;
});
