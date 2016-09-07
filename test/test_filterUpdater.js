import { filterUpdater } from '../tmp/with-coverage';
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
});
