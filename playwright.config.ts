import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    ...devices['Desktop Chrome'],
    launchOptions: { executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] },
  },
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
