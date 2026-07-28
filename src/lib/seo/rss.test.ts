import { describe, expect, test } from 'bun:test';
import { buildRssFeed } from './rss';
import type { Article } from '@/lib/types';

const article = (over: Partial<Article> = {}): Article => ({
  slug: 'gitops',
  title: 'GitOps & ArgoCD',
  description: 'Reconciliation loops, "drift" and pull-based delivery',
  date: '2025-05-14',
  author: 'Thomas Vignoli',
  content: [],
  tags: ['GitOps'],
  ...over,
});

describe('buildRssFeed', () => {
  test('escapes XML-hostile characters in titles and descriptions', () => {
    const xml = buildRssFeed([article()], 'en');
    expect(xml).toMatch(/<title>GitOps &amp; ArgoCD<\/title>/);
    expect(xml).toMatch(/&quot;drift&quot;/);
    // A raw & would make the feed unparseable.
    expect(xml).not.toMatch(/& /);
  });

  test('links items to the locale-prefixed article URL', () => {
    const xml = buildRssFeed([article()], 'it');
    expect(xml).toMatch(/<link>https:\/\/tvignoli\.com\/it\/articles\/gitops<\/link>/);
    expect(xml).toMatch(/<language>it<\/language>/);
    expect(xml).toMatch(/rel="self" type="application\/rss\+xml"/);
  });

  test('emits RFC-822 pubDates', () => {
    const xml = buildRssFeed([article()], 'en');
    expect(xml).toMatch(/<pubDate>Wed, 14 May 2025 00:00:00 GMT<\/pubDate>/);
  });

  test('stays valid with no articles', () => {
    const xml = buildRssFeed([], 'en');
    expect(xml).toMatch(/<\/channel>/);
    expect(xml).not.toMatch(/<item>/);
  });
});
