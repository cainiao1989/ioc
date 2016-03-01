ioc.createModule(module)
.dependency('config', './config')
.dependency('app', './core/app')
.dependency('router', './core/router')
.dependency('http', './core/http')
.dependencyValue('fs', require('fs'))
.module(function* (dep) {
  /* wait for db connect */
  const resourceNames = yield (callback) => dep.fs.readdir(ioc.get('resource').basePath, callback)

  /* load all routes */
  yield resourceNames.map((resourceName) => {
    ioc.get('resource').module(`${resourceName}/router`).get()
      .catch((err) => {
        console.log(resourceName, 'do not have router file')
      })
    })

  /* wait for server listen */
  yield (callback) => dep.http.listen(dep.config.http, callback)
})
