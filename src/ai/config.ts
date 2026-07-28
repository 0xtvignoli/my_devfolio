/**
 * Key presence check, deliberately free of any genkit import: server components
 * need it to decide whether to render the assistant UI at all, and pulling in
 * `./genkit` would initialise the plugin inside a static page's module graph.
 */
export function hasAssistantKey(): boolean {
  return Boolean(
    process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY
  );
}
