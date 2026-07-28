import { describe, expect, test } from 'bun:test';
import { parseInline } from './inline-markup';

describe('parseInline', () => {
  test('leaves plain text as a single token', () => {
    expect(parseInline('no markup here')).toEqual([{ type: 'text', value: 'no markup here' }]);
  });

  test('splits code spans out of surrounding text', () => {
    expect(parseInline('run `terraform apply` twice')).toEqual([
      { type: 'text', value: 'run ' },
      { type: 'code', value: 'terraform apply' },
      { type: 'text', value: ' twice' },
    ]);
  });

  test('parses absolute and root-relative links', () => {
    expect(parseInline('see [x402](https://x402.org) and [the lab](/en/lab)')).toEqual([
      { type: 'text', value: 'see ' },
      { type: 'link', value: 'x402', href: 'https://x402.org' },
      { type: 'text', value: ' and ' },
      { type: 'link', value: 'the lab', href: '/en/lab' },
    ]);
  });

  test('refuses non-http schemes — they stay literal text', () => {
    const tokens = parseInline('[click](javascript:alert(1))');
    expect(tokens).toEqual([{ type: 'text', value: '[click](javascript:alert(1))' }]);
  });

  test('handles an unterminated code span without dropping text', () => {
    expect(parseInline('a `b')).toEqual([{ type: 'text', value: 'a `b' }]);
  });

  test('handles adjacent marks', () => {
    expect(parseInline('`a`[b](/c)')).toEqual([
      { type: 'code', value: 'a' },
      { type: 'link', value: 'b', href: '/c' },
    ]);
  });
});
