describe('Messaging', function() {

  var MESSAGE_COUNT_PER_TEST = 150;
  var MESSAGES_RESPONSE_TIME_INTERVALL_MIN = 1000;
  var MESSAGES_RESPONSE_TIME_INTERVALL_MAX = 5000;

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 3 * MESSAGES_RESPONSE_TIME_INTERVALL_MAX + 1000;

  function getRandomTime() {
    return Math.floor(Math.random() * (MESSAGES_RESPONSE_TIME_INTERVALL_MIN -
        MESSAGES_RESPONSE_TIME_INTERVALL_MAX + 1)) +
        MESSAGES_RESPONSE_TIME_INTERVALL_MAX;
  }

  require(process.cwd() + '/setup.js');

  var clientApi, serverApi;

  beforeAll(function(done) {
    define(['./bin/Endpoint'], function(Endpoint) {
      var endpoint = new Endpoint({
        someApiMethod: function(figure) {
          return new Promise(function(resolve, reject) {
            // fake unorded responses
            setTimeout(function() {
              resolve('someApiAnswer' + figure + 'test1');
            }, getRandomTime());
          });
        },
        someUnPromisedApiMethod: function(figure) {
          return 'someUnPromisedApiMethod' + figure + 'test2';
        }
      });

      serverApi = endpoint.asServer({
        host: 'localhost',
        port: 3497
      });

      endpoint.asClient({'url': 'ws://localhost:3497'})
        .then(function(c) {
            clientApi = c;
            done();
        });

    });
  });

  afterAll(function() {
    if (serverApi)
      serverApi.close();
  });

  describe('works with promises', function() {
    it('responses asynchron on message', function(done) {
      var res = [];
      var resultCounter = 0;

      var callDelayed = function(figure) {
        return new Promise(function(resolve) {
          setTimeout(function() {
            return clientApi.someApiMethod(figure)
              .then(function(response) {
                  resultCounter++;
                  expect(response).toBe('someApiAnswer' + figure + 'test1');
                  resolve();
              });
          }, getRandomTime());
        });
      };

      for (var i = 0; i < MESSAGE_COUNT_PER_TEST; i++) {
        res.push(callDelayed(getRandomTime()));
      }

      Promise.all(res).then(function() {
        expect(resultCounter).toBe(i);
        done();
      });

    });

    it('without return promise on server side', function(done) {
      var res = [];
      var resultCounter = 0;

      var callDelayed = function(figure) {
        return new Promise(function(resolve) {
          setTimeout(function() {
            return clientApi.someUnPromisedApiMethod(figure)
              .then(function(response) {
                  resultCounter++;
                  expect(response).toBe('someUnPromisedApiMethod' + figure + 'test2');
                  resolve();
              });
          }, getRandomTime());
        });
      };

      for (var i = 0; i < MESSAGE_COUNT_PER_TEST; i++) {
        res.push(callDelayed(getRandomTime()));
      }

      Promise.all(res).then(function() {
        expect(resultCounter).toBe(i);
        done();
      });

    });
  });

});
