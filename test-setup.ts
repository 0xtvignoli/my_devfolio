// Setup happy-dom environment for Bun tests
// Bun will use happy-dom automatically when imported
import { Window } from 'happy-dom';

const window = new Window();
const document = window.document;

// happy-dom's querySelector uses window.SyntaxError; ensure it exists
(window as unknown as Record<string, unknown>).SyntaxError = globalThis.SyntaxError;

// Make it available globally
global.window = window as any;
global.document = document as any;
global.navigator = window.navigator as any;

