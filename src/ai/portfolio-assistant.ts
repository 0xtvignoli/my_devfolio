import { ai } from './genkit';
import { hasAssistantKey } from './config';
import { createBoundedCache } from '@/lib/bounded-cache';
import { projects } from '@/data/content/projects';
import { experiences } from '@/data/content/experiences';

// Context is built from the real portfolio data, so the assistant can only
// speak to what's actually in projects/experiences — no hallucinated résumé.
const LOCALE = 'en' as const;

function buildContext(): string {
  const projectLines = projects.map((p) => {
    const metrics = (p.metrics ?? []).map((m) => `${m.label[LOCALE]}: ${m.value}`).join(', ');
    return `- ${p.title[LOCALE]} [${p.tags.join(', ')}] — ${p.description[LOCALE]}${metrics ? ` (${metrics})` : ''}`;
  });
  const experienceLines = experiences.map(
    (e) => `- ${e.title[LOCALE]} @ ${e.company} (${e.date[LOCALE]}): ${e.description[LOCALE]}`
  );
  const skills = Array.from(new Set(projects.flatMap((p) => p.tags))).sort();
  return [
    `SKILLS: ${skills.join(', ')}`,
    '',
    'PROJECTS:',
    ...projectLines,
    '',
    'EXPERIENCE:',
    ...experienceLines,
  ].join('\n');
}

const SYSTEM_PROMPT = `You are the terminal assistant embedded in Thomas Vignoli's DevOps engineering portfolio.
Answer questions about his projects, skills and experience using ONLY the CONTEXT provided.
You print to a terminal: reply in plain text, no markdown headings, keep it under ~8 short lines.
If the answer isn't in the context, say so briefly and suggest what you can answer instead.
Reply in the same language as the question.`;

export { hasAssistantKey } from './config';

// Visitors converge on the same few questions and the context is a build-time
// constant, so an identical question has an identical answer.
const answerCache = createBoundedCache<string>(200);

const cacheKey = (question: string) => question.toLowerCase().replace(/\s+/g, ' ');

export async function answerPortfolioQuestion(question: string): Promise<string> {
  const q = question.trim();
  if (!q) {
    return 'Usage: ask <question>  —  e.g. `ask what has Thomas done with Kubernetes?`';
  }
  if (!hasAssistantKey()) {
    return 'Assistant offline: set GEMINI_API_KEY on the server to enable `ask`.';
  }

  const key = cacheKey(q);
  const cached = answerCache.get(key);
  if (cached !== undefined) return cached;

  const response = await ai.generate({
    system: SYSTEM_PROMPT,
    prompt: `CONTEXT:\n${buildContext()}\n\nQUESTION: ${q}`,
  });
  const answer = response.text.trim();
  // Don't cache an empty completion — that would pin a dud until restart.
  if (answer) answerCache.set(key, answer);
  return answer;
}
