let ModuleResolver = require('./moduleResolver')
let asyncToGenerator = require('./asyncToGenerator')

class Module {
  static resolveExecutor(resolve, reject, executorFunction, dependencies) {
    let moduleFunction

    /* GeneratorFunction */
    if (executorFunction.constructor.name == 'GeneratorFunction') {
      moduleFunction = asyncToGenerator( executorFunction )(dependencies)
      .catch((error) => {
        reject(error)
      })

    /* @TODO ES7 async function detection, wait till it will be standard
       function or async function, babel regenerator return function */
    } else {
      moduleFunction = (function () {
        let result = undefined
        try {
          /* it's moduleExecutor function */
          if (dependencies !== undefined) {
            result = executorFunction(dependencies, resolve, reject)
          } else {
            result = executorFunction(resolve, reject)
          }
        } catch (error) {
          /* unhandled moduleFunction error
             This happens only when moduleExecutor is only normal function ex. function() {}
          */
          reject(error)
        }

        if (!(result instanceof Object) || !(result.catch instanceof Function)) {
          /* It's normal function, let's do dirty hack it so no unhandledRejection will appear */
          result = {
            catch: function() {}
          }
        }
        return result
      })().catch(reject)
    }

    if (moduleFunction && moduleFunction.then instanceof Function) {
      moduleFunction.then(resolve)
    }
  }

  static createDependency (name, value) {
    if ( value.constructor.name == 'String' ) {
      return {
        name: name,
        modulePath: value,
        type: 'modulePath'
      }
    }

    if ( value.constructor.name == 'ModuleResolver' ) {
      return {
        name: name,
        moduleResolver: value,
        type: 'moduleResolver'
      }
    }

    if ( value.constructor.name == 'Module' ) {
      return {
        name: name,
        module: value,
        type: 'module'
      }
    }

    throw new Error('Unknown type of value')
  }

  static createDependencyValue (name, value) {
    return {
      name: name,
      value: value,
      type: 'value'
    }
  }

  static createDependencyFunction (name, value) {
    return {
      name: name,
      function: function() {
        return new Promise(function(resolve, reject) {
          Module.resolveExecutor(resolve, reject, value)
        })
      },
      type: 'function'
    }
  }

  static createDependencyFunctionOnce (name, value) {
    return {
      name: name,
      function: function() {
        return new Promise(function(resolve, reject) {
          Module.resolveExecutor(resolve, reject, value)
        })
      },
      resolved: false,
      type: 'functionOnce'
    }
  }

  constructor (module) {
    this.nodeModule = module
    this.singleton = true
    this.dependencies = {}
    return this
  }

  setSingleton (value) {
    this.singleton = value
    return this
  }

  dependency (name, value) {
    this.dependencies[name] = Module.createDependency(name, value)
    return this
  }

  dependencyValue (name, value) {
    this.dependencies[name] = Module.createDependencyValue(name, value)
    return this
  }

  dependencyFunction (name, value) {
    this.dependencies[name] = Module.createDependencyFunction(name, value)
    return this
  }

  dependencyFunctionOnce (name, value) {
    this.dependencies[name] = Module.createDependencyFunctionOnce(name, value)
    return this
  }

  module (moduleExecutor) {
    this.moduleExecutor = moduleExecutor
    if (this.nodeModule instanceof Object && this.nodeModule.exports) {
      this.nodeModule.exports = this
    }
    return this
  }

}

module.exports = Module
