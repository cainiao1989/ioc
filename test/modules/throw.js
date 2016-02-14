'use strict';

ioc.createModule(module).module(function (dep, resolve, reject) {
  throw new Error('error ok');
});