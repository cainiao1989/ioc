ioc.createModule(module)
  .dependency('module', './config')
  .dependency('module2', '../modules/config')
  .dependency('moduleResolver', ioc.get('test').module('modules/config') )
  .dependencyValue('value', 'value ok')
  .dependencyGenerator(
    'generator',
    (() => {
      let count = 0
      return function* () {
        count++
        return { name: 'generator ok', count: count }
      }
    })()
  )
  .dependencyGeneratorOnce(
    'generatorOnce',
    (() => {
      let count = 0
      return function* () {
        count++
        return { name: 'generatorOnce ok', count: count }
      }
    })()
  )
  .dependencyAsync(
    'async',
    (() => {
      let count = 0
      return async () => {
        count++
        return { name: 'async ok', count: count }
      }
    })()
  )
  .dependencyAsyncOnce(
    'asyncOnce',
    (() => {
      let count = 0
      return async () => {
        count++
        return { name: 'asyncOnce ok', count: count }
      }
    })()
  )
  .dependencyAsync(
    'promise',
    (() => {
      let count = 0
      return () => {
        count++
        return new Promise((resolve, reject) => {
          resolve({ name: 'promise ok', count: count })
        })
      }
    })()
  )
  .dependencyAsyncOnce(
    'promiseOnce',
    (() => {
      let count = 0
      return () => {
        count++
        return new Promise((resolve, reject) => {
          resolve({ name: 'promiseOnce ok', count: count })
        })
      }
    })()
  )
  .module(function (dep, resolve, reject) {
    resolve(dep)
  })
