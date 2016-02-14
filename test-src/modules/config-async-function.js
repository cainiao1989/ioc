ioc.createModule(module)
  .module(async function (dep, resolve, reject) {
    await new Promise( (resolve, reject) => {
      setTimeout(resolve, 10)
    })

    return 'config ok'
  })
