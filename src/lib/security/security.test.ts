import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import robots from '@/app/robots';
import { AI_SEARCH_CRAWLERS, AI_TRAINING_CRAWLERS } from '@/lib/security/ai-crawlers';

describe('security.txt', () => {
  test('exists at public/.well-known/security.txt with required RFC 9116 fields', () => {
    const content = readFileSync(
      join(process.cwd(), 'public/.well-known/security.txt'),
      'utf8'
    );
    expect(content).toContain('Contact: mailto:thomas.vignoli@pm.me');
    expect(content).toContain('Expires:');
    expect(content).toContain('Canonical: https://tvignoli.com/.well-known/security.txt');
  });
});

describe('robots.ts', () => {
  test('blocks AI training crawlers and allows search crawlers', () => {
    const rules = robots().rules;
    const flat = Array.isArray(rules) ? rules : [rules];

    for (const bot of AI_TRAINING_CRAWLERS) {
      const rule = flat.find((r) => r.userAgent === bot);
      expect(rule?.disallow).toBeDefined();
    }

    for (const bot of AI_SEARCH_CRAWLERS) {
      const rule = flat.find((r) => r.userAgent === bot);
      expect(rule?.allow).toBe('/');
    }
  });
});
