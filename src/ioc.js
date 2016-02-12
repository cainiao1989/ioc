var ModuleResolver = require('./moduleResolver')
var path = require('path')

class Ioc {
  constructor () {
    this.basePath = process.cwd()
    this.replacements = {}
  }

  setBasePath (basePath) {
    this.basePath = path.normalize( basePath )
    return this
  }

  module (modulePath) {
    return new ModuleResolver({
      ioc: this,
      modulePath: modulePath
    })
  }
}

module.exports = Ioc
