/**
 * Representing a message send over the wire. Providing convenience methods
 * for parsing, serializing and giving an interface for the various parameters
 * of that messages.
 *
 * @return {Message}
 */
define(function() {
  'use strict';

  var MSGKEY_ID = '_id',
      MSGKEY_ERROR = 'error',
      MSGKEY_ERROR_CODE = 'ecode',
      MSGKEY_EXCEPTION = 'exception',
      MSGKEY_RESULT = 'result',
      MSGKEY_EXEC = '_exec',
      MSGKEY_EXEC_ARGS = '_eargs';


  var Message = function(objMsg) {
    this.obj = objMsg || {};
  };

  var prototype = Message.prototype;

  prototype.getExecutionMethodName = function() {
    return this.obj[MSGKEY_EXEC];
  };

  prototype.setExecutionMethodName = function(strMethodName) {
    this.obj[MSGKEY_EXEC] = strMethodName;
    return this;
  };

  prototype.getExecutionArguments = function() {
    return this.obj[MSGKEY_EXEC_ARGS];
  };

  prototype.setExecutionArguments = function(arrArgs) {
    this.obj[MSGKEY_EXEC_ARGS] = Array.isArray(arrArgs) ? arrArgs : [arrArgs];
    return this;
  };

  prototype.getInternalId = function() {
    return this.obj[MSGKEY_ID];
  };

  prototype.setInternalId = function(strId) {
    this.obj[MSGKEY_ID] = strId;
    return this;
  };

  prototype.getErrorText = function() {
    return this.obj[MSGKEY_ERROR];
  };

  prototype.setErrorText = function(strError) {
    this.obj[MSGKEY_ERROR] = strError;
    return this;
  };

  prototype.getErrorCode = function() {
    return this.obj[MSGKEY_ERROR_CODE];
  };

  prototype.setErrorCode = function(strErrorCode) {
    this.obj[MSGKEY_ERROR_CODE] = strErrorCode;
    return this;
  };

  prototype.getException = function() {
    return this.obj[MSGKEY_EXCEPTION];
  };

  prototype.setException = function(objException) {
    this.obj[MSGKEY_EXCEPTION] = objException;
    return this;
  };

  prototype.getResult = function() {
    return this.obj[MSGKEY_RESULT];
  };

  prototype.setResult = function(mixedResult) {
    this.obj[MSGKEY_RESULT] = mixedResult;
    return this;
  };

  /**
   * Do serialize to plain wire format.
   * @param {mixed} obj The obj to serialize.
   * @return {string} Serialized object
   */
  prototype.toPlain = function() {
    return JSON.stringify(this.obj);
  };

  /**
   * Create message from plain wire format.
   * @param  {string} plainMsg
   * @return {Message}
   */
  Message.fromPlain = function(plainMsg) {
    return new Message(JSON.parse(plainMsg));
  };

  Message.fromObject = function(objMsg) {
    return new Message(objMsg);
  };

  return Message;
});
