import { concat } from '../src'

const f = action => state => state + action
const g = action => state => state * action
const h = action => state => [state, action]

describe('concat(...updaters)', () => {
  const action = 5
  const state = 20

  test('proxy calls each updater with the preceding updater\'s outgoing state', () => {
    const s = concat(f, g, h)(action)(state)
    const r = h(action)(g(action)(f(action)(state)))

    expect(s).toEqual(r)
    expect(r).toEqual([125, 5])
  })
})
