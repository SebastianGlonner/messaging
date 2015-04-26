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


  /**
   * Constructor.
   * @param {object} methods The methods which will be callable remotely by
   * clients.
   */
  var Server = function(methods) {
    this.methods = methods;
  };


  /**
   * Start listening for the messages of a sepecific WebSocket connection.
   *
   * @param  {WebSocket} webSocket
   * @return {[type]}
   */
  Server.prototype.listen = function(webSocket) {
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
        console.log('Server send error: ' + e + '\n' + e.stack);
      }
    });
  };


  /**
   * Cached property of the WebSocketServer class for instantiation.
   * @type {WebSocketServer}
   */
  Server.prototype.NodeJsWebSocketServerClazz = require('ws').Server;


  /**
   * Creating a WebSocketServer instance.
   * @param  {object} cfg
   * @return {WebSocketServer}
   */
  Server.prototype.createServer = function(cfg) {
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
  Server.prototype.process = function(plainMessage) {
    var objMsg = null,
        internalId,
        executionMethodName,
        executionMethodArgs,
        parsedArgs,
        methodFunction,
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

    methodFunction = this.methods[executionMethodName];

    if (typeof methodFunction !== 'function') {
      return builder.composeError(1002, undefined, internalId);
    }

    executionMethodArgs = objMsg.getExecutionArguments();
    if (executionMethodArgs !== undefined) {
      parsedArgs = executionMethodArgs;

      // TODO parse arguments (int, string etc.)
    }

    try {
      execResult = methodFunction.apply(this, parsedArgs);

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
      return builder.composeError(
          5005,
          err,
          internalId
      );
    }
  };


  /**
   * Close this WebSocketServer connection.
   */
  Server.prototype.close = function() {
    this.webSocketServer.close();
  };

  return Server;

});
