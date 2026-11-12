import { describe, expect, test } from 'bun:test';
import { callOf, foldHits, hitFacts, type Canary } from './canaries';

describe('callOf', () => {
  test('maps real CloudTrail event names', () => {
    expect(callOf('GetCallerIdentity')).toBe('identity');
    expect(callOf('ListSecrets')).toBe('secrets');
    expect(callOf('DescribeParameters')).toBe('secrets');
    expect(callOf('Converse')).toBe('ai');
    expect(callOf('DescribeDBInstances')).toBe('data');
    expect(callOf('ListTables')).toBe('data');
    expect(callOf('ListBuckets')).toBe('data');
    expect(callOf('DescribeInstances')).toBe('compute');
    expect(callOf('ListFunctions20150331')).toBe('compute');
    expect(callOf('DescribeSecurityGroups')).toBe('network');
    expect(callOf('ListUsers')).toBe('iam');
    expect(callOf('GetSendQuota')).toBe('email');
    expect(callOf('ListTopics')).toBe('other');
    expect(callOf('CreateUser')).toBe('iam');
    expect(callOf('ListVerifiedEmailAddresses')).toBe('email');
    expect(callOf('DescribeTrails')).toBe('account');
    expect(callOf('GetAlternateContact')).toBe('account');
    expect(callOf('ListHostedZones')).toBe('network');
    expect(callOf('GetResources')).toBe('other');
  });
});

describe('foldHits', () => {
  const base: Canary = { id: 'docker', plantedAt: '2026-11-07T17:46:00Z', firstUseAt: '2026-11-07T17:48:00Z', calls: ['identity'], hits: 55, daily: { '2026-11-07': 55 } };
  const hit = (t: string, e: string[], useragent = 'botocore') => ({
    time_of_hit: Date.parse(t) / 1000,
    useragent,
    additional_info: { aws_key_log_data: { eventName: e } },
  });

  test('adds calls, keeps the earlier first use and never lowers the count', () => {
    const out = foldHits(base, [hit('2026-11-08T02:00:00Z', ['ListSecrets']), hit('2026-11-08T02:00:00Z', ['ListSecrets'])]);
    expect(out.calls).toEqual(['identity', 'secrets']);
    expect(out.firstUseAt).toBe('2026-11-07T17:48:00Z');
    expect(out.hits).toBe(55);
    expect(out.lastUseAt).toBe('2026-11-08T02:00:00Z');
    expect(out.timeline).toEqual([{ at: Date.parse('2026-11-08T02:00:00Z') / 1000, name: 'ListSecrets' }]);
  });

  test('AWS quarantine is not a use', () => {
    const out = foldHits({ ...base, firstUseAt: null, calls: [], hits: undefined, daily: undefined }, [hit('2026-11-07T18:26:43Z', ['AttachUserPolicy'], 'AWS Internal')]);
    expect(out.firstUseAt).toBeNull();
    expect(out.calls).toEqual([]);
    expect(out.quarantinedAt).toBe('2026-11-07T18:26:43Z');
    expect(out.hits).toBeUndefined();
  });

  test('keeps nothing but times and call kinds', () => {
    const out = foldHits(base, [
      { ...hit('2026-11-08T02:00:00Z', ['Converse']), src_ip: '203.0.113.9' } as never,
      hit('2026-11-08T02:00:01Z', ['<script>alert(1)</script>']),
    ]);
    expect(out.timeline?.map((x) => x.name)).toEqual(['Converse']);
    expect(JSON.stringify(out)).not.toMatch(/203\.0\.113/);
    expect(JSON.stringify(out)).not.toMatch(/botocore/);
  });

  test('baseline days fill what the store never saw; a day seen by both counts once', () => {
    const store = { uses: 118, calls: [], first: null, quarantined: null, daily: { '2026-11-07': 50, '2026-11-11': 68 }, gaps: 0 };
    const out = foldHits(base, [], store);
    expect(out.daily).toEqual({ '2026-11-07': 55, '2026-11-11': 68 });
    expect(out.hits).toBe(123);
  });

  test('the store counts past the 50 hits canarytokens keeps, and remembers calls that rolled off', () => {
    const store = { uses: 312, calls: ['email' as const], first: '2026-11-07T17:47:30Z', quarantined: null, daily: { '2026-11-10': 12 }, gaps: 1 };
    const out = foldHits(base, [hit('2026-11-10T10:00:00Z', ['Converse'])], store);
    expect(out.hits).toBe(312);
    expect(out.calls).toEqual(['identity', 'ai', 'email']);
    expect(out.firstUseAt).toBe('2026-11-07T17:47:30Z');
    expect(out.daily).toEqual({ '2026-11-07': 55, '2026-11-10': 12 });
    expect(out.gaps).toBe(1);
    expect(foldHits(base, [], null).hits).toBe(55);
  });

  test('hitFacts: one string per use, the same in every export, and nothing about the caller', () => {
    const hits = [
      hit('2026-11-10T10:00:00Z', ['GetCallerIdentity']),
      hit('2026-11-10T10:00:00Z', ['GetCallerIdentity']),
      hit('2026-11-10T10:00:05Z', ['ListSecrets', '<script>']),
      hit('2026-11-10T09:00:00Z', ['AttachUserPolicy'], 'AWS Internal'),
    ];
    const facts = hitFacts(hits);
    expect(facts.uses).toEqual([`${Date.parse('2026-11-10T10:00:00Z') / 1000}|GetCallerIdentity`, `${Date.parse('2026-11-10T10:00:05Z') / 1000}|ListSecrets`]);
    expect(hitFacts([...hits].reverse()).uses.sort()).toEqual([...facts.uses].sort());
    expect(facts.calls).toEqual(['identity', 'secrets', 'other']);
    expect(facts.first).toBe('2026-11-10T10:00:00Z');
    expect(facts.quarantined).toBe('2026-11-10T09:00:00Z');
    expect(JSON.stringify(facts)).not.toMatch(/botocore|script/);
  });
});
