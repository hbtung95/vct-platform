import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const build = require('next/dist/build').default
const { Bundler } = require('next/dist/lib/bundler')

process.env.NEXT_FORCE_WORKER_THREADS ??= '1'
process.env.TURBOPACK ??= '1'

await build(
  process.cwd(),
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
