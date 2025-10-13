// Setup for bun test runner with happy-dom
import '@testing-library/jest-dom';
import { beforeAll } from 'bun:test';

beforeAll(() => {
  // Setup happy-dom environment
  if (typeof window !== 'undefined') {
    // Already in a browser-like environment
  }
});
