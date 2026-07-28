import { describe, expect, test } from 'bun:test';
import { getArticle, getArticles, getArticleSlugs, getRelatedArticles } from './articles';

describe('getRelatedArticles', () => {
  test('only returns articles that actually share a tag', () => {
    const related = getRelatedArticles('kubernetes-autoscaling-hpa-keda', 'en');
    const own = new Set(getArticle('kubernetes-autoscaling-hpa-keda', 'en')!.tags);
    expect(related.length).toBeGreaterThan(0);
    for (const article of related) {
      expect(article.tags.some((tag) => own.has(tag))).toEqual(true);
      expect(article.slug).not.toEqual('kubernetes-autoscaling-hpa-keda');
    }
  });

  test('ranks more shared tags first', () => {
    const related = getRelatedArticles('llmops-serving-llms-in-production', 'en');
    const own = new Set(getArticle('llmops-serving-llms-in-production', 'en')!.tags);
    const overlaps = related.map((a) => a.tags.filter((t) => own.has(t)).length);
    expect([...overlaps].sort((a, b) => b - a)).toEqual(overlaps);
  });

  test('caps the list and tolerates an unknown slug', () => {
    expect(getRelatedArticles('kubernetes-autoscaling-hpa-keda', 'en', 1).length).toEqual(1);
    expect(getRelatedArticles('does-not-exist', 'en')).toEqual([]);
  });
});

describe('article content', () => {
  test('every article carries at least one tag in both locales', () => {
    for (const locale of ['en', 'it'] as const) {
      for (const article of getArticles(locale)) {
        expect(article.tags.length).toBeGreaterThan(0);
      }
    }
  });

  test('slugs are unique', () => {
    const slugs = getArticleSlugs();
    expect(new Set(slugs).size).toEqual(slugs.length);
  });
});
