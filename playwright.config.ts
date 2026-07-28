import type { PlaywrightTestConfig } from '@playwright/test';

const PORT = process.env.PORT ? Number(process.env.PORT) : 9004;
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${PORT}`;

const config: PlaywrightTestConfig = {
  testDir: './tests/e2e',
  retries: process.env.CI ? 2 : 0,
  timeout: 60 * 1000,
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  webServer: {
    // Production build, not the dev server. Turbopack compiles each route on the
    // first request, so a test could measure a document that was served before its
    // stylesheet existed — which made the touch-target test read default styles and
    // fail roughly one run in four. A built server has no per-route compile step,
    // and e2e should exercise what actually ships rather than the dev pipeline.
    command: `bun run build && bun --bun next start -p ${PORT}`,
    url: BASE_URL,
    stdout: 'pipe',
    stderr: 'pipe',
    reuseExistingServer: !process.env.CI,
    timeout: 240 * 1000,
  },
};

export default config;
