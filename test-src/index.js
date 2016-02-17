process.on('unhandledRejection', (reason, p) => {
  console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason)
  console.log(reason.stack)
})

var assert = require('assert')

global.ioc = (function () {
  if (require('path').basename(__dirname) === 'test-src') {
    return require('../src/index')
  }
  return require('../lib/index')
})()

ioc.get('test').setBasePath(__dirname)

describe('module.basic', function () {
  it('should return module', function (done) {
    (async function () {
      let module = await ioc.get('test').module('modules/config').resolve()

      assert.equal(module, 'config ok')
      done()
    })()
  })
})

describe('module.asyncFunction', function () {
  it('should return module', function (done) {
    (async function () {
      let module = await ioc.get('test').module('modules/config-async-function').resolve()

      assert.equal(module, 'config ok')
      done()
    })()
  })
})

describe('module.generatorFunction', function () {
  it('should return module', function (done) {
    (async function () {
      let module = await ioc.get('test').module('modules/config-generator-function').resolve()

      assert.equal(module, 'config ok')
      done()
    })()
  })
})

describe('module.singleton', function () {
  it('should return module', function (done) {
    (async function () {
      let singleton = await ioc.get('test').module('modules/singleton').get()
      let singletonVerify = await ioc.get('test').module('modules/singleton').get()

      assert.strictEqual(singleton, singletonVerify)
      done()
    })()
  })
})

describe('module.factory', function () {
  it('should return module', function (done) {
    (async function () {
      let factory = await ioc.get('test').module('modules/factory').get()
      let factoryVerify = await ioc.get('test').module('modules/factory').get()

      assert.notStrictEqual(factory, factoryVerify)
      done()
    })()
  })
})

describe('module.dependency', function () {
  it('should return module', function (done) {
    (async function () {
      let module = await ioc.get('test').module('modules/dependency').resolve()

      assert.equal(module.module, 'config ok')
      assert.equal(module.module2, 'config ok')
      assert.equal(module.moduleResolver, 'config ok')
      assert.equal(module.value, 'value ok')
      assert.deepEqual(module.generator, { name: 'generator ok', count: 1 })
      assert.deepEqual(module.generatorOnce, { name: 'generatorOnce ok', count: 1 })
      assert.deepEqual(module.async, { name: 'async ok', count: 1 })
      assert.deepEqual(module.asyncOnce, { name: 'asyncOnce ok', count: 1 })
      assert.deepEqual(module.promise, { name: 'promise ok', count: 1 })
      assert.deepEqual(module.promiseOnce, { name: 'promiseOnce ok', count: 1 })
      done()
    })()
  })
})

describe('module.dependency.once', function () {
  it('should return module', function (done) {
    (async function () {
      let module = await ioc.get('test').module('modules/dependency').resolve()

      assert.equal(module.module, 'config ok')
      assert.equal(module.module2, 'config ok')
      assert.equal(module.moduleResolver, 'config ok')
      assert.equal(module.value, 'value ok')
      assert.deepEqual(module.generator, { name: 'generator ok', count: 2 })
      assert.deepEqual(module.generatorOnce, { name: 'generatorOnce ok', count: 1 })
      assert.deepEqual(module.async, { name: 'async ok', count: 2 })
      assert.deepEqual(module.asyncOnce, { name: 'asyncOnce ok', count: 1 })
      assert.deepEqual(module.promise, { name: 'promise ok', count: 2 })
      assert.deepEqual(module.promiseOnce, { name: 'promiseOnce ok', count: 1 })
      done()
    })()
  })
})

