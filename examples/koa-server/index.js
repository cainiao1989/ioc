require('./lib/init-ioc')

process.on('unhandledRejection', (reason, p) => {
    console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason.stack);
    // application specific logging, throwing an error, or other logic here
});

ioc.get('app').module('server').get()
.then(() => {
  console.log('Server running')
})
.catch((error) => {
  console.log('Server error', error.stack)
})
