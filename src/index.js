export { pipeUpdaters, filterUpdater, createUpdater } from './old'

import dotProp from 'dot-prop-immutable'
import compose from 'compose-function'

let warning = {}

/**
 * Higher-order updater.
 *
 * Calls `leftUpdater` if `predicateUpdater` returns true,
 * else calls `rightUpdater`, if it exists, or returns the state unchanged.
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
 * Higher-order updater.
 *
 * Sets the state that `updater` will receive initially.
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
 * Higher-order updater.
 *
 * Calls `updaters` sequentially from left to right.
 * Each updater gets the state returned from previous updater.
 * @param {...Updater} updaters
 */
export const concat = (...updaters): Updater => action => state => {
  return updaters.reduce((s, updater) => updater(action)(s), state)
}

/**
 * Higher-order updater.
 *
 * Like [`combineReducers`](http://redux.js.org/docs/api/combineReducers.html), but for updaters.
 *
 *
 * @example
 * combine({
 *   foo: fooUpdater,
 *   bar: barUpdater
 * })
 * // Is equivalent to
 * concat(
 *   updateState('foo', fooUpdater),
 *   updateState('bar', barUpdater)
 * )
 *
 */
export const combine = (pathFragmentUpdaterMap: Object): Updater => withDefaultState({}, concat(
  ...Object.keys(pathFragmentUpdaterMap)
    .map(k => updateState(k, pathFragmentUpdaterMap[k]))
))

/**
 * @private
 */
export const combineUpdaters = (...args) => {
  if (!warning.combineUpdaters) {
    warning.combineUpdaters = true
    // eslint-disable-next-line
    console.warn('Warning: combineUpdaters(...updaters) is deprecated. Use combine(...updaters)')
  }
  return combine(...args)
}

/**
 * Higher-order updater.
 *
 * Calls `updater` if `actionType` matches, or returns the state unchanged.
 *
 *
 * @example
 * handleAction('SOME_ACTION', someUpdater)
 * // Is equivalent to
 * match(action => () => action.type === 'SOME_ACTION', someUpdater)
 */
export const handleAction = (actionType: string, updater: Updater): Updater => {
  return match(
    action => () => action.type === actionType,
    updater
  )
}

/**
 * Higher-order updater.
 *
 * Delegates to matching updater in `actionTypeUpdaterMap`, or returns the state unchanged.
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

export const select = (mappingUpdater, updater) => {
  if (updater !== undefined) {
    return action => state => updater(mappingUpdater(action)(state))(state)
  }

  return updater => select(mappingUpdater, updater)
}

/**
 * Higher-order updater.
 *
 * Calls `updater` with incoming state focused to `path`. Saves the result in state at `path`.
 *
 *
 * @example
 * const updater = updateState('a.b', () => b => b + 1)
 * updater()({ a: { b: 1 }, c: 0 })
 * // Result: `{ a: { b: 2 }, c: 0 }`
 */
export const updateState = (path: string, updater: Updater): Updater => {
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

  return updater => updateState(path, updater)
}

export const mapState = updater => action => state => {
  return state.map(updater(action))
}

export const filterState = updater => action => state => {
  return state.filter(updater(action))
}

export const replaceState = (path) => updateState(path, action => () => action)

export const constantState = value => () => () => value

export const decorate = (...args) => {
  const updater = args.slice(-1)[0]
  const enhancers = args.slice(0, -1)

  if (enhancers.length === 0) {
    return updater
  }

  return compose(...enhancers)(updater)
}

/**
 * Action-first curried reducer.
 */
type Updater = (action: mixed) => (state: mixed) => mixed