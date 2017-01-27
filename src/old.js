// @flow
/* eslint-disable */

type Mapping<V> = {[key: string]: V}
type Updater<A, P, S> = (action: A) => (prevState: P) => S
type PredicateFn<A, S> = (action: A, state: S) => boolean

let warnings = {}

/**
 * @private
 */
export function pipeUpdaters(...updaters: Updater<*,*,*>[]): Updater <*,*,*> {
  if(!warnings.pipeUpdaters) {
    warnings.pipeUpdaters = true
    console.warn('Warning: pipeUpdaters(...updaters) is deprecated. Use concat(...updaters)')
  }

  return current => previous =>
    updaters.reduce(
      (p, r) => r(current)(p),
      previous
    )
}

type Predicate = string | PredicateFn<*,*> | Array<Predicate>

function anyOf(...args) {
  return args.reduce((c, n) => !!c || !!n(), false)
}

/**
 * @private
 */
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

/**
 * @private
 */
export function createUpdater(actionMap: Mapping<Updater<*,*,*>>): Updater<*,*,*> {
  const updaters = Object.keys(actionMap).map(
    actionType => filterUpdater(actionType, actionMap[actionType])
  )

  return pipeUpdaters(...updaters)
}
