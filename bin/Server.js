/**
 * WebSocketServer wrapper handling incomming messages by invoking the
 * appropriate given methods and sending a response message (RPC).
 *
 * @return {Server}
 */
define([
  './Builder',
  './Message'
],
function(builder, Message) {
  'use strict';

  var InvalidMethodArgumentsError = function(msg, code) {
    this.name = 'InvalidMethodArgumentsError';
    this.message = msg;
    this.stack = (new Error(msg)).stack;
    this.errCode = code || 1004;
  };
  InvalidMethodArgumentsError.prototype = Object.create(Error.prototype);
  InvalidMethodArgumentsError.prototype
      .constructor = InvalidMethodArgumentsError;

  /**
   * Constructor.
   * @param {object} methods The methods which will be callable remotely by
   * clients.
   */
  var Server = function(methods) {
    this.initMethods(methods);
  };


  var _proto = Server.prototype;


  /**
   * Initialize the remote callable methods.
   * Ensure proper structure of the methods handlers and arguments.
   *
   * @param {object} methods
   */
  _proto.initMethods = function(methods) {
    var args, handler, method;
    for (var name in methods) {
      if (!methods.hasOwnProperty(name))
        continue;

      method = methods[name];
      if (typeof method === 'function') {
        handler = method;
        args = undefined;
      } else {
        args = method[0];
        handler = method[1];
        if (typeof args === 'function') {
          // support different order
          handler = args;
          args = method[1];
        }
      }

      if (Array.isArray(args))
        args = this.initArgsParams(args);
      else
        args = undefined;

      methods[name] = [handler, args];
    }
    this.methods = methods;
  };


  /**
   * Initialize the arguments array of the remote callable methods.
   * Ensure every argument is an array on its own.
   * Default value is optional.
   *
   * @param  {array} args
   */
  _proto.initArgsParams = function(args) {
    var i = 0, l = args.length, arg;
    for (; i < l; i++) {
      arg = args[i];
      if (!Array.isArray(arg))
        args[i] = [arg];
    }

    return args;
  };


  /**
   * Apply default values and types to the given arguments.
   * @param {array} args (Reference) The args to apply to (will be mutated).
   * @param {array} argDef The arg definitions.
   */
  _proto.enforceArgs = function(args, argDef) {
    var def, arg, defaultValue;
    for (var i = 0, l = argDef.length; i < l; i++) {
      def = argDef[i];
      arg = args[i];

      if (arg == null) {
        defaultValue = def[1];
        if (defaultValue === undefined)
          throw new InvalidMethodArgumentsError('arg[' + i + '] is missing', 1005);

        arg = defaultValue;
      } else {
        switch (def[0]) {
          case 'ANY':
            break;


          case 'int':
          case 'integer':
            arg = parseInt(arg);
            if (Number.isNaN(arg)) {
              throw new InvalidMethodArgumentsError('arg[' + i + '] "' + args[i] + '" is no integer');
            }

            break;


          case 'float':
            arg = parseFloat(arg);
            if (Number.isNaN(arg))
              throw new InvalidMethodArgumentsError('arg[' + i + '] "' + args[i] + '" is no floating point');

            break;


          case 'bool':
          case 'boolean':
            if (typeof arg !== 'boolean')
              throw new InvalidMethodArgumentsError('arg[' + i + '] "' + args[i] + '" is no boolean value');

            break;


          case 'string':
            arg = '' + arg;
            break;


          case 'array':
            if (!Array.isArray(arg))
              throw new InvalidMethodArgumentsError('arg[' + i + '] "' + arg + '" is no array');

            break;


          case 'object':
            // Obviously this is no very strict isObject like check,
            // but at the moment this is enough. Since [functions] cant get
            // transported with JSON
            if (typeof arg !== 'object' || Array.isArray(arg))
              throw new InvalidMethodArgumentsError('arg[' + i + '] "' + args[i] + '" is no object');

            break;


          default:
              throw new InvalidMethodArgumentsError('arg[' + i + '] "' + def[0] + '" is no allowed argument type');
        }
      }

      args[i] = arg;
    }
  };


  /**
   * Start listening for the messages of a sepecific WebSocket connection.
   *
   * @param  {WebSocket} webSocket
   */
  _proto.listen = function(webSocket) {
    this.webSocket = webSocket;
    var self = this;
    webSocket.on('message', function(plainMessage) {
      try {
        var objMsg = self.process(plainMessage);
        if (objMsg instanceof Promise) {
          objMsg.then(function(objMsg) {
            webSocket.send(objMsg.toPlain());

          });
        } else
          webSocket.send(objMsg.toPlain());

      } catch (e) {
        console.log('Error processing message on server side: ' + e + '\n' + e.stack);
      }
    });
  };


  /**
   * Cached property of the WebSocketServer class for instantiation.
   * @type {WebSocketServer}
   */
  _proto.NodeJsWebSocketServerClazz = require('ws').Server;


  /**
   * Creating a WebSocketServer instance.
   * @param  {object} cfg
   * @return {WebSocketServer}
   */
  _proto.createServer = function(cfg) {
    var _this = this,
        webSocketServer = this.webSocketServer =
            new this.NodeJsWebSocketServerClazz(cfg);

    webSocketServer.on('connection', function(webSocket) {
      // NOTE: this.wss != serverWs
      _this.listen(webSocket);
    });

    return webSocketServer;
  };


  /**
   * Process a plain message by invoking the containing method and sending
   * a message back with the result of that very method.
   *
   * @param  {string} plainMessage
   * @return {Message}
   */
  _proto.process = function(plainMessage) {
    var objMsg = null,
        internalId,
        executionMethodName,
        executionMethodArgs,
        methodDefinition,
        methodFunction,
        methodArgsDef,
        execResult;

    try {
      objMsg = Message.fromPlain(plainMessage);
    } catch (e) {
      return builder.composeError(1001, e);
    }

    internalId = objMsg.getInternalId();
    if (internalId == null)
      internalId = undefined;

    executionMethodName = objMsg.getExecutionMethodName();

    if (executionMethodName === undefined) {
      return builder.composeError(1003, undefined, internalId);
    }

    methodDefinition = this.methods[executionMethodName];
    methodFunction = methodDefinition[0];
    methodArgsDef = methodDefinition[1];

    if (typeof methodFunction !== 'function') {
      return builder.composeError(1002, undefined, internalId);
    }

    try {
      executionMethodArgs = objMsg.getExecutionArguments();
      if (executionMethodArgs !== undefined && methodArgsDef) {
        // Mutating executionMethodArgs
        this.enforceArgs(executionMethodArgs, methodArgsDef);
      }

      execResult = methodFunction.apply(this, executionMethodArgs);

      if (execResult instanceof Promise) {
        return execResult.then(function(functionResult) {
          return builder.composeResult(
              functionResult,
              internalId
          );
        }).catch (function(err) {
          return builder.composeError(
              5005,
              err,
              internalId
          );
        });
      } else {
        return builder.composeResult(
            execResult,
            internalId
        );
      }

    } catch (e) {
      if (e instanceof InvalidMethodArgumentsError) {
        return builder.composeError(e.errCode, e, internalId);
      }

      return builder.composeError(5005, e, internalId);
    }
  };


  /**
   * Close this WebSocketServer connection.
   */
  _proto.close = function() {
    this.webSocketServer.close();
  };

  return Server;

});
