import { createUpdater } from '../../src';
import { strictEqual } from 'assert'

describe('createUpdater', () => {
  const handleAdd = () => () => "handleAdd"
  const handleRemove = () => () => "handleRemove"

  it('returns a composition of `filterUpdater` over every key-value pair', () => {
    const composedUpdater = createUpdater({
      ADD: handleAdd,
      REMOVE: handleRemove
    })

    function updater(action) {
      if (action.type === 'ADD') {
        return handleAdd(action)
      }

      if (action.type === 'REMOVE') {
        return handleRemove(action)
      }

      return state => state
    }

    strictEqual(
      composedUpdater({type: 'ADD'})("default"),
      "handleAdd"
    )

    strictEqual(
      updater({type: 'ADD'})("default"),
      "handleAdd"
    )

    strictEqual(
      composedUpdater({type: 'REMOVE'})("default"),
      "handleRemove"
    )

    strictEqual(
      updater({type: 'REMOVE'})("default"),
      "handleRemove"
    )

    strictEqual(
      composedUpdater({type: 'OTHER'})("default"),
      "default"
    )

    strictEqual(
      updater({type: 'OTHER'})("default"),
      "default"
    )
  });
});
