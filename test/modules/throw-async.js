'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

ioc.createModule(module).module(function () {
  var ref = _asyncToGenerator(function* (dep, resolve, reject) {
    throw new Error('error ok');
  });

  return function (_x, _x2, _x3) {
    return ref.apply(this, arguments);
  };
}());