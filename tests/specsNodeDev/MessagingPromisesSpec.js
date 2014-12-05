describe('Messaging', function() {

  var MESSAGE_COUNT_PER_TEST = 50;

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;
  function getRandomTime(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  var COMMON = require(process.cwd() + '/bootstrap.js');
  require(COMMON.DIR.TESTS_LIB + 'minjector');
  Minjector.config({
    baseUrl: COMMON.DIR.ROOT
  });

  var clientApi, serverApi;

  beforeEach(function(done) {
    define(['bin/Client', 'bin/Server'], function(Client, Server) {
      var MockupClientApi = function() {};
      MockupClientApi.prototype = new Client();
      MockupClientApi.prototype.someApiMethod = function(i) {
        return this.execute('someApiMethod', i);
      };
      MockupClientApi.prototype.someUnPromisedApiMethod = function(i) {
        return this.execute('someUnPromisedApiMethod', i);
      };

      var MockupServerApi = function() {};
      MockupServerApi.prototype = new Server();
      MockupServerApi.prototype.someApiMethod = function(i) {
        return new Promise(function(resolve, reject) {
          // fake unorded responses
          setTimeout(function() {
            resolve('someApiAnswer' + i);
          }, getRandomTime(1000, 4000));
        });
      };

      MockupServerApi.prototype.someUnPromisedApiMethod = function(i) {
        return 'someUnPromisedApiMethod' + i;
      };

      clientApi = new MockupClientApi();
      serverApi = new MockupServerApi();

      serverApi.createServer({
        host: 'localhost',
        port: 3497
      });
      var ws = clientApi.createConnection('ws://localhost:3497');
      ws.on('open', function() {
        done();
      });
    });
  });

  afterEach(function() {
    serverApi.close();
  });

  describe('works with promises', function() {
    xit('can NOT call internal methods', function() {
    });

    xit('can override internal methods', function() {
    });

    it('responses asynchron on message', function(done) {
      var fThrow = function() {
        throw new Error('message failed');
      };

      var res = [], i;

      for (i = 0; i < MESSAGE_COUNT_PER_TEST; i++) {
        (function(closureI) {
          var promise = clientApi.someApiMethod(i);
          res.push(promise);
          promise.then(function(response) {
            res['someApiAnswer' + closureI] = true;
            expect(response.result).toBe('someApiAnswer' + closureI);
          }, fThrow);

        })(i);
      }

      Promise.all(res).then(function() {
        done();
      });

    });

    it('without return promise on server side', function(done) {
      var fThrow = function() {
        throw new Error('message failed');
      };

      var res = [], i;

      for (i = 0; i < MESSAGE_COUNT_PER_TEST; i++) {
        (function(closureI) {
          var promise = clientApi.someUnPromisedApiMethod(i);
          res.push(promise);
          promise.then(function(response) {
            res['someUnPromisedApiMethod' + closureI] = true;
            expect(response.result).toBe('someUnPromisedApiMethod' + closureI);
          }, fThrow);

        })(i);
      }

      Promise.all(res).then(function() {
        done();
      });

    });
  });

});
