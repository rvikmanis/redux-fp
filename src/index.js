// @flow

import { combineReducers } from 'redux'
import { mapValues } from './utils'

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

export function filterUpdater(predicate: (string | PredicateFn<*,*>), updater: Updater<*,*,*>): Updater<*,*,*> {
  return action => state => {
    const doesMatch = (
      (typeof predicate === 'function' && predicate(action, state))
      || (typeof predicate === 'string' && predicate === action.type)
    )

    if (doesMatch) {
      return updater(action)(state)
    }

    return state
  }
}

export function createUpdater(actionMap: Mapping<Updater<*,*,*>>): Updater<*,*,*> {
  const updaters = Object.keys(actionMap).map(
    actionType => filterUpdater(actionType, actionMap[actionType])
  )

  return pipeUpdaters(...updaters)
}
