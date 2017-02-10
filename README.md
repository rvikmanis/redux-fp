# redux-fp

Functional programming helpers for Redux.

[![Build Status](https://travis-ci.org/rvikmanis/redux-fp.svg?branch=master)](https://travis-ci.org/rvikmanis/redux-fp)
[![Code Coverage](https://codecov.io/gh/rvikmanis/redux-fp/branch/master/graph/badge.svg)](https://codecov.io/gh/rvikmanis/redux-fp)

**Table of contents**

- [Updaters vs. reducers](#updaters-vs-reducers)
- [Purpose](#purpose)
- [Installation](#installation)
- [API reference](#api-reference)

## Updaters vs. reducers

*Updater* is a type of function that takes an action and
returns another function that takes the state and produces a result.

```javascript
action => state => {
  // Do something
}
```

Yes, they are just curried reducers with reversed argument order.

### Using with utility libraries

Unlike reducers, updaters compose nicely with existing tools like lodash/fp or Ramda.

Let's create an updater that replaces a part
of the state with the action's payload. We will use lodash/fp's `set` helper to illustrate the point.

```javascript
import { set } from 'lodash/fp'
const changeFoo = action => set('foo', action.payload)
```

Note that I've eliminated state from the definition of our updater, and called `set` with two, not three, arguments.
This works because when `set` is called without
the third argument, it returns a function that takes the missing argument and produces a result.
That function becomes the inner function of our updater and receives the state.

The paradigm is called [point-free style](https://en.wikipedia.org/wiki/Tacit_programming), and
if you're not familiar with it, check out
[Lucas Reis' introductory article](http://lucasmreis.github.io/blog/pointfree-javascript/).

### Compatibility

To create a Redux store, just wrap the root updater in a reducer:

```javascript
createStore((s, a) => updater(a)(s))
```

## Purpose

*redux-fp* provides a set of useful utilities and enhancers like `combine`, `withDefaultState` or `mapState`
that help working with updaters.

Check out the [API reference](#api-reference) for a full list of helpers, complete with descriptions and usage examples.

## Installation

**Node**

`npm i --save redux-fp`

Or as a development dependency:

`npm i --save-dev redux-fp`

**Browser**

```html
<script src="https://unpkg.com/redux-fp/dist/redux-fp.min.js"></script>
```

Makes the library available globally as `ReduxFp`.

## API reference

See [docs/API.md](docs/API.md)
