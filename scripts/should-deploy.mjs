#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — VERCEL IGNORED BUILD STEP
// Determines whether Vercel should build or skip deployment.
// Exit 1 = proceed with build, Exit 0 = skip build.
// https://vercel.com/docs/projects/overview#ignored-build-step
// ═══════════════════════════════════════════════════════════════

import { execSync } from 'node:child_process'

// Paths that do NOT require a Vercel redeploy
const SKIP_PATTERNS = [
  /^docs\//,
  /^backend\//,
  /^\.agents\//,
  /^\.claude\//,
  /^\.github\//,
  /^\.vscode\//,
  /^infra\//,
  /^scripts\/run_quality/,
  /^scripts\/squash/,
  /^scripts\/auto-git/,
  /\.md$/,
  /^Makefile$/,
  /^docker-compose/,
  /^render\.yaml$/,
]

// Paths that ALWAYS require a Vercel redeploy
const FORCE_PATTERNS = [
  /^apps\/next\//,
  /^packages\//,
  /^tsconfig/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^eslint\.config/,
  /^vercel\.json$/,
  /^scripts\/pre-deploy/,
  /^scripts\/next-build/,
  /^scripts\/generate-authz/,
  /^scripts\/check-boundaries/,
]

try {
  // Get list of changed files since last successful deployment
  // Vercel sets VERCEL_GIT_PREVIOUS_SHA for this purpose
  const prevSha = process.env.VERCEL_GIT_PREVIOUS_SHA || 'HEAD~1'
  const currentSha = process.env.VERCEL_GIT_COMMIT_SHA || 'HEAD'

  let changedFiles
  try {
    changedFiles = execSync(`git diff --name-only ${prevSha} ${currentSha}`, {
      encoding: 'utf-8',
    })
      .trim()
      .split('\n')
      .filter(Boolean)
  } catch {
    // If git diff fails (e.g., first deploy), always build
    console.log('⚙️  Cannot determine changed files — proceeding with build.')
    process.exit(1)
  }

  if (changedFiles.length === 0) {
    console.log('⏭️  No files changed — skipping build.')
    process.exit(0)
  }

  console.log(`📋 ${changedFiles.length} file(s) changed:`)
  changedFiles.forEach((f) => console.log(`   ${f}`))

  // Check if any force pattern matches
  const hasForceFile = changedFiles.some((file) =>
    FORCE_PATTERNS.some((pattern) => pattern.test(file))
  )

  if (hasForceFile) {
    console.log('🔨 Frontend-related files changed — proceeding with build.')
    process.exit(1)
  }

  // Check if ALL changed files match skip patterns
  const allSkippable = changedFiles.every((file) =>
    SKIP_PATTERNS.some((pattern) => pattern.test(file))
  )

  if (allSkippable) {
    console.log('⏭️  Only non-frontend files changed — skipping build.')
    process.exit(0)
  }

  // Default: build (safety-first)
  console.log('🔨 Unknown file changes detected — proceeding with build (safety-first).')
  process.exit(1)
} catch (err) {
  // On any error, proceed with build (safety-first)
  console.error('⚠️  Error in should-deploy check:', err.message)
  process.exit(1)
}
