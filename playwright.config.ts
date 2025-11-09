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
    command: `bun --bun next dev --turbopack -p ${PORT}`,
    url: BASE_URL,
    stdout: 'pipe',
    stderr: 'pipe',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
};

export default config;
