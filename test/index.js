"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

process.on('unhandledRejection', (reason, p) => {
  console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
  console.log(reason.stack);
});

var assert = require('assert');

global.ioc = function () {
  if (require('path').basename(__dirname) === 'test-src') {
    return require('../src/index');
  }
  return require('../lib/index');
}();

ioc.get('test').setBasePath(__dirname);

describe('module.basic', function () {
  it('should return module', function (done) {
    _asyncToGenerator(function* () {
      let module = yield ioc.get('test').module('modules/config').resolve();

      ioc.get('app').module('testt').set(ioc.createModule().module(function* () {
        return 'test';
      }));
      ioc.get('app').module('testt').set(ioc.createModule().module(function* () {
        return 'test';
      }));

      assert.equal(module, 'config ok');
      done();
    })();
  });
});

describe('module.asyncFunction', function () {
  it('should return module', function (done) {
    _asyncToGenerator(function* () {
      let module = yield ioc.get('test').module('modules/config-async-function').resolve();

      assert.equal(module, 'config ok');
      done();
    })();
  });
});

describe('module.generatorFunction', function () {
  it('should return module', function (done) {
    _asyncToGenerator(function* () {
      let module = yield ioc.get('test').module('modules/config-generator-function').resolve();

      assert.equal(module, 'config ok');
      done();
    })();
  });
});

describe('module.singleton', function () {
  it('should return module', function (done) {
    _asyncToGenerator(function* () {
      let singleton = yield ioc.get('test').module('modules/singleton').get();
      let singletonVerify = yield ioc.get('test').module('modules/singleton').get();

      assert.strictEqual(singleton, singletonVerify);
      done();
    })();
  });
});

describe('module.factory', function () {
  it('should return module', function (done) {
    _asyncToGenerator(function* () {
      let factory = yield ioc.get('test').module('modules/factory').get();
      let factoryVerify = yield ioc.get('test').module('modules/factory').get();

      assert.notStrictEqual(factory, factoryVerify);
      done();
    })();
  });
});

describe('module.dependency', function () {
  it('should return module', function (done) {
    _asyncToGenerator(function* () {
      let module = yield ioc.get('test').module('modules/dependency').resolve();

      assert.equal(module.module, 'config ok');
      assert.equal(module.module2, 'config ok');
      assert.equal(module.moduleResolver, 'config ok');
      assert.equal(module.value, 'value ok');
      assert.deepEqual(module.generator, { name: 'generator ok', count: 1 });
      assert.deepEqual(module.generatorOnce, { name: 'generatorOnce ok', count: 1 });
      assert.deepEqual(module.async, { name: 'async ok', count: 1 });
      assert.deepEqual(module.asyncOnce, { name: 'asyncOnce ok', count: 1 });
      assert.deepEqual(module.promise, { name: 'promise ok', count: 1 });
      assert.deepEqual(module.promiseOnce, { name: 'promiseOnce ok', count: 1 });
      done();
    })();
  });
});

describe('module.dependency.once', function () {
  it('should return module', function (done) {
    _asyncToGenerator(function* () {
      let module = yield ioc.get('test').module('modules/dependency').resolve();

      assert.equal(module.module, 'config ok');
      assert.equal(module.module2, 'config ok');
      assert.equal(module.moduleResolver, 'config ok');
      assert.equal(module.value, 'value ok');
      assert.deepEqual(module.generator, { name: 'generator ok', count: 2 });
      assert.deepEqual(module.generatorOnce, { name: 'generatorOnce ok', count: 1 });
      assert.deepEqual(module.async, { name: 'async ok', count: 2 });
      assert.deepEqual(module.asyncOnce, { name: 'asyncOnce ok', count: 1 });
      assert.deepEqual(module.promise, { name: 'promise ok', count: 2 });
      assert.deepEqual(module.promiseOnce, { name: 'promiseOnce ok', count: 1 });
      done();
    })();
  });
});

