ioc.createModule(module)
.dependencyValue('koa', require('koa'))
.module(function* (dep) {
  const app = dep.koa()
  return app
})
