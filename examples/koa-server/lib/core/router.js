ioc.createModule(module)
.dependency('app', './app')
.dependencyValue('router', require('koa-router'))
.module(function* (dep) {
  const router = new dep.router({
    prefix: '/api/'
  })

  return router
})
