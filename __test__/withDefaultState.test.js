import { withDefaultState } from '../src'

const d = 500
const du = action => state => state + action

describe('withDefaultState(defaultState, updater)', () => {
  const u = withDefaultState(d, du)

  test('proxy calls updater with defaultState if incoming state is undefined', () => {
    expect(u(15)()).toBe(515)
  })

  test('proxy calls updater with incoming state if it is not undefined', () => {
    expect(u(15)(200)).toBe(215)
  })

  describe('curried form withDefaultState(defaultState)(updater)', () => {
    const u = withDefaultState(d)(du)

    test('is equivalent to withDefaultState(defaultState, updater)', () => {
      expect(u(15)()).toBe(515)
      expect(u(15)(200)).toBe(215)
    })
  })
})
