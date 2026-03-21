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
      'packages/app/features/mobile/__tests__/api-client.test.ts',
      'packages/app/features/mobile/__tests__/api-resilience.test.ts',
      'packages/app/features/mobile/__tests__/deep-linking.test.ts',
      'packages/app/features/mobile/__tests__/navigation-helpers.test.ts',
      'packages/app/features/mobile/__tests__/screen-registry.test.ts',
      'packages/app/features/mobile/__tests__/security-utils.test.ts',
    ],
    alias: {
      app: path.resolve(rootDir, 'packages/app'),
    },
    setupFiles: [path.resolve(rootDir, 'vitest.setup.ts')],
  },
})
