ioc.createModule(module)
.dependency('app', './app')
.dependencyValue('http', require('http'))
.module(function* (dep) {
  const server = dep.http.createServer(dep.app.callback())
  return server
})
