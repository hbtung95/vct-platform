-- Migration: Federation National Module
-- Up Script

-- Master Data Tables
CREATE TABLE federation_master_belts (
    level INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color_hex VARCHAR(7) NOT NULL,
    required_time_min INTEGER NOT NULL,
    is_dan_level BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    scope VARCHAR(50),
    scope_id VARCHAR(50),
    inherits_from VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE federation_master_weights (
    id VARCHAR(50) PRIMARY KEY,
    gender VARCHAR(20) NOT NULL,
    category VARCHAR(50) NOT NULL,
    max_weight INTEGER NOT NULL,
    is_heavy BOOLEAN NOT NULL DEFAULT FALSE,
    scope VARCHAR(50),
    scope_id VARCHAR(50),
    inherits_from VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE federation_master_ages (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    min_age INTEGER NOT NULL,
    max_age INTEGER NOT NULL,
    scope VARCHAR(50),
    scope_id VARCHAR(50),
    inherits_from VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE federation_master_contents (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    requires_weight BOOLEAN NOT NULL DEFAULT FALSE,
    is_team_event BOOLEAN NOT NULL DEFAULT FALSE,
    min_athletes INTEGER DEFAULT 1,
    max_athletes INTEGER DEFAULT 1,
    has_weapon BOOLEAN NOT NULL DEFAULT FALSE,
    scope VARCHAR(50),
    scope_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Workflow Approvals
CREATE TABLE federation_approvals (
    id VARCHAR(50) PRIMARY KEY,
    request_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    requester_id VARCHAR(50) NOT NULL,
    request_data JSONB,
    status VARCHAR(50) NOT NULL,
    level INTEGER DEFAULT 1,
    notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Federation Structure
CREATE TABLE federation_provinces (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(50) NOT NULL,
    has_fed BOOLEAN NOT NULL DEFAULT FALSE,
    fed_unit_id VARCHAR(50),
    club_count INTEGER DEFAULT 0,
    coach_count INTEGER DEFAULT 0,
    vdv_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE federation_units (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    parent_id VARCHAR(50),
    province_id VARCHAR(50),
    status VARCHAR(50) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    founded_date VARCHAR(50),
    leader_name VARCHAR(255),
    leader_title VARCHAR(100),
    club_count INTEGER DEFAULT 0,
    member_count INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE federation_personnel (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    unit_id VARCHAR(50) NOT NULL,
    unit_name VARCHAR(255) NOT NULL,
    position VARCHAR(100) NOT NULL,
    role_code VARCHAR(50) NOT NULL,
    start_date VARCHAR(50),
    end_date VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    decision_no VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
