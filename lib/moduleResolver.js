'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

var path = require('path');
var Module = require('./module');

class ModuleResolver {
  constructor(options) {
    this.ioc = options.ioc;
    this.modulePath = options.modulePath;
    this.extends = {};
    /* check replacement */
    this.checkForReplacement();

    if (!this.isReplacement) {
      this.module = this.requireModule();
    } else {
      if (this.replacement.type == 'module') {
        return new ModuleResolver({ ioc: this.ioc, modulePath: this.replacement.path });
      }
      if (this.replacement.type == 'moduleResolver') {
        return this.replacement.moduleResolver;
      }
    }
  }

  checkForReplacement() {
    this.isReplacement = false;
    var moduleFullPath = this.getModuleNormalizePath();
    if (this.ioc.replacements[moduleFullPath] !== undefined) {
      this.isReplacement = true;
      this.replacement = this.ioc.replacements[moduleFullPath];
    }
  }

  getModuleNormalizePath() {
    return this.ioc.getModuleNormalizePath(this.modulePath);
  }

  getModuleNormalizeDirectory() {
    return path.dirname(path.join(this.ioc.basePath, this.modulePath));
  }

  getDependencyPath(dependencyModulePath) {
    /* is relative to this module */
    if (dependencyModulePath[0] === '.') {
      let fullPath = path.join(this.getModuleNormalizeDirectory(), dependencyModulePath);
      /* remove the basePath part */
      dependencyModulePath = fullPath.replace(this.ioc.basePath, '');
    }

    return dependencyModulePath;
  }

  requireModule() {
    return require(this.getModuleNormalizePath());
  }

  extend(name, value) {
    this.extends[name] = Module.createDependency(name, value);
    return this;
  }

  extendValue(name, value) {
    this.extends[name] = Module.createDependencyValue(name, value);
    return this;
  }

  extendPromise(name, value) {
    this.extends[name] = Module.createDependencyPromise(name, value);
    return this;
  }

  extendExecutor(name, value) {
    this.extends[name] = Module.createDependencyExecutor(name, value);
    return this;
  }

  createModuleDependency(dependency) {
    var _this = this;

    return _asyncToGenerator(function* () {
      var dependencyValue = null;

      switch (dependency.type) {
        case 'module':
          dependencyValue = yield new ModuleResolver({ ioc: _this.ioc, modulePath: _this.getDependencyPath(dependency.path) }).get();
          break;
        case 'moduleResolver':
          dependencyValue = yield dependency.moduleResolver.get();
          break;
        case 'value':
          dependencyValue = dependency.value;
          break;
        case 'promise':
          dependencyValue = yield dependency.promise;
          break;
        case 'executor':
          dependencyValue = yield new Promise(dependency.executor);
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

  resolveModuleDependencies() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      var dependencyPromiseArray = [];
      var dependencies = [];

      for (var dependencyName in _this2.module.dependencies) {
        let dependency = _this2.module.dependencies[dependencyName];

        /* dependency or extend */
        if (_this2.extends[dependencyName] !== undefined) {
          dependencyPromiseArray.push(_this2.createModuleDependency(_this2.extends[dependencyName]));
        } else {
          dependencyPromiseArray.push(_this2.createModuleDependency(dependency));
        }

        /* new extend dependencies */
        for (var extendName in _this2.extends) {
          let dependency = _this2.extends[extendName];
          if (_this2.module.dependencies[extendName] === undefined) {
            dependencyPromiseArray.push(_this2.createModuleDependency(dependency));
          }
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
    var self = this;

    if (this.isReplacement) {
      return _asyncToGenerator(function* () {
        return (yield self.createModuleDependency(self.replacement)).value;
      })();
    }

    var self = this;

    var promise = new Promise(function () {
      var ref = _asyncToGenerator(function* (resolve, reject) {
        /* resolve dependencies */
        let dependencies = yield self.resolveModuleDependencies();

        /* dependencies are resolved we can launch moduleExecutor */
        self.module.moduleExecutor(dependencies, resolve, reject);
      });

      return function (_x, _x2) {
        return ref.apply(this, arguments);
      };
    }());

    return promise;
  }

  /* same as module */
  get() {
    /* check for replacement */
    var self = this;

    if (this.isReplacement) {
      return _asyncToGenerator(function* () {
        return (yield self.createModuleDependency(self.replacement)).value;
      })();
    }

    /* singleton ? */
    if (this.module.singleton === true && this.module.promise !== undefined) {
      return this.module.promise;
    }

    /* module resolve promise */
    let promise = this.resolve();

    if (this.module.singleton === true) {
      this.module.promise = promise;
    }

    return promise;
  }
}

module.exports = ModuleResolver;