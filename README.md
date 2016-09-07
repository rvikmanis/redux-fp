# redux-fp

Functional programming helpers for Redux.

[![Build Status](https://travis-ci.org/rvikmanis/redux-fp.svg?branch=master)](https://travis-ci.org/rvikmanis/redux-fp)
[![Code Coverage](https://codecov.io/gh/rvikmanis/redux-fp/branch/master/graph/badge.svg)](https://codecov.io/gh/rvikmanis/redux-fp)


- [Rationale](#rationale)
- [Installation](#installation)
- [API reference](#api-reference)
  - [`pipeUpdaters(...updaters)`](#pipeupdatersupdaters)
  - [`combineUpdaters(pathMap)`](#combineupdaterspathmap)
  - [`filterUpdater(predicate, leftUpdater, rightUpdater?)`](#filterupdaterpredicate-leftupdater-rightupdater)
  - [`createUpdater(actionMap)`](#createupdateractionmap)

## Rationale

The idea is to use curried "action-first" reducers or, as they're called here, `updaters`.

Instead of taking the current state and action, and returning the next state,
an updater takes the action and returns a function that takes the current state and returns the next state.
```js
nextState = updater(action)(currentState)
```

Compare the signature of a normal reducer to that of an updater:

```js
type Reducer<C, A, S> = (currentState: C, action: A) => S
type Updater<A, C, S> = (action: A) => (currentState: C) => S
```

The reason why updaters are better suited for Redux is that they can be composed
with any curried "context-last" function,
allowing [point-free style](https://en.wikipedia.org/wiki/Tacit_programming)
and declarative reducer creation
with libraries like [lodash/fp](https://github.com/lodash/lodash/wiki/FP-Guide)
or [Ramda](http://ramdajs.com).

Consider this example, where we call the updating function with `state`:

```js
import { update, concat } from 'lodash/fp'

const reducer = (state, action) => {
  if (action.type === 'PUSH')
    return update('list', concat(action.payload))(state)

  return state
}
```

Same example, as a point-free updater - we return the updating function itself:

```js
import { update, concat } from 'lodash/fp'

const updater = (action) => {
  if (action.type === 'PUSH')
    return update('list', concat(action.payload))

  return state => state
}
```

Or even more concisely, by using [`createUpdater`](#createupdateractionmap):

```js
import { update, concat } from 'lodash/fp'
import { createUpdater } from 'redux-fp'

const updater = createUpdater({
  PUSH: action => update('list', concat(action.payload))
})
```

## Installation

Server side usage:

`npm i --save redux-fp`

Client side usage (with a bundler):

`npm i --save-dev redux-fp`

## API reference


### `pipeUpdaters(...updaters)`

Compose updaters from left to right.

Based on [reduce-reducers](https://github.com/acdlite/reduce-reducers).

#### Arguments

* `...updaters: Array<Updater>`: updaters to compose

#### Returns

* `Updater`: composed updater

---

### `combineUpdaters(pathMap)`

Like Redux's `combineReducers`, but for updaters.

More info: http://redux.js.org/docs/api/combineReducers.html

#### Arguments

1. `pathMap: { [key: string]: Updater }`: mapping from path fragments to updaters

#### Returns

* `Updater`: combined updater

---

### `filterUpdater(predicate, leftUpdater, rightUpdater?)`

Create a proxy that delegates to `leftUpdater` when predicate matches,
and to `rightUpdater` otherwise.

Note: `rightUpdater` is optional and defaults to state identity (`() => state => state`).

The following rules apply to predicate matching:  
*if `predicate` is a string, match when `action.type === predicate`,*  
*if `predicate` is an array, match when any element matches,*  
*else match when `predicate(action, state)` is truthy.*

##### Type defs

`Predicate`: `string | (action: mixed, state: mixed) => boolean | Array<Predicate>`

#### Arguments

1. `predicate: Predicate`: action type, array or predicate function
2. `leftUpdater: Updater`: updater to call when predicate matches
3. `rightUpdater?: Updater`: updater to call when predicate doesn't match  
  * Default value: `() => state => state`

#### Returns

* `Updater`: filtered updater

#### Examples

##### Basic usage

```js
const add = filterUpdater('ADD', action => state =>
  state + action.payload
)

assert(add({type: 'ADD', payload: 5})(5) === 10)
assert(add({type: 'OTHER'})(10) === 10)
```

`add` is equivalent to:

```js
function add(action) {
  if (action.type === 'ADD') {
    return state => state + action.payload
  }

  return state => state
}
```

---

### `createUpdater(actionMap)`

Create a proxy that delegates to updaters in `actionMap` based on `action.type`
or returns the state unchanged.

#### Arguments

1. `actionMap: { [key: string]: Updater }`: mapping from action types to updaters

#### Returns

* `Updater`: proxy updater

#### Example

```js
const updater = createUpdater({
  ADD: handleAdd,
  REMOVE: handleRemove
})
```

`updater` is equivalent to:

```js
function updater(action) {
  if (action.type === 'ADD') {
    return handleAdd(action)
  }

  if (action.type === 'REMOVE') {
    return handleRemove(action)
  }

  return state => state
}
```
