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
* [Examples]()
  * [Module definition]()
  * [Container usage]()
  * [Resolving module]()
* [Api](#api)



## Api

* [Ioc](#class-ioc)
  * [get(name)](#iocgetname)
  * [createContainer()](#iocgetname)
  * [createModule([module])](#ioccreatemodule)
* [Container](#container)
  * [setBasePath(basePath)](#containersetbasepath)
  * [module(modulePath)](#containermodule)
* [Module](#module)
  * [setSingleton(boolean)](#)
  * [dependency(name, mixed)](#)
  * [dependencyValue(name, mixed)](#)
  * [dependencyFunction(name, function)](#)
  * [dependencyFunctionOnce(name, function)](#)
  * [module(mixed)](#)
* [ModuleResolver](#)
  * [get()](#)
  * [resolve()](#)
  * [extend(name, mixed)](#)
  * [extendValue(name, mixed)](#)
  * [extendFunction(name, function)](#)
  * [extendFunctionOnce(name, function)](#)
  * [set(mixed)](#)
  * [setValue(value)](#)
  * [setFunction(function)](#)
  * [setFunctionOnce(function)](#)

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
* `boolean` `Boolean`

`return` `Module` instance
> It specify if module should be resolved as singleton or new instance every time you resolve it

#### module.dependency(name, mixed)
* `name` `String` - Name of dependency when it will be resolved and put in module function
* `mixed` `String` | `ModuleResolver` | `Module`

`return` `Module` instance
> Add dependency to your module

#### module.dependencyValue(name, mixed)
* `name` `String` - Name of dependency when it will be resolved and put in module function
* `mixed` `Mixed` - Anything

`return` `Module` instance
> Add dependency to your module

#### module.dependencyFunction(name, mixed)
* `name` `String` - Name of dependency when it will be resolved and put in module function
* `mixed` `Function` | `GeneratorFunction` | `AsyncFunction`

`return` `Module` instance
> Add dependency to your module

#### module.dependencyFunctionOnce(name, mixed)
* `name` `String` - Name of dependency when it will be resolved and put in module function
* `mixed` `Function` | `GeneratorFunction` | `AsyncFunction`

`return` `Module` instance
> Add dependency to your module

#### module.module(mixed)
* `mixed` `Function` | `GeneratorFunction` | `AsyncFunction`

`return` `Module` instance
> Function that handle logic of module or in other words function that return content of module

## Class: ModuleResolver
#### moduleResolver.get()
#### moduleResolver.resolve()
#### moduleResolver.extend(name, mixed)
#### moduleResolver.extendValue(name, mixed)
#### moduleResolver.extendFunction(name, function)
#### moduleResolver.extendFunctionOnce(name, function)
#### moduleResolver.set(mixed)
#### moduleResolver.setValue(value)
#### moduleResolver.setFunction(function)
#### moduleResolver.setFunctionOnce(function)
