import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:3101',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'npm run dev:backend',
      url: 'http://127.0.0.1:18080/healthz',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command:
        'npm run build --workspace next-app && npm run start --workspace next-app -- --port 3101',
      url: 'http://127.0.0.1:3101',
      reuseExistingServer: !process.env.CI,
      timeout: 240_000,
      env: {
        ...process.env,
        NEXT_PUBLIC_API_BASE_URL: 'http://127.0.0.1:18080',
      },
    },
  ],
})
