import { reduceCurriedReducers } from '../';
import { strictEqual } from 'assert';

describe('reduceCurriedReducers', () => {
  it('is a function', () => {
    strictEqual(typeof reduceCurriedReducers, 'function')
  });
});
