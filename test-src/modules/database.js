ioc.createModule(module)
  .module(function (dep, resolve, reject) {
    setTimeout(() => {
      resolve('database ok')
    }, 0)
  })
