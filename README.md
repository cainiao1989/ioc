# Kuul-ioc - node.js and browser module for promise based asynchronous inversion of control
[![npm package](https://nodei.co/npm/kuul-ioc.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/kuulioc/)

[![Build Status](https://travis-ci.org/kuul-node-stuff/ioc.svg?branch=master)](https://travis-ci.org/kuul-node-stuff/ioc)

## Motivation
>  As a node.js developer I've been missing some good asynchronous inversion of control module for Node.js. There are some, but I was not fully satisfied with them. Using native Node.js require is not always best idea, specifically for larger project. Good IoC is a foundation stone for every Javascript application, so here comes one :).

## Features
* Resolve your dependencies asynchronously with promises
* Module logic can be wrapped into promise executor, generator function or async function
* Resolve singleton instance of your module
* You can extend (add or replace) dependencies when you are resolving module
* Simple mocking modules for tests and replacements
* It's perfect to use if you like promises, ES6 generators or ES7 async / await features
* You don't have to worry about `module.export` or `export` keyword anymore, `kuul-ioc` will handle that for you
* Small and very powerful library

## Installation
```
$ npm install kuul-ioc
```
## Example folder
 You can see example usage for sample koa server

## Simple usage example
> Module definition

`file` `core/simple.js`
```javascript
var ioc = require('kuul-ioc')

ioc.createModule(module)
.dependencyValue('sentence', 'Anything can be there')
.dependencyValue('object', {'greeting' : 'Hello world !'})
.module(function (dep, resolve, reject) {
  console.log(dep.sentence)
  /* 'Anything can be there' */
  console.log(dep.object.greeting)
  /* 'Hello world !' */

  /* some async work */
  setTimeout(function () {
    resolve(dep.object.greeting)
  }, 1000)
})
```
> Module resolve

`file` `index.js`
```javascript
var ioc = require('kuul-ioc')
var appContainer = ioc.get('app').setBasePath(__dirname)

appContainer.module('core/simple').get()
.then(function(simple) {
  console.log(simple)
  /* 'Hello world !' */
})
```
## Advanced usage example
> Module definition

`file` `core/advanced.js`
```javascript
var ioc = require('kuul-ioc')
var someContainer = ioc.createContainer().setBasePath(__dirname)

ioc.createModule(module)
.dependency('simple', 'core/simple')
.dependency('simpleRelative', './simple')
.dependency('moduleResolver', someContainer.module('config') )
.dependency('moduleOnTheFly',
  ioc.createModule()
  .dependencyValue('sentence', 'Anything can be there')
  .module(function(dep, resolve, reject) {
    resolve(dep.sentence)
  })
)
.dependencyValue('sentence', 'Anything can be there')
.dependencyFunction('fcePromiseExecutor', function(resolve, reject) {
  resolve('This is like factory')
})
.dependencyFunctionOnce('fceGeneratorOnce', function* () {
  yield 'This is like singleton'
})
.module(function (dep, resolve, reject) {
  console.log(dep.sentence)
  /* 'Anything can be there' */
  console.log(dep.object.greeting)
  /* 'Hello world !' */

  /* some async work */
  setTimeout(function () {
    resolve(dep.object.greeting)
  }, 1000)
})
```
> Module resolve

`file` `index.js`
```javascript
var ioc = require('kuul-ioc')
var appContainer = ioc.get('app').setBasePath(__dirname)

appContainer.module('core/advanced').get()
.then(function(simple) {
  console.log(simple)
  /* 'Hello world !' */
})
```
## Table of contents
* [Examples](#)
  * [Module definition - file](#)
    * [Promise executor](#)
    * [ES6 generator function](#)
    * [ES7 async function](#)
  * [Module definition - on the fly](#)
  * [Module resolve](#)
    * [Singleton](#)
    * [Factory](#)
    * [ES7 async/await](#)
* [Api](#api)


## Module definition - file
#### Module definition - file with Promise executor
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

#### Module definition - file with ES6 generator function
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

#### Module definition - file with ES7 async function
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
Now you dont' pass module variable into createModule function
  ioc.createModule(module)
  you leave it empty
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
```javascript
ioc.get('containerName').module('someModule').get()
```
> `get()` if module is singleton it will be resolved only the first time, next time you call get() on singleton module it will return cached result - it will be exact same result as the first time, see [Module resolve - singleton](#)

```javascript
ioc.get('containerName').module('someModule').resolve()
```
> `resolve()` Does not care if module is a singleton, it will always return a new instance - it always run your module function and fetch the result, see [Module resolve - factory](#)

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
#### Module resolve - Singeton
> Module is singleton by default, you don't have to use
setSingleton(true), `file` `core/config.js`

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

        resolve() will ignore module singleton boolean, it will always run module executor function and fetch result
      */
    })
  })
})

```

#### Module resolve - Factory
> In this example `co` module is used to transform generator function to async control flow, you can read more about it here [https://www.npmjs.com/package/co](https://www.npmjs.com/package/co)

> `kuul-ioc` use `co` module internally to resolve your generator function, so you can use all it's features

> `co` module internally also uses `koa`

```javascript
var ioc = require('kuul-ioc')
var co = require('co')

ioc.get('nameForContainer').setBasePath(__dirname)
var moduleResolver = ioc.get('nameForContainer').module('core/factory')
co(function* () {
  var factoryA = yield moduleResolver.get()
  var factoryB = yield moduleResolver.get()
  var factoryC = yield moduleResolver.get()
  /* this would be the same as above, because core/factory.js have
    setSingleton(false)

  var factoryA = yield moduleResolver.resolve()
  var factoryB = yield moduleResolver.resolve()
  var factoryC = yield moduleResolver.resolve()
  */

  console.log( configA === configB )
  /* returns false */
  console.log( configA === configC )
  /* returns false */

})
```

#### Module resolve - ES7 async/await
> To run this example, you will have to use some compiler, ex. [babel](https://babeljs.io/)

`file` `.babelrc`
```json
{
  "presets": [ "es2015-node5", "stage-3" ]
}
```

```javascript
var ioc = require('kuul-ioc')
var co = require('co')

ioc.get('nameForContainer').setBasePath(__dirname)
var moduleResolver = ioc.get('nameForContainer').module('core/factory')

(async function() {
  var factory = await moduleResolver.get()
})()
```

## Api

* [Ioc](#class-ioc)
  * [get(name)](#iocgetname)
  * [createContainer()](#ioccreatecontainer)
  * [createModule([module])](#ioccreatemodulemodule)
* [Container](#class-container)
  * [setBasePath(basePath)](#containersetbasepathbasepath)
  * [module(modulePath)](#containermodulemodulepath)
  * [getReplacements()](#containergetreplacements)
  * [setReplacements(mixed)](#containersetreplacementsmixed)
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
> Create new or return an existing instance of `Container`

#### ioc.createContainer()

`return` `Container` instance
> Create a new instance of `Container`

#### ioc.createModule([`module`])
  * `module` Node.js `module` keyword, used to `module.exports` or `exports` Objects from native Node.js module system

`return` `Module` instance

> Create a new instance of `Module`

Parameter `module` is optional because you can create `Module` instance on the fly - `kuulioc` will not internally call `require` function to get `Module` instance. So basically, you don't provide any parameters when your're creating `Module` instance on the fly.

## Class: Container

#### container.setBasePath(`basePath`)
  * `basePath` `String`  Base path of container

`return` `Container` instance
> Set base path of the container

#### container.module(`modulePath`)
  * `modulePath` `String`  Path to requested module

`return` `ModuleResolver` instance
> Create `ModuleResolver` instance for module specified by `modulePath`

#### container.getReplacements()

`return` replacements Object
> Get a `Container` replacements Object

#### container.setReplacements(`mixed`)

  * `mixed` `Container` | `Object`

`return` `ModuleResolver` instance
> Set replacements object. Replacements object is used with all `ModuleResolved`.`set*` functions, also used when resolving replaced/mocked modules


## Class: Module

#### module.setSingleton(`boolean`)
* `boolean` `Boolean`

`return` `Module` instance
> It specify if module should be resolved as a singleton or a new instance every time you resolve it

#### module.dependency(`name`, `mixed`)
* `name` `String`  Name of a dependency when it will be resolved and put in a module function
* `mixed` `String` | `ModuleResolver` | `Module`

`return` `Module` instance
> Add a dependency to your module

#### module.dependencyValue(`name`, `mixed`)
* `name` `String`  Name of the dependency when it gets resolved and put in a module function
* `mixed` `Mixed`  Anything

`return` `Module` instance
> Add a dependency to your module

#### module.dependencyFunction(`name`, `mixed`)
* `name` `String`  Name of the dependency when it gets resolved and put in module function
* `mixed` `Function` | `GeneratorFunction` | `AsyncFunction`

`return` `Module` instance
> Add a dependency to your module

#### module.dependencyFunctionOnce(`name`, `mixed`)
* `name` `String`  Name of the dependency when it gets resolved and put in module function
* `mixed` `Function` | `GeneratorFunction` | `AsyncFunction`

`return` `Module` instance
> Add a dependency to your module

#### module.module(`mixed`)
* `mixed` `Function` | `GeneratorFunction` | `AsyncFunction`

`return` `Module` instance
> Function that handle a logic of module - function that return content of module

## Class: ModuleResolver
#### moduleResolver.get()
`return` `Promise` instance
> Asynchronously resolve module: if module is singleton it gets resolved only the first time, next time you call get() on singleton module it returns the same result as a first time

#### moduleResolver.resolve()
`return` `Promise` instance
> Asynchronously resolve module, it does not care if module is singleton, it always returns a new instance - it always run your module function and fetch the result

#### moduleResolver.extend(`name`, `mixed`)
* `name` `String`  Name of the added or replaced dependency
* `mixed` `String` | `ModuleResolver` | `Module`

`return` `ModuleResolver` instance
> Add or replace a dependency to your module

#### moduleResolver.extendValue(`name`, `mixed`)
* `name` `String`  Name of the added or replaced dependency
* `mixed` `Mixed`  Anything

`return` `ModuleResolver` instance
> Add or replace dependency to your module

#### moduleResolver.extendFunction(`name`, `mixed`)
* `name` `String`  Name of the added or replaced dependency
* `mixed` `Function` | `GeneratorFunction` | `AsyncFunction`

`return` `ModuleResolver` instance
> Add or replace dependency to your module

#### moduleResolver.extendFunctionOnce(`name`, `mixed`)
* `name` `String`  Name of the added or replaced dependency
* `mixed` `Function` | `GeneratorFunction` | `AsyncFunction`

`return` `ModuleResolver` instance
> Add or replace dependency to your module

#### moduleResolver.set(`mixed`)
* `mixed` `String` | `ModuleResolver` | `Module`

`return` `ModuleResolver` instance
> It replaces your module

#### moduleResolver.setValue(`mixed`)
* `mixed` `Mixed`  Anything

`return` `ModuleResolver` instance
> It replaces your module

#### moduleResolver.setFunction(`mixed`)
* `mixed` `Function` | `GeneratorFunction` | `AsyncFunction`

`return` `ModuleResolver` instance
> It replaces your module

#### moduleResolver.setFunctionOnce(`mixed`)
* `mixed` `Function` | `GeneratorFunction` | `AsyncFunction`

`return` `ModuleResolver` instance
> It replaces your module
