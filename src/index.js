export { pipeUpdaters, filterUpdater, createUpdater } from './old'

import dotProp from 'dot-prop-immutable'
import compose from 'compose-function'

let warning = {}

/**
 * **Syntax**
 * ```javascript
 * match(predicateUpdater, leftUpdater)
 * ```
 *
 * ```javascript
 * match(predicateUpdater, leftUpdater, rightUpdater)
 * ```
 *
 * ```javascript
 * match(predicateUpdater)(leftUpdater)
 * ```
 *
 * ```javascript
 * match(predicateUpdater)(leftUpdater, rightUpdater)
 * ```
 *
 * **Description**
 *
 * Creates a proxy updater that:
 *
 * - calls **`leftUpdater`** if `predicateUpdater` returns true, or
 * - calls **`rightUpdater`** if `predicateUpdater` returns false and `rightUpdater` is defined, or
 * - returns the state unchanged if `predicateUpdater` returns false and `rightUpdater` is undefined.
 *
 * @example
 * match(p, t, f)
 * // Is equivalent to
 * action => state => p(action)(state) ? t(action)(state) : f(action)(state)
 *
 * @example
 * match(p, t)
 * // Is equivalent to
 * action => state => p(action)(state) ? t(action)(state) : state
 */
export const match = (predicateUpdater: (action: mixed) => (state: mixed) => boolean, leftUpdater: Updater, rightUpdater: ?Updater): Updater => {
  if (leftUpdater !== undefined) {
    return action => state => predicateUpdater(action)(state)
      ? leftUpdater(action)(state)
      : (rightUpdater !== undefined ? rightUpdater(action)(state) : state)
  }

  return (leftUpdater, rightUpdater) => match(predicateUpdater, leftUpdater, rightUpdater)
}

/**
 * **Syntax**
 * ```javascript
 * withDefaultState(defaultState, updater)
 * ```
 *
 * ```javascript
 * withDefaultState(defaultState)(updater)
 * ```
 *
 * **Description**
 *
 * Creates a proxy updater that:
 *
 * calls `updater` with `defaultState` if incoming state is undefined, or calls it with the incoming state.
 * @example
 * withDefaultState(0, add)
 * // Is equivalent to
 * action => (state = 0) => add(action)(state)
 */
export const withDefaultState = (defaultState: mixed, updater: Updater): Updater => {
  if (updater !== undefined) {
    return match(() => state => state === undefined)(
      action => () => updater(action)(defaultState),
      updater
    )
  }

  return updater => withDefaultState(defaultState, updater)
}

/**
 * **Syntax**
 * ```javascript
 * concat(...updaters)
 * ```
 *
 * **Description**
 *
 * Creates a proxy updater that:
 *
 * calls each updater with the preceding updater's outgoing state (left-to-right).
 * @param {...Updater} updaters
 * @example
 * concat(f, g, h)
 * // Is equivalent to
 * action => state => h(action)(g(action)(f(action)(state)))
 */
export const concat = (...updaters): Updater => action => state => {
  return updaters.reduce((s, updater) => updater(action)(s), state)
}

/**
 * **Syntax**
 * ```javascript
 * combine(pathFragmentUpdaterMap)
 * ```
 *
 * **Description**
 *
 * Like [`combineReducers`](http://redux.js.org/docs/api/combineReducers.html), but for updaters.
 *
 * @example
 * combine({
 *   foo: fooUpdater,
 *   bar: barUpdater
 * })
 * // Is equivalent to
 * concat(
 *   updateStateAt('foo', fooUpdater),
 *   updateStateAt('bar', barUpdater)
 * )
 *
 */
export const combine = (pathFragmentUpdaterMap: Object): Updater => withDefaultState({}, concat(
  ...Object.keys(pathFragmentUpdaterMap)
    .map(k => updateStateAt(k, pathFragmentUpdaterMap[k]))
))

/**
 * @private
 */
export const combineUpdaters = (...args) => {
  if (!warning.combineUpdaters) {
    warning.combineUpdaters = true
    // eslint-disable-next-line
    console.warn('Warning: combineUpdaters(pathMap) is deprecated. Use combine(pathFragmentUpdaterMap)')
  }
  return combine(...args)
}

/**
 * **Syntax**
 * ```javascript
 * handleAction(actionType, updater)
 * ```
 *
 * ```javascript
 * handleAction(actionType)(updater)
 * ```
 *
 * **Description**
 *
 * Creates a proxy updater that:
 *
 * calls `updater` if `actionType` matches incoming action's type, or returns the state unchanged.
 * @example
 * handleAction('SOME_ACTION', someUpdater)
 * // Is equivalent to
 * match(action => () => action.type === 'SOME_ACTION', someUpdater)
 */
