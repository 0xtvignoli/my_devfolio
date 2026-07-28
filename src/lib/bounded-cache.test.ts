import { describe, expect, test } from 'bun:test';
import { createBoundedCache } from './bounded-cache';

describe('createBoundedCache', () => {
  test('stores and returns values', () => {
    const cache = createBoundedCache<string>(3);
    cache.set('a', '1');
    expect(cache.get('a')).toEqual('1');
    expect(cache.get('missing')).toEqual(undefined);
  });

  test('never exceeds the cap, evicting the oldest first', () => {
    const cache = createBoundedCache<string>(2);
    cache.set('a', '1');
    cache.set('b', '2');
    cache.set('c', '3');
    expect(cache.size).toEqual(2);
    expect(cache.get('a')).toEqual(undefined);
    expect(cache.get('b')).toEqual('2');
    expect(cache.get('c')).toEqual('3');
  });

  test('re-setting a key refreshes its position', () => {
    const cache = createBoundedCache<string>(2);
    cache.set('a', '1');
    cache.set('b', '2');
    cache.set('a', '1-again'); // 'a' becomes the newest, so 'b' is next out
    cache.set('c', '3');
    expect(cache.get('a')).toEqual('1-again');
    expect(cache.get('b')).toEqual(undefined);
  });

  test('a cap of zero keeps nothing rather than looping', () => {
    const cache = createBoundedCache<string>(0);
    cache.set('a', '1');
    expect(cache.size).toEqual(0);
    expect(cache.get('a')).toEqual(undefined);
  });
});
