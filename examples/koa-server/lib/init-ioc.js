global.ioc = require(`${process.cwd()}`)

ioc.get('app').setBasePath(`${__dirname}`)
ioc.get('config').setBasePath(`${__dirname}/core/config`)
ioc.get('core').setBasePath(`${__dirname}/core`)
ioc.get('resource').setBasePath(`${__dirname}/resource`)
