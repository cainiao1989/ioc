# Kuul-ioc - Node.js and browser module for asynchronous promise based inversion of control
[![npm package](https://nodei.co/npm/kuul-ioc.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/kuul-ioc/)

[![Build Status](https://travis-ci.org/kuul/ioc.svg?branch=master)](https://travis-ci.org/kuul/ioc)

## Motivation
>  As Node.js developer I really missed some good asynchronous inversion of controll module for Node.js, there are some but I was not fully satisfied with them. Also using native Node.js require is not always best idea, definetly not for bigger project. Good IoC is foundation stone for every Javascript application, so here you have one :)

## Features
* Resolve your dependencies asynchronously with promises
* Module logic can be wrapped into promise executor, generator function or async function
* Resolve singleton instance of your module
* You can extend ( add or replace ) dependencies when you resolving module
* Simple mocking modules for tests and replacement
* It's perfect to use if you like promises, ES6 generators or ES7 async / await features
* You don't have to worry about `module.export` or `export` keyword anymore, kuul-ioc will handle that for you
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
- [Api](#Api)



##  Api
* [Ioc](#Class: Ioc)
  * get(name)
  * createContainer()
  * createModule([module])
* Container
  * setBasePath(basePath)
  * module(modulePath)
* Module
  * setSingleton(boolean)
  * dependency(name, mixed)
  * dependencyValue(name, mixed)
  * dependencyGenerator(name, function)
  * dependencyGeneratorOnce(name, function)
  * dependencyAsync(name, function)
  * dependencyAsyncOnce(name, function)
  * module(function)
* ModuleResolver
  * get()
  * resolve()
  * extend(name, mixed)
  * extendValue(name, mixed)
  * extendGenerator(name, function)
  * extendGeneratorOnce(name, function)
  * extendAsync(name, function)
  * extendAsyncOnce(name, function)
  * set(mixed)
  * setValue(value)
  * setGenerator(function)
  * setGeneratorOnce(function)
  * setAsync(function)
  * setAsyncOnce(function)

## Class: Ioc

#### ioc.get(`name`)
  * `name` `String` - Name of container

`return` `Container` instance
> Create new or return existing instance of `Container`

#### ioc.createContainer(`name`)
  * `name` `String` - Name of container

`return` `Container` instance

> Create new instance of `Container`

#### ioc.createModule([`module`])
  * `module` - Node.js `module` keyword, used to `module.exports` or `exports` Objects from native Node.js module system

`return` - `Module` instance

> Create new instance of `Module`

Parameter `module` is optional because you can create `Module` instance on fly so `kuul-ioc` will not internally call `require` function to get `Module` instance. So basically you don't provide any parameter when creating `Module` instance on fly.

## Class: Container

#### container.setBasePath(`basePath`)
  * `basePath` `String` - Base path of container

`return` `Container` instance
> Set base path of container

#### container.module(`modulePath`)
  * `modulePath` `String` - Path to requested module

`return` `ModuleResolver` instance
> Create `ModuleResolver` instance for module specified by `modulePath`

## Class: Module
#### module.setSingleton(boolean)
#### module.dependency(name, mixed)
#### module.dependencyValue(name, mixed)
#### module.dependencyGenerator(name, function)
#### module.dependencyGeneratorOnce(name, function)
#### module.dependencyAsync(name, function)
#### module.dependencyAsyncOnce(name, function)
#### module.module(function)

## Class: ModuleResolver

#### moduleResolver.get()
#### moduleResolver.resolve()
#### moduleResolver.extend(name, mixed)
#### moduleResolver.extendValue(name, mixed)
#### moduleResolver.extendGenerator(name, function)
#### moduleResolver.extendGeneratorOnce(name, function)
#### moduleResolver.extendAsync(name, function)
#### moduleResolver.extendAsyncOnce(name, function)
#### moduleResolver.set(mixed)
#### moduleResolver.setValue(value)
#### moduleResolver.setGenerator(function)
#### moduleResolver.setGeneratorOnce(function)
#### moduleResolver.setAsync(function)
#### moduleResolver.setAsyncOnce(function)
