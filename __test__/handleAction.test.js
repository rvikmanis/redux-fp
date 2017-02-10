import { handleAction } from '../src'

describe('handleAction(actionType, updater)', () => {
  const u = handleAction('FOO', action => state => state + action.payload)

  test('proxy calls updater if actionType matches incoming action\'s type', () => {
    const r = u({ type: 'FOO', payload: 5 })(200)
    expect(r).toBe(205)
  })

  test('proxy returns the state unchanged if actionType doesn\'t match incoming action\'s type', () => {
    const d = u({ type: 'BAR' })(900)
    expect(d).toBe(900)
  })

  describe('curried form handleAction(actionType)(updater)', () => {
    const u = handleAction('FOO')(action => state => state + action.payload)

    test('is equivalent to handleAction(actionType, updater)', () => {
      const r = u({ type: 'FOO', payload: 5 })(200)
      expect(r).toBe(205)

      const d = u({ type: 'BAR' })(900)
      expect(d).toBe(900)
    })
  })
})
