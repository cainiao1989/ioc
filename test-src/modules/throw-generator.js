ioc.createModule(module)
  .module(function * (dep, resolve, reject) {
    yield new Promise((resolve) => {
      setTimeout(resolve, 10)
    })
    throw new Error('error ok')
  })