describe('moduleResolver.extend', function () {
  it('should return module', function (done) {
    _asyncToGenerator(function* () {
      let moduleResolver = ioc.get('test').module('modules/dependency').extend('module', 'modules/database').extend('moduleResolver', ioc.get('test').module('modules/database')).extendValue('value', 'extendValue ok').extendFunction('generator', function () {
        let count = 0;
        return function* () {
          count++;
          return { name: 'extendGenerator ok', count: count };
        };
      }()).extendFunctionOnce('generatorOnce', function () {
        let count = 0;
        return function* () {
          count++;
          return { name: 'extendGeneratorOnce ok', count: count };
        };
      }()).extendFunction('async', function () {
        let count = 0;
        return _asyncToGenerator(function* () {
          count++;
          return { name: 'extendAsync ok', count: count };
        });
      }()).extendFunctionOnce('asyncOnce', function () {
        let count = 0;
        return _asyncToGenerator(function* () {
          count++;
          return { name: 'extendAsyncOnce ok', count: count };
        });
      }()).extendFunction('promise', function () {
        let count = 0;
        return function () {
          count++;
          return new Promise(function (resolve, reject) {
            resolve({ name: 'extendPromise ok', count: count });
          });
        };
      }()).extendFunctionOnce('promiseOnce', function () {
        let count = 0;
        return function () {
          count++;
          return new Promise(function (resolve, reject) {
            resolve({ name: 'extendPromiseOnce ok', count: count });
          });
        };
      }());

      let module = yield moduleResolver.resolve();

      assert.equal(module.module, 'database ok');
      assert.equal(module.moduleResolver, 'database ok');
      assert.equal(module.value, 'extendValue ok');
      assert.deepEqual(module.generator, { name: 'extendGenerator ok', count: 1 });
      assert.deepEqual(module.generatorOnce, { name: 'extendGeneratorOnce ok', count: 1 });
      assert.deepEqual(module.async, { name: 'extendAsync ok', count: 1 });
      assert.deepEqual(module.asyncOnce, { name: 'extendAsyncOnce ok', count: 1 });
      assert.deepEqual(module.promise, { name: 'extendPromise ok', count: 1 });
      assert.deepEqual(module.promiseOnce, { name: 'extendPromiseOnce ok', count: 1 });

      module = yield moduleResolver.resolve();

      assert.equal(module.module, 'database ok');
      assert.equal(module.moduleResolver, 'database ok');
      assert.equal(module.value, 'extendValue ok');
      assert.deepEqual(module.generator, { name: 'extendGenerator ok', count: 2 });
      assert.deepEqual(module.generatorOnce, { name: 'extendGeneratorOnce ok', count: 1 });
      assert.deepEqual(module.async, { name: 'extendAsync ok', count: 2 });
      assert.deepEqual(module.asyncOnce, { name: 'extendAsyncOnce ok', count: 1 });
      assert.deepEqual(module.promise, { name: 'extendPromise ok', count: 2 });
      assert.deepEqual(module.promiseOnce, { name: 'extendPromiseOnce ok', count: 1 });

      done();
    })();
  });
});

describe('moduleReplace.set.modulePath', function () {
  it('should return module', function (done) {
    _asyncToGenerator(function* () {
      let testIoc = ioc.createContainer().setBasePath(__dirname);
      testIoc.module('modules/replace').set('modules/config');

      let module = yield testIoc.module('modules/replace').resolve();
      assert.equal(module, 'config ok');
      done();
    })();
  });
});

describe('moduleReplace.set.moduleResolver', function () {
  it('should return module', function (done) {
    _asyncToGenerator(function* () {
      let testIoc = ioc.createContainer().setBasePath(__dirname);
      testIoc.module('modules/replace').set(ioc.get('test').module('modules/config'));

      let module = yield testIoc.module('modules/replace').resolve();
      assert.equal(module, 'config ok');
      done();
    })();
  });
});

describe('moduleReplace.set.module', function () {
  it('should return module', function (done) {
    _asyncToGenerator(function* () {
      let testIoc = ioc.createContainer().setBasePath(__dirname);
      testIoc.module('modules/replace').set(ioc.createModule().module(function (dep, resolve, reject) {
        resolve('config ok');
      }));

      testIoc.module('modules/replace2').set(ioc.createModule().dependency('replace', 'modules/replace').module(function (dep, resolve, reject) {
        resolve(dep);
      }));

      let module = yield testIoc.module('modules/replace2').resolve();
      assert.equal(module.replace, 'config ok');
      done();
    })();
  });
});

