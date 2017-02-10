import { filterState } from '../src'

describe('filterState(updater)', () => {
  const u = filterState(action => state => state % action === 0)
  const state = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  test('proxy filters incoming state via updater as predicate', () => {
    const r = u(4)(state)
    expect(r).toEqual([4, 8])

    const t = u(2)(state)
    expect(t).toEqual([2, 4, 6, 8, 10])
  })
})
