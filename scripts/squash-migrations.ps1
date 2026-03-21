#!/usr/bin/env pwsh
# ═══════════════════════════════════════════════════════════════
# VCT PLATFORM — Migration Squash Script
# Concatenates all N up-migrations into a single `0000_baseline.sql`
# and moves the originals to `_archive/`.
#
# Usage:  powershell -ExecutionPolicy Bypass -File scripts/squash-migrations.ps1
#
# IMPORTANT:
# - Run this ONLY when the team agrees to squash
# - After squashing, existing databases need to run the reconciliation
#   SQL printed at the end
# ═══════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"
$MigrationsDir = Join-Path (Join-Path (Join-Path $PSScriptRoot "..") "backend") "migrations"
$MigrationsDir = (Resolve-Path $MigrationsDir).Path
$ArchiveDir = Join-Path $MigrationsDir "_archive"

Write-Host "`n═══ VCT Migration Squash ═══" -ForegroundColor Cyan

# ── 1. Collect up-migration files in order ────────────────────
$upFiles = Get-ChildItem -Path $MigrationsDir -Filter "*.sql" |
    Where-Object { $_.Name -notmatch "_down\.sql$" } |
    Sort-Object Name

if ($upFiles.Count -eq 0) {
    Write-Host "No migration files found." -ForegroundColor Yellow
    exit 0
}

Write-Host "Found $($upFiles.Count) up-migration files to squash."

# ── 2. Build baseline.sql by concatenating all up files ──────
$header = @"
-- ═══════════════════════════════════════════════════════════════
-- VCT PLATFORM — Squashed Baseline Migration
-- Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
-- Squashed from $($upFiles.Count) individual migrations
-- ═══════════════════════════════════════════════════════════════

"@

$body = ""
foreach ($file in $upFiles) {
    $body += "`n-- ─── Source: $($file.Name) ──────────────────────────`n"
    $body += (Get-Content $file.FullName -Raw)
    $body += "`n"
}

$baselinePath = Join-Path $MigrationsDir "0000_baseline.sql"
Set-Content -Path $baselinePath -Value ($header + $body) -Encoding UTF8
Write-Host "✓ Created $baselinePath" -ForegroundColor Green

# ── 3. Create baseline_down.sql ──────────────────────────────
$downContent = @"
-- ═══════════════════════════════════════════════════════════════
-- VCT PLATFORM — Baseline Rollback (DANGEROUS)
-- Drops ALL tables, types, functions created by the baseline.
-- Only use this to completely reset a database.
-- ═══════════════════════════════════════════════════════════════

DO `$`$
DECLARE
    r RECORD;
BEGIN
    -- Drop all tables in public schema
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != 'schema_migrations')
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;

    -- Drop all custom types
    FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typtype = 'e')
    LOOP
        EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;

    -- Drop all functions
    FOR r IN (SELECT proname, oidvectortypes(proargtypes) as args
              FROM pg_proc WHERE pronamespace = 'public'::regnamespace)
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.proname) || '(' || r.args || ') CASCADE';
    END LOOP;
END `$`$;
"@

$downPath = Join-Path $MigrationsDir "0000_baseline_down.sql"
Set-Content -Path $downPath -Value $downContent -Encoding UTF8
Write-Host "✓ Created $downPath" -ForegroundColor Green

# ── 4. Archive old migration files ───────────────────────────
if (-not (Test-Path $ArchiveDir)) {
    New-Item -ItemType Directory -Path $ArchiveDir -Force | Out-Null
}

$allOldFiles = Get-ChildItem -Path $MigrationsDir -Filter "*.sql" |
    Where-Object { $_.Name -ne "0000_baseline.sql" -and $_.Name -ne "0000_baseline_down.sql" }

foreach ($file in $allOldFiles) {
    Move-Item -Path $file.FullName -Destination (Join-Path $ArchiveDir $file.Name) -Force
}

Write-Host "✓ Archived $($allOldFiles.Count) files to _archive/" -ForegroundColor Green

# ── 5. Print reconciliation SQL for existing databases ───────
$reconciliation = @"

═══ RECONCILIATION SQL (for existing databases) ═══

Run this SQL on any database that has already applied the old migrations:

  BEGIN;
  DELETE FROM schema_migrations;
  INSERT INTO schema_migrations (version, name)
  VALUES ('0000_baseline', '0000_baseline.sql');
  COMMIT;

This tells the migrator that the baseline is already applied,
so it won't try to re-run it on existing databases.
"@

Write-Host $reconciliation -ForegroundColor Yellow
Write-Host "`n✓ Squash complete! $($upFiles.Count) migrations → 1 baseline" -ForegroundColor Cyan
