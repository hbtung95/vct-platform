-- ═══════════════════════════════════════════════════════════════
-- VCT Platform — Schema Reference: Extensions & Core Setup
-- PURPOSE: Read-only reference. NOT executed by migration tool.
-- SOURCE: Extracted from 0000_baseline.sql
-- ═══════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Updated-at trigger (shared by all tables with updated_at) ──

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
