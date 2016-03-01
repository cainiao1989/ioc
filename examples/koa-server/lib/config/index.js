ioc.createModule(module)
.module(function* (dep) {
  const config = {
    http: {
      port: 3000,
      host: 'localhost'
    }
  }
  
  return config
})
