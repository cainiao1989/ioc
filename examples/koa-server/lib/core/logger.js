ioc.createModule(module)
.module(function* (dep) {
  class Logger {
    log(message) {
      console.log(message)
    }
  }

  return new Logger
})
