import { labelAttribute } from './coercion';

describe('labelAttribute', () => {
  it('should merge value and defaultValue when value is provided', () => {
    const value = { key1: 'value1' };
    const defaultValue = { key2: 'value2' };
    const result = labelAttribute(value, defaultValue);
    expect(result).toEqual({ key1: 'value1', key2: 'value2' });
  });

  it('should return defaultValue when value is null', () => {
    const value = null;
    const defaultValue = { key2: 'value2' };
    const result = labelAttribute(value, defaultValue);
    expect(result).toEqual(defaultValue);
  });

  it('should return defaultValue when value is undefined', () => {
    const value = undefined;
    const defaultValue = { key2: 'value2' };
    const result = labelAttribute(value, defaultValue);
    expect(result).toEqual(defaultValue);
  });

  it('should return an empty object when both value and defaultValue are not provided', () => {
    const result = labelAttribute(undefined, undefined);
    expect(result).toEqual({});
  });

  it('should handle empty objects for value and defaultValue', () => {
    const value = {};
    const defaultValue = {};
    const result = labelAttribute(value, defaultValue);
    expect(result).toEqual({});
  });
});
