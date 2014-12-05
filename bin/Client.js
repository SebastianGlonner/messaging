define([
  './builder',
  './Serializer',
  './Parser'
],
function(builder, serializer, parser) {

  /**
   * [exports description]
   * @param {object} ws
   */
  var Client = function() {
    this.counter = 0;
    this.messages = [];
  };

  var addMessageListener;
  if (typeof WebSocket === 'function') {
    Client.prototype.WebSocketClazz = WebSocket;
    addMessageListener = function(instance, ws) {
      ws.onmessage = this.applyResponse.bind(instance);
    };
  }
  else if (typeof require === 'function') {
    Client.prototype.WebSocketClazz = require('ws');
    addMessageListener = function(instance, ws) {
      ws.on('message', function(message) {
        try {
          instance.applyResponse(message);
        } catch (e) {
          console.log('callee send error: ' + e + '\n' + e.stack);
        }
      });
    };

  } else
    throw Error('Can not detect WebSocket class in your environment!');

  Client.prototype.addMessageListener = addMessageListener;

  Client.prototype.listen = function(ws) {
    this.ws = ws;
    this.addMessageListener(this, ws);
  };

  Client.prototype.createConnection = function(url) {
    var ws = new this.WebSocketClazz(url);
    this.listen(ws);
    return ws;
  };


  Client.prototype.execute = function(method, args) {
    var ws = this.ws;
    var counter = this.counter++;
    var self = this;

    var promise = new Promise(function(resolve, reject) {
      var message = builder.composeExecution(method, args, counter);
      message = serializer.serialize(message);
      try {
        self.listenForResponse(counter, function(response) {
          resolve(response);
        });
        ws.send(message);
      } catch (e) {
        console.log('Client send error: ' + e);
      }
    });

    return promise;
  };

  Client.prototype.listenForResponse = function(counter, callback) {
    this.messages[counter] = callback;
  };

  Client.prototype.applyResponse = function(response) {
    if (typeof response === 'object' && response.data)
      response = response.data;

    response = parser.parse(response);

    if (response._id === undefined) {
      throw new Error('Invalid message: Missing required "_id"');
    }

    this.messages[response._id](response);
  };

  return Client;
});
