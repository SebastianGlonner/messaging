describe('Messaging server initialization', function() {

  require(process.cwd() + '/setup.js');

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

  var clientApi, serverApi;

  beforeAll(function(done) {

    define(['./bin/Endpoint'], function(Endpoint) {
      //
      // Defining an endpoint with various methods
      //
      var endpoint = new Endpoint({


        noArgs: function() {
          return 'noArgs';
        },


        checkTypes: [
          function() {},
          ['int', 'integer', 'float', 'bool', 'boolean', 'string', 'array',
            'object']
        ],


        withDefaults: [
          function() {},
          ['int', ['int', 5]]
        ],


        parsingFails: [
          function() {},
          ['int']
        ],


        hasNoDefaultForMissingArg: [
          function() {},
          ['int']
        ]


      });

      serverApi = endpoint.asServer({
        host: 'localhost',
        port: 3498
      });

      endpoint.asClient({'url': 'ws://localhost:3498'})
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

  describe('methods arguments', function() {



    it('can be omitted', function(done) {
      clientApi.noArgs()
          .then(function(res) {
            expect(res).toBe('noArgs');
            done();
          });
    });



    it('will be parsed properly', function(done) {
      var called = 0;
      spyOn(serverApi.methods.checkTypes, 0).and.callFake(
          function(varInt, varInteger, varFloat, varBool, varBoolean, varString, varArray, varObject) {
            expect(varInt).toBe(1);
            expect(varInteger).toBe(5123);
            expect(varFloat).toBe(1.3);
            expect(varBool).toBe(false);
            expect(varBoolean).toBe(true);
            expect(varString).toBe('999');
            expect(Array.isArray(varArray)).toBe(true);
            expect(varObject instanceof Object).toBe(true);

            called++;
          }
      );

      Promise.all([
        clientApi.checkTypes(1, 5123, 1.3, false, true, '999', [1], {'foo': 'bar'}),
        clientApi.checkTypes('1', '5123', '1.3', false, true, 999, [2], {'foo': 'bar'})
      ])
          .then(function() {
            expect(called).toBe(2);
            done();
          })
          .catch (function(err) {
            console.error(err);
          });
    });



    it('can have default values which will be applied for UNDEFINED params',
        function(done) {
          var called = 0;
          spyOn(serverApi.methods.withDefaults, 0).and.callFake(
              function(varInt, varDefault) {
                expect(varInt).toBe(1);
                expect(varDefault).toBe(5);

                called++;
              }
          );

          Promise.all([
            clientApi.withDefaults(1),
            clientApi.withDefaults(1, undefined)
          ])
              .then(function() {
                expect(called).toBe(2);
                done();
              })
              .catch (function(err) {
                console.error(err);
              });
        }
    );



    it('can hava multiple allowed types definitions.', function() {
      pending('TODO');
    });



    it('support string boolean definitions "false" | "FALSE" | "true" etc.',
        function() {
          pending('TODO');
        }
    );
  });





  describe('throws error if', function() {



    it('parsing results in incorrect type', function(done) {
      clientApi.parsingFails('t')
          .catch (
              function(err) {
                expect(err.obj.ecode).toBe(1004);
                done();
              }
          );

    });



    it('argument is missing and has no default value defined', function(done) {
      clientApi.hasNoDefaultForMissingArg()
          .catch (
              function(err) {
                expect(err.obj.ecode).toBe(1005);
                done();
              }
          );

    });
  });
});
