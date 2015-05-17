/**
 * Convenience endpoint class providing a server and appropriate client class
 * for given methods. Supporting the the RPC pattern.
 *
 * @return {Endpoint}
 */
define([
  './Client',
  './Server',
  './adapter'
],
function(Client, Server) {
  'use strict';

  /**
   * Constructor.
   * @param {object} methods {@see Server.constructor()}.
   */
  var Endpoint = function(methods) {
    this.methods = methods;
  };

  var _proto = Endpoint.prototype;


  /**
   * Instantiating and connecting a Client class and setting all given
   * endpoint methods as methods for this object.
   * Returning a promise resolving on successful connection.
   *
   * @param  {object} cfg Configuration for the connection {url: ''}.
   * @return {Promise}
   */
  _proto.asClient = function(cfg) {
    if (!cfg || !cfg.url)
      throw new Error('InvalidArgumentException: Missing "url" property.');

    var methods = this.methods,
        client = new Client();

    for (var name in methods) {
      if (!methods.hasOwnProperty(name))
        continue;

      client[name] = this._buildClientMethod(client, name);
    }

    var ws = client.__createConnection(cfg.url);

    return new Promise(function(resolve, reject) {
      ws.on('open', function() {
        resolve(client);
      });
    });
  };


  /**
   * Instantiating and launching a Server class with the given methods as
   * remote methods.
   *
   * @param  {object} cfg Configuration for the server.
   * @return {Server}
   */
  _proto.asServer = function(cfg) {
    var methods = this.methods,
        server = new Server(this.methods);

    server.createServer(cfg);
    return server;
  };


  /**
   * Returning a function which will do a remote procedure call with the
   * given client and method name.
   *
   * @param  {Client} client
   * @param  {string} name Remote method name.
   * @return {function}
   */
  _proto._buildClientMethod = function(client, name) {
    return function() {
      return this.__execute.apply(client, [
        name,
        Array.prototype.slice.call(arguments)
      ]);
    }
  };

  return Endpoint;

});
