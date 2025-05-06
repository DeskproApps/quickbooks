import { ParamKeyValuePair } from 'react-router-dom';
import getQueryParams from './getQueryParams';

describe('getQueryParams', () => {
  it('should return an empty string if no data is provided', () => {
    expect(getQueryParams()).toBe('');
  });

  it('should return an empty string for an empty array', () => {
    expect(getQueryParams([])).toBe('');
  });

  it('should return an empty string for an empty object', () => {
    expect(getQueryParams({})).toBe('');
  });

  it('should return the same string if data is a string', () => {
    expect(getQueryParams('key=value')).toBe('key=value');
  });

  it('should convert an array of key-value pairs to a query string', () => {
    const data: ParamKeyValuePair[] = [
      ['key1', 'value1'],
      ['key2', 'value2']
    ];
    expect(getQueryParams(data)).toBe('key1=value1&key2=value2');
  });

  it('should convert an object to a query string', () => {
    const data = {
      key1: 'value1',
      key2: 'value2'
    };
    expect(getQueryParams(data)).toBe('key1=value1&key2=value2');
  });

  it('should handle mixed data types in an object', () => {
    const data = {
      key1: 'value1',
      key2: '123',
      key3: 'true'
    };
    expect(getQueryParams(data)).toBe('key1=value1&key2=123&key3=true');
  });

  it('should return an empty string for unsupported data types', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    expect(getQueryParams(123 as any)).toBe('');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    expect(getQueryParams(true as any)).toBe('');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    expect(getQueryParams(null as any)).toBe('');
  });
});