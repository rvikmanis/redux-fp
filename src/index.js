// @flow

import { combineReducers as combineNormalReducers } from 'redux'
import { mapValues } from './utils'

type Mapping<V> = {[key: string]: V}
type CurriedReducer<S, A> = (action: A) => (prevState: S) => S

/**
 * Like `combineReducers`, but works with curried functions.
 *
 * More info: http://redux.js.org/docs/api/combineReducers.html
 */
export function combineReducers(reducers: Mapping<CurriedReducer>): CurriedReducer {
  const reducer = combineNormalReducers(
    mapValues(reducers, fn => (s, a) => fn(a)(s))
  )
  return action => state => reducer(state, action)
}

/**
 * Like `reduceReducers`, but takes and returns curried functions.
 *
 * More info: https://github.com/acdlite/reduce-reducers
 */
export function reduceReducers(...reducers: CurriedReducer[]): CurriedReducer {
  return current => previous =>
    reducers.reduce(
      (p, r) => r(current)(p),
      previous
    )
}
