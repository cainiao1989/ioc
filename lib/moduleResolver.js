'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

let path = require('path');
let Module = require('./module');
let asyncToGenerator = require('./asyncToGenerator');

class ModuleResolver {
  constructor(options) {
    this.container = options.container;
    this.modulePath = options.modulePath;
    this.module = options.module;

    this.extends = {};

    /* check replacement only if modulePath is not set */
    if (this.module !== undefined) {
      return this;
    }

    this.checkForReplacement();
    if (this.isReplacement) {
      return this.getModuleResolverReplacement();
    }
  }

  checkForReplacement() {
    this.isReplacement = false;
    let moduleFullPath = this.getModuleNormalizePath();
    if (this.container.replacements[moduleFullPath] !== undefined) {
      this.isReplacement = true;
      this.replacement = this.container.replacements[moduleFullPath];
    }
  }

  getModuleResolverReplacement() {
    if (this.replacement.type == 'modulePath') {
      return new ModuleResolver({ container: this.container, modulePath: this.replacement.modulePath });
    }
    if (this.replacement.type == 'moduleResolver') {
      return this.replacement.moduleResolver;
    }
    if (this.replacement.type == 'module') {
      return new ModuleResolver({ container: this.container, module: this.replacement.module });
    }
    return this;
  }

  getModuleNormalizePath() {
    return path.normalize(path.join(this.container.basePath, this.modulePath));
  }

  getModuleNormalizeDirectory() {
    return path.dirname(path.join(this.container.basePath, this.modulePath));
  }

  getDependencyPath(dependencyModulePath) {
    /* is relative to this module */
    if (dependencyModulePath[0] === '.') {
      let fullPath = path.join(this.getModuleNormalizeDirectory(), dependencyModulePath);
      /* remove the basePath part */
      dependencyModulePath = fullPath.replace(this.container.basePath, '');
    }

    return dependencyModulePath;
  }

  requireModule() {
    if (this.module === undefined) {
      this.module = require(this.getModuleNormalizePath());
    }
    return this.module;
  }

  extend(name, value) {
    this.extends[name] = Module.createDependency(name, value);
    return this;
  }

  extendValue(name, value) {
    this.extends[name] = Module.createDependencyValue(name, value);
    return this;
  }

  extendGenerator(name, value) {
    this.extends[name] = Module.createDependencyGenerator(name, value);
    return this;
  }

  extendGeneratorOnce(name, value) {
    this.extends[name] = Module.createDependencyGeneratorOnce(name, value);
    return this;
  }

  extendAsync(name, value) {
    this.extends[name] = Module.createDependencyAsync(name, value);
    return this;
  }

  extendAsyncOnce(name, value) {
    this.extends[name] = Module.createDependencyAsyncOnce(name, value);
    return this;
  }

  set(value) {
    let name = this.getModuleNormalizePath();
    this.container.replacements[name] = Module.createDependency(name, value);
    this.checkForReplacement();

    let moduleResolverReplacement = this.getModuleResolverReplacement();

    for (let member in this) {
      delete this[member];
    }

    Object.assign(this, moduleResolverReplacement);
    return this;
  }

  setValue(value) {
    let name = this.getModuleNormalizePath();
    this.container.replacements[name] = Module.createDependencyValue(name, value);
    this.checkForReplacement();
    return this;
  }

  setGenerator(value) {
    let name = this.getModuleNormalizePath();
    this.container.replacements[name] = Module.createDependencyGenerator(name, value);
    this.checkForReplacement();
    return this;
  }

  setGeneratorOnce(value) {
    let name = this.getModuleNormalizePath();
    this.container.replacements[name] = Module.createDependencyGeneratorOnce(name, value);
    this.checkForReplacement();
    return this;
  }

  setAsync(value) {
    let name = this.getModuleNormalizePath();
    this.container.replacements[name] = Module.createDependencyAsync(name, value);
    this.checkForReplacement();
    return this;
  }

  setAsyncOnce(value) {
    let name = this.getModuleNormalizePath();
    this.container.replacements[name] = Module.createDependencyAsyncOnce(name, value);
    this.checkForReplacement();
    return this;
  }

