import { afterEach, expect, test } from 'bun:test';
import { canaryPair } from './canary-keys';

// Built at runtime so the source never contains a string shaped like an AWS key
// (GitHub push protection rejects those, fake or not).
const FAKE_ACCESS = ['AK', 'IA', 'ABCDEFGHIJKLMNOP'].join('');
const FAKE_SECRET = 'abcdefghij'.repeat(4);

afterEach(() => {
  delete process.env.CANARY_HTML_ACCESS_KEY;
  delete process.env.CANARY_HTML_SECRET_KEY;
});

test('returns a well-formed pair', () => {
  process.env.CANARY_HTML_ACCESS_KEY = FAKE_ACCESS;
  process.env.CANARY_HTML_SECRET_KEY = FAKE_SECRET;
  expect(canaryPair('HTML')?.access).toBe(FAKE_ACCESS);
});

test('ignores missing or malformed values, so nothing odd reaches the page', () => {
  expect(canaryPair('HTML')).toBeNull();
  process.env.CANARY_HTML_ACCESS_KEY = FAKE_ACCESS;
  process.env.CANARY_HTML_SECRET_KEY = '--><script>alert(1)</script><!--aaaaaaa';
  expect(canaryPair('HTML')).toBeNull();
});
