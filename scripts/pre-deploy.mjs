#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — PRE-DEPLOY VALIDATION SCRIPT
// Chạy 7 quality gates tuần tự, fail-fast tại gate đầu tiên lỗi.
// Usage: node scripts/pre-deploy.mjs [--quick]
//   --quick: chỉ chạy 3 gates nhanh (authz + typecheck + lint)
// ═══════════════════════════════════════════════════════════════

import { execSync } from 'node:child_process'
import { existsSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const isQuick = process.argv.includes('--quick')

// ── ANSI Colors ────────────────────────────────────────────────
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
}

const PASS = `${c.green}✅ PASS${c.reset}`
const FAIL = `${c.red}❌ FAIL${c.reset}`
const SKIP = `${c.yellow}⏭️  SKIP${c.reset}`

// ── Gate Definitions ───────────────────────────────────────────
const GATES = [
  {
    name: 'Authz Contract',
    emoji: '🔑',
    cmd: 'npm run authz:check',
    description: 'RBAC contract đồng bộ giữa backend ↔ frontend',
    quick: true,
  },
  {
    name: 'TypeScript',
    emoji: '🔷',
    cmd: 'npx tsc -p tsconfig.json --noEmit',
    description: 'Zero type errors across all packages',
    quick: true,
  },
  {
    name: 'ESLint',
    emoji: '🔍',
    cmd: 'npm run lint',
    description: 'Code style, hooks rules, import validation',
    quick: true,
  },
  {
    name: 'Architecture Boundaries',
    emoji: '🏗️',
    cmd: 'npm run lint:boundaries',
    description: 'Ngăn circular deps giữa packages (shared-types → ui → app)',
    quick: false,
  },
  {
    name: 'Unit Tests',
    emoji: '🧪',
    cmd: 'npm run test',
    description: 'Regression check — all test suites pass',
    quick: false,
  },
  {
    name: 'Production Build',
    emoji: '📦',
    cmd: 'npm run build',
    description: 'Next.js production build (giống Vercel)',
    quick: false,
  },
  {
    name: 'Bundle Sanity Check',
    emoji: '📊',
    cmd: null, // custom logic
    description: 'Kiểm tra .next output — pages, size, missing routes',
    quick: false,
  },
]

// ── Helpers ────────────────────────────────────────────────────

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  const m = Math.floor(ms / 60_000)
  const s = Math.round((ms % 60_000) / 1000)
  return `${m}m ${s}s`
}

function runCmd(cmd) {
  execSync(cmd, {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, FORCE_COLOR: '1' },
    timeout: 600_000, // 10 minute timeout per gate
  })
}

function bundleSanityCheck() {
  const nextDir = path.join(ROOT, 'apps', 'next', '.next')
  if (!existsSync(nextDir)) {
    throw new Error('.next directory does not exist — build probably failed silently')
  }

  // Check that essential routes exist
  const serverDir = path.join(nextDir, 'server')
  if (!existsSync(serverDir)) {
    throw new Error('.next/server missing — build output incomplete')
  }

  // Check for build manifest
  const manifestPath = path.join(nextDir, 'build-manifest.json')
  if (!existsSync(manifestPath)) {
    throw new Error('build-manifest.json missing — build output corrupted')
  }

  // Check total bundle size (warn if > 100MB)
  const totalSize = getDirSize(nextDir)
  const sizeMB = (totalSize / (1024 * 1024)).toFixed(1)
  console.log(`  ${c.dim}Bundle size: ${sizeMB} MB${c.reset}`)

  if (totalSize > 200 * 1024 * 1024) {
    throw new Error(`Bundle quá lớn: ${sizeMB}MB (limit: 200MB). Kiểm tra import không cần thiết.`)
  }

  if (totalSize > 100 * 1024 * 1024) {
    console.log(`  ${c.yellow}⚠️  Bundle khá lớn (${sizeMB}MB). Cân nhắc optimize.${c.reset}`)
  }

  console.log(`  ${c.green}Bundle sanity check passed.${c.reset}`)
}

