process.on('unhandledRejection', (reason, p) => {
  console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason)
  console.log(reason.stack)
})

var assert = require('assert')

global.ioc = require('../src/index')
ioc.get('test').setBasePath(__dirname)

describe('Ioc.module.basic', function () {
  it('should return module', function (done) {
    (async function () {
      let module = await ioc.get('test').module('modules/config').resolve()

      assert.equal(module, 'config ok')
      done()
    })()
  })
})

describe('Ioc.module.singleton', function () {
  it('should return module', function (done) {
    (async function () {
      let singleton = await ioc.get('test').module('modules/singleton').get()
      let singletonVerify = await ioc.get('test').module('modules/singleton').get()

      assert.strictEqual(singleton, singletonVerify)
      done()
    })()
  })
})

describe('Ioc.module.factory', function () {
  it('should return module', function (done) {
    (async function () {
      let factory = await ioc.get('test').module('modules/factory').get()
      let factoryVerify = await ioc.get('test').module('modules/factory').get()

      assert.notStrictEqual(factory, factoryVerify)
      done()
    })()
  })
})

describe('Ioc.module.dependency', function () {
  it('should return module', function (done) {
    (async function () {
      let module = await ioc.get('test').module('modules/dependency').resolve()

      assert.equal(module.module, 'config ok')
      assert.equal(module.module2, 'config ok')
      assert.equal(module.moduleResolver, 'config ok')
      assert.equal(module.value, 'value ok')
      assert.equal(module.promise, 'promise ok')
      assert.equal(module.executor, 'executor ok')
      assert.equal(module.function, 'function ok')
      done()
    })()
  })
})

describe('Ioc.module.extend', function () {
  it('should return module', function (done) {
    (async function () {
      let module = await ioc.get('test').module('modules/dependency')
      .extend('module', 'modules/database')
      .extend('moduleResolver', ioc.get('test').module('modules/database'))
      .extendValue('value', 'extendValue ok')
      .extendPromise('promise', new Promise( (resolve, reject) => { resolve('extendPromise ok') } ) )
      .extendExecutor('executor', (resolve, reject) => {resolve('extendExecutor ok')})
      .extendFunction('function', () => { return new Promise( (resolve, reject) => { resolve('extendFunction ok') } ) })
      .extendValue('extendValue', 'extendValue ok')
      .resolve()

      assert.equal(module.module, 'database ok')
      assert.equal(module.moduleResolver, 'database ok')
      assert.equal(module.value, 'extendValue ok')
      assert.equal(module.promise, 'extendPromise ok')
      assert.equal(module.executor, 'extendExecutor ok')
      assert.equal(module.function, 'extendFunction ok')
      assert.equal(module.extendValue, 'extendValue ok')
      done()
    })()
  })
})

describe('Ioc.set.path', function () {
  it('should return module', function (done) {
    (async function () {
      var testIoc = ioc.createIoc().setBasePath(__dirname)
      testIoc.module('modules/replace').set('modules/config')

      let module = await testIoc.module('modules/replace').resolve()
      assert.equal(module, 'config ok')
      done()
    })()
  })
})

describe('Ioc.set.moduleResolver', function () {
  it('should return module', function (done) {
    (async function () {
      var testIoc = ioc.createIoc().setBasePath(__dirname)
      testIoc.module('modules/replace').set(ioc.get('test').module('modules/config'))

      let module = await testIoc.module('modules/replace').resolve()
      assert.equal(module, 'config ok')
      done()
    })()
  })
})

describe('Ioc.set.value', function () {
  it('should return module', function (done) {
    (async function () {
      var testIoc = ioc.createIoc().setBasePath(__dirname)
      testIoc.module('modules/replace').setValue('value ok')

      let module = await testIoc.module('modules/replace').resolve()
      assert.equal(module, 'value ok')
      done()
    })()
  })
})

describe('Ioc.set.promise', function () {
  it('should return module', function (done) {
    (async function () {
      var testIoc = ioc.createIoc().setBasePath(__dirname)
      testIoc.module('modules/replace').setPromise(new Promise(function(resolve, rejct) {resolve('promise ok')}))

      let module = await testIoc.module('modules/replace').resolve()
      assert.equal(module, 'promise ok')
      done()
    })()
  })
})

describe('Ioc.set.executor', function () {
  it('should return module', function (done) {
    (async function () {
      var testIoc = ioc.createIoc().setBasePath(__dirname)
      testIoc.module('modules/replace').setExecutor(function(resolve, reject) {resolve('executor ok')})

      let module = await testIoc.module('modules/replace').resolve()
      assert.equal(module, 'executor ok')
      done()
    })()
  })
})

describe('Ioc.set.function', function () {
  it('should return module', function (done) {
    (async function () {
      var testIoc = ioc.createIoc().setBasePath(__dirname)
      testIoc.module('modules/replace').setFunction(() => { return new Promise( (resolve, reject) => { resolve('function ok') } ) })

      let module = await testIoc.module('modules/replace').resolve()
      assert.equal(module, 'function ok')
      done()
    })()
  })
})
