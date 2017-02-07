import { combine } from '../src'

const items = (action) => (state = []) => {
  if (action.type === 'ADD_ITEM') {
    return state.concat(action.payload)
  }

  return state
}

const visibilityMode = (action) => (state = 'ALL') => {
  if (action.type === 'TOGGLE_VISIBILITY_MODE') {
    return state === 'ALL' ? 'LATEST' : 'ALL'
  }

  return state
}

describe('combine(pathFragmentUpdaterMap)', () => {
  let state
  const u = combine({ items, visibilityMode })
  const dispatch = action => {
    state = u(action)(state)
  }

  test('proxy called with undefined state returns combined default values', () => {
    expect(state).toBe(undefined)

    dispatch({ type: 'INIT' })
    expect(state).toEqual({ items: [], visibilityMode: 'ALL' })
  })

  test('proxy delegates actions to child updaters', () => {
    dispatch({ type: 'TOGGLE_VISIBILITY_MODE' })
    expect(state).toEqual({ items: [], visibilityMode: 'LATEST' })

    dispatch({ type: 'ADD_ITEM', payload: 'Hello' })
    expect(state).toEqual({ items: ['Hello'], visibilityMode: 'LATEST' })

    dispatch({ type: 'ADD_ITEM', payload: 'World' })
    expect(state).toEqual({ items: ['Hello', 'World'], visibilityMode: 'LATEST' })

    dispatch({ type: 'TOGGLE_VISIBILITY_MODE' })
    expect(state).toEqual({ items: ['Hello', 'World'], visibilityMode: 'ALL' })
  })
})