export const handleAction = (actionType: string, updater: Updater): Updater => {
  if (updater !== undefined) {
    return match(
      action => () => typeof action === 'object' && action != null && action.type === actionType,
      updater
    )
  }

  return updater => handleAction(actionType, updater)
}

/**
 * **Syntax**
 * ```javascript
 * handleActions(actionTypeUpdaterMap)
 * ```
 *
 * **Description**
 *
 * Creates a proxy updater that:
 *
 * delegates to a matching updater from `actionTypeUpdaterMap` based on the incoming action's type, or returns the state unchanged.
 *
 *
 * @example
 * handleActions({
 *   ACTION_ONE: updaterOne,
 *   ACTION_TWO: updaterTwo
 * })
 * // Is equivalent to
 * concat(
 *   handleAction('ACTION_ONE', updaterOne),
 *   handleAction('ACTION_TWO', updaterTwo)
 * )
 */
export const handleActions = (actionTypeUpdaterMap: Object): Updater => concat(
  ...Object.keys(actionTypeUpdaterMap)
    .map(k => handleAction(k, actionTypeUpdaterMap[k]))
)

/**
 * **Syntax**
 * ```javascript
 * updateStateAt(path, updater)
 * ```
 *
 * ```javascript
 * updateStateAt(path)(updater)
 * ```
 *
 * **Description**
 *
 * Creates a proxy updater that:
 *
 * calls `updater` with incoming state focused at `path`, then merges the result into outgoing state.
 *
 *
 * @example
 * const updater = updateStateAt('a.b', () => state => state + 1)
 * const state = { a: { b: 1 }, c: 0 }
 *
 * updater()(state)
 * // Result: `{ a: { b: 2 }, c: 0 }`
 */
export const updateStateAt = (path: string, updater: Updater): Updater => {
  if (updater !== undefined) {
    return action => state => {
      return dotProp.set(state, path, v => {
        if (dotProp.get(state, path) !== undefined) {
          return updater(action)(v)
        }
        return updater(action)(undefined)
      })
    }
  }

  return updater => updateStateAt(path, updater)
}

/**
 * **Syntax**
 * ```javascript
 * mapState(updater)
 * ```
 *
 * **Description**
 *
 * Creates a proxy updater that:
 *
 * maps incoming state via `updater` as iteratee.
 *
 * @example
 * mapState(action => state => state + action)
 * // Is equivalent to
 * action => state => state.map(item => item + action)
 */
export const mapState = (updater: Updater): Updater => action => state => {
  return state.map(updater(action))
}

/**
 * **Syntax**
 * ```javascript
 * filterState(updater)
 * ```
 *
 * **Description**
 *
 * Creates a proxy updater that:
 *
 * filters incoming state via `updater` as predicate.
 * @example
 * filterState(action => state => action > state)
 * // Is equivalent to
 * action => state => state.filter(item => action > item)
 */
export const filterState = (updater: (action: mixed) => (state: mixed) => boolean): Updater => action => state => {
  return state.filter(updater(action))
}

/**
 * **Syntax**
 * ```javascript
 * constantState(value)
 * ```
 *
 * **Description**
 *
 * Creates an updater that always returns `value`.
 * @example
 * constantState('foo')
 * // Is equivalent to
 * () => () => 'foo'
*/
export const constantState = (value: mixed): Updater => () => () => value

/**
 * **Syntax**
 * ```javascript
 * decorate(...fns, value)
 * ```
 *
 * **Description**
 *
 * Applies to `value` a function created by composing `...fns`.
 *
 * @example
 * decorate(f, g, h, value)
 * // Is equivalent to
 * f(g(h(value)))
 * @example
 * decorate(
 *   withDefaultState(0),
 *   handleAction('ADD'),
 *   action => state => state + action.payload
 * )
 * // Is equivalent to
 * withDefaultState(0, handleAction('ADD', action => state => state + action.payload))
 * @param {...Function} fns
 * @param {any} value
 * @returns {any}
*/
export const decorate = (...fns) => {
  const value = fns.slice(-1)[0]
  fns = fns.slice(0, -1)

  if (fns.length === 0) {
    return value
  }

  return compose(...fns)(value)
}

/**
 * Action-first curried reducer.
 */
type Updater = (action: mixed) => (state: mixed) => mixed