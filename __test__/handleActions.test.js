import { handleActions } from '../src'

describe('handleActions(actionTypeUpdaterMap)', () => {
  const foo = () => state => state + 5
  const bar = () => state => state * 5
  const u = handleActions({ FOO: foo, BAR: bar })

  test('proxy delegates to matched updater if the incoming action\'s type matches a key in actionTypeUpdaterMap', () => {
    const r = u({ type: 'FOO' })(200)
    expect(r).toBe(205)

    const t = u({ type: 'BAR' })(200)
    expect(t).toBe(1000)
  })

  test('proxy returns the state unchanged if the incoming action\'s type doesn\'t match any key in actionTypeUpdaterMap', () => {
    const y = u({ type: 'BAZ' })(200)
    expect(y).toBe(200)
  })
})
