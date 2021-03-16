# w-leaflet-vue
A wrapper for vue2-leaflet.

![language](https://img.shields.io/badge/language-JavaScript-orange.svg) 
[![language](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://github.com/vuejs/vue) 
[![npm version](http://img.shields.io/npm/v/w-leaflet-vue.svg?style=flat)](https://npmjs.org/package/w-leaflet-vue) 
[![Build Status](https://travis-ci.org/yuda-lyu/w-leaflet-vue.svg?branch=master)](https://travis-ci.org/yuda-lyu/w-leaflet-vue) 
[![license](https://img.shields.io/npm/l/w-leaflet-vue.svg?style=flat)](https://npmjs.org/package/w-leaflet-vue) 
[![gzip file size](http://img.badgesize.io/yuda-lyu/w-leaflet-vue/master/dist/w-leaflet-vue.umd.js.svg?compression=gzip)](https://github.com/yuda-lyu/w-leaflet-vue)
[![npm download](https://img.shields.io/npm/dt/w-leaflet-vue.svg)](https://npmjs.org/package/w-leaflet-vue) 
[![jsdelivr download](https://img.shields.io/jsdelivr/npm/hm/w-leaflet-vue.svg)](https://www.jsdelivr.com/package/npm/w-leaflet-vue)

## Documentation
To view documentation or get support, visit [docs](https://yuda-lyu.github.io/w-leaflet-vue/module-WLeafletVue.html).

## Example
To view some examples for more understanding, visit examples:

> **all examples:** [web](https://yuda-lyu.github.io/w-leaflet-vue/examples/app.html) [[source code](https://github.com/yuda-lyu/w-leaflet-vue/blob/master/docs/examples/app.html)]

## Installation
### Using npm(ES6 module):
> **Note:** w-leaflet-vue is mainly dependent on `leaflet`, `vue2-leaflet`, `@turf` and `d3-tricontour`.
```alias
npm i w-leaflet-vue
```

### In a browser(UMD module):
> **Note:** w-leaflet-vue is mainly dependent on `vue`.

> **Note:** umd file includes with `lodash` and `wsemi`, by using tree-shaking for dead-code elimination.

[Optional] Add script with nomodule for IE11.
```alias
<script nomodule src="https://cdn.jsdelivr.net/npm/@babel/polyfill/dist/polyfill.min.js"></script>
```
[Necessary] Add script for vue.
```alias
<script src="https://cdn.jsdelivr.net/npm/vue@2.x/dist/vue.min.js"></script>
```
[Necessary] Add script for w-leaflet-vue.
```alias
<script src="https://cdn.jsdelivr.net/npm/w-leaflet-vue@1.0.1/dist/w-leaflet-vue.umd.js"></script>
```
