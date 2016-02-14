let ModuleResolver = require('./moduleResolver')
let asyncToGenerator = require('./asyncToGenerator')

class Module {
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

  static createDependencyGenerator (name, value) {
    return {
      name: name,
      function: asyncToGenerator(value),
      type: 'generator'
    }
  }

  static createDependencyGeneratorOnce (name, value) {
    return {
      name: name,
      function: asyncToGenerator(value),
      resolved: false,
      type: 'generatorOnce'
    }
  }

  static createDependencyAsync (name, value) {
    return {
      name: name,
      function: value,
      type: 'async'
    }
  }

  static createDependencyAsyncOnce (name, value) {
    return {
      name: name,
      function: value,
      resolved: false,
      type: 'asyncOnce'
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

  dependencyGenerator (name, value) {
    this.dependencies[name] = Module.createDependencyGenerator(name, value)
    return this
  }

  dependencyGeneratorOnce (name, value) {
    this.dependencies[name] = Module.createDependencyGeneratorOnce(name, value)
    return this
  }

  dependencyAsync (name, value) {
    this.dependencies[name] = Module.createDependencyAsync(name, value)
    return this
  }

  dependencyAsyncOnce (name, value) {
    this.dependencies[name] = Module.createDependencyAsyncOnce(name, value)
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