describe('moduleResolver.extend', function () {
  it('should return module', function (done) {
    (async function () {
      let moduleResolver = ioc.get('test').module('modules/dependency')
      .extend('module', 'modules/database')
      .extend('moduleResolver', ioc.get('test').module('modules/database'))
      .extendValue('value', 'extendValue ok')
      .extendFunction(
        'generator',
        (() => {
          let count = 0
          return function* () {
            count++
            return { name: 'extendGenerator ok', count: count }
          }
        })()
      )
      .extendFunctionOnce(
        'generatorOnce',
        (() => {
          let count = 0
          return function* () {
            count++
            return { name: 'extendGeneratorOnce ok', count: count }
          }
        })()
      )
      .extendFunction(
        'async',
        (() => {
          let count = 0
          return async () => {
            count++
            return { name: 'extendAsync ok', count: count }
          }
        })()
      )
      .extendFunctionOnce(
        'asyncOnce',
        (() => {
          let count = 0
          return async () => {
            count++
            return { name: 'extendAsyncOnce ok', count: count }
          }
        })()
      )
      .extendFunction(
        'promise',
        (() => {
          let count = 0
          return () => {
            count++
            return new Promise((resolve, reject) => {
              resolve({ name: 'extendPromise ok', count: count })
            })
          }
        })()
      )
      .extendFunctionOnce(
        'promiseOnce',
        (() => {
          let count = 0
          return () => {
            count++
            return new Promise((resolve, reject) => {
              resolve({ name: 'extendPromiseOnce ok', count: count })
            })
          }
        })()
      )

      let module = await moduleResolver
      .resolve()

      assert.equal(module.module, 'database ok')
      assert.equal(module.moduleResolver, 'database ok')
      assert.equal(module.value, 'extendValue ok')
      assert.deepEqual(module.generator, { name: 'extendGenerator ok', count: 1 })
      assert.deepEqual(module.generatorOnce, { name: 'extendGeneratorOnce ok', count: 1 })
      assert.deepEqual(module.async, { name: 'extendAsync ok', count: 1 })
      assert.deepEqual(module.asyncOnce, { name: 'extendAsyncOnce ok', count: 1 })
      assert.deepEqual(module.promise, { name: 'extendPromise ok', count: 1 })
      assert.deepEqual(module.promiseOnce, { name: 'extendPromiseOnce ok', count: 1 })

      module = await moduleResolver
      .resolve()

      assert.equal(module.module, 'database ok')
      assert.equal(module.moduleResolver, 'database ok')
      assert.equal(module.value, 'extendValue ok')
      assert.deepEqual(module.generator, { name: 'extendGenerator ok', count: 2 })
      assert.deepEqual(module.generatorOnce, { name: 'extendGeneratorOnce ok', count: 1 })
      assert.deepEqual(module.async, { name: 'extendAsync ok', count: 2 })
      assert.deepEqual(module.asyncOnce, { name: 'extendAsyncOnce ok', count: 1 })
      assert.deepEqual(module.promise, { name: 'extendPromise ok', count: 2 })
      assert.deepEqual(module.promiseOnce, { name: 'extendPromiseOnce ok', count: 1 })

      done()
    })()
  })
})

describe('moduleReplace.set.modulePath', function () {
  it('should return module', function (done) {
    (async function () {
      var testIoc = ioc.createContainer().setBasePath(__dirname)
      testIoc.module('modules/replace').set('modules/config')

      let module = await testIoc.module('modules/replace').resolve()
      assert.equal(module, 'config ok')
      done()
    })()
  })
})

describe('moduleReplace.set.moduleResolver', function () {
  it('should return module', function (done) {
    (async function () {
      var testIoc = ioc.createContainer().setBasePath(__dirname)
      testIoc.module('modules/replace').set(ioc.get('test').module('modules/config'))

      let module = await testIoc.module('modules/replace').resolve()
      assert.equal(module, 'config ok')
      done()
    })()
  })
})

describe('moduleReplace.set.module', function () {
  it('should return module', function (done) {
    (async function () {
      var testIoc = ioc.createContainer().setBasePath(__dirname)
      testIoc.module('modules/replace').set(
        ioc.createModule()
        .module(function (dep, resolve, reject) {
          resolve('config ok')
        })
      )

      testIoc.module('modules/replace2').set(
        ioc.createModule()
        .dependency('replace', 'modules/replace')
        .module(function (dep, resolve, reject) {
          resolve(dep)
        })
      )

      let module = await testIoc.module('modules/replace2').resolve()
      assert.equal(module.replace, 'config ok')
      done()
    })()
  })
})

