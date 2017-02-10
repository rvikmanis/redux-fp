import { constantState } from '../src'

describe('constantState(value)', () => {
  const u = constantState('foo')

  test('updater always returns value', () => {
    expect(u()()).toEqual('foo')
    expect(u({})()).toEqual('foo')
    expect(u()({})).toEqual('foo')
    expect(u({})({})).toEqual('foo')
  })
})