describe('moduleReplace.set.value', function () {
  it('should return module', function (done) {
    _asyncToGenerator(function* () {
      let testIoc = ioc.createContainer().setBasePath(__dirname);
      testIoc.module('modules/replace').setValue('value ok');

      let module = yield testIoc.module('modules/replace').resolve();
      assert.equal(module, 'value ok');
      done();
    })();
  });
});

describe('moduleReplace.set.function.generator', function () {
  it('should return module', function (done) {
    _asyncToGenerator(function* () {
      let testIoc = ioc.createContainer().setBasePath(__dirname);
      testIoc.module('modules/replace').setFunction(function () {
        let count = 0;
        return function* () {
          count++;
          return { name: 'generator ok', count: count };
        };
      }());

      let module = yield testIoc.module('modules/replace').resolve();
      assert.deepEqual(module, { name: 'generator ok', count: 1 });

      module = yield testIoc.module('modules/replace').resolve();
      assert.deepEqual(module, { name: 'generator ok', count: 2 });

      done();
    })();
  });
});

describe('moduleReplace.set.functionOnce.generator', function () {
  it('should return module', function (done) {
    _asyncToGenerator(function* () {
      let testIoc = ioc.createContainer().setBasePath(__dirname);
      testIoc.module('modules/replace').setFunctionOnce(function () {
        let count = 0;
        return function* () {
          count++;
          return { name: 'generatorOnce ok', count: count };
        };
      }());

      let module = yield testIoc.module('modules/replace').resolve();
      assert.deepEqual(module, { name: 'generatorOnce ok', count: 1 });

      module = yield testIoc.module('modules/replace').resolve();
      assert.deepEqual(module, { name: 'generatorOnce ok', count: 1 });

      done();
    })();
  });
});

describe('moduleReplace.set.function.async', function () {
  it('should return module', function (done) {
    _asyncToGenerator(function* () {
      let testIoc = ioc.createContainer().setBasePath(__dirname);
      testIoc.module('modules/replace').setFunction(function () {
        let count = 0;
        return _asyncToGenerator(function* () {
          count++;
          return { name: 'async ok', count: count };
        });
      }());

      let module = yield testIoc.module('modules/replace').resolve();
      assert.deepEqual(module, { name: 'async ok', count: 1 });

      module = yield testIoc.module('modules/replace').resolve();
      assert.deepEqual(module, { name: 'async ok', count: 2 });

      done();
    })();
  });
});

describe('moduleReplace.set.functionOnce.async', function () {
  it('should return module', function (done) {
    _asyncToGenerator(function* () {
      let testIoc = ioc.createContainer().setBasePath(__dirname);
      testIoc.module('modules/replace').setFunctionOnce(function () {
        let count = 0;
        return _asyncToGenerator(function* () {
          count++;
          return { name: 'asyncOnce ok', count: count };
        });
      }());

      let module = yield testIoc.module('modules/replace').resolve();
      assert.deepEqual(module, { name: 'asyncOnce ok', count: 1 });

      module = yield testIoc.module('modules/replace').resolve();
      assert.deepEqual(module, { name: 'asyncOnce ok', count: 1 });

      done();
    })();
  });
});

describe('moduleReplace.set.function.promise', function () {
  it('should return module', function (done) {
    _asyncToGenerator(function* () {
      let testIoc = ioc.createContainer().setBasePath(__dirname);
      testIoc.module('modules/replace').setFunction(function () {
        let count = 0;
        return _asyncToGenerator(function* () {
          count++;
          return new Promise(function (resolve, reject) {
            resolve({ name: 'promise ok', count: count });
          });
        });
      }());

      let module = yield testIoc.module('modules/replace').resolve();
      assert.deepEqual(module, { name: 'promise ok', count: 1 });

      module = yield testIoc.module('modules/replace').resolve();
      assert.deepEqual(module, { name: 'promise ok', count: 2 });

      done();
    })();
  });
});

