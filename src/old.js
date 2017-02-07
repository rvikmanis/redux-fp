/* eslint-disable */

let warnings = {}

/**
 * @private
 */
export function pipeUpdaters(...updaters) {
  if (!warnings.pipeUpdaters) {
    warnings.pipeUpdaters = true
    console.warn('Warning: pipeUpdaters(...updaters) is deprecated. Use concat(...updaters)')
  }

  return current => previous =>
    updaters.reduce(
      (p, r) => r(current)(p),
      previous
    )
}

function anyOf(...args) {
  return args.reduce((c, n) => !!c || !!n(), false)
}

/**
 * @private
 */
export function filterUpdater(predicate, leftUpdater?, rightUpdater?) {
  if (!warnings.filterUpdater) {
    warnings.filterUpdater = true
    console.warn('Warning: filterUpdater(predicate, leftUpdater, rightUpdater) is deprecated. Use match(predicateUpdater, leftUpdater, rightUpdater)')
  }

  if (leftUpdater == null) {
    return (leftUpdater, ...rest) => filterUpdater(predicate, leftUpdater, ...rest)
  }

  if (rightUpdater == null) {
    return filterUpdater(predicate, leftUpdater, () => s => s)
  }

  const doesMatch = (predicate, action = {}, state) => {
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
  }
}

/**
 * @private
 */
export function createUpdater(actionMap) {
  if (!warnings.createUpdater) {
    warnings.createUpdater = true
    console.warn('Warning: createUpdater(actionMap) is deprecated. Use handleActions(actionTypeUpdaterMap)')
  }
  const updaters = Object.keys(actionMap).map(
    actionType => filterUpdater(actionType, actionMap[actionType])
  )

  return pipeUpdaters(...updaters)
}
