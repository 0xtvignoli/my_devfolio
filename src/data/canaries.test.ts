import { describe, expect, test } from 'bun:test';
import { callOf, foldHits, type Canary } from './canaries';

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
  });
});

describe('foldHits', () => {
  const base: Canary = { id: 'docker', plantedAt: '2026-11-07T17:46:00Z', firstUseAt: '2026-11-07T17:48:00Z', calls: ['identity'], hits: 55 };
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
  });

  test('AWS quarantine is not a use', () => {
    const out = foldHits({ ...base, firstUseAt: null, calls: [], hits: undefined }, [hit('2026-11-07T18:26:43Z', ['AttachUserPolicy'], 'AWS Internal')]);
    expect(out.firstUseAt).toBeNull();
    expect(out.calls).toEqual([]);
    expect(out.quarantinedAt).toBe('2026-11-07T18:26:43Z');
    expect(out.hits).toBeUndefined();
  });

  test('keeps nothing but times and call kinds', () => {
    const out = foldHits(base, [{ ...hit('2026-11-08T02:00:00Z', ['Converse']), src_ip: '203.0.113.9' } as never]);
    expect(JSON.stringify(out)).not.toMatch(/203\.0\.113/);
    expect(JSON.stringify(out)).not.toMatch(/botocore/);
  });
});
