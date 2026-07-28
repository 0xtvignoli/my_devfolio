import { describe, expect, test } from 'bun:test';
import { buildPermalink, MAX_PERMALINK_COMMANDS, replayableCommands } from './lab-permalink';

describe('replayableCommands', () => {
  test('drops commands that would replay as noise', () => {
    expect(replayableCommands(['kubectl get pods', 'clear', 'history', 'help', 'git log'])).toEqual([
      'kubectl get pods',
      'git log',
    ]);
  });

  test('keeps the tail when a session runs long', () => {
    const many = Array.from({ length: 20 }, (_, i) => `cmd-${i}`);
    const kept = replayableCommands(many);
    expect(kept.length).toEqual(MAX_PERMALINK_COMMANDS);
    expect(kept.at(-1)).toEqual('cmd-19');
  });

  test('ignores blank entries', () => {
    expect(replayableCommands(['  ', '', 'status'])).toEqual(['status']);
  });
});

describe('buildPermalink', () => {
  test('encodes one cmd param per command, in order', () => {
    const url = buildPermalink('https://tvignoli.com', '/en/lab', [
      'deploy --strategy=canary --weight=20',
      'kubectl get pods',
    ]);
    expect(url).toEqual(
      'https://tvignoli.com/en/lab?cmd=deploy+--strategy%3Dcanary+--weight%3D20&cmd=kubectl+get+pods'
    );
  });

  test('returns null when there is nothing worth sharing', () => {
    expect(buildPermalink('https://tvignoli.com', '/en/lab', [])).toEqual(null);
    expect(buildPermalink('https://tvignoli.com', '/en/lab', ['clear', 'help'])).toEqual(null);
  });

  test('round-trips through URLSearchParams', () => {
    const url = buildPermalink('https://x.test', '/it/lab', ['chaos latency', 'status'])!;
    const parsed = new URL(url);
    expect(parsed.searchParams.getAll('cmd')).toEqual(['chaos latency', 'status']);
  });
});
