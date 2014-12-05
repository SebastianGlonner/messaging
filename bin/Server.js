/**
 * Node.js only module!
 *
 * @type {[type]}
 */

/**
 *
 */
define([
  './Builder',
  './Codes',
  './Serializer',
  './Parser'
],
function(builder, errorCodes, serializer, parser) {

  /**
   * [exports description]
   * @param {object} ws
   */
  var Server = function() {};

  Server.prototype.listen = function(ws) {
    this.ws = ws;
    var self = this;
    ws.on('message', function(message) {
      try {
        self.process(message, function(resultMessage) {
          ws.send(resultMessage);
        });
      } catch (e) {
        console.log('Server send error: ' + e + '\n' + e.stack);
      }
    });
  };


  Server.prototype.NodeJsWebSocketServerClazz = require('ws').Server;

  Server.prototype.createServer = function(cfg) {
    this.wss = new this.NodeJsWebSocketServerClazz(cfg);

    this.wss.on('connection', function(serverWs) {
      // NOTE: this.wss != serverWs
      this.listen(serverWs);
    }.bind(this));

    return this.wss;
  };


  Server.prototype.process = function(message, sendCallback) {
    var objMessage = null;

    try {
      objMessage = parser.parse(message);
    } catch (e) {
      return serializer.serialize(builder.composeError(1001, e));
    }

    if (objMessage._execute === undefined) {
      return serializer.serialize(builder.composeError(1003));
    }

    var handlerFunction = this[objMessage._execute];

    if (handlerFunction === undefined) {
      return serializer.serialize(builder.composeError(1002));
    }

    var args = [];
    if (objMessage._arguments !== undefined) {
      args = objMessage._arguments;
    }

    var mixedResult = handlerFunction.apply(this, args);

    if (mixedResult instanceof Promise) {
      mixedResult.then(function(functionResult) {
        sendCallback(
            serializer.serialize(
                builder.composeResult(
                    functionResult,
                    objMessage._id
                )
            )
        );
      }).catch (function(err) {
        sendCallback(
            serializer.serialize(
                builder.composeError(
                    5005,
                    err,
                    objMessage._id
                )
            )
        );
      });
    } else {
      sendCallback(
          serializer.serialize(
              builder.composeResult(
                  mixedResult,
                  objMessage._id
              )
          )
      );
    }
  };

  Server.prototype.close = function(cfg) {
    this.wss.close();
  };

  return Server;

});
