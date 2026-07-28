import { describe, expect, test } from 'bun:test';
import { createRateLimiter } from './rate-limit';

describe('createRateLimiter', () => {
  test('allows up to the limit, then blocks', () => {
    const limited = createRateLimiter(3, 60_000);
    expect(limited('1.1.1.1')).toEqual(false);
    expect(limited('1.1.1.1')).toEqual(false);
    expect(limited('1.1.1.1')).toEqual(false);
    expect(limited('1.1.1.1')).toEqual(true);
  });

  test('counts each key separately', () => {
    const limited = createRateLimiter(1, 60_000);
    expect(limited('1.1.1.1')).toEqual(false);
    expect(limited('2.2.2.2')).toEqual(false);
    expect(limited('1.1.1.1')).toEqual(true);
  });

  test('forgets hits older than the window', async () => {
    const limited = createRateLimiter(1, 20);
    expect(limited('1.1.1.1')).toEqual(false);
    expect(limited('1.1.1.1')).toEqual(true);
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(limited('1.1.1.1')).toEqual(false);
  });
});
