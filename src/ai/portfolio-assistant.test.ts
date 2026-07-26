import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { answerPortfolioQuestion, hasAssistantKey } from './portfolio-assistant';

// Only the offline paths are covered here — they return before any model call,
// so no network / API key is needed.
describe('portfolio assistant (offline paths)', () => {
  const saved = { ...process.env };
  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GOOGLE_API_KEY;
    delete process.env.GOOGLE_GENAI_API_KEY;
  });
  afterEach(() => {
    process.env = { ...saved };
  });

  test('reports no key when none is set', () => {
    expect(hasAssistantKey()).toBe(false);
  });

  test('shows usage for an empty question', async () => {
    expect(await answerPortfolioQuestion('   ')).toMatch(/Usage: ask/);
  });

  test('degrades gracefully without an API key', async () => {
    expect(await answerPortfolioQuestion('hi')).toMatch(/Assistant offline/);
  });
});
