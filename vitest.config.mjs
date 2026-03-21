import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import path from 'path'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: rootDir,
  test: {
    globals: true,
    environment: 'jsdom',
    pool: process.platform === 'win32' ? 'threads' : 'forks',
    include: [
      'packages/app/features/**/__tests__/**/*.test.{ts,tsx}',
      'packages/app/features/**/*.test.{ts,tsx}',
    ],
    exclude: [
      'packages/app/features/mobile/**', // covered by jest.config.mobile.js
      'node_modules/**',
    ],
    alias: {
      app: path.resolve(rootDir, 'packages/app'),
    },
    setupFiles: [path.resolve(rootDir, 'vitest.setup.ts')],
  },
})