describe('moduleReplace.set.functionOnce.promise', function () {
  it('should return module', function (done) {
    _asyncToGenerator(function* () {
      let testIoc = ioc.createContainer().setBasePath(__dirname);
      testIoc.module('modules/replace').setFunctionOnce(function () {
        let count = 0;
        return _asyncToGenerator(function* () {
          count++;
          return new Promise(function (resolve, reject) {
            resolve({ name: 'promiseOnce ok', count: count });
          });
        });
      }());

      let module = yield testIoc.module('modules/replace').resolve();
      assert.deepEqual(module, { name: 'promiseOnce ok', count: 1 });

      module = yield testIoc.module('modules/replace').resolve();
      assert.deepEqual(module, { name: 'promiseOnce ok', count: 1 });

      done();
    })();
  });
});

describe('container.setReplacments', function () {
  it('should return module', function (done) {
    _asyncToGenerator(function* () {
      let containerA = ioc.createContainer().setBasePath('/');
      containerA.module('modules/core/test').set(ioc.createModule().module(_asyncToGenerator(function* () {
        return 'test ok';
      })));

      let containerB = ioc.createContainer().setBasePath('/modules/core').setReplacements(containerA);

      containerB.module('test2').set(ioc.createModule().module(_asyncToGenerator(function* () {
        return 'test2 ok';
      })));

      let testModule = yield containerB.module('test').get();
      assert.equal(testModule, 'test ok');

      let testModule2 = yield containerB.module('test2').get();
      assert.equal(testModule2, 'test2 ok');
      done();
    })();
  });
});

describe('module.error.reject', function () {
  it('should return error', function (done) {

    let testIoc = ioc.createContainer().setBasePath(__dirname);
    testIoc.module('modules/reject').get().catch(error => {
      assert.equal(error.message, 'error ok');
      done();
    });
  });
});

describe('module.error.throw', function () {
  it('should return error', function (done) {

    let testIoc = ioc.createContainer().setBasePath(__dirname);

    testIoc.module('modules/throw').get().catch(error => {
      assert.equal(error.message, 'error ok');
      done();
    });
  });
});

describe('module.error.throwGenerator', function () {
  it('should return error', function (done) {

    let testIoc = ioc.createContainer().setBasePath(__dirname);
    testIoc.module('modules/throw-generator').get().catch(error => {
      assert.equal(error.message, 'error ok');
      done();
    });
  });
});

describe('module.error.throwAsync', function () {
  it('should return error', function (done) {

    let testIoc = ioc.createContainer().setBasePath(__dirname);
    testIoc.module('modules/throw-async').get().catch(error => {
      assert.equal(error.message, 'error ok');
      done();
    });
  });
});

describe('module.error.throwDependency', function () {
  it('should return error', function (done) {

    let testIoc = ioc.createContainer().setBasePath(__dirname);
    let module = testIoc.module('modules/throwDependency').set('modules/config').extend('throw', 'modules/throw').resolve().catch(error => {
      assert.equal(error.message, 'error ok');
      done();
    });
  });
});

describe('module.error.dependency.generatorOnce', function () {
  it('should return error', function (done) {

    let testIoc = ioc.createContainer().setBasePath(__dirname);
    let module = testIoc.module('modules/config').extendFunctionOnce('generator', function* () {
      yield new Promise(resolve => {
        setTimeout(resolve, 10);
      });
      throw new Error('error ok');
    }).resolve().catch(error => {
      assert.equal(error.message, 'error ok');
      done();
    });
  });
});

describe('module.error.dependency.asyncOnce', function () {
  it('should return error', function (done) {

    let testIoc = ioc.createContainer().setBasePath(__dirname);
    let module = testIoc.module('modules/config').extendFunctionOnce('generator', _asyncToGenerator(function* () {
      yield new Promise(function (resolve) {
        setTimeout(resolve, 10);
      });
      throw new Error('error ok');
    })).resolve().catch(error => {
      assert.equal(error.message, 'error ok');
      done();
    });
  });
});

describe('module.error.dependency.asyncOnce.promise', function () {
  it('should return error', function (done) {

    let testIoc = ioc.createContainer().setBasePath(__dirname);
    let module = testIoc.module('modules/config').extendFunctionOnce('generator', () => {
      return new Promise(resolve => {
        throw new Error('error ok');
      });
    }).resolve().catch(error => {
      assert.equal(error.message, 'error ok');
      done();
    });
  });
});