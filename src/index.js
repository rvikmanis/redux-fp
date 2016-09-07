// @flow

import { combineReducers } from 'redux'
import { mapValues, anyOf } from './utils'

type Mapping<V> = {[key: string]: V}
type Updater<A, P, S> = (action: A) => (prevState: P) => S
type PredicateFn<A, S> = (action: A, state: S) => boolean

export function combineUpdaters(pathMap: Mapping<Updater<*,*,*>>): Updater<*,*,*> {
  const reducer = combineReducers(
    mapValues(pathMap, fn => (s, a) => fn(a)(s))
  )
  return action => state => reducer(state, action)
}

export function pipeUpdaters(...updaters: Updater<*,*,*>[]): Updater<*,*,*> {
  return current => previous =>
    updaters.reduce(
      (p, r) => r(current)(p),
      previous
    )
}

type Predicate = string | PredicateFn<*,*> | Array<Predicate>

export function filterUpdater(predicate: Predicate, leftUpdater?: Updater<*,*,*>, rightUpdater?: Updater<*,*,*>): Updater<*,*,*> {
  if (leftUpdater == null) {
    return (leftUpdater: Updater<*,*,*>, ...rest) => filterUpdater(predicate, leftUpdater, ...rest)
  }

  if (rightUpdater == null) {
    return filterUpdater(predicate, leftUpdater, () => s => s)
  }

  const doesMatch = (predicate, action={}, state) => {
    if (typeof predicate === 'string')
      return predicate === action.type

    if (Array.isArray(predicate))
      return anyOf(...predicate.map(p => () => doesMatch(p, action, state)))

    return Boolean(predicate(action, state))
  }

  return action => state => {
    if (leftUpdater != null && rightUpdater != null)
      return doesMatch(predicate, action, state)
        ? leftUpdater(action)(state)
        : rightUpdater(action)(state)

    throw new Error('degenerate program state')
  }
}

export function createUpdater(actionMap: Mapping<Updater<*,*,*>>): Updater<*,*,*> {
  const updaters = Object.keys(actionMap).map(
    actionType => filterUpdater(actionType, actionMap[actionType])
  )

  return pipeUpdaters(...updaters)
}
