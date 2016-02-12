ioc.createModule(module)
  .module(function (dep, resolve, reject) {
    resolve('database ok')
  })
