import { expect, test } from 'bun:test';
import { formatDuration } from './duration';

const MIN = 60_000;

test('minutes, hours with minutes, hours, days', () => {
  expect(formatDuration(7 * MIN, 'en')).toBe('7 min');
  expect(formatDuration(192 * MIN, 'en')).toBe('3 h 12 min');
  expect(formatDuration(19 * 60 * MIN, 'en')).toBe('19 h');
  expect(formatDuration(4 * 24 * 60 * MIN, 'it')).toBe('4 giorni');
  expect(formatDuration(10, 'en')).toBe('1 min');
});