  moduleExecutorPromise() {
    let self = this;

    return new Promise(function () {
      var ref = _asyncToGenerator(function* (resolve, reject) {
        /* resolve dependencies */
        let dependencies;
        try {
          dependencies = yield self.resolveModuleDependencies();
        } catch (error) {
          return reject(error);
        }

        /* dependencies was resolved we can launch moduleExecutor */
        let moduleFunction;

        /* GeneratorFunction */
        if (self.module.moduleExecutor.constructor.name == 'GeneratorFunction') {
          moduleFunction = asyncToGenerator(self.module.moduleExecutor)(dependencies, resolve, reject).catch(function (error) {
            reject(error);
          });

          /* @TODO ES7 async function detection, wait till it will be standard
             function or async function, babel regenerator return function */
        } else {
            moduleFunction = function () {
              let result = undefined;
              try {
                result = self.module.moduleExecutor(dependencies, resolve, reject);
              } catch (error) {
                /* unhandled moduleFunction error
                   This happens only when moduleExecutor is only normal function ex. function() {}
                */
                reject(error);
              }

              if (!(result instanceof Object) || !(result.catch instanceof Function)) {
                /* It's normal function, let's do dirty hack it so no unhandledRejection will appear */
                result = {
                  catch: function _catch() {}
                };
              }
              return result;
            }().catch(reject);
          }

        if (moduleFunction && moduleFunction.then instanceof Function) {
          moduleFunction.then(resolve);
        }
      });

      return function (_x, _x2) {
        return ref.apply(this, arguments);
      };
    }());
  }

  resolveModuleDependency(dependency) {
    var _this = this;

    return _asyncToGenerator(function* () {
      let dependencyValue = null;
      switch (dependency.type) {
        case 'modulePath':
          dependencyValue = yield new ModuleResolver({ container: _this.container, modulePath: _this.getDependencyPath(dependency.modulePath) }).get();
          break;
        case 'moduleResolver':
          dependencyValue = yield dependency.moduleResolver.get();
          break;
        case 'module':
          dependencyValue = yield new ModuleResolver({ container: _this.container, module: _this.replacement.module }).get();
          break;
        case 'value':
          dependencyValue = dependency.value;
          break;
        case 'generator':
          dependencyValue = yield dependency.function();
          break;
        case 'generatorOnce':
          if (!dependency.resolved) {
            dependencyValue = yield dependency.function();
            delete dependency.function;
            dependency.resolved = true;
            dependency.value = dependencyValue;
          } else {
            dependencyValue = dependency.value;
          }
          break;
        case 'async':
          dependencyValue = yield dependency.function();
          break;
        case 'asyncOnce':
          if (!dependency.resolved) {
            dependencyValue = yield dependency.function();
            delete dependency.function;
            dependency.resolved = true;
            dependency.value = dependencyValue;
          } else {
            dependencyValue = dependency.value;
          }
          break;
        default:
          throw new Error('Unknown dependency.type');
      }

      return {
        name: dependency.name,
        value: dependencyValue
      };
    })();
  }

  resolveReplacement() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      return (yield _this2.resolveModuleDependency(_this2.replacement)).value;
    })();
  }

  resolveModuleDependencies() {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      let dependencyPromiseArray = [];
      let dependencies = [];

      for (let dependencyName in _this3.module.dependencies) {
        let dependency = _this3.module.dependencies[dependencyName];

        /* dependency or extend */
        if (_this3.extends[dependencyName] !== undefined) {
          dependencyPromiseArray.push(_this3.resolveModuleDependency(_this3.extends[dependencyName]));
        } else {
          dependencyPromiseArray.push(_this3.resolveModuleDependency(dependency));
        }
      }

      /* new extend dependencies */
      for (let extendName in _this3.extends) {
        let dependency = _this3.extends[extendName];

        if (_this3.module.dependencies[extendName] === undefined) {
          dependencyPromiseArray.push(_this3.resolveModuleDependency(dependency));
        }
      }

      ;(yield Promise.all(dependencyPromiseArray)).map(function (dependency) {
        dependencies[dependency.name] = dependency.value;
      });

      return dependencies;
    })();
  }

  resolve() {
    /* check for replacement */
    let self = this;

    if (this.isReplacement) {
      return this.resolveReplacement();
    }

    this.requireModule();

    let promise = this.moduleExecutorPromise();

    if (this.module.singleton === true && this.module.promise === undefined) {
      this.module.promise = promise;
    }

    return promise;
  }

  get() {
    /* check for replacement */
    let self = this;

    if (this.isReplacement) {
      return this.resolveReplacement();
    }

    this.requireModule();

    /* singleton ? */
    if (this.module.singleton === true && this.module.promise !== undefined) {
      return this.module.promise;
    }

    /* module resolve promise */
    return this.resolve();
  }
}

module.exports = ModuleResolver;