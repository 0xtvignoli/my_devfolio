import { expect, test } from 'bun:test';
import { firstContact } from './decoy-ports';

const opening = { at: '2026-11-09T08:22:41Z', checkedUntil: '2026-11-09T08:25:00Z' };

test('our own check right after opening is not the first contact', () => {
  expect(firstContact(opening, ['2026-11-09T08:23:02Z', '2026-11-09T09:41:10Z'])).toBe('2026-11-09T09:41:10Z');
});

test('nobody yet, or only us', () => {
  expect(firstContact(opening, ['2026-11-09T08:23:02Z'])).toBeNull();
  expect(firstContact(opening, undefined)).toBeNull();
  expect(firstContact(null, ['2026-11-09T09:00:00Z'])).toBeNull();
});
