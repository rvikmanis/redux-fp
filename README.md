# redux-fp

Functional programming helpers for Redux.

[![Build Status](https://travis-ci.org/rvikmanis/redux-fp.svg?branch=master)](https://travis-ci.org/rvikmanis/redux-fp)
[![Code Coverage](https://codecov.io/gh/rvikmanis/redux-fp/branch/master/graph/badge.svg)](https://codecov.io/gh/rvikmanis/redux-fp)

**Table of contents**

- [Reducers vs. updaters](#reducers-vs-updaters)
- [Installation](#installation)
- [API reference](#api-reference)

## Reducers vs. updaters

Introducing the concept of **updater** - a curried form of reducer with inverted argument order:

```javascript
const updater = action => state => {
  // Do something
}
```

Updaters are well suited for composition with tacit functional tools like lodash/fp or Ramda.

All redux-fp utilities work on updaters.

For interoperability with Redux, use `(state, action) => updater(action)(state)`

## Installation

**Node**

`npm i --save redux-fp`

Or as a development dependency:

`npm i --save-dev redux-fp`

**Browser**

```html
<script src="https://unpkg.com/redux-fp/dist/redux-fp.min.js"></script>
```

API exposed at `window.ReduxFp`.

## API reference

See [docs/API.md](docs/API.md)
