import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const build = require('next/dist/build').default
const { Bundler } = require('next/dist/lib/bundler')
const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectDir = path.resolve(scriptDir, '../apps/next')

process.env.NEXT_FORCE_WORKER_THREADS ??= '1'
process.env.TURBOPACK ??= '1'
process.chdir(projectDir)

await build(
  projectDir,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  Bundler.Turbopack,
  'compile',
  undefined,
  undefined,
  undefined
)

console.warn(
  '[build] Completed in compile mode. Run generate mode in unrestricted CI/deploy when needed.'
)
