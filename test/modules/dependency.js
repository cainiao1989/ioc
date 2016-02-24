'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

ioc.createModule(module).dependency('module', './config').dependency('module2', '../modules/config').dependency('moduleResolver', ioc.get('test').module('modules/config')).dependency('moduleOnTheFly', ioc.createModule().module(_asyncToGenerator(function* () {
  return 'moduleOnTheFly ok';
}))).dependencyValue('value', 'value ok').dependencyFunction('generator', (() => {
  let count = 0;
  return function* () {
    count++;
    return { name: 'generator ok', count: count };
  };
})()).dependencyFunctionOnce('generatorOnce', (() => {
  let count = 0;
  return function* () {
    count++;
    return { name: 'generatorOnce ok', count: count };
  };
})()).dependencyFunction('async', (() => {
  let count = 0;
  return _asyncToGenerator(function* () {
    count++;
    return { name: 'async ok', count: count };
  });
})()).dependencyFunctionOnce('asyncOnce', (() => {
  let count = 0;
  return _asyncToGenerator(function* () {
    count++;
    return { name: 'asyncOnce ok', count: count };
  });
})()).dependencyFunction('promise', (() => {
  let count = 0;
  return () => {
    count++;
    return new Promise((resolve, reject) => {
      resolve({ name: 'promise ok', count: count });
    });
  };
})()).dependencyFunctionOnce('promiseOnce', (() => {
  let count = 0;
  return () => {
    count++;
    return new Promise((resolve, reject) => {
      resolve({ name: 'promiseOnce ok', count: count });
    });
  };
})()).module(function (dep, resolve, reject) {
  resolve(dep);
});