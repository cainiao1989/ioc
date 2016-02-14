'use strict';

ioc.createModule(module).module(function* (dep, resolve, reject) {
  yield new Promise((resolve, reject) => {
    setTimeout(resolve, 10);
  });

  return 'config ok';
});