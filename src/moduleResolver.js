var path = require('path')
var Module = require('./module')

class ModuleResolver {
  constructor (options) {
    this.ioc = options.ioc
    this.modulePath = options.modulePath
    this.extends = {}
    /* check replacement */
    this.checkForReplacement()

    if (this.isReplacement) {
      return this.getModuleResolverReplacement()
    }
  }

  checkForReplacement () {
    this.isReplacement = false;
    var moduleFullPath = this.getModuleNormalizePath()
    if (this.ioc.replacements[moduleFullPath] !== undefined) {
      this.isReplacement = true;
      this.replacement = this.ioc.replacements[moduleFullPath];
    }
  }

  getModuleResolverReplacement() {
    if (this.replacement.type == 'module') {
      return new ModuleResolver({ ioc: this.ioc, modulePath: this.replacement.path })
    }
    if (this.replacement.type == 'moduleResolver') {
      return this.replacement.moduleResolver
    }
    return this
  }

  getModuleNormalizePath () {
    return path.normalize( path.join( this.ioc.basePath, this.modulePath ) )
  }

  getModuleNormalizeDirectory () {
    return path.dirname(path.join(this.ioc.basePath, this.modulePath))
  }

  getDependencyPath (dependencyModulePath) {
    /* is relative to this module */
    if (dependencyModulePath[0] === '.') {
      let fullPath = path.join(this.getModuleNormalizeDirectory(), dependencyModulePath)
      /* remove the basePath part */
      dependencyModulePath = fullPath.replace(this.ioc.basePath, '')
    }

    return dependencyModulePath
  }

  requireModule () {
    this.module = require(this.getModuleNormalizePath())
    return this.module
  }

  extend (name, value) {
    this.extends[name] = Module.createDependency(name, value)
    return this
  }

  extendValue (name, value) {
    this.extends[name] = Module.createDependencyValue(name, value)
    return this
  }

  extendPromise (name, value) {
    this.extends[name] = Module.createDependencyPromise(name, value)
    return this
  }

  extendExecutor (name, value) {
    this.extends[name] = Module.createDependencyExecutor(name, value)
    return this
  }

  extendFunction (name, value) {
    this.extends[name] = Module.createDependencyFunction(name, value)
    return this
  }

  set (value) {
    let name = this.getModuleNormalizePath()
    this.ioc.replacements[name] = Module.createDependency(name, value)
    this.checkForReplacement()

    let moduleResolverReplacement = this.getModuleResolverReplacement()
    for (var member in this) {
      delete this[member];
    }

    Object.assign(this, moduleResolverReplacement)
    return this
  }

  setValue (value) {
    let name = this.getModuleNormalizePath()
    this.ioc.replacements[name] = Module.createDependencyValue(name, value)
    this.checkForReplacement()
    return this
  }

  setPromise (value) {
    let name = this.getModuleNormalizePath()
    this.ioc.replacements[name] = Module.createDependencyPromise(name, value)
    this.checkForReplacement()
    return this
  }

  setExecutor (value) {
    let name = this.getModuleNormalizePath()
    this.ioc.replacements[name] = Module.createDependencyExecutor(name, value)
    this.checkForReplacement()
    return this
  }

  setFunction (value) {
    let name = this.getModuleNormalizePath()
    this.ioc.replacements[name] = Module.createDependencyFunction(name, value)
    this.checkForReplacement()
    return this
  }

  async createModuleDependency(dependency) {
    var dependencyValue = null
    switch (dependency.type) {
      case 'module':
        dependencyValue = await (new ModuleResolver({ioc: this.ioc, modulePath: this.getDependencyPath(dependency.path)})).get()
        break
      case 'moduleResolver':
        dependencyValue = await dependency.moduleResolver.get()
        break
      case 'value':
        dependencyValue = dependency.value
        break
      case 'promise':
        dependencyValue = await dependency.promise
        break
      case 'executor':
        dependencyValue = await new Promise(dependency.executor)
        break
      case 'function':
        dependencyValue = await dependency.function()
        break
      default:
       throw new Error('Unknown dependency.type')
    }

    return {
      name: dependency.name,
      value: dependencyValue
    }
  }

  async resolveModuleDependencies() {
    var dependencyPromiseArray = []
    var dependencies = []

    for (var dependencyName in this.module.dependencies) {
      let dependency = this.module.dependencies[dependencyName]

      /* dependency or extend */
      if (this.extends[dependencyName] !== undefined) {
        dependencyPromiseArray.push(this.createModuleDependency(this.extends[dependencyName]))
      } else {
        dependencyPromiseArray.push(this.createModuleDependency(dependency))
      }

      /* new extend dependencies */
      for (var extendName in this.extends) {
        let dependency = this.extends[extendName]
        if (this.module.dependencies[extendName] === undefined) {
          dependencyPromiseArray.push(this.createModuleDependency(dependency))
        }
      }
    }

    ;(await Promise.all(dependencyPromiseArray)).map((dependency) => {
      dependencies[dependency.name] = dependency.value
    })

    return dependencies
  }

  resolve () {
    /* check for replacement */
    var self = this

    if (this.isReplacement) {
      return (async function() {
        return (await self.createModuleDependency(self.replacement)).value
      })()
    }

    this.requireModule()

    var self = this

    var promise = new Promise( async function (resolve, reject) {
      /* resolve dependencies */
      let dependencies = await self.resolveModuleDependencies()

      /* dependencies are resolved we can launch moduleExecutor */
      self.module.moduleExecutor(dependencies, resolve, reject)
    } )

    if (this.module.singleton === true && this.module.promise === undefined) {
      this.module.promise = promise
    }

    return promise
  }

  /* same as module */
  get () {
    /* check for replacement */
    var self = this

    if (this.isReplacement) {
      return (async function() {
        return (await self.createModuleDependency(self.replacement)).value
      })()
    }

    this.requireModule()

    /* singleton ? */
    if (this.module.singleton === true && this.module.promise !== undefined) {
      return this.module.promise
    }

    /* module resolve promise */
    return this.resolve()
  }
}

module.exports = ModuleResolver
