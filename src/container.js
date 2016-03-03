const ModuleResolver = require('./moduleResolver')
const path = require('path')

class Container {
  constructor () {
    this.basePath = process.cwd()
    this.replacements = {}
  }

  setBasePath (basePath) {
    this.basePath = path.normalize( basePath )
    return this
  }

  getReplacements() {
    return this.replacements
  }

  setReplacements(replacements) {
    if (replacements.constructor.name == 'Container') {
      replacements = replacements.getReplacements()
    }
    this.replacements = replacements
    return this
  }

  module (modulePath) {
    return new ModuleResolver({
      container: this,
      modulePath: modulePath
    })
  }
}

module.exports = Container
