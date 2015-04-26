/**
 * Convenience builder for messages.
 *
 * @return {object}
 */
define([
  './codes',
  './Message'
],
function(codes, Message) {
  'use strict';

  var builder = {};

  /**
   * Build error message object
   * @param  {string} errorCode Error code.
   * @param  {mixed} exception (Optionial) Error string or Error object to
   * explain the errorCode with more details.
   * @param  {string} _id (Optionial)
   * @return {Message}
   */
  builder.composeError = function(errorCode, exception, _id) {
    var objMsg = new Message(),
        error = codes[errorCode];

    if (error)
      objMsg.setErrorText(error);

    objMsg.setErrorCode(errorCode);

    if (exception instanceof Error) {
      console.error(exception.stack);
      objMsg.setException({
        'name': exception.name,
        'message': exception.message,
        'stack' : exception.stack
      });
    } else if (exception != null) {
      objMsg.setException(exception);
    }

    if (_id != null)
      objMsg.setInternalId(_id);

    return objMsg;
  };


  /**
   * Build standard result message.
   * @param  {object} resultParam
   * @param  {string} _id
   * @return {Message}
   */
  builder.composeResult = function(resultParam, _id) {
    return new Message()
      .setResult(resultParam)
      .setInternalId(_id);
  };


  /**
   * Build standard RPC message.
   * @param  {string} methodName
   * @param  {string} _id
   * @param  {mixed} args
   * @return {Message}
   */
  builder.composeExecution = function(methodName, _id, args) {
    var msg = new Message()
      .setExecutionMethodName(methodName)
      .setInternalId(_id);

    if (args !== undefined)
      msg.setExecutionArguments(args);

    return msg;
  };

  return builder;
});
