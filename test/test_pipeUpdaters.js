import { pipeUpdaters } from '../tmp/with-coverage';
import { strictEqual } from 'assert';

describe('pipeUpdaters', () => {
  it('composes curried reducers left to right', () => {
    const updater = pipeUpdaters(
      a => s => a + s,
      a => s => a * s
    )

    strictEqual(
      updater(5)(20),
      5 * (5 + 20)
    )
  });
});
