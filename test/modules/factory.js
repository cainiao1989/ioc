'use strict';

ioc.createModule(module).setSingleton(false).module(function (dep, resolve, reject) {
  resolve(new String('factory ok'));
});