function getDirSize(dirPath) {
  let totalSize = 0
  try {
    const entries = readdirSync(dirPath, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      if (entry.isDirectory()) {
        totalSize += getDirSize(fullPath)
      } else if (entry.isFile()) {
        totalSize += statSync(fullPath).size
      }
    }
  } catch {
    // ignore permission errors
  }
  return totalSize
}

// ── Main Execution ─────────────────────────────────────────────

console.log()
console.log(`${c.bold}${c.cyan}╔══════════════════════════════════════════════════════════╗${c.reset}`)
console.log(`${c.bold}${c.cyan}║     VCT PLATFORM — PRE-DEPLOY VALIDATION                ║${c.reset}`)
console.log(`${c.bold}${c.cyan}║     ${isQuick ? '⚡ Quick Mode (3 gates)' : '🔒 Full Mode (7 gates) '}                          ║${c.reset}`)
console.log(`${c.bold}${c.cyan}╚══════════════════════════════════════════════════════════╝${c.reset}`)
console.log()

const results = []
const totalStart = Date.now()
let failed = false

for (let i = 0; i < GATES.length; i++) {
  const gate = GATES[i]
  const gateNum = i + 1

  // Skip non-quick gates in quick mode
  if (isQuick && !gate.quick) {
    results.push({ ...gate, status: 'skip', duration: 0 })
    continue
  }

  console.log(`${c.bold}━━━ Gate ${gateNum}/${GATES.length}: ${gate.emoji} ${gate.name} ━━━${c.reset}`)
  console.log(`  ${c.dim}${gate.description}${c.reset}`)
  console.log()

  const start = Date.now()

  try {
    if (gate.cmd) {
      runCmd(gate.cmd)
    } else {
      bundleSanityCheck()
    }
    const duration = Date.now() - start
    results.push({ ...gate, status: 'pass', duration })
    console.log()
    console.log(`  ${PASS} ${c.dim}(${formatDuration(duration)})${c.reset}`)
    console.log()
  } catch (err) {
    const duration = Date.now() - start
    results.push({ ...gate, status: 'fail', duration })
    console.log()
    console.log(`  ${FAIL} ${c.dim}(${formatDuration(duration)})${c.reset}`)
    console.log()
    failed = true
    break // fail-fast
  }
}

// ── Report ─────────────────────────────────────────────────────

const totalDuration = Date.now() - totalStart

console.log()
console.log(`${c.bold}${c.cyan}╔══════════════════════════════════════════════════════════╗${c.reset}`)
console.log(`${c.bold}${c.cyan}║     PRE-DEPLOY REPORT                                    ║${c.reset}`)
console.log(`${c.bold}${c.cyan}╚══════════════════════════════════════════════════════════╝${c.reset}`)
console.log()

for (const r of results) {
  const icon = r.status === 'pass' ? PASS : r.status === 'fail' ? FAIL : SKIP
  const dur = r.duration > 0 ? ` ${c.dim}(${formatDuration(r.duration)})${c.reset}` : ''
  console.log(`  ${r.emoji} ${r.name.padEnd(25)} ${icon}${dur}`)
}

console.log()
console.log(`  ${c.dim}Total: ${formatDuration(totalDuration)}${c.reset}`)
console.log()

if (failed) {
  console.log(`${c.bgRed}${c.bold} 🚫 DEPLOY BLOCKED — Fix errors above before deploying. ${c.reset}`)
  console.log()
  console.log(`${c.yellow}Tip: Chạy lại sau khi fix:${c.reset}`)
  console.log(`  ${c.cyan}npm run predeploy${c.reset}         # full 7 gates`)
  console.log(`  ${c.cyan}npm run predeploy:quick${c.reset}   # 3 gates nhanh`)
  console.log()
  process.exit(1)
} else {
  console.log(`${c.bgGreen}${c.bold} ✅ ALL GATES PASSED — Safe to deploy! ${c.reset}`)
  console.log()
  process.exit(0)
}
