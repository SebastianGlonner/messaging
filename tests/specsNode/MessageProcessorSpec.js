describe('Message processor', function() {
  var MessageHandlerMock = {
    fooString: function() {
      return 'bar';
    },

    fooBoolean: function() {
      return false;
    },

    fooArray: function() {
      return ['test1', 'test2'];
    },

    fooObject: function() {
      return {'test': 1};
    },

    fooArgument: function(arg) {
      return arg;
    },

    fooInteger: function() {
      return 178;
    }

    // fooEnforce: {
    //   arguments: [
    //     // argKey, argType, argRequired, argDefault
    //     ['myName', 'string', true]
    //   ],
    //   execute: function() {

    //   }
    // }
  };

  var config = require(process.cwd() + '/bootstrap.js');
  var Messaging = require(config.DIR.ROOT);

  var parser = new Messaging.Parser();
  var serializer = new Messaging.Serializer();

  var codes = Messaging.Codes;
  var mp = new Messaging.Processor(MessageHandlerMock);

  beforeEach(function() {

  });

  it('can be initialized', function() {
    expect(typeof mp).toBe('object');
    expect(typeof mp.process).toBe('function');
  });

  it('return error message on invalid json', function() {
    var message = 'invalid json';
    var result = parser.parse(mp.process(message));
    expect(typeof result).toBe('object');
    expect(typeof result.error).toBe('string');
    expect(result.code).toBe(1);

    expect(typeof result.exception).toBe('object');
    expect(result.exception.name).toBe('SyntaxError');
    expect(typeof result.exception.message).toBe('string');
  });

  it('return error message if message handler function not exists', function() {
    var message = '{"execute": "fooUnde", "arguments":[true]}';
    var serialized = mp.process(message);
    var result = parser.parse(serialized);

    expect(typeof result).toBe('object');
    expect(typeof result.error).toBe('string');
    expect(result.code).toBe(2);

    expect(typeof result.exception).toBe('undefined');
  });

  it('return error message if message missing "execute" key', function() {
    var message = '{"executed": "fooUnde", "arguments":[true]}';
    var serialized = mp.process(message);
    var result = parser.parse(serialized);

    expect(typeof result).toBe('object');
    expect(typeof result.error).toBe('string');
    expect(result.code).toBe(3);

    expect(typeof result.exception).toBe('undefined');
  });

  describe('handle execution results', function() {
    it('of type string', function() {
      var message = '{"execute": "fooString"}';
      var result = parser.parse(mp.process(message));
      expect(result.result).toBe('bar');
    });

    it('of type string', function() {
      var message = '{"execute": "fooInteger"}';
      var result = parser.parse(mp.process(message));
      expect(result.result).toBe(178);
    });

    it('of type boolean', function() {
      var message = '{"execute": "fooBoolean"}';
      var result = parser.parse(mp.process(message));
      expect(result.result).toBe(false);
    });

    it('of type array', function() {
      var message = '{"execute": "fooArray"}';
      var serialized = mp.process(message);
      var result = parser.parse(serialized);
      expect(result.result).toContain('test2');
    });

    it('of type object', function() {
      var message = '{"execute": "fooObject"}';
      var serialized = mp.process(message);
      var result = parser.parse(serialized);
      expect(result.result).toEqual(jasmine.objectContaining({
        'test': 1
      }));
    });
  });

  describe('correctly transports arguments', function() {
    it('of type string', function() {
      var message = '{"execute": "fooArgument", "arguments":["myString"]}';
      var result = parser.parse(mp.process(message));
      expect(result.result).toBe('myString');
    });
    it('of type integer', function() {
      var message = '{"execute": "fooArgument", "arguments":[105]}';
      var result = parser.parse(mp.process(message));
      expect(result.result).toBe(105);
    });

    it('of type boolean', function() {
      var message = '{"execute": "fooArgument", "arguments":[false]}';
      var result = parser.parse(mp.process(message));
      expect(result.result).toBe(false);
    });

    it('of type array', function() {
      var message = '{"execute": "fooArgument", "arguments":[["te","test2"]]}';
      var serialized = mp.process(message);
      var result = parser.parse(serialized);
      expect(result.result).toContain('test2');
    });

    it('of type object', function() {
      var message = '{"execute": "fooArgument", "arguments":[' +
          '{"t":"hm", "test":1}]}';

      var serialized = mp.process(message);
      var result = parser.parse(serialized);
      expect(result.result).toEqual(jasmine.objectContaining({
        'test': 1
      }));
    });
  });

  // describe('can handle MessageHandler argument descriptions', function() {
  //   it('throws error on invalid arguments', function() {
  //     var message = '{"execute": "fooEnforce", "arguments":["myString"]}';
  //     var result = parser.parse(mp.process(message));
  //     expect(result.result).toBe('myString');
  //   });
  // });

});
