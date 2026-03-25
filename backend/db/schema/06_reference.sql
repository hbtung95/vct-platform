-- ═══════════════════════════════════════════════════════════════
-- VCT Platform — Schema Reference: Reference / Lookup Tables
-- PURPOSE: Read-only reference. NOT executed by migration tool.
-- TABLES: ref_sport_types, ref_competition_formats,
--         ref_penalty_types, ref_scoring_criteria,
--         ref_belt_ranks, ref_age_categories, ref_equipment_types
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE ref_sport_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name_vi VARCHAR(200) NOT NULL,
  name_en VARCHAR(200),
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE ref_competition_formats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name_vi VARCHAR(200) NOT NULL,
  name_en VARCHAR(200),
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE ref_penalty_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name_vi VARCHAR(200) NOT NULL,
  name_en VARCHAR(200),
  category VARCHAR(50) NOT NULL,
  point_deduction DECIMAL(3,1) DEFAULT 0,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE ref_scoring_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name_vi VARCHAR(200) NOT NULL,
  name_en VARCHAR(200),
  category VARCHAR(50) NOT NULL,
  max_score DECIMAL(5,2) NOT NULL,
  weight DECIMAL(3,2) DEFAULT 1.0,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE ref_belt_ranks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name_vi VARCHAR(200) NOT NULL,
  name_en VARCHAR(200),
  level INT NOT NULL,
  color VARCHAR(50),
  requirements TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE ref_age_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name_vi VARCHAR(200) NOT NULL,
  name_en VARCHAR(200),
  min_age INT NOT NULL,
  max_age INT NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE ref_equipment_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name_vi VARCHAR(200) NOT NULL,
  name_en VARCHAR(200),
  category VARCHAR(50),
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'
);
