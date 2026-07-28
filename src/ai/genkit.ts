import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// gemini-2.0-flash was shut down on 2026-06-01: its free-tier quota is reported
// as `limit: 0`, so every call came back 429 and the assistant had been dead
// since June. flash-lite is the current tier that this key can actually reach
// (3.5-flash answers 404 here) and it is plenty for 8-line answers over a 1.7k
// token context.
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-3.1-flash-lite',
});
