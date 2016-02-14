'use strict';

ioc.createModule(module).module(function (dep, resolve, reject) {
  reject(new Error('error ok'));
});