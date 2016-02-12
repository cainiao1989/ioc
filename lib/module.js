'use strict';

var ModuleResolver = require('./moduleResolver');

class Module {
  static createDependency(name, value) {

    if (typeof value === 'string') {
      return {
        name: name,
        path: value,
        type: 'module'
      };
    }

    if (value instanceof ModuleResolver.constructor) {
      return {
        name: name,
        moduleResolver: value,
        type: 'moduleResolver'
      };
    }

    throw new Error('Unknown type of value');
  }

  static createDependencyValue(name, value) {
    return {
      name: name,
      value: value,
      type: 'value'
    };
  }

  static createDependencyPromise(name, value) {
    return {
      name: name,
      promise: value,
      type: 'promise'
    };
  }

  static createDependencyExecutor(name, value) {
    return {
      name: name,
      executor: value,
      type: 'executor'
    };
  }

  constructor(module) {
    this.nodeModule = module;
    this.singleton = true;
    this.dependencies = {};
    return this;
  }

  setSingleton(value) {
    this.singleton = value;
    return this;
  }

  dependency(name, value) {
    this.dependencies[name] = Module.createDependency(name, value);
    return this;
  }

  dependencyValue(name, value) {
    this.dependencies[name] = Module.createDependencyValue(name, value);
    return this;
  }

  dependencyPromise(name, value) {
    this.dependencies[name] = Module.createDependencyPromise(name, value);
    return this;
  }

  dependencyExecutor(name, value) {
    this.dependencies[name] = Module.createDependencyExecutor(name, value);
    return this;
  }

  module(moduleExecutor) {
    this.moduleExecutor = moduleExecutor;
    this.nodeModule.exports = this;
    return this;
  }
}

module.exports = Module;