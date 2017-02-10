import { decorate } from '../src'

describe('decorate(...fns, value)', () => {
  const f = v => ({ value: v })
  const g = v => v * 3
  const h = v => v + 10

  test('applies to value a function created by composing ...fns', () => {
    expect(decorate(f, g, h, 300)).toEqual({ value: (300 + 10) * 3 })
  })
})

describe('decorate(value)', () => {
  test('returns value', () => {
    expect(decorate(512)).toBe(512)
  })
})