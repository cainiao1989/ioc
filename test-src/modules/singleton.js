ioc.createModule(module)
  .module(function (dep, resolve, reject) {
    resolve(new String('singleton ok'))
  })
