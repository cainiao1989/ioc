'use strict';

const Container = require('./container');
const Module = require('./module.js');

class Ioc {
  constructor() {
    this.containers = {};
  }

  get(name) {
    if (this.containers[name] === undefined) {
      this.containers[name] = new Container();
    }
    return this.containers[name];
  }

  createModule(options) {
    return new Module(options);
  }

  createContainer() {
    return new Container();
  }
}

module.exports = new Ioc();