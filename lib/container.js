'use strict';

let ModuleResolver = require('./moduleResolver');
let path = require('path');

class Container {
  constructor() {
    this.basePath = process.cwd();
    this.replacements = {};
  }

  setBasePath(basePath) {
    this.basePath = path.normalize(basePath);
    return this;
  }

  module(modulePath) {
    return new ModuleResolver({
      container: this,
      modulePath: modulePath
    });
  }
}

module.exports = Container;