describe('moduleReplace.set.value', function () {
  it('should return module', function (done) {
    (async function () {
      var testIoc = ioc.createContainer().setBasePath(__dirname)
      testIoc.module('modules/replace').setValue('value ok')

      let module = await testIoc.module('modules/replace').resolve()
      assert.equal(module, 'value ok')
      done()
    })()
  })
})

describe('moduleReplace.set.function.generator', function () {
  it('should return module', function (done) {
    (async function () {
      var testIoc = ioc.createContainer().setBasePath(__dirname)
      testIoc.module('modules/replace')
      .setFunction(
        (() => {
          let count = 0
          return function* () {
            count++
            return { name: 'generator ok', count: count }
          }
        })()
      )

      let module = await testIoc.module('modules/replace').resolve()
      assert.deepEqual(module, { name: 'generator ok', count: 1 })

      module = await testIoc.module('modules/replace').resolve()
      assert.deepEqual(module, { name: 'generator ok', count: 2 })

      done()
    })()
  })
})

describe('moduleReplace.set.functionOnce.generator', function () {
  it('should return module', function (done) {
    (async function () {
      var testIoc = ioc.createContainer().setBasePath(__dirname)
      testIoc.module('modules/replace')
      .setFunctionOnce(
        (() => {
          let count = 0
          return function* () {
            count++
            return { name: 'generatorOnce ok', count: count }
          }
        })()
      )

      let module = await testIoc.module('modules/replace').resolve()
      assert.deepEqual(module, { name: 'generatorOnce ok', count: 1 })

      module = await testIoc.module('modules/replace').resolve()
      assert.deepEqual(module, { name: 'generatorOnce ok', count: 1 })

      done()
    })()
  })
})

describe('moduleReplace.set.function.async', function () {
  it('should return module', function (done) {
    (async function () {
      var testIoc = ioc.createContainer().setBasePath(__dirname)
      testIoc.module('modules/replace')
      .setFunction(
        (() => {
          let count = 0
          return async () => {
            count++
            return { name: 'async ok', count: count }
          }
        })()
      )

      let module = await testIoc.module('modules/replace').resolve()
      assert.deepEqual(module, { name: 'async ok', count: 1 })

      module = await testIoc.module('modules/replace').resolve()
      assert.deepEqual(module, { name: 'async ok', count: 2 })

      done()
    })()
  })
})

describe('moduleReplace.set.functionOnce.async', function () {
  it('should return module', function (done) {
    (async function () {
      var testIoc = ioc.createContainer().setBasePath(__dirname)
      testIoc.module('modules/replace')
      .setFunctionOnce(
        (() => {
          let count = 0
          return async () => {
            count++
            return { name: 'asyncOnce ok', count: count }
          }
        })()
      )

      let module = await testIoc.module('modules/replace').resolve()
      assert.deepEqual(module, { name: 'asyncOnce ok', count: 1 })

      module = await testIoc.module('modules/replace').resolve()
      assert.deepEqual(module, { name: 'asyncOnce ok', count: 1 })

      done()
    })()
  })
})

describe('moduleReplace.set.function.promise', function () {
  it('should return module', function (done) {
    (async function () {
      var testIoc = ioc.createContainer().setBasePath(__dirname)
      testIoc.module('modules/replace')
      .setFunction(
        (() => {
          let count = 0
          return async () => {
            count++
            return new Promise((resolve, reject) => {
              resolve({ name: 'promise ok', count: count })
            })
          }
        })()
      )

      let module = await testIoc.module('modules/replace').resolve()
      assert.deepEqual(module, { name: 'promise ok', count: 1 })

      module = await testIoc.module('modules/replace').resolve()
      assert.deepEqual(module, { name: 'promise ok', count: 2 })

      done()
    })()
  })
})

