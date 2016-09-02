# redux-fp

Functional programming helpers for Redux.

[![Build Status](https://travis-ci.org/rvikmanis/redux-curried-reducers.svg?branch=master)](https://travis-ci.org/rvikmanis/redux-fp)

- [Rationale](#rationale)
- [Installation](#installation)
- [API reference](#api-reference)
  - [`pipeUpdaters(...updaters)`](#pipeupdatersupdaters)
  - [`combineUpdaters(pathMap)`](#combineupdaterspathmap)
  - [`filterUpdater(predicate, updater)`](#filterupdaterpredicate-updater)
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

- [`pipeUpdaters(...updaters)`](#pipeupdatersupdaters)
- [`combineUpdaters(pathMap)`](#combineupdaterspathmap)
- [`filterUpdater(predicate, updater)`](#filterupdaterpredicate-updater)
- [`createUpdater(actionMap)`](#createupdateractionmap)

---

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

### `filterUpdater(predicate, updater)`

Create a proxy that delegates to `updater` or returns the state unchanged.

Delegation happens when the predicate "matches":  
*if `predicate` is a string, match when `action.type === predicate`,*  
*else match when `!!predicate(action, state)`.*

#### Arguments

1. `predicate: string | (action: mixed, state: mixed) => boolean`: action type or predicate function
2. `updater: Updater`: updater to filter based on predicate

#### Returns

* `Updater`: filtered updater

#### Example

```js
import { filterUpdater } from 'redux-fp'

const updater = filterUpdater('PUSH', action => update('list', concat(action.payload)))
```

is equivalent to

```js
const updater = (action) => {
  if (action.type === 'PUSH')
    return update('list', concat(action.payload))

  return state => state
}
```

---

### `createUpdater(actionMap)`

Create a proxy that delegates to `actionMap[action.type]`
or returns the state unchanged.

Delegation happens when `!!actionMap[action.type]`.

#### Arguments

1. `actionMap: { [key: string]: Updater }`: mapping from action types to updaters

#### Returns

* `Updater`: proxy updater

#### Example

```js
import { createUpdater } from 'redux-fp'

const updater = createUpdater({
  ADD: handleAdd,
  REMOVE: handleRemove
})
```

is equivalent to

```js
const updater = (action) => {
  if (action.type === 'ADD') {
    return handleAdd(action)
  }

  if (action.type === 'REMOVE') {
    return handleRemove(action)
  }

  return state => state
}
```
