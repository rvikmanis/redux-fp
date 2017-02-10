import { updateStateAt } from '../src'

describe('updateStateAt(path, updater)', () => {
  const addFoo = updateStateAt('foo', action => state => action + state)
  const idFooBar = updateStateAt('foo.bar', () => state => state)
  const addFooBarWithDefault = updateStateAt('foo.bar', action => (state = 1) => action + state)

  test('proxy updates state focused at path', () => {
    const r = addFoo(10)({ foo: 10 })
    expect(r).toEqual({ foo: 20 })

    const t = idFooBar()({ foo: 40 })
    expect(t).toEqual({ foo: { bar: undefined } })

    const y = idFooBar()({})
    expect(y).toEqual({ foo: { bar: undefined } })

    const a = idFooBar()({ foo: { bar: { baz: true } } })
    expect(a).toEqual({ foo: { bar: { baz: true } } })

    const i = addFooBarWithDefault(2)({})
    expect(i).toEqual({ foo: { bar: 3 } })
  })

  describe('curried form updateStateAt(path)(updater)', () => {
    const addFoo = updateStateAt('foo')(action => state => action + state)
    const idFooBar = updateStateAt('foo.bar')(() => state => state)
    const addFooBarWithDefault = updateStateAt('foo.bar')(action => (state = 1) => action + state)

    test('is equivalent to updateStateAt(path, updater)', () => {
      const r = addFoo(10)({ foo: 10 })
      expect(r).toEqual({ foo: 20 })

      const t = idFooBar()({ foo: 40 })
      expect(t).toEqual({ foo: { bar: undefined } })

      const y = idFooBar()({})
      expect(y).toEqual({ foo: { bar: undefined } })

      const a = idFooBar()({ foo: { bar: { baz: true } } })
      expect(a).toEqual({ foo: { bar: { baz: true } } })

      const i = addFooBarWithDefault(2)({})
      expect(i).toEqual({ foo: { bar: 3 } })
    })
  })
})
