import { ObjectUtils } from './object-utils';

describe('ObjectUtils', () => {
  it('Assess the emptiness of an object', () => {
    expect(ObjectUtils.isEmpty({})).toBe(true);
    expect(ObjectUtils.isEmpty({ a: '' })).toBe(false);
  });
});
