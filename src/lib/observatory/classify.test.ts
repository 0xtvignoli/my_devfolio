import { describe, expect, test } from 'bun:test';
import { classifyClient, classifyRequest, countryCode } from './classify';

describe('classifyRequest', () => {
  const cases: [string, string, string, string][] = [
    ['GET', '/.env', 'secrets', '.env'],
    ['GET', '/horde/%2eenv', 'secrets', '.env'],
    ['GET', '/%252Faws.json', 'secrets', 'cloud credentials'],
    ['GET', '/wp-config%2ephp%2ebak', 'secrets', 'backups & dumps'],
    ['GET', '/wp-login.php', 'cms', 'WordPress'],
    ['GET', '/.git/config', 'secrets', '.git'],
    ['GET', '/actuator/env', 'admin', 'Spring actuator'],
    ['GET', '/..%2f..%2fetc/passwd', 'traversal', '../ traversal'],
    ['POST', '/en', 'app-exploit', 'POST to a page'],
    ['POST', '/api/contact/send', 'other', 'other'],
    ['GET', '/en/articles', 'other', 'other'],
  ];
  for (const [method, path, category, target] of cases) {
    test(`${method} ${path} → ${category}`, () => {
      expect(classifyRequest(method, path)).toEqual({ category, target } as never);
    });
  }

  test('malformed encoding does not throw', () => {
    expect(classifyRequest('GET', '/%E0%A4%A').category).toBe('other');
  });
});

test('classifyClient maps to the fixed vocabulary only', () => {
  expect(classifyClient('curl/8.5.0')).toBe('curl');
  expect(classifyClient('')).toBe('empty user agent');
  expect(classifyClient('Mozilla/5.0 (X11) <script>')).toBe('browser-like');
  expect(classifyClient('<img src=x onerror=alert(1)>')).toBe('other');
});

test('countryCode keeps ISO codes and Tor, drops the rest', () => {
  expect(countryCode('DE')).toBe('DE');
  expect(countryCode('T1')).toBe('T1');
  expect(countryCode('XX')).toBeNull();
  expect(countryCode('<b>')).toBeNull();
});