describe('moduleReplace.set.functionOnce.promise', function () {
  it('should return module', function (done) {
    (async function () {
      var testIoc = ioc.createContainer().setBasePath(__dirname)
      testIoc.module('modules/replace')
      .setFunctionOnce(
        (() => {
          let count = 0
          return async () => {
            count++
            return new Promise((resolve, reject) => {
              resolve({ name: 'promiseOnce ok', count: count })
            })
          }
        })()
      )

      let module = await testIoc.module('modules/replace').resolve()
      assert.deepEqual(module, { name: 'promiseOnce ok', count: 1 })

      module = await testIoc.module('modules/replace').resolve()
      assert.deepEqual(module, { name: 'promiseOnce ok', count: 1 })

      done()
    })()
  })
})

describe('module.error.reject', function () {
  it('should return error', function (done) {

    var testIoc = ioc.createContainer().setBasePath(__dirname)
    testIoc
      .module('modules/reject')
      .get()
      .catch((error) => {
        assert.equal(error.message, 'error ok')
        done()
      })
  })
})

describe('module.error.throw', function () {
  it('should return error', function (done) {

    var testIoc = ioc.createContainer().setBasePath(__dirname)

    testIoc
      .module('modules/throw')
      .get()
      .catch((error) => {
        assert.equal(error.message, 'error ok')
        done()
      })
  })
})

describe('module.error.throwGenerator', function () {
  it('should return error', function (done) {

    var testIoc = ioc.createContainer().setBasePath(__dirname)
    testIoc
      .module('modules/throw-generator')
      .get()
      .catch((error) => {
        assert.equal(error.message, 'error ok')
        done()
      })
  })
})

describe('module.error.throwAsync', function () {
  it('should return error', function (done) {

    var testIoc = ioc.createContainer().setBasePath(__dirname)
    testIoc
      .module('modules/throw-async')
      .get()
      .catch((error) => {
        assert.equal(error.message, 'error ok')
        done()
      })
  })
})

describe('module.error.throwDependency', function () {
  it('should return error', function (done) {

    var testIoc = ioc.createContainer().setBasePath(__dirname)
    var module = testIoc
      .module('modules/throwDependency')
      .set('modules/config')
      .extend('throw', 'modules/throw')
      .resolve()
      .catch((error) => {
        assert.equal(error.message, 'error ok')
        done()
      })
  })
})

describe('module.error.dependency.generatorOnce', function () {
  it('should return error', function (done) {

    var testIoc = ioc.createContainer().setBasePath(__dirname)
    var module = testIoc
      .module('modules/config')
      .extendFunctionOnce(
        'generator',
        function* () {
          yield new Promise((resolve) => {
            setTimeout(resolve, 10)
          })
          throw new Error('error ok')
        }
      )
      .resolve()
      .catch((error) => {
        assert.equal(error.message, 'error ok')
        done()
      })
  })
})

describe('module.error.dependency.asyncOnce', function () {
  it('should return error', function (done) {

    var testIoc = ioc.createContainer().setBasePath(__dirname)
    var module = testIoc
      .module('modules/config')
      .extendFunctionOnce(
        'generator',
        async () => {
          await new Promise((resolve) => {
            setTimeout(resolve, 10)
          })
          throw new Error('error ok')
        }
      )
      .resolve()
      .catch((error) => {
        assert.equal(error.message, 'error ok')
        done()
      })
  })
})

describe('module.error.dependency.asyncOnce.promise', function () {
  it('should return error', function (done) {

    var testIoc = ioc.createContainer().setBasePath(__dirname)
    var module = testIoc
      .module('modules/config')
      .extendFunctionOnce(
        'generator',
        () => {
          return new Promise((resolve) => {
            throw new Error('error ok')
          })
        }
      )
      .resolve()
      .catch((error) => {
        assert.equal(error.message, 'error ok')
        done()
      })
  })
})
