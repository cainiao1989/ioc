(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.kuulIoc = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

function asyncToGenerator(fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new Promise(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }
        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(function (value) {
            return step("next", value);
          }, function (err) {

            return step("throw", err);
          });
        }
      }
      return step("next");
    });
  };
}

module.exports = asyncToGenerator;
},{}],2:[function(require,module,exports){
(function (process){
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
}).call(this,require('_process'))
},{"./moduleResolver":6,"_process":8,"path":7}],3:[function(require,module,exports){
'use strict';

module.exports = require('./ioc');
},{"./ioc":4}],4:[function(require,module,exports){
'use strict';

let Container = require('./container');
let Module = require('./module.js');

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
},{"./container":2,"./module.js":5}],5:[function(require,module,exports){
'use strict';

let ModuleResolver = require('./moduleResolver');
let asyncToGenerator = require('./asyncToGenerator');

class Module {
  static createDependency(name, value) {
    if (value.constructor.name == 'String') {
      return {
        name: name,
        modulePath: value,
        type: 'modulePath'
      };
    }

    if (value.constructor.name == 'ModuleResolver') {
      return {
        name: name,
        moduleResolver: value,
        type: 'moduleResolver'
      };
    }

    if (value.constructor.name == 'Module') {
      return {
        name: name,
        module: value,
        type: 'module'
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

  static createDependencyGenerator(name, value) {
    return {
      name: name,
      function: asyncToGenerator(value),
      type: 'generator'
    };
  }

  static createDependencyGeneratorOnce(name, value) {
    return {
      name: name,
      function: asyncToGenerator(value),
      resolved: false,
      type: 'generatorOnce'
    };
  }

  static createDependencyAsync(name, value) {
    return {
      name: name,
      function: value,
      type: 'async'
    };
  }

  static createDependencyAsyncOnce(name, value) {
    return {
      name: name,
      function: value,
      resolved: false,
      type: 'asyncOnce'
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

  dependencyGenerator(name, value) {
    this.dependencies[name] = Module.createDependencyGenerator(name, value);
    return this;
  }

  dependencyGeneratorOnce(name, value) {
    this.dependencies[name] = Module.createDependencyGeneratorOnce(name, value);
    return this;
  }

  dependencyAsync(name, value) {
    this.dependencies[name] = Module.createDependencyAsync(name, value);
    return this;
  }

  dependencyAsyncOnce(name, value) {
    this.dependencies[name] = Module.createDependencyAsyncOnce(name, value);
    return this;
  }

  module(moduleExecutor) {
    this.moduleExecutor = moduleExecutor;
    if (this.nodeModule instanceof Object && this.nodeModule.exports) {
      this.nodeModule.exports = this;
    }
    return this;
  }
}

module.exports = Module;
},{"./asyncToGenerator":1,"./moduleResolver":6}],6:[function(require,module,exports){
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
    if (this.modulePath === undefined) {
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
    if (this.modulePath !== undefined) {
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
},{"./asyncToGenerator":1,"./module":5,"path":7}],7:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":8}],8:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[3])(3)
});