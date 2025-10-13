// Setup happy-dom environment for Bun tests
// Bun will use happy-dom automatically when imported
import { Window } from 'happy-dom';

const window = new Window();
const document = window.document;

// Make it available globally
global.window = window as any;
global.document = document as any;
global.navigator = window.navigator as any;

