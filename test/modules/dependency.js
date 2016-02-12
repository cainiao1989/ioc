'use strict';

ioc.createModule(module).dependency('module', './config').dependency('module2', '../modules/config').dependency('moduleResolver', ioc.get('test').module('modules/config')).dependencyValue('value', 'value ok').dependencyPromise('promise', new Promise((resolve, reject) => {
  resolve('promise ok');
})).dependencyExecutor('executor', (resolve, reject) => {
  resolve('executor ok');
}).dependencyFunction('function', () => {
  return new Promise((resolve, reject) => {
    resolve('function ok');
  });
}).module(function (dep, resolve, reject) {
  resolve(dep);
});