import { expect, test } from 'bun:test';
import { fuzzyMatch, search } from './command-palette';

test('fuzzyMatch finds subsequences, ignores case, spaces and a leading cd', () => {
  expect(fuzzyMatch('finops', 'FinOps for Kubernetes')).toBe(true);
  expect(fuzzyMatch('fkc', 'FinOps for Kubernetes: Cutting')).toBe(true);
  expect(fuzzyMatch('cd lab', 'Lab')).toBe(true);
  expect(fuzzyMatch('theme d', 'theme dark')).toBe(true);
  expect(fuzzyMatch('xyz', 'Lab')).toBe(false);
});

test('search prefers substring matches over loose ones', () => {
  const items = [{ title: 'FinOps for Kubernetes' }, { title: 'Platform Engineering with GitOps' }];
  expect(search('finops', items).map((i) => i.title)).toEqual(['FinOps for Kubernetes']);
  expect(search('fkub', items).map((i) => i.title)).toEqual(['FinOps for Kubernetes']);
  expect(search('', items)).toHaveLength(2);
});
