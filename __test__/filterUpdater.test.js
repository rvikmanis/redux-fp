import { filterUpdater } from '../src';
import { strictEqual } from 'assert';

describe('filterUpdater', () => {
  const updater = filterUpdater(
    (action, state) => typeof state === 'number' && action.type === 'ADD',
    a => s => a.payload + s,
    a => s => a.payload + s + 100
  )

  it('delegates to leftUpdater if predicate matches', () => {
    let state = 0

    state = updater({type: 'ADD', payload: 42})(state)
    strictEqual(state, 42)

    state = updater({type: 'ADD', payload: 'bar'})(5)
    strictEqual(state, 'bar5')
  });

  it('delegates to rightUpdater if predicate doesn\'t match', () => {
    let state = 0

    state = updater({type: 'OTHER', payload: 5})(0)
    strictEqual(state, 105)

    state = updater({type: 'ADD', payload: 'foo'})('bar')
    strictEqual(state, 'foobar100')
  })

  const actionUpdater = filterUpdater('ADD', a => s => a.payload + s)

  it('if predicate is string, matches on action type', () => {
    strictEqual(
      actionUpdater({type: 'ADD', payload: 19})(1),
      20
    )
  })

  it('the default rightUpdater returns current state unchanged', () => {
    strictEqual(
      actionUpdater({type: 'OTHER', payload: 19})(1),
      1
    )
  })

  const manyActionsUpdater = filterUpdater(
    ['SET_VALUE', 'SET_VAL'], ({ payload }) => () => payload
  )

  it('if predicate is an array, matches if any of its elements match', () => {
    let state = 'foo'

    const setValResult = manyActionsUpdater({type: 'SET_VAL', payload: 'bar'})(state)
    const setValueResult = manyActionsUpdater({type: 'SET_VALUE', payload: 'bar'})(state)
    const otherResult = manyActionsUpdater({type: 'OTHER', payload: 'bar'})(state)

    strictEqual(setValResult, 'bar')
    strictEqual(setValueResult, 'bar')
    strictEqual(otherResult, state)
  })

  it('if invoked with only a predicate, returns a function that accepts the rest of the arguments and returns a filtered updater', () => {
    const updater = filterUpdater(a => a === 5)(
      () => () => true
    )

    strictEqual(updater(5)(false), true)
    strictEqual(updater(1)(false), false)
  })
});
