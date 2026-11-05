import { expect, test } from 'bun:test';
import { headingIds, slugify } from './heading-ids';

test('slugify strips accents and punctuation', () => {
  expect(slugify('Perché contava')).toBe('perche-contava');
  expect(slugify('The x402 handshake')).toBe('the-x402-handshake');
  expect(slugify('Pre-payment vs metered billing?')).toBe('pre-payment-vs-metered-billing');
  expect(slugify('—')).toBe('section');
});

test('headingIds de-duplicates in order', () => {
  expect(headingIds(['Lessons', 'Setup', 'Lessons', 'Lessons'])).toEqual(['lessons', 'setup', 'lessons-2', 'lessons-3']);
});
