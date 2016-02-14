ioc.createModule(module)
  .module(async function (dep, resolve, reject) {
    throw new Error('error ok')
  })
