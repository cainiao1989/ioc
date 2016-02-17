# Kuul-ioc  Node.js and browser module for asynchronous promise based inversion of control
[![npm package](https://nodei.co/npm/kuul-ioc.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/kuulioc/)

[![Build Status](https://travis-ci.org/kuul-node-stuff/ioc.svg?branch=master)](https://travis-ci.org/kuul-node-stuff/ioc)

## Motivation
>  As Node.js developer I really missed some good asynchronous inversion of controll module for Node.js, there are some but I was not fully satisfied with them. Also using native Node.js require is not always best idea, definetly not for bigger project. Good IoC is foundation stone for every Javascript application, so here you have one :)

## Features
* Resolve your dependencies asynchronously with promises
* Module logic can be wrapped into promise executor, generator function or async function
* Resolve singleton instance of your module
* You can extend ( add or replace ) dependencies when you resolving module
* Simple mocking modules for tests and replacement
* It's perfect to use if you like promises, ES6 generators or ES7 async / await features
* You don't have to worry about `module.export` or `export` keyword anymore, `kuul-ioc` will handle that for you
* Small and very powerfull library

## Simple usage
```javascript
let ioc = require('kuul-ioc')

ioc.createModule(module)
  .dependency('database', 'core/database')
  .module(function (dep, resolve, reject) {

    dep.database
      .connect()
      .then(function(dbConnection) {
        resolve(dbConnection)
      })

  })
```

## Table of contents
* [Examples](#)
  * [Module definition - file based](#)
    * [Promise](#)
    * [ES6 generator function](#)
    * [ES7 async function](#)
  * [Module definition - on the fly](#)
  * [Module resolve](#)
    * [Singeton](#)
    * [Factory](#)
    * [ES7 async/await](#)
* [Api](#api)


## Module definition - file based
#### Module definition - Promise executor
`file` `hello-world.js`
```javascript
var ioc = require('ioc')

ioc
.createModule(module)
.module(function (dep, resolve, reject) {
  setTimeout(function() {
    resolve('Hello world')
  }, 1000)
})
```

#### Module definition - ES6 generator function
`file` `hello-world.js`
```javascript
var ioc = require('ioc')

ioc
.createModule(module)
.module(function* (dep) {
  yield new Promise(function (resolve, reject) {
    setTimeout(resolve, 1000)
  })

  return 'Hello world'
})
```

#### Module definition - ES7 async function
`file` `hello-world.js`
```javascript
var ioc = require('ioc')

ioc
.createModule(module)
.module(async function (dep) {
  await new Promise(function (resolve, reject) {
    setTimeout(resolve, 1000)
  })

  return 'Hello world'
})
```
## Module definition - on the fly
```javascript
var ioc = require('ioc')

var container = ioc.createContainer().setBasePath('/')
/*
we don't use
  ioc.createModule(module)
but
  ioc.createModule()
*/
var onTheFlyModule = ioc
  .createModule()
  .module(function* (dep) {
    yield new Promise(function (resolve, reject) {
      setTimeout(resolve, 1000)
    })

    return 'Hello world'
  })

container.module('not/real/path').set(onTheFlyModule)
```

## Module resolve
This will be our file structure

`file` `core/config.js`
```javascript
ioc
.createModule(module)
.module(async function (dep) {
  return 'config'
})
```

`file` `core/factory.js`
```javascript
ioc
.createModule(module)
.setSingleton(false)
.module(async function (dep) {
  return 'factory'
})
```
#### Singeton
```javascript
var ioc = require('kuul-ioc')
ioc.get('nameForContainer').setBasePath(__dirname)

var moduleResolver = ioc.get('nameForContainer').module('core/config')

moduleResolver.get().then(function(configA) {
  moduleResolver.get().then(function(configB) {
    moduleResolver.resolve().then(function(configC) {
      console.log( configA === configB )
      /* returns true */
      console.log( configA === configC )
      /* returns false

        resolve() will ignore module singeton boolean, it will always run module executor function and fetch results
      */
    })
  })
})

```

#### Factory
```javascript
var ioc = require('kuul-ioc')
var co = require('co')

ioc.get('nameForContainer').setBasePath(__dirname)
var moduleResolver = ioc.get('nameForContainer').module('core/factory')
co(function* () {
  var configA = yield moduleResolver.get()
  var configB = yield moduleResolver.get()
  var configC = yield moduleResolver.get()
  /* this would be same as above, because core/factory.js have
    setSingleton(false)

  var configA = yield moduleResolver.resolve()
  var configB = yield moduleResolver.resolve()
  var configC = yield moduleResolver.resolve()
  */

  console.log( configA === configB )
  /* returns false */
  console.log( configA === configC )
  /* returns false */

})
```

## Api

* [Ioc](#class-ioc)
  * [get(name)](#iocgetname)
  * [createContainer()](#ioccreatecontainer)
  * [createModule([module])](#ioccreatemodulemodule)
* [Container](#class-container)
  * [setBasePath(basePath)](#containersetbasepathbasepath)
  * [module(modulePath)](#containermodulemodulepath)
* [Module](#class-module)
  * [setSingleton(boolean)](#modulesetsingletonboolean)
  * [dependency(name, mixed)](#moduledependencyname-mixed)
  * [dependencyValue(name, mixed)](#moduledependencyvaluename-mixed)
  * [dependencyFunction(name, mixed)](#moduledependencyfunctionname-mixed)
  * [dependencyFunctionOnce(name, mixed)](#moduledependencyfunctiononcename-mixed)
  * [module(mixed)](#modulemodulemixed)
* [ModuleResolver](#class-moduleresolver)
  * [get()](#moduleresolverget)
  * [resolve()](#moduleresolverresolve)
  * [extend(name, mixed)](#moduleresolverextendname-mixed)
  * [extendValue(name, mixed)](#moduleresolverextendvaluename-mixed)
  * [extendFunction(name, mixed)](#moduleresolverextendfunctionname-mixed)
  * [extendFunctionOnce(name, mixed)](#moduleresolverextendfunctiononcename-mixed)
  * [set(mixed)](#moduleresolversetmixed)
  * [setValue(mixed)](#moduleresolversetvaluemixed)
  * [setFunction(mixed)](#moduleresolversetfunctionmixed)
  * [setFunctionOnce(mixed)](#moduleresolversetfunctiononcemixed)

## Class: Ioc

#### ioc.get(`name`)
  * `name` `String`  Name of container

`return` `Container` instance
> Create new or return existing instance of `Container`

#### ioc.createContainer()

`return` `Container` instance
> Create new instance of `Container`

#### ioc.createModule([`module`])
  * `module` Node.js `module` keyword, used to `module.exports` or `exports` Objects from native Node.js module system

`return` `Module` instance

> Create new instance of `Module`

Parameter `module` is optional because you can create `Module` instance on fly so `kuulioc` will not internally call `require` function to get `Module` instance. So basically you don't provide any parameter when creating `Module` instance on fly.

## Class: Container

#### container.setBasePath(`basePath`)
  * `basePath` `String`  Base path of container

`return` `Container` instance
> Set base path of container

#### container.module(`modulePath`)
  * `modulePath` `String`  Path to requested module

`return` `ModuleResolver` instance
> Create `ModuleResolver` instance for module specified by `modulePath`

## Class: Module

#### module.setSingleton(`boolean`)
* `boolean` `Boolean`

`return` `Module` instance
> It specify if module should be resolved as singleton or new instance every time you resolve it

#### module.dependency(`name`, `mixed`)
* `name` `String`  Name of dependency when it will be resolved and put in module function
* `mixed` `String` | `ModuleResolver` | `Module`

`return` `Module` instance
> Add dependency to your module

#### module.dependencyValue(`name`, `mixed`)
* `name` `String`  Name of dependency when it will be resolved and put in module function
* `mixed` `Mixed`  Anything

`return` `Module` instance
> Add dependency to your module

#### module.dependencyFunction(`name`, `mixed`)
* `name` `String`  Name of dependency when it will be resolved and put in module function
* `mixed` `Function` | `GeneratorFunction` | `AsyncFunction`

`return` `Module` instance
> Add dependency to your module

#### module.dependencyFunctionOnce(`name`, `mixed`)
* `name` `String`  Name of dependency when it will be resolved and put in module function
* `mixed` `Function` | `GeneratorFunction` | `AsyncFunction`

`return` `Module` instance
> Add dependency to your module

#### module.module(`mixed`)
* `mixed` `Function` | `GeneratorFunction` | `AsyncFunction`

`return` `Module` instance
> Function that handle logic of module or in other words function that return content of module

## Class: ModuleResolver
#### moduleResolver.get()
`return` `Promise` instance
> Asynchronously resolve module, if module is singleton it will be resolved only first time, next time you call get() on singleton module it will return the same result as first time

#### moduleResolver.resolve()
`return` `Promise` instance
> Asynchronously resolve module, it does not care if module is singleton, it will always return a new instance. Basically it always run your module function and fetch the result

#### moduleResolver.extend(`name`, `mixed`)
* `name` `String`  Name of dependency that will be added or replaced
* `mixed` `String` | `ModuleResolver` | `Module`

`return` `ModuleResolver` instance
> Add or replace dependency to your module

#### moduleResolver.extendValue(`name`, `mixed`)
* `name` `String`  Name of dependency that will be added or replaced
* `mixed` `Mixed`  Anything

`return` `ModuleResolver` instance
> Add or replace dependency to your module

#### moduleResolver.extendFunction(`name`, `mixed`)
* `name` `String`  Name of dependency that will be added or replaced
* `mixed` `Function` | `GeneratorFunction` | `AsyncFunction`

`return` `ModuleResolver` instance
> Add or replace dependency to your module

#### moduleResolver.extendFunctionOnce(`name`, `mixed`)
* `name` `String`  Name of dependency that will be added or replaced
* `mixed` `Function` | `GeneratorFunction` | `AsyncFunction`

`return` `ModuleResolver` instance
> Add or replace dependency to your module

#### moduleResolver.set(`mixed`)
* `mixed` `String` | `ModuleResolver` | `Module`

`return` `ModuleResolver` instance
> It replace your module

#### moduleResolver.setValue(`mixed`)
* `mixed` `Mixed`  Anything

`return` `ModuleResolver` instance
> It replace your module

#### moduleResolver.setFunction(`mixed`)
* `mixed` `Function` | `GeneratorFunction` | `AsyncFunction`

`return` `ModuleResolver` instance
> It replace your module

#### moduleResolver.setFunctionOnce(`mixed`)
* `mixed` `Function` | `GeneratorFunction` | `AsyncFunction`

`return` `ModuleResolver` instance
> It replace your module
