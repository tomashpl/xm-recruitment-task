import { defineConfig, devices } from '@playwright/test';

const PORT = 4300;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const isCi = !!process.env['CI'];

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 1 : undefined,
  reporter: isCi ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    reducedMotion: 'reduce',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'node tools/serve-dist.mjs',
    url: BASE_URL,
    reuseExistingServer: !isCi,
    timeout: 60_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
