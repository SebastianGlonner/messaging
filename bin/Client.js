/**
 * Client wrapper for WebSocket's providing remote procedure call pattern.
 *
 * @return {Client}
 */
define([
  './builder',
  './Message'
],
function(builder, Message) {
  'use strict';

  /**
   * Constructor.
   */
  var Client = function() {
    this.counter = 0;
    this.messages = {};
  };

  var _prototype = Client.prototype;


  /**
   * Dynamic function adding listener to the WebSocket client for the
   * "message" event in dependence of the environment (Node, Browser).
   *
   */
  var addMessageListener;
  if (typeof WebSocket === 'function') {
    _prototype.__WebSocketClazz = WebSocket;
    addMessageListener = function(_this, webSocket) {
      webSocket.onmessage = this.__invokeResponseListener.bind(_this);
    };

  } else {
    _prototype.__WebSocketClazz = require('ws');
    addMessageListener = function(_this, webSocket) {
      webSocket.on('message', function(message, flag) {
        if (flag && flag.binary)
          throw new Error('Binary messages are not supported yet!');

        this.__invokeResponseListener(message);
      }.bind(_this));
    };

  }
  _prototype.__addMessageListener = addMessageListener;


  /**
   * Start listening for the given websocket messages.
   * @param  {WebSocket} webSocket
   */
  _prototype.__listenToWebsockets = function(webSocket) {
    this.webSocket = webSocket;
    this.__addMessageListener(this, webSocket);
  };


  /**
   * Create a connection to a WebSocket server.
   * @param  {string} url
   * @return {WebSocket}
   */
  _prototype.__createConnection = function(url) {
    var webSocket = new this.__WebSocketClazz(url);
    this.__listenToWebsockets(webSocket);
    return webSocket;
  };


  /**
   * Execute a remote method by sending an appropriate message and waiting
   * for the respective response.
   * @param  {string} method Remote method name.
   * @param  {array} args Remote method arguments
   * @return {Promise}
   */
  _prototype.__execute = function(method, args) {
    var webSocket = this.webSocket;
    var counter = ++this.counter;
    var _this = this;

    return new Promise(function(resolve, reject) {
      try {
        var objMsg = builder.composeExecution(method, counter, args);
        _this.__listenForResponse(counter, function(error, result) {
          if (error)
            reject(error);
          else
            resolve(result);
        });
        webSocket.send(objMsg.toPlain());
      } catch (e) {
        console.error(e.stack);
      }
    });
  };


  /**
   * Add listener callback for a specific RPC.
   * @param  {integer}  counter
   * @param  {Function} callback
   */
  _prototype.__listenForResponse = function(counter, callback) {
    this.messages[counter] = callback;
  };


  /**
   * Invoke the response listener for a specifc RPC.
   *
   * @param  {string} response The WebSocket message representing an response
   * for an specific RPC.
   */
  _prototype.__invokeResponseListener = function(response) {
    response = Message.fromPlain(response);
    var id = response.getInternalId();

    if (id === undefined) {
      throw new Error('Invalid message. Missing required "_id"');
    }

    var invokee = this.messages[id];
    if (invokee === undefined)
      throw new Error('Invalid invokee id. Can not invoke message with id: ' +
          id);

    this.messages[id] = undefined;
    invokee(
        response.getErrorText() ? response : undefined,
        response.getResult()
    );
  };

  return Client;
});
