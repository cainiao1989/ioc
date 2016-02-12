'use strict';

var ModuleResolver = require('./moduleResolver');
var Module = require('./module');
var path = require('path');

class Ioc {
  constructor() {
    this.basePath = process.cwd();
    this.replacements = {};
  }

  setBasePath(basePath) {
    this.basePath = path.normalize(basePath);
    return this;
  }

  getModuleNormalizePath(modulePath) {
    return path.normalize(path.join(this.basePath, modulePath));
  }

  set(name, value) {
    name = this.getModuleNormalizePath(name);
    this.replacements[name] = Module.createDependency(name, value);
    return this;
  }

  setValue(name, value) {
    name = this.getModuleNormalizePath(name);
    this.replacements[name] = Module.createDependencyValue(name, value);
    return this;
  }

  setPromise(name, value) {
    name = this.getModuleNormalizePath(name);
    this.replacements[name] = Module.createDependencyPromise(name, value);
    return this;
  }

  setExecutor(name, value) {
    name = this.getModuleNormalizePath(name);
    this.replacements[name] = Module.createDependencyExecutor(name, value);
    return this;
  }

  module(modulePath) {
    return new ModuleResolver({
      ioc: this,
      modulePath: modulePath
    });
  }
}

module.exports = Ioc;