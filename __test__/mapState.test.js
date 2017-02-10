import { mapState } from '../src'

describe('mapState(updater)', () => {
  const u = mapState(action => state => state * action)

  test('proxy maps incoming state via updater as iteratee', () => {
    const r = u(1.5)([2, 4, 6])
    expect(r).toEqual([3, 6, 9])
  })
})
