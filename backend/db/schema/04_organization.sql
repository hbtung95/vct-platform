-- ═══════════════════════════════════════════════════════════════
-- VCT Platform — Schema Reference: Organization
-- PURPOSE: Read-only reference. NOT executed by migration tool.
-- TABLES: federations, clubs, rankings
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE federations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  level VARCHAR(50) NOT NULL,
  parent_id UUID REFERENCES federations(id),
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  website TEXT,
  logo_url TEXT,
  president VARCHAR(200),
  established_year INT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  federation_id UUID REFERENCES federations(id),
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),
  website TEXT,
  logo_url TEXT,
  head_coach VARCHAR(200),
  established_year INT,
  member_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID REFERENCES athletes(id),
  category VARCHAR(50) NOT NULL,
  weight_class VARCHAR(50),
  age_category VARCHAR(50),
  elo_rating DECIMAL(8,2) DEFAULT 1500,
  points DECIMAL(8,2) DEFAULT 0,
  national_rank INT,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  draws INT DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX idx_clubs_federation ON clubs(federation_id);
CREATE INDEX idx_federations_parent ON federations(parent_id);
CREATE INDEX idx_rankings_athlete ON rankings(athlete_id);
