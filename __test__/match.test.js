import { match } from '../src'

const p = action => () => action > 100
const t = action => state => state + action
const f = action => state => state - action

describe('match(predicateUpdater, leftUpdater)', () => {
  const u = match(p, t)

  test('proxy delegates to leftUpdater if predicateUpdater returns true', () => {
    expect(u(101)(10)).toBe(111)
  })

  test('proxy returns the state unchanged if predicateUpdater returns false', () => {
    expect(u(100)(10)).toBe(10)
  })

  describe('curried form match(predicateUpdater)(leftUpdater)', () => {
    const u = match(p)(t)

    test('is equivalent to match(predicateUpdater, leftUpdater)', () => {
      expect(u(101)(10)).toBe(111)
      expect(u(100)(10)).toBe(10)
    })
  })
})

describe('match(predicateUpdater, leftUpdater, rightUpdater)', () => {
  const u = match(p, t, f)

  test('proxy delegates to leftUpdater if predicateUpdater returns true', () => {
    expect(u(101)(10)).toBe(111)
  })

  test('proxy delegates to rightUpdater if predicateUpdater returns false', () => {
    expect(u(100)(10)).toBe(-90)
  })

  describe('curried form match(predicateUpdater)(leftUpdater, rightUpdater)', () => {
    const u = match(p)(t, f)

    test('is equivalent to match(predicateUpdater, leftUpdater, rightUpdater)', () => {
      expect(u(101)(10)).toBe(111)
      expect(u(100)(10)).toBe(-90)
    })
  })
})

