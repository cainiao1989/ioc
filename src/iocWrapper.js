var Ioc = require('./ioc')
var Module = require('./module.js')


class IocWrapper {
  constructor () {
    this.iocInstances = {}
  }

  get (name) {
    if (this.iocInstances[name] === undefined) {
      this.iocInstances[name] = new Ioc()
    }
    return this.iocInstances[name]
  }

  createModule (options) {
    return new Module(options)
  }

  createIoc () {
    return new Ioc()
  }
}

module.exports = new IocWrapper()
