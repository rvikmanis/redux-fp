import { reduceCurriedReducers, combineCurriedReducers } from '../';
import { strictEqual, deepEqual } from 'assert';

describe('reduceCurriedReducers', () => {
  it('reduces curried reducers', () => {
    const result = reduceCurriedReducers(
      a => s => a + s,
      a => s => a * s
    )(5)(20)
    strictEqual(result, 5 * (5 + 20))
  });
});

describe('combineCurriedReducers', () => {
  it('combines curried reducers', () => {
    const every = action => (state = []) => {
      return state.concat(action)
    }

    const latestByType = action => (state = {}) => {
      return Object.assign({}, state, { [action.type]: action.payload })
    }

    const combinedReducer = combineCurriedReducers({
      every,
      latestByType
    })

    let state = combinedReducer({ type: 'A' })()
    deepEqual(state, {
      every: [{ type: 'A' }],
      latestByType: { A: undefined }
    })

    state = combinedReducer({type: 'B', payload: 1 })(state)
    deepEqual(state, {
      every: [{ type: 'A' }, { type: 'B', payload: 1 }],
      latestByType: { A: undefined, B: 1 }
    })

    state = combinedReducer({type: 'A', payload: 2 })(state)
    deepEqual(state, {
      every: [{ type: 'A' }, { type: 'B', payload: 1 }, { type: 'A', payload: 2 }],
      latestByType: { A: 2, B: 1 }
    })
  });
});
