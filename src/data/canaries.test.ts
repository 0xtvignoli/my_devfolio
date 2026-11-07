import { describe, expect, test } from 'bun:test';
import { callOf } from './canaries';

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
