-- ═══════════════════════════════════════════════════════════════
-- VCT PLATFORM — Squashed Baseline Migration
-- Generated: 2026-03-20 19:57:32
-- Squashed from 86 individual migrations
-- ═══════════════════════════════════════════════════════════════

-- ─── Source: 000003_support_module.up.sql ──────────────────────────
-- Phase 3 Roadmap: Customer Support Schema

CREATE TABLE support_categories (
    id VARCHAR(50) PRIMARY KEY,
    ten VARCHAR(255) NOT NULL,
    mo_ta TEXT,
    icon VARCHAR(100),
    mau_sac VARCHAR(20),
    thu_tu INT DEFAULT 0,
    so_ticket INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE faqs (
    id VARCHAR(50) PRIMARY KEY,
    cau_hoi text NOT NULL,
    tra_loi text NOT NULL,
    danh_muc_id VARCHAR(50) REFERENCES support_categories(id) ON DELETE SET NULL,
    danh_muc VARCHAR(255),
    luot_xem INT DEFAULT 0,
    thu_tu INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE support_tickets (
    id VARCHAR(50) PRIMARY KEY,
    ma_ticket VARCHAR(20) UNIQUE NOT NULL,
    tieu_de VARCHAR(255) NOT NULL,
    noi_dung TEXT NOT NULL,
    loai VARCHAR(50) NOT NULL,
    muc_uu_tien VARCHAR(20) NOT NULL,
    trang_thai VARCHAR(20) NOT NULL,
    danh_muc_id VARCHAR(50) REFERENCES support_categories(id) ON DELETE SET NULL,
    nguoi_tao_id VARCHAR(50) NOT NULL,
    nguoi_tao_ten VARCHAR(255),
    nguoi_tao_email VARCHAR(255),
    nguoi_xu_ly_id VARCHAR(50),
    nguoi_xu_ly_ten VARCHAR(255),
    so_tra_loi INT DEFAULT 0,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    first_reply_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE ticket_replies (
    id VARCHAR(50) PRIMARY KEY,
    ticket_id VARCHAR(50) REFERENCES support_tickets(id) ON DELETE CASCADE,
    noi_dung TEXT NOT NULL,
    nguoi_tra VARCHAR(255) NOT NULL,
    nguoi_tra_id VARCHAR(50) NOT NULL,
    is_staff BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE attachments (
    id VARCHAR(50) PRIMARY KEY,
    ticket_id VARCHAR(50) REFERENCES support_tickets(id) ON DELETE CASCADE,
    reply_id VARCHAR(50) REFERENCES ticket_replies(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    url VARCHAR(1024) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_tickets_trang_thai ON support_tickets(trang_thai);
CREATE INDEX idx_tickets_muc_uu_tien ON support_tickets(muc_uu_tien);
CREATE INDEX idx_tickets_nguoi_tao ON support_tickets(nguoi_tao_id);
CREATE INDEX idx_replies_ticket ON ticket_replies(ticket_id);


-- ─── Source: 0001_entity_records.sql ──────────────────────────
CREATE TABLE IF NOT EXISTS entity_records (
  entity TEXT NOT NULL,
  id TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(entity, id)
);

CREATE INDEX IF NOT EXISTS idx_entity_records_entity_updated_at
  ON entity_records(entity, updated_at DESC);


-- ─── Source: 0002_relational_schema.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0002: Relational Schema
-- Replaces JSONB EAV (entity_records) with typed tables.
-- Run AFTER 0001_entity_records.sql
-- ===============================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============ AUTH ============

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin','btc','referee_manager','referee','delegate','athlete','spectator','medical','media')),
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  access_token_jti VARCHAR(100) UNIQUE NOT NULL,
  refresh_token_jti VARCHAR(100) UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  tournament_code VARCHAR(50),
  operation_shift VARCHAR(10),
  expires_at TIMESTAMPTZ NOT NULL,
  refresh_expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  username VARCHAR(50),
  role VARCHAR(20),
  action VARCHAR(50) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ TOURNAMENT ============

CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  level VARCHAR(20) NOT NULL,
  round_number INT DEFAULT 1,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  registration_deadline DATE,
  location TEXT,
  venue TEXT,
  organizer TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'nhap',
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ CONTENT & CATEGORIES ============

CREATE TABLE IF NOT EXISTS age_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  ten VARCHAR(100) NOT NULL,
  tuoi_min INT NOT NULL,
  tuoi_max INT NOT NULL
);

CREATE TABLE IF NOT EXISTS content_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  ten VARCHAR(200) NOT NULL,
  loai VARCHAR(20) NOT NULL CHECK (loai IN ('quyen','doi_khang')),
  gioi_tinh VARCHAR(10) CHECK (gioi_tinh IN ('nam','nu','chung')),
  lua_tuoi_id UUID REFERENCES age_groups(id),
  so_nguoi INT DEFAULT 1,
  mo_ta TEXT,
  trang_thai VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weight_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  ten VARCHAR(100) NOT NULL,
  gioi_tinh VARCHAR(5) NOT NULL CHECK (gioi_tinh IN ('nam','nu')),
  lua_tuoi_id UUID REFERENCES age_groups(id),
  can_nang_min DECIMAL(5,1) NOT NULL,
  can_nang_max DECIMAL(5,1) NOT NULL,
  trang_thai VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ TEAMS & ATHLETES ============

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  ten VARCHAR(200) NOT NULL,
  ma_doan VARCHAR(20) NOT NULL,
  loai VARCHAR(20) CHECK (loai IN ('tinh','clb','ca_nhan')),
  tinh_thanh VARCHAR(100),
  lien_he VARCHAR(100),
  sdt VARCHAR(20),
  email VARCHAR(255),
  trang_thai VARCHAR(20) NOT NULL DEFAULT 'nhap',
  docs JSONB DEFAULT '{}',
  fees JSONB DEFAULT '{"total":0,"paid":0,"remaining":0}',
  achievements JSONB DEFAULT '[]',
  delegate_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS athletes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  ho_ten VARCHAR(200) NOT NULL,
  gioi_tinh VARCHAR(5) NOT NULL CHECK (gioi_tinh IN ('nam','nu')),
  ngay_sinh DATE NOT NULL,
  can_nang DECIMAL(5,1) NOT NULL,
  chieu_cao DECIMAL(5,1),
  trang_thai VARCHAR(20) NOT NULL DEFAULT 'nhap',
  docs JSONB DEFAULT '{}',
  ghi_chu TEXT,
  avatar_url TEXT,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  content_category_id UUID REFERENCES content_categories(id),
  weight_class_id UUID,
  trang_thai VARCHAR(20) NOT NULL DEFAULT 'cho_duyet',
  ghi_chu TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ REFEREES ============

CREATE TABLE IF NOT EXISTS referees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  ho_ten VARCHAR(200) NOT NULL,
  cap_bac VARCHAR(20) NOT NULL,
  chuyen_mon VARCHAR(20) NOT NULL,
  tinh_thanh VARCHAR(100),
  dien_thoai VARCHAR(20),
  email VARCHAR(255),
  nam_kinh_nghiem INT,
  trang_thai VARCHAR(20) NOT NULL DEFAULT 'cho_duyet',
  ghi_chu TEXT,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ ARENAS ============

CREATE TABLE IF NOT EXISTS arenas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  ten VARCHAR(200) NOT NULL,
  loai VARCHAR(20) NOT NULL,
  trang_thai VARCHAR(20) NOT NULL DEFAULT 'dong',
  suc_chua INT DEFAULT 0,
  vi_tri TEXT,
  ghi_chu TEXT,
  equipment JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referee_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id),
  referee_id UUID REFERENCES referees(id),
  arena_id UUID REFERENCES arenas(id),
  session_date DATE NOT NULL,
  session_shift VARCHAR(10) NOT NULL,
  role VARCHAR(20) DEFAULT 'chinh',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ COMPETITION ============

CREATE TABLE IF NOT EXISTS combat_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id),
  content_category_id UUID REFERENCES content_categories(id),
  weight_class_id UUID,
  arena_id UUID REFERENCES arenas(id),
  athlete_red_id UUID REFERENCES athletes(id),
  athlete_blue_id UUID REFERENCES athletes(id),
  vong VARCHAR(50),
  bracket_position INT,
  diem_do JSONB DEFAULT '[]',
  diem_xanh JSONB DEFAULT '[]',
  penalties_red JSONB DEFAULT '[]',
  penalties_blue JSONB DEFAULT '[]',
  ket_qua TEXT,
  nguoi_thang_id UUID REFERENCES athletes(id),
  trang_thai VARCHAR(20) NOT NULL DEFAULT 'chua_dau',
  thoi_gian_bat_dau TIMESTAMPTZ,
  thoi_gian_ket_thuc TIMESTAMPTZ,
  event_log JSONB DEFAULT '[]',
  ghi_chu TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS form_performances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id),
  content_category_id UUID REFERENCES content_categories(id),
  arena_id UUID REFERENCES arenas(id),
  athlete_id UUID REFERENCES athletes(id),
  judge_scores JSONB NOT NULL DEFAULT '[]',
  diem_trung_binh DECIMAL(5,2),
  diem_tru_high DECIMAL(5,2),
  diem_tru_low DECIMAL(5,2),
  tong_diem DECIMAL(5,2),
  xep_hang INT,
  trang_thai VARCHAR(20) NOT NULL DEFAULT 'cho_thi',
  ghi_chu TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weigh_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id),
  athlete_id UUID REFERENCES athletes(id),
  weight_class_id UUID,
  can_nang_thuc DECIMAL(5,1) NOT NULL,
  ket_qua VARCHAR(20) NOT NULL DEFAULT 'cho_xu_ly',
  thoi_gian TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  nguoi_can VARCHAR(100),
  ghi_chu TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ SCHEDULE ============

CREATE TABLE IF NOT EXISTS schedule_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id),
  ngay DATE NOT NULL,
  buoi VARCHAR(10) NOT NULL CHECK (buoi IN ('sang','chieu','toi')),
  gio_bat_dau TIME NOT NULL,
  gio_ket_thuc TIME NOT NULL,
  arena_id UUID REFERENCES arenas(id),
  content_category_id UUID REFERENCES content_categories(id),
  so_tran INT DEFAULT 0,
  ghi_chu TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ APPEALS ============

CREATE TABLE IF NOT EXISTS appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id),
  loai VARCHAR(20) NOT NULL CHECK (loai IN ('khieu_nai','khang_nghi')),
  team_id UUID REFERENCES teams(id),
  noi_dung TEXT NOT NULL,
  match_id UUID,
  performance_id UUID,
  trang_thai VARCHAR(20) NOT NULL DEFAULT 'moi',
  nguoi_gui VARCHAR(200) NOT NULL,
  thoi_gian_gui TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  nguoi_xu_ly VARCHAR(200),
  ket_luan TEXT,
  thoi_gian_xu_ly TIMESTAMPTZ,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ NOTIFICATIONS ============

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id),
  user_id UUID REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ MEDICAL ============

CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id),
  athlete_id UUID REFERENCES athletes(id),
  match_id UUID,
  type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(20),
  action_taken TEXT,
  can_continue BOOLEAN,
  reported_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ MEDIA ============

CREATE TABLE IF NOT EXISTS media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id),
  uploaded_by UUID REFERENCES users(id),
  type VARCHAR(20) NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  title VARCHAR(200),
  description TEXT,
  tags JSONB DEFAULT '[]',
  match_id UUID,
  athlete_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ DATA AUDIT TRAIL ============

CREATE TABLE IF NOT EXISTS data_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ INDEXES ============

CREATE INDEX IF NOT EXISTS idx_athletes_tournament ON athletes(tournament_id);
CREATE INDEX IF NOT EXISTS idx_athletes_team ON athletes(team_id);
CREATE INDEX IF NOT EXISTS idx_registrations_athlete ON registrations(athlete_id);
CREATE INDEX IF NOT EXISTS idx_combat_matches_tournament ON combat_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_combat_matches_status ON combat_matches(trang_thai);
CREATE INDEX IF NOT EXISTS idx_form_performances_tournament ON form_performances(tournament_id);
CREATE INDEX IF NOT EXISTS idx_schedule_tournament_date ON schedule_entries(tournament_id, ngay);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_data_audit_entity ON data_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_teams_tournament ON teams(tournament_id);
CREATE INDEX IF NOT EXISTS idx_weight_classes_tournament ON weight_classes(tournament_id);
CREATE INDEX IF NOT EXISTS idx_content_categories_tournament ON content_categories(tournament_id);
CREATE INDEX IF NOT EXISTS idx_referees_tournament ON referees(tournament_id);
CREATE INDEX IF NOT EXISTS idx_arenas_tournament ON arenas(tournament_id);
CREATE INDEX IF NOT EXISTS idx_appeals_tournament ON appeals(tournament_id);
CREATE INDEX IF NOT EXISTS idx_weigh_ins_athlete ON weigh_ins(athlete_id);

-- ============ UPDATED_AT TRIGGER ============

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'users','tournaments','teams','athletes','registrations',
    'combat_matches','form_performances','appeals'
  ]) LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()',
      tbl
    );
  END LOOP;
EXCEPTION WHEN duplicate_object THEN
  NULL; -- triggers already exist
END $$;

COMMIT;


-- ─── Source: 0003_scoring_events_refs.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0003: Scoring Events & Reference Tables
-- Adds Event Sourcing for match state, judge_scores, reference tables,
-- results/medals, and API views.
-- ===============================================================

BEGIN;

-- ============ REFERENCE TABLES ============

CREATE TABLE IF NOT EXISTS ref_sport_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name_vi VARCHAR(200) NOT NULL,
  name_en VARCHAR(200),
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS ref_competition_formats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name_vi VARCHAR(200) NOT NULL,
  name_en VARCHAR(200),
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS ref_penalty_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name_vi VARCHAR(200) NOT NULL,
  name_en VARCHAR(200),
  category VARCHAR(50) NOT NULL, -- 'combat', 'forms'
  point_deduction DECIMAL(3,1) DEFAULT 0,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS ref_scoring_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name_vi VARCHAR(200) NOT NULL,
  name_en VARCHAR(200),
  category VARCHAR(50) NOT NULL, -- 'quyen', 'doi_khang'
  max_score DECIMAL(5,2) NOT NULL,
  weight DECIMAL(3,2) DEFAULT 1.0,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS ref_belt_ranks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name_vi VARCHAR(200) NOT NULL,
  name_en VARCHAR(200),
  level INT NOT NULL, -- numeric ordering
  color VARCHAR(50),
  requirements TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS ref_age_categories (
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

CREATE TABLE IF NOT EXISTS ref_equipment_types (
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

-- ============ EVENT SOURCING: MATCH EVENTS ============

CREATE TABLE IF NOT EXISTS match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL,
  match_type VARCHAR(20) NOT NULL CHECK (match_type IN ('combat', 'forms')),
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  sequence_number BIGINT NOT NULL,
  round_number INT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recorded_by UUID REFERENCES users(id),
  device_id VARCHAR(100),
  sync_status VARCHAR(20) DEFAULT 'synced',
  metadata JSONB DEFAULT '{}',

  UNIQUE (match_id, sequence_number)
);

-- ============ JUDGE SCORES (normalized) ============

CREATE TABLE IF NOT EXISTS judge_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id),
  match_id UUID NOT NULL,
  match_type VARCHAR(20) NOT NULL CHECK (match_type IN ('combat', 'forms')),
  referee_id UUID REFERENCES referees(id),
  round_number INT,
  athlete_id UUID REFERENCES athletes(id),
  score DECIMAL(5,2) NOT NULL,
  penalties DECIMAL(5,2) DEFAULT 0,
  criteria_scores JSONB DEFAULT '{}',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_final BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'
);

-- ============ RESULTS & MEDALS ============

CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id),
  content_category_id UUID REFERENCES content_categories(id),
  weight_class_id UUID,
  athlete_id UUID REFERENCES athletes(id),
  team_id UUID REFERENCES teams(id),
  event_type VARCHAR(20) NOT NULL,
  rank INT,
  medal VARCHAR(20) CHECK (medal IN ('gold', 'silver', 'bronze')),
  score DECIMAL(8,2),
  match_id UUID,
  performance_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medals_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id),
  team_id UUID REFERENCES teams(id),
  gold INT DEFAULT 0,
  silver INT DEFAULT 0,
  bronze INT DEFAULT 0,
  total_points DECIMAL(8,2) DEFAULT 0,
  rank INT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ ORGANIZATIONS (Federation, Club) ============

CREATE TABLE IF NOT EXISTS federations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  level VARCHAR(50) NOT NULL, -- 'quoc_gia', 'tinh', 'khu_vuc'
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

CREATE TABLE IF NOT EXISTS clubs (
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

-- ============ RANKINGS ============

CREATE TABLE IF NOT EXISTS rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID REFERENCES athletes(id),
  category VARCHAR(50) NOT NULL, -- 'doi_khang', 'quyen'
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

-- ============ ADDITIONAL INDEXES ============

CREATE INDEX IF NOT EXISTS idx_match_events_match ON match_events(match_id, sequence_number);
CREATE INDEX IF NOT EXISTS idx_match_events_type ON match_events(event_type);
CREATE INDEX IF NOT EXISTS idx_judge_scores_match ON judge_scores(match_id, round_number);
CREATE INDEX IF NOT EXISTS idx_results_tournament ON results(tournament_id);
CREATE INDEX IF NOT EXISTS idx_results_athlete ON results(athlete_id);
CREATE INDEX IF NOT EXISTS idx_medals_summary_tournament ON medals_summary(tournament_id);
CREATE INDEX IF NOT EXISTS idx_rankings_athlete ON rankings(athlete_id);
CREATE INDEX IF NOT EXISTS idx_clubs_federation ON clubs(federation_id);
CREATE INDEX IF NOT EXISTS idx_federations_parent ON federations(parent_id);

-- ============ REFERENCE DATA SEEDS ============

INSERT INTO ref_sport_types (code, name_vi, name_en, sort_order) VALUES
  ('vo_co_truyen', 'Võ Cổ Truyền', 'Traditional Vietnamese Martial Arts', 1),
  ('quyen_thuat', 'Quyền thuật', 'Forms / Kata', 2),
  ('doi_khang', 'Đối kháng', 'Combat / Sparring', 3),
  ('binh_khi', 'Binh khí', 'Weapons', 4),
  ('song_luyen', 'Song luyện', 'Paired Practice', 5),
  ('dong_luyen', 'Đồng luyện', 'Group Practice', 6)
ON CONFLICT (code) DO NOTHING;

INSERT INTO ref_competition_formats (code, name_vi, name_en, sort_order) VALUES
  ('loai_truc_tiep', 'Loại trực tiếp', 'Single Elimination', 1),
  ('vong_tron', 'Vòng tròn', 'Round Robin', 2),
  ('loai_kep', 'Loại kép', 'Double Elimination', 3),
  ('hybrid', 'Vòng bảng + Loại trực tiếp', 'Group Stage + Knockout', 4),
  ('diem_tich_luy', 'Điểm tích lũy', 'Cumulative Score', 5)
ON CONFLICT (code) DO NOTHING;

INSERT INTO ref_penalty_types (code, name_vi, category, point_deduction, sort_order) VALUES
  ('canh_cao', 'Cảnh cáo', 'combat', 0, 1),
  ('tru_diem', 'Trừ điểm', 'combat', 1.0, 2),
  ('pham_loi_nang', 'Phạm lỗi nặng', 'combat', 2.0, 3),
  ('loai', 'Truất quyền thi đấu', 'combat', 0, 4),
  ('sai_dong_tac', 'Sai động tác', 'forms', 0.5, 5),
  ('mat_thang_bang', 'Mất thăng bằng', 'forms', 0.3, 6),
  ('quen_bai', 'Quên bài', 'forms', 1.0, 7)
ON CONFLICT (code) DO NOTHING;

INSERT INTO ref_belt_ranks (code, name_vi, name_en, level, color, sort_order) VALUES
  ('trang', 'Đai trắng', 'White Belt', 1, '#FFFFFF', 1),
  ('vang', 'Đai vàng', 'Yellow Belt', 2, '#FFD700', 2),
  ('xanh_la', 'Đai xanh lá', 'Green Belt', 3, '#228B22', 3),
  ('xanh_duong', 'Đai xanh dương', 'Blue Belt', 4, '#0000FF', 4),
  ('do', 'Đai đỏ', 'Red Belt', 5, '#FF0000', 5),
  ('den', 'Đai đen', 'Black Belt', 6, '#000000', 6)
ON CONFLICT (code) DO NOTHING;

INSERT INTO ref_age_categories (code, name_vi, name_en, min_age, max_age, sort_order) VALUES
  ('thieu_nhi', 'Thiếu nhi', 'Children', 8, 12, 1),
  ('thieu_nien', 'Thiếu niên', 'Juniors', 13, 15, 2),
  ('thanh_nien', 'Thanh niên', 'Youth', 16, 18, 3),
  ('tuyen', 'Tuyển', 'Senior', 19, 35, 4),
  ('cao_tuoi', 'Cao tuổi', 'Veterans', 36, 60, 5)
ON CONFLICT (code) DO NOTHING;

INSERT INTO ref_scoring_criteria (code, name_vi, category, max_score, weight, sort_order) VALUES
  ('ky_thuat', 'Kỹ thuật', 'quyen', 10, 0.4, 1),
  ('luc', 'Lực', 'quyen', 10, 0.2, 2),
  ('toc_do', 'Tốc độ', 'quyen', 10, 0.2, 3),
  ('phong_thai', 'Phong thái', 'quyen', 10, 0.2, 4),
  ('tan_cong', 'Tấn công', 'doi_khang', 5, 0.5, 5),
  ('phong_thu', 'Phòng thủ', 'doi_khang', 5, 0.3, 6),
  ('the_hien', 'Thể hiện', 'doi_khang', 5, 0.2, 7)
ON CONFLICT (code) DO NOTHING;

-- ============ TRIGGERS FOR NEW TABLES ============

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'federations', 'clubs', 'medals_summary'
  ]) LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()',
      tbl
    );
  END LOOP;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

COMMIT;


-- ─── Source: 0004_enterprise_foundation.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0004: ENTERPRISE FOUNDATION
-- Schemas, UUIDv7, base functions, core tenant/identity tables
-- Target: 1B users, 1000s concurrent events, multi-region
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. SCHEMA NAMESPACES
-- ════════════════════════════════════════════════════════

CREATE SCHEMA IF NOT EXISTS core;        -- Tenant & Identity
CREATE SCHEMA IF NOT EXISTS tournament;  -- Giải đấu & Thi đấu
CREATE SCHEMA IF NOT EXISTS people;      -- Con người
CREATE SCHEMA IF NOT EXISTS training;    -- Đào tạo
CREATE SCHEMA IF NOT EXISTS platform;    -- Community, Finance, Heritage
CREATE SCHEMA IF NOT EXISTS system;      -- Infrastructure
CREATE SCHEMA IF NOT EXISTS api_v1;      -- Stable API views

-- ════════════════════════════════════════════════════════
-- 2. UUIDv7 FUNCTION (Time-ordered UUID)
--    40-60% better insert perf vs UUIDv4
--    Sequential → minimal B-tree fragmentation
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION uuidv7() RETURNS UUID AS $$
DECLARE
  unix_ts_ms BIGINT;
  uuid_bytes BYTEA;
BEGIN
  unix_ts_ms = (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT;
  uuid_bytes = substring(int8send(unix_ts_ms) FROM 3);           -- 6 bytes timestamp
  uuid_bytes = uuid_bytes || gen_random_bytes(10);                -- 10 bytes random
  -- Set version 7
  uuid_bytes = set_byte(uuid_bytes, 6, (get_byte(uuid_bytes, 6) & x'0F'::INT) | x'70'::INT);
  -- Set variant 2
  uuid_bytes = set_byte(uuid_bytes, 8, (get_byte(uuid_bytes, 8) & x'3F'::INT) | x'80'::INT);
  RETURN encode(uuid_bytes, 'hex')::UUID;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- ════════════════════════════════════════════════════════
-- 3. BASE TRIGGER FUNCTIONS
-- ════════════════════════════════════════════════════════

-- Overwrite the one from 0002 to also bump version
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF TG_TABLE_NAME != 'schema_migrations' THEN
    BEGIN
      NEW.version = COALESCE(OLD.version, 0) + 1;
    EXCEPTION WHEN undefined_column THEN
      NULL; -- table may not have version column
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Prevent hard deletes on protected tables
CREATE OR REPLACE FUNCTION trigger_prevent_hard_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Hard deletes are not allowed on %. Use soft-delete (SET is_deleted = true) instead.', TG_TABLE_NAME;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Auto-set tenant_id from session variable
CREATE OR REPLACE FUNCTION trigger_set_tenant_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tenant_id IS NULL THEN
    BEGIN
      NEW.tenant_id = current_setting('app.current_tenant', true)::UUID;
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'tenant_id is required. Set via SET app.current_tenant or provide explicitly.';
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 4. CORE TABLES: TENANTS
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS core.tenants (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  name          VARCHAR(200) NOT NULL,
  code          VARCHAR(50) UNIQUE NOT NULL,
  tenant_type   VARCHAR(30) NOT NULL DEFAULT 'federation',
  -- CHECK (tenant_type IN ('system', 'federation', 'club', 'school'))
  parent_id     UUID REFERENCES core.tenants(id),
  domain        VARCHAR(200),
  logo_url      TEXT,
  settings      JSONB DEFAULT '{}',
  is_active     BOOLEAN DEFAULT true,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version       INT NOT NULL DEFAULT 1
);

-- System tenant (root)
INSERT INTO core.tenants (id, name, code, tenant_type)
VALUES ('00000000-0000-7000-8000-000000000001', 'VCT System', 'vct_system', 'system')
ON CONFLICT (code) DO NOTHING;

-- ════════════════════════════════════════════════════════
-- 5. CORE TABLES: ENHANCED USERS
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS core.users (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL REFERENCES core.tenants(id),
  username        VARCHAR(50) NOT NULL,
  email           VARCHAR(255),
  phone           VARCHAR(20),
  password_hash   VARCHAR(255) NOT NULL,
  full_name       VARCHAR(200) NOT NULL,
  avatar_url      TEXT,
  locale          VARCHAR(10) DEFAULT 'vi',
  timezone        VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
  is_active       BOOLEAN DEFAULT true,
  is_deleted      BOOLEAN DEFAULT false,
  deleted_at      TIMESTAMPTZ,
  last_login_at   TIMESTAMPTZ,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by      UUID,
  version         INT NOT NULL DEFAULT 1,
  UNIQUE (tenant_id, username),
  UNIQUE (tenant_id, email)
);

-- RLS
ALTER TABLE core.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_users ON core.users
  USING (
    tenant_id = COALESCE(
      current_setting('app.current_tenant', true)::UUID,
      '00000000-0000-7000-8000-000000000001'::UUID
    )
  );

-- System admin bypasses RLS
CREATE POLICY system_admin_users ON core.users
  FOR ALL
  USING (
    current_setting('app.is_system_admin', true) = 'true'
  );

-- ════════════════════════════════════════════════════════
-- 6. CORE TABLES: ROLES & PERMISSIONS
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS core.roles (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL REFERENCES core.tenants(id),
  name          VARCHAR(100) NOT NULL,
  description   TEXT,
  permissions   JSONB DEFAULT '[]',
  is_system     BOOLEAN DEFAULT false,
  is_active     BOOLEAN DEFAULT true,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version       INT NOT NULL DEFAULT 1,
  UNIQUE (tenant_id, name)
);

CREATE TABLE IF NOT EXISTS core.user_roles (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL REFERENCES core.tenants(id),
  user_id       UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  role_id       UUID NOT NULL REFERENCES core.roles(id) ON DELETE CASCADE,
  scope_type    VARCHAR(30) NOT NULL DEFAULT 'TENANT',
  scope_id      UUID,
  granted_by    UUID REFERENCES core.users(id),
  granted_at    TIMESTAMPTZ DEFAULT NOW(),
  expires_at    TIMESTAMPTZ,
  is_active     BOOLEAN DEFAULT true,
  metadata      JSONB DEFAULT '{}',
  UNIQUE (tenant_id, user_id, role_id, scope_type, scope_id)
);

-- ════════════════════════════════════════════════════════
-- 7. CORE TABLES: SESSIONS & AUTH AUDIT
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS core.sessions (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL REFERENCES core.tenants(id),
  user_id       UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  token_hash    VARCHAR(255) NOT NULL,
  device_info   JSONB DEFAULT '{}',
  ip_address    INET,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS core.auth_audit_log (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL REFERENCES core.tenants(id),
  user_id       UUID REFERENCES core.users(id),
  action        VARCHAR(50) NOT NULL,
  ip_address    INET,
  user_agent    TEXT,
  details       JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════
-- 8. INDEXES
-- ════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_tenants_parent ON core.tenants(parent_id);
CREATE INDEX IF NOT EXISTS idx_tenants_type ON core.tenants(tenant_type) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_users_tenant_active ON core.users(tenant_id, is_active)
  WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_users_email ON core.users(tenant_id, email)
  WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_users_last_login ON core.users(tenant_id, last_login_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON core.user_roles(tenant_id, user_id)
  WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_roles_scope ON core.user_roles(scope_type, scope_id)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_sessions_user ON core.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON core.sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON core.sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_auth_audit_user ON core.auth_audit_log(tenant_id, user_id, created_at DESC);

-- ════════════════════════════════════════════════════════
-- 9. TRIGGERS
-- ════════════════════════════════════════════════════════

CREATE TRIGGER set_updated_at BEFORE UPDATE ON core.tenants
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON core.users
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON core.roles
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Prevent hard deletes on users
CREATE TRIGGER prevent_hard_delete BEFORE DELETE ON core.users
  FOR EACH ROW EXECUTE FUNCTION trigger_prevent_hard_delete();

-- Seed default roles
INSERT INTO core.roles (tenant_id, name, description, is_system, permissions) VALUES
  ('00000000-0000-7000-8000-000000000001', 'SYSTEM_ADMIN', 'Quản trị viên hệ thống', true, '["*"]'),
  ('00000000-0000-7000-8000-000000000001', 'FEDERATION_ADMIN', 'Quản trị viên liên đoàn', true, '["federation.*"]'),
  ('00000000-0000-7000-8000-000000000001', 'CLUB_MANAGER', 'Quản lý CLB', true, '["club.*"]'),
  ('00000000-0000-7000-8000-000000000001', 'COACH', 'Huấn luyện viên', true, '["training.*","people.read"]'),
  ('00000000-0000-7000-8000-000000000001', 'REFEREE', 'Trọng tài', true, '["scoring.*","tournament.read"]'),
  ('00000000-0000-7000-8000-000000000001', 'ATHLETE', 'Vận động viên', true, '["profile.*","training.read"]'),
  ('00000000-0000-7000-8000-000000000001', 'DELEGATE', 'Trưởng đoàn', true, '["team.*","registration.*"]'),
  ('00000000-0000-7000-8000-000000000001', 'VIEWER', 'Người xem', true, '["*.read"]')
ON CONFLICT (tenant_id, name) DO NOTHING;

COMMIT;


-- ─── Source: 0005_existing_tables_upgrade.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0005: EXISTING TABLES UPGRADE
-- Add tenant_id, audit columns, version, constraints
-- to all tables created in 0002/0003
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- Default tenant for existing data
-- ════════════════════════════════════════════════════════
DO $$ BEGIN
  PERFORM id FROM core.tenants WHERE code = 'vct_system';
EXCEPTION WHEN undefined_table THEN
  NULL;
END $$;

-- ════════════════════════════════════════════════════════
-- ADD tenant_id + audit columns to ALL existing tables
-- ════════════════════════════════════════════════════════

DO $$
DECLARE
  tbl TEXT;
  default_tenant UUID := '00000000-0000-7000-8000-000000000001';
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'tournaments', 'age_groups', 'content_categories', 'weight_classes',
    'teams', 'athletes', 'registrations', 'referees', 'arenas',
    'referee_assignments', 'combat_matches', 'form_performances',
    'weigh_ins', 'schedule_entries', 'appeals', 'notifications',
    'medical_records', 'media_files', 'data_audit_log',
    'match_events', 'judge_scores', 'rankings', 'medals_summary',
    'federations', 'clubs', 'organizations'
  ]) LOOP
    BEGIN
      -- tenant_id
      EXECUTE format(
        'ALTER TABLE %I ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT %L REFERENCES core.tenants(id)',
        tbl, default_tenant
      );
      -- created_by / updated_by
      EXECUTE format(
        'ALTER TABLE %I ADD COLUMN IF NOT EXISTS created_by UUID',
        tbl
      );
      EXECUTE format(
        'ALTER TABLE %I ADD COLUMN IF NOT EXISTS updated_by UUID',
        tbl
      );
      -- version (optimistic locking)
      EXECUTE format(
        'ALTER TABLE %I ADD COLUMN IF NOT EXISTS version INT DEFAULT 1',
        tbl
      );
      -- is_deleted + deleted_at + deleted_by
      EXECUTE format(
        'ALTER TABLE %I ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false',
        tbl
      );
      EXECUTE format(
        'ALTER TABLE %I ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ',
        tbl
      );
      EXECUTE format(
        'ALTER TABLE %I ADD COLUMN IF NOT EXISTS deleted_by UUID',
        tbl
      );
      -- metadata (if missing)
      EXECUTE format(
        'ALTER TABLE %I ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT ''{}''',
        tbl
      );
    EXCEPTION WHEN undefined_table THEN
      RAISE NOTICE 'Table % does not exist, skipping', tbl;
    END;
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════
-- SET tenant_id NOT NULL (after backfilling default)
-- ════════════════════════════════════════════════════════

DO $$
DECLARE
  tbl TEXT;
  default_tenant UUID := '00000000-0000-7000-8000-000000000001';
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'tournaments', 'teams', 'athletes', 'registrations', 'referees',
    'arenas', 'combat_matches', 'form_performances', 'appeals'
  ]) LOOP
    BEGIN
      EXECUTE format('UPDATE %I SET tenant_id = %L WHERE tenant_id IS NULL', tbl, default_tenant);
      EXECUTE format('ALTER TABLE %I ALTER COLUMN tenant_id SET NOT NULL', tbl);
    EXCEPTION WHEN undefined_table THEN
      NULL;
    END;
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════
-- ADD CHECK CONSTRAINTS on status fields
-- ════════════════════════════════════════════════════════

DO $$ BEGIN
  ALTER TABLE tournaments ADD CONSTRAINT chk_tournaments_status
    CHECK (status IN ('nhap', 'dang_ky', 'khoa_dk', 'thi_dau', 'ket_thuc', 'huy'));
EXCEPTION WHEN duplicate_object OR check_violation THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE teams ADD CONSTRAINT chk_teams_status
    CHECK (trang_thai IN ('nhap', 'cho_duyet', 'da_duyet', 'tu_choi', 'rut'));
EXCEPTION WHEN duplicate_object OR check_violation THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE athletes ADD CONSTRAINT chk_athletes_status
    CHECK (trang_thai IN ('nhap', 'cho_duyet', 'da_duyet', 'tu_choi', 'rut'));
EXCEPTION WHEN duplicate_object OR check_violation THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE combat_matches ADD CONSTRAINT chk_matches_status
    CHECK (trang_thai IN ('chua_dau', 'dang_dau', 'tam_dung', 'ket_thuc', 'huy'));
EXCEPTION WHEN duplicate_object OR check_violation THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE registrations ADD CONSTRAINT chk_registrations_status
    CHECK (trang_thai IN ('cho_duyet', 'da_duyet', 'tu_choi', 'rut'));
EXCEPTION WHEN duplicate_object OR check_violation THEN NULL;
END $$;

-- ════════════════════════════════════════════════════════
-- COMPOSITE INDEXES (replace single-column)
-- ════════════════════════════════════════════════════════

-- Athletes: most common query pattern
CREATE INDEX IF NOT EXISTS idx_athletes_tenant_tournament
  ON athletes(tenant_id, tournament_id, trang_thai)
  WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_athletes_tenant_team
  ON athletes(tenant_id, team_id)
  WHERE is_deleted = false;

-- Matches: live scoring queries
CREATE INDEX IF NOT EXISTS idx_matches_tenant_tournament_status
  ON combat_matches(tenant_id, tournament_id, trang_thai)
  WHERE is_deleted = false;

-- Teams
CREATE INDEX IF NOT EXISTS idx_teams_tenant_tournament
  ON teams(tenant_id, tournament_id, trang_thai)
  WHERE is_deleted = false;

-- Registrations
CREATE INDEX IF NOT EXISTS idx_registrations_tenant_tournament
  ON registrations(tenant_id, tournament_id, trang_thai);

-- Match events: BRIN for append-only time-series
CREATE INDEX IF NOT EXISTS idx_match_events_recorded_brin
  ON match_events USING BRIN (recorded_at)
  WITH (pages_per_range = 32);

CREATE INDEX IF NOT EXISTS idx_match_events_match_seq
  ON match_events(match_id, sequence_number);

-- Rankings
CREATE INDEX IF NOT EXISTS idx_rankings_tenant_category
  ON rankings(tenant_id, category, weight_class)
  WHERE is_deleted = false;

-- ════════════════════════════════════════════════════════
-- RLS ON KEY TABLES
-- ════════════════════════════════════════════════════════

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'tournaments', 'teams', 'athletes', 'registrations', 'referees',
    'arenas', 'combat_matches', 'form_performances', 'appeals',
    'match_events', 'rankings', 'federations', 'clubs'
  ]) LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
      EXECUTE format(
        'CREATE POLICY tenant_isolation_%I ON %I
          USING (tenant_id = COALESCE(
            current_setting(''app.current_tenant'', true)::UUID,
            ''00000000-0000-7000-8000-000000000001''::UUID
          ))',
        tbl, tbl
      );
    EXCEPTION
      WHEN undefined_table THEN NULL;
      WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════
-- PREVENT HARD DELETES on critical tables
-- ════════════════════════════════════════════════════════

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'tournaments', 'athletes', 'teams', 'combat_matches', 'match_events'
  ]) LOOP
    BEGIN
      EXECUTE format(
        'CREATE TRIGGER prevent_hard_delete BEFORE DELETE ON %I
         FOR EACH ROW EXECUTE FUNCTION trigger_prevent_hard_delete()',
        tbl
      );
    EXCEPTION
      WHEN undefined_table THEN NULL;
      WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;

COMMIT;


-- ─── Source: 0006_training_module.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0006: TRAINING MODULE (Enterprise)
-- Schema: training.* | Template: tenant-aware, bitemporal, versioned
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- CURRICULA (Giáo trình)
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS training.curricula (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  name              VARCHAR(200) NOT NULL,
  code              VARCHAR(50) NOT NULL,
  school_style      VARCHAR(100),
  description       TEXT,
  is_active         BOOLEAN DEFAULT true,
  metadata          JSONB DEFAULT '{}',
  is_deleted        BOOLEAN DEFAULT false,
  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by        UUID,
  version           INT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, id),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS training.curriculum_levels (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  curriculum_id     UUID NOT NULL,
  belt_rank_id      UUID,
  level_order       INT NOT NULL,
  name              VARCHAR(200) NOT NULL,
  description       TEXT,
  min_training_months INT DEFAULT 0,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version           INT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, id)
);

-- ════════════════════════════════════════════════════════
-- TECHNIQUES (Kỹ thuật)
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS training.techniques (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  name_vi           VARCHAR(200) NOT NULL,
  name_en           VARCHAR(200),
  name_han_nom      VARCHAR(200),
  category          VARCHAR(50) NOT NULL
    CHECK (category IN ('don', 'quyen', 'tu_ve', 'binh_khi', 'song_luyen')),
  difficulty_level  INT DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 10),
  description       TEXT,
  instructions      TEXT,
  is_active         BOOLEAN DEFAULT true,
  metadata          JSONB DEFAULT '{}',
  is_deleted        BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by        UUID,
  version           INT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS training.technique_media (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  technique_id      UUID NOT NULL,
  media_type        VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'video', 'document')),
  url               TEXT NOT NULL,
  thumbnail_url     TEXT,
  title             VARCHAR(200),
  sort_order        INT DEFAULT 0,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS training.curriculum_techniques (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  curriculum_level_id UUID NOT NULL,
  technique_id      UUID NOT NULL,
  is_mandatory      BOOLEAN DEFAULT true,
  sort_order        INT DEFAULT 0,
  PRIMARY KEY (tenant_id, id),
  UNIQUE (tenant_id, curriculum_level_id, technique_id)
);

-- ════════════════════════════════════════════════════════
-- TRAINING PLANS & SESSIONS
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS training.training_plans (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  club_id           UUID,
  coach_id          UUID,
  name              VARCHAR(200) NOT NULL,
  description       TEXT,
  start_date        DATE,
  end_date          DATE,
  status            VARCHAR(20) DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  metadata          JSONB DEFAULT '{}',
  is_deleted        BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by        UUID,
  version           INT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS training.training_sessions (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  training_plan_id  UUID,
  club_id           UUID,
  coach_id          UUID,
  title             VARCHAR(200) NOT NULL,
  session_date      DATE NOT NULL,
  start_time        TIME NOT NULL,
  end_time          TIME NOT NULL,
  location          VARCHAR(200),
  description       TEXT,
  status            VARCHAR(20) DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  max_participants  INT,
  metadata          JSONB DEFAULT '{}',
  is_deleted        BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by        UUID,
  version           INT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS training.attendance_records (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  session_id        UUID NOT NULL,
  athlete_id        UUID NOT NULL,
  check_in_at       TIMESTAMPTZ,
  check_out_at      TIMESTAMPTZ,
  status            VARCHAR(20) NOT NULL DEFAULT 'present'
    CHECK (status IN ('present', 'absent', 'late', 'excused')),
  checked_by        UUID,
  device_id         VARCHAR(100),
  sync_status       VARCHAR(20) DEFAULT 'synced',
  note              TEXT,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id),
  UNIQUE (tenant_id, session_id, athlete_id)
);

-- ════════════════════════════════════════════════════════
-- BELT EXAMINATIONS (Thi đai)
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS training.belt_examinations (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  club_id           UUID,
  title             VARCHAR(200) NOT NULL,
  exam_date         DATE NOT NULL,
  location          VARCHAR(200),
  target_belt_id    UUID,
  status            VARCHAR(20) NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  chief_examiner    VARCHAR(200),
  max_candidates    INT,
  registration_deadline DATE,
  description       TEXT,
  metadata          JSONB DEFAULT '{}',
  is_deleted        BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by        UUID,
  version           INT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS training.belt_exam_results (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  examination_id    UUID NOT NULL,
  athlete_id        UUID NOT NULL,
  current_belt_id   UUID,
  target_belt_id    UUID,
  score             DECIMAL(5,2),
  result            VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (result IN ('pending', 'passed', 'failed', 'deferred')),
  examiner_notes    TEXT,
  certificate_number VARCHAR(100),
  certificate_date  DATE,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id),
  UNIQUE (tenant_id, examination_id, athlete_id)
);

-- ════════════════════════════════════════════════════════
-- E-LEARNING (Khóa học online)
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS training.courses (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  title             VARCHAR(200) NOT NULL,
  code              VARCHAR(50) NOT NULL,
  description       TEXT,
  instructor_id     UUID,
  category          VARCHAR(50)
    CHECK (category IN ('quyen', 'ky_thuat', 'ly_thuyet', 'trong_tai', 'hlv')),
  level             VARCHAR(20) DEFAULT 'beginner'
    CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  thumbnail_url     TEXT,
  duration_hours    DECIMAL(5,1),
  is_published      BOOLEAN DEFAULT false,
  is_free           BOOLEAN DEFAULT true,
  price             DECIMAL(12,2) DEFAULT 0,
  metadata          JSONB DEFAULT '{}',
  is_deleted        BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by        UUID,
  version           INT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, id),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS training.course_enrollments (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  course_id         UUID NOT NULL,
  user_id           UUID NOT NULL,
  progress_percent  DECIMAL(5,2) DEFAULT 0,
  status            VARCHAR(20) DEFAULT 'enrolled'
    CHECK (status IN ('enrolled', 'in_progress', 'completed', 'dropped')),
  enrolled_at       TIMESTAMPTZ DEFAULT NOW(),
  completed_at      TIMESTAMPTZ,
  metadata          JSONB DEFAULT '{}',
  PRIMARY KEY (tenant_id, id),
  UNIQUE (tenant_id, course_id, user_id)
);

-- ════════════════════════════════════════════════════════
-- RLS
-- ════════════════════════════════════════════════════════

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'training.curricula', 'training.curriculum_levels', 'training.techniques',
    'training.training_plans', 'training.training_sessions',
    'training.attendance_records', 'training.belt_examinations',
    'training.belt_exam_results', 'training.courses', 'training.course_enrollments'
  ]) LOOP
    EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %s
        USING (tenant_id = COALESCE(
          current_setting(''app.current_tenant'', true)::UUID,
          ''00000000-0000-7000-8000-000000000001''::UUID
        ))',
      tbl
    );
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════
-- INDEXES
-- ════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_curricula_tenant ON training.curricula(tenant_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_techniques_tenant_cat ON training.techniques(tenant_id, category) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_sessions_tenant_date ON training.training_sessions(tenant_id, session_date DESC) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_sessions_club ON training.training_sessions(tenant_id, club_id);
CREATE INDEX IF NOT EXISTS idx_attendance_session ON training.attendance_records(tenant_id, session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_athlete ON training.attendance_records(tenant_id, athlete_id);
CREATE INDEX IF NOT EXISTS idx_belt_exams_tenant ON training.belt_examinations(tenant_id, exam_date) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_courses_tenant_pub ON training.courses(tenant_id, is_published) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON training.course_enrollments(tenant_id, user_id);

-- ════════════════════════════════════════════════════════
-- TRIGGERS
-- ════════════════════════════════════════════════════════

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'training.curricula', 'training.techniques', 'training.training_plans',
    'training.training_sessions', 'training.belt_examinations', 'training.courses'
  ]) LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %s
       FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()',
      tbl
    );
  END LOOP;
END $$;

COMMIT;


-- ─── Source: 0007_org_people.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0007: ORGANIZATION + PEOPLE (Enterprise)
-- Schema: people.* | Club branches, coaches, certifications,
-- bitemporal belt/weight history
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- CLUB BRANCHES (Chi nhánh CLB)
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS people.club_branches (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  club_id           UUID NOT NULL,
  name              VARCHAR(200) NOT NULL,
  address           TEXT,
  city              VARCHAR(100),
  province          VARCHAR(100),
  phone             VARCHAR(20),
  email             VARCHAR(255),
  head_instructor   VARCHAR(200),
  capacity          INT DEFAULT 0,
  is_active         BOOLEAN DEFAULT true,
  metadata          JSONB DEFAULT '{}',
  is_deleted        BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by        UUID,
  version           INT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, id)
);

-- ════════════════════════════════════════════════════════
-- CLUB MEMBERSHIPS (Thành viên CLB)
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS people.club_memberships (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  club_id           UUID NOT NULL,
  user_id           UUID,
  athlete_id        UUID,
  full_name         VARCHAR(200) NOT NULL,
  role              VARCHAR(50) NOT NULL DEFAULT 'member'
    CHECK (role IN ('owner', 'manager', 'instructor', 'member', 'trial')),
  join_date         DATE NOT NULL DEFAULT CURRENT_DATE,
  leave_date        DATE,
  status            VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'suspended', 'transferred')),
  membership_number VARCHAR(50),
  notes             TEXT,
  metadata          JSONB DEFAULT '{}',
  is_deleted        BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by        UUID,
  version           INT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, id)
);

-- ════════════════════════════════════════════════════════
-- COACHES (Huấn luyện viên)
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS people.coaches (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  user_id           UUID,
  full_name         VARCHAR(200) NOT NULL,
  date_of_birth     DATE,
  gender            VARCHAR(5) CHECK (gender IN ('nam', 'nu')),
  phone             VARCHAR(20),
  email             VARCHAR(255),
  club_id           UUID,
  specialization    VARCHAR(100),
  belt_rank_id      UUID,
  experience_years  INT DEFAULT 0,
  bio               TEXT,
  avatar_url        TEXT,
  status            VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'retired', 'suspended')),
  metadata          JSONB DEFAULT '{}',
  is_deleted        BOOLEAN DEFAULT false,
  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by        UUID,
  version           INT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, id)
);

-- ════════════════════════════════════════════════════════
-- CERTIFICATIONS (Chứng chỉ — coaches & referees)
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS people.certifications (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  holder_type       VARCHAR(20) NOT NULL CHECK (holder_type IN ('coach', 'referee', 'athlete')),
  holder_id         UUID NOT NULL,
  cert_type         VARCHAR(100) NOT NULL,
  issuing_authority VARCHAR(200),
  certificate_number VARCHAR(100),
  issue_date        DATE NOT NULL,
  expiry_date       DATE,
  status            VARCHAR(20) DEFAULT 'valid'
    CHECK (status IN ('valid', 'expired', 'revoked', 'pending_renewal')),
  document_url      TEXT,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID,
  version           INT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, id)
);

-- ════════════════════════════════════════════════════════
-- ATHLETE BELT HISTORY (Bitemporal)
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS people.athlete_belt_history (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  athlete_id        UUID NOT NULL,
  belt_rank_id      UUID NOT NULL,
  -- Bitemporal: valid_time
  valid_from        DATE NOT NULL,
  valid_to          DATE DEFAULT 'infinity',
  -- Bitemporal: transaction_time
  recorded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  superseded_at     TIMESTAMPTZ DEFAULT 'infinity',
  recorded_by       UUID,
  superseded_by_id  UUID,
  examination_id    UUID,
  certificate_number VARCHAR(100),
  notes             TEXT,
  metadata          JSONB DEFAULT '{}',
  PRIMARY KEY (tenant_id, id)
);

-- ════════════════════════════════════════════════════════
-- ATHLETE WEIGHT HISTORY
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS people.athlete_weight_history (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  athlete_id        UUID NOT NULL,
  weight            DECIMAL(5,1) NOT NULL,
  measured_at       DATE NOT NULL,
  measured_by       VARCHAR(200),
  context           VARCHAR(50)
    CHECK (context IN ('routine', 'weigh_in', 'medical', 'self_report')),
  notes             TEXT,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id)
);

-- ════════════════════════════════════════════════════════
-- ENHANCE ATHLETES TABLE (add columns if missing)
-- ════════════════════════════════════════════════════════

DO $$
BEGIN
  ALTER TABLE athletes ADD COLUMN IF NOT EXISTS current_club_id UUID;
  ALTER TABLE athletes ADD COLUMN IF NOT EXISTS belt_rank_id UUID;
  ALTER TABLE athletes ADD COLUMN IF NOT EXISTS national_id VARCHAR(20);
  ALTER TABLE athletes ADD COLUMN IF NOT EXISTS blood_type VARCHAR(5);
  ALTER TABLE athletes ADD COLUMN IF NOT EXISTS insurance_number VARCHAR(50);
  ALTER TABLE athletes ADD COLUMN IF NOT EXISTS insurance_expiry DATE;
  ALTER TABLE referees ADD COLUMN IF NOT EXISTS date_of_birth DATE;
  ALTER TABLE referees ADD COLUMN IF NOT EXISTS gender VARCHAR(5);
  ALTER TABLE referees ADD COLUMN IF NOT EXISTS avatar_url TEXT;
END $$;

-- ════════════════════════════════════════════════════════
-- RLS
-- ════════════════════════════════════════════════════════

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'people.club_branches', 'people.club_memberships', 'people.coaches',
    'people.certifications', 'people.athlete_belt_history',
    'people.athlete_weight_history'
  ]) LOOP
    EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %s
        USING (tenant_id = COALESCE(
          current_setting(''app.current_tenant'', true)::UUID,
          ''00000000-0000-7000-8000-000000000001''::UUID
        ))',
      tbl
    );
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════
-- INDEXES
-- ════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_branches_club ON people.club_branches(tenant_id, club_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_memberships_club ON people.club_memberships(tenant_id, club_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_memberships_user ON people.club_memberships(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_coaches_club ON people.coaches(tenant_id, club_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_coaches_status ON people.coaches(tenant_id, status) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_certs_holder ON people.certifications(tenant_id, holder_type, holder_id);
CREATE INDEX IF NOT EXISTS idx_certs_expiry ON people.certifications(tenant_id, expiry_date) WHERE status = 'valid';
CREATE INDEX IF NOT EXISTS idx_belt_history_athlete ON people.athlete_belt_history(tenant_id, athlete_id);
CREATE INDEX IF NOT EXISTS idx_belt_history_current ON people.athlete_belt_history(tenant_id, athlete_id, valid_to)
  WHERE valid_to = 'infinity';
CREATE INDEX IF NOT EXISTS idx_weight_history_athlete ON people.athlete_weight_history(tenant_id, athlete_id, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_athletes_club ON athletes(current_club_id);
CREATE INDEX IF NOT EXISTS idx_athletes_belt ON athletes(belt_rank_id);

-- TRIGGERS
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'people.club_branches', 'people.club_memberships', 'people.coaches'
  ]) LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %s
       FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()',
      tbl
    );
  END LOOP;
END $$;

COMMIT;


-- ─── Source: 0008_finance.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0008: FINANCE MODULE (Enterprise)
-- Schema: platform.* | Fees, payments, invoices, sponsorships, budgets
-- ===============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS platform.fee_schedules (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  club_id           UUID,
  name              VARCHAR(200) NOT NULL,
  fee_type          VARCHAR(50) NOT NULL
    CHECK (fee_type IN ('hoc_phi', 'le_phi_giai', 'thi_dai', 'dang_ky', 'bao_hiem')),
  amount            DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
  currency          VARCHAR(10) DEFAULT 'VND',
  period            VARCHAR(20)
    CHECK (period IN ('thang', 'quy', 'nam', 'mot_lan')),
  description       TEXT,
  is_active         BOOLEAN DEFAULT true,
  metadata          JSONB DEFAULT '{}',
  is_deleted        BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by        UUID,
  version           INT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS platform.payments (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  fee_schedule_id   UUID,
  payer_user_id     UUID,
  payer_name        VARCHAR(200) NOT NULL,
  amount            DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  currency          VARCHAR(10) DEFAULT 'VND',
  payment_method    VARCHAR(50)
    CHECK (payment_method IN ('tien_mat', 'chuyen_khoan', 'vietqr', 'momo', 'zalopay', 'vnpay')),
  transaction_ref   VARCHAR(200),
  payment_date      DATE NOT NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'failed', 'refunded', 'cancelled')),
  confirmed_by      UUID,
  confirmed_at      TIMESTAMPTZ,
  notes             TEXT,
  receipt_url       TEXT,
  metadata          JSONB DEFAULT '{}',
  is_deleted        BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by        UUID,
  version           INT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS platform.invoices (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  invoice_number    VARCHAR(50) NOT NULL,
  club_id           UUID,
  tournament_id     UUID,
  customer_name     VARCHAR(200) NOT NULL,
  customer_email    VARCHAR(255),
  customer_phone    VARCHAR(20),
  customer_address  TEXT,
  subtotal          DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount        DECIMAL(12,2) DEFAULT 0,
  discount_amount   DECIMAL(12,2) DEFAULT 0,
  total_amount      DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency          VARCHAR(10) DEFAULT 'VND',
  status            VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'voided')),
  issue_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date          DATE,
  paid_date         DATE,
  notes             TEXT,
  metadata          JSONB DEFAULT '{}',
  is_deleted        BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by        UUID,
  version           INT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, id),
  UNIQUE (tenant_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS platform.invoice_items (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  invoice_id        UUID NOT NULL,
  description       VARCHAR(500) NOT NULL,
  quantity          INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price        DECIMAL(12,2) NOT NULL,
  amount            DECIMAL(12,2) NOT NULL,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS platform.sponsorships (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  sponsor_name      VARCHAR(200) NOT NULL,
  sponsor_type      VARCHAR(50)
    CHECK (sponsor_type IN ('doanh_nghiep', 'ca_nhan', 'to_chuc', 'truyen_thong')),
  contact_person    VARCHAR(200),
  contact_email     VARCHAR(255),
  contact_phone     VARCHAR(20),
  logo_url          TEXT,
  website           TEXT,
  package_name      VARCHAR(100),
  amount            DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
  currency          VARCHAR(10) DEFAULT 'VND',
  tournament_id     UUID,
  benefits          TEXT,
  contract_start    DATE,
  contract_end      DATE,
  status            VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  metadata          JSONB DEFAULT '{}',
  is_deleted        BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by        UUID,
  version           INT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS platform.tournament_budgets (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  tournament_id     UUID NOT NULL,
  name              VARCHAR(200) NOT NULL,
  total_budget      DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_spent       DECIMAL(15,2) DEFAULT 0,
  total_income      DECIMAL(15,2) DEFAULT 0,
  status            VARCHAR(20) DEFAULT 'draft'
    CHECK (status IN ('draft', 'approved', 'active', 'closed')),
  approved_by       UUID,
  approved_at       TIMESTAMPTZ,
  notes             TEXT,
  metadata          JSONB DEFAULT '{}',
  is_deleted        BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by        UUID,
  version           INT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS platform.budget_items (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  budget_id         UUID NOT NULL,
  category          VARCHAR(100) NOT NULL,
  item_type         VARCHAR(10) NOT NULL CHECK (item_type IN ('income', 'expense')),
  description       VARCHAR(500) NOT NULL,
  planned_amount    DECIMAL(12,2) NOT NULL DEFAULT 0,
  actual_amount     DECIMAL(12,2) DEFAULT 0,
  notes             TEXT,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version           INT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, id)
);

-- RLS
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'platform.fee_schedules', 'platform.payments', 'platform.invoices',
    'platform.invoice_items', 'platform.sponsorships',
    'platform.tournament_budgets', 'platform.budget_items'
  ]) LOOP
    EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %s
        USING (tenant_id = COALESCE(
          current_setting(''app.current_tenant'', true)::UUID,
          ''00000000-0000-7000-8000-000000000001''::UUID
        ))',
      tbl
    );
  END LOOP;
END $$;

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_fees_tenant_type ON platform.fee_schedules(tenant_id, fee_type) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_payments_tenant_status ON platform.payments(tenant_id, status, payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_payer ON platform.payments(tenant_id, payer_user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_status ON platform.invoices(tenant_id, status) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON platform.invoice_items(tenant_id, invoice_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_tournament ON platform.sponsorships(tenant_id, tournament_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_budgets_tournament ON platform.tournament_budgets(tenant_id, tournament_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_budget_items_budget ON platform.budget_items(tenant_id, budget_id);

-- TRIGGERS
DO $$
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'platform.fee_schedules', 'platform.payments', 'platform.invoices',
    'platform.sponsorships', 'platform.tournament_budgets', 'platform.budget_items'
  ]) LOOP
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()', tbl);
  END LOOP;
END $$;

COMMIT;


-- ─── Source: 0009_heritage.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0009: HERITAGE MODULE (Enterprise)
-- Schema: platform.* | Môn phái, phả hệ, kỹ thuật, từ điển, sự kiện
-- ===============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS platform.martial_schools (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  name              VARCHAR(200) NOT NULL,
  name_han_nom      VARCHAR(200),
  code              VARCHAR(50) NOT NULL,
  founder           VARCHAR(200),
  founded_year      INT,
  origin_location   VARCHAR(200),
  description       TEXT,
  philosophy        TEXT,
  history           TEXT,
  logo_url          TEXT,
  banner_url        TEXT,
  is_recognized     BOOLEAN DEFAULT false,
  federation_id     UUID,
  parent_school_id  UUID,
  status            VARCHAR(20) DEFAULT 'active',
  metadata          JSONB DEFAULT '{}',
  is_deleted        BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by        UUID,
  version           INT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, id),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS platform.school_lineage (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  school_id         UUID NOT NULL,
  parent_school_id  UUID,
  relationship_type VARCHAR(50) NOT NULL
    CHECK (relationship_type IN ('origin', 'branch', 'influenced_by', 'merged')),
  description       TEXT,
  year_established  INT,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS platform.lineage_nodes (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  person_name       VARCHAR(200) NOT NULL,
  title             VARCHAR(100),
  generation        INT,
  school_id         UUID,
  parent_node_id    UUID,
  birth_year        INT,
  death_year        INT,
  bio               TEXT,
  photo_url         TEXT,
  notable_achievements TEXT,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version           INT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS platform.heritage_techniques (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  school_id         UUID,
  name_vi           VARCHAR(200) NOT NULL,
  name_han_nom      VARCHAR(200),
  name_en           VARCHAR(200),
  category          VARCHAR(50) NOT NULL
    CHECK (category IN ('quyen', 'binh_khi', 'don_thuc', 'song_luyen', 'dong_luyen')),
  difficulty        VARCHAR(20)
    CHECK (difficulty IN ('co_ban', 'trung_binh', 'nang_cao', 'bieu_dien')),
  description       TEXT,
  history           TEXT,
  video_url         TEXT,
  thumbnail_url     TEXT,
  is_signature      BOOLEAN DEFAULT false,
  metadata          JSONB DEFAULT '{}',
  is_deleted        BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by        UUID,
  version           INT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS platform.heritage_media (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  school_id         UUID,
  technique_id      UUID,
  node_id           UUID,
  media_type        VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'video', 'document', 'audio')),
  title             VARCHAR(200) NOT NULL,
  description       TEXT,
  url               TEXT NOT NULL,
  thumbnail_url     TEXT,
  source            VARCHAR(200),
  year_created      INT,
  is_public         BOOLEAN DEFAULT true,
  tags              JSONB DEFAULT '[]',
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS platform.heritage_glossary (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  term_vi           VARCHAR(200) NOT NULL,
  term_han_nom      VARCHAR(200),
  term_en           VARCHAR(200),
  pronunciation     VARCHAR(200),
  category          VARCHAR(50),
  definition        TEXT NOT NULL,
  usage_example     TEXT,
  school_id         UUID,
  audio_url         TEXT,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version           INT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS platform.heritage_events (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  name              VARCHAR(200) NOT NULL,
  event_type        VARCHAR(50) NOT NULL
    CHECK (event_type IN ('le_ky_niem', 'giao_luu', 'bieu_dien', 'hoi_nghi', 'trung_bay')),
  school_id         UUID,
  location          VARCHAR(200),
  start_date        DATE NOT NULL,
  end_date          DATE,
  description       TEXT,
  organizer         VARCHAR(200),
  max_participants  INT,
  status            VARCHAR(20) DEFAULT 'upcoming'
    CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  banner_url        TEXT,
  metadata          JSONB DEFAULT '{}',
  is_deleted        BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by        UUID,
  version           INT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, id)
);

-- RLS
DO $$
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'platform.martial_schools', 'platform.school_lineage', 'platform.lineage_nodes',
    'platform.heritage_techniques', 'platform.heritage_media',
    'platform.heritage_glossary', 'platform.heritage_events'
  ]) LOOP
    EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %s USING (tenant_id = COALESCE(current_setting(''app.current_tenant'', true)::UUID, ''00000000-0000-7000-8000-000000000001''::UUID))',
      tbl
    );
  END LOOP;
END $$;

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_schools_tenant ON platform.martial_schools(tenant_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_schools_federation ON platform.martial_schools(tenant_id, federation_id);
CREATE INDEX IF NOT EXISTS idx_lineage_nodes_school ON platform.lineage_nodes(tenant_id, school_id);
CREATE INDEX IF NOT EXISTS idx_lineage_nodes_parent ON platform.lineage_nodes(tenant_id, parent_node_id);
CREATE INDEX IF NOT EXISTS idx_heritage_tech_school ON platform.heritage_techniques(tenant_id, school_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_heritage_tech_cat ON platform.heritage_techniques(tenant_id, category);
CREATE INDEX IF NOT EXISTS idx_heritage_media_school ON platform.heritage_media(tenant_id, school_id);
CREATE INDEX IF NOT EXISTS idx_heritage_glossary_cat ON platform.heritage_glossary(tenant_id, category);
CREATE INDEX IF NOT EXISTS idx_heritage_events_date ON platform.heritage_events(tenant_id, start_date) WHERE is_deleted = false;

-- TRIGGERS
DO $$
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'platform.martial_schools', 'platform.lineage_nodes',
    'platform.heritage_techniques', 'platform.heritage_glossary', 'platform.heritage_events'
  ]) LOOP
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()', tbl);
  END LOOP;
END $$;

COMMIT;


-- ─── Source: 0010_community.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0010: COMMUNITY MODULE (Enterprise)
-- Schema: platform.* | Posts, comments, follows, groups, marketplace
-- ===============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS platform.posts (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  author_id         UUID NOT NULL,
  title             VARCHAR(500),
  content           TEXT NOT NULL,
  post_type         VARCHAR(20) DEFAULT 'text'
    CHECK (post_type IN ('text', 'image', 'video', 'tournament_update', 'achievement', 'article')),
  visibility        VARCHAR(20) DEFAULT 'public'
    CHECK (visibility IN ('public', 'members', 'group', 'private')),
  club_id           UUID,
  tournament_id     UUID,
  group_id          UUID,
  like_count        INT DEFAULT 0,
  comment_count     INT DEFAULT 0,
  share_count       INT DEFAULT 0,
  is_pinned         BOOLEAN DEFAULT false,
  media_urls        JSONB DEFAULT '[]',
  tags              JSONB DEFAULT '[]',
  metadata          JSONB DEFAULT '{}',
  is_deleted        BOOLEAN DEFAULT false,
  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by        UUID,
  version           INT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS platform.comments (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  post_id           UUID NOT NULL,
  author_id         UUID NOT NULL,
  parent_comment_id UUID,
  content           TEXT NOT NULL,
  like_count        INT DEFAULT 0,
  metadata          JSONB DEFAULT '{}',
  is_deleted        BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version           INT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS platform.reactions (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  user_id           UUID NOT NULL,
  target_type       VARCHAR(20) NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id         UUID NOT NULL,
  reaction_type     VARCHAR(20) DEFAULT 'like'
    CHECK (reaction_type IN ('like', 'love', 'fire', 'clap', 'sad')),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id),
  UNIQUE (tenant_id, user_id, target_type, target_id)
);

CREATE TABLE IF NOT EXISTS platform.follows (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  follower_id       UUID NOT NULL,
  following_type    VARCHAR(20) NOT NULL
    CHECK (following_type IN ('user', 'club', 'athlete', 'tournament', 'school')),
  following_id      UUID NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id),
  UNIQUE (tenant_id, follower_id, following_type, following_id)
);

CREATE TABLE IF NOT EXISTS platform.community_groups (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  name              VARCHAR(200) NOT NULL,
  description       TEXT,
  group_type        VARCHAR(50)
    CHECK (group_type IN ('mon_phai', 'vung_mien', 'so_thich', 'giai_dau', 'hlv', 'trong_tai')),
  cover_image_url   TEXT,
  avatar_url        TEXT,
  owner_id          UUID NOT NULL,
  privacy           VARCHAR(20) DEFAULT 'public'
    CHECK (privacy IN ('public', 'private', 'secret')),
  member_count      INT DEFAULT 0,
  is_active         BOOLEAN DEFAULT true,
  rules             TEXT,
  metadata          JSONB DEFAULT '{}',
  is_deleted        BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by        UUID,
  version           INT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS platform.group_memberships (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  group_id          UUID NOT NULL,
  user_id           UUID NOT NULL,
  role              VARCHAR(20) DEFAULT 'member'
    CHECK (role IN ('admin', 'moderator', 'member')),
  status            VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('active', 'pending', 'banned', 'left')),
  joined_at         TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id),
  UNIQUE (tenant_id, group_id, user_id)
);

CREATE TABLE IF NOT EXISTS platform.marketplace_listings (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  seller_id         UUID NOT NULL,
  title             VARCHAR(200) NOT NULL,
  description       TEXT,
  category          VARCHAR(50) NOT NULL
    CHECK (category IN ('trang_phuc', 'bao_ho', 'binh_khi', 'sach', 'thiet_bi', 'khac')),
  condition_state   VARCHAR(20) DEFAULT 'new'
    CHECK (condition_state IN ('new', 'like_new', 'good', 'fair')),
  price             DECIMAL(12,2) NOT NULL CHECK (price >= 0),
  currency          VARCHAR(10) DEFAULT 'VND',
  images            JSONB DEFAULT '[]',
  location          VARCHAR(200),
  status            VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('active', 'sold', 'reserved', 'expired', 'deleted')),
  view_count        INT DEFAULT 0,
  metadata          JSONB DEFAULT '{}',
  is_deleted        BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by        UUID,
  version           INT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, id)
);

-- RLS
DO $$
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'platform.posts', 'platform.comments', 'platform.reactions',
    'platform.follows', 'platform.community_groups',
    'platform.group_memberships', 'platform.marketplace_listings'
  ]) LOOP
    EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %s USING (tenant_id = COALESCE(current_setting(''app.current_tenant'', true)::UUID, ''00000000-0000-7000-8000-000000000001''::UUID))',
      tbl
    );
  END LOOP;
END $$;

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_posts_tenant_created ON platform.posts(tenant_id, created_at DESC) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_posts_author ON platform.posts(tenant_id, author_id);
CREATE INDEX IF NOT EXISTS idx_posts_club ON platform.posts(tenant_id, club_id) WHERE club_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comments_post ON platform.comments(tenant_id, post_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_reactions_target ON platform.reactions(tenant_id, target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON platform.follows(tenant_id, follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON platform.follows(tenant_id, following_type, following_id);
CREATE INDEX IF NOT EXISTS idx_groups_tenant ON platform.community_groups(tenant_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_group_members_group ON platform.group_memberships(tenant_id, group_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_marketplace_cat ON platform.marketplace_listings(tenant_id, category) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_marketplace_seller ON platform.marketplace_listings(tenant_id, seller_id);

-- TRIGGERS
DO $$
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'platform.posts', 'platform.comments', 'platform.community_groups', 'platform.marketplace_listings'
  ]) LOOP
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()', tbl);
  END LOOP;
END $$;

COMMIT;


-- ─── Source: 0011_system_partitions_views.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0011: SYSTEM, PARTITIONING & API VIEWS
-- Schema: system.* + api_v1.* | Enterprise infrastructure layer
-- Sync, feature flags, devices, notifications, audit,
-- match_events partitioning, stable API view contracts
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- SYSTEM TABLES
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.sync_queue (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  table_name        VARCHAR(100) NOT NULL,
  record_id         UUID NOT NULL,
  operation         VARCHAR(10) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  payload           JSONB NOT NULL DEFAULT '{}',
  device_id         VARCHAR(100) NOT NULL,
  status            VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'synced', 'conflict', 'failed')),
  retry_count       INT DEFAULT 0,
  max_retries       INT DEFAULT 5,
  last_error        TEXT,
  priority          INT DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at      TIMESTAMPTZ,
  PRIMARY KEY (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS system.sync_conflicts (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  sync_queue_id     UUID NOT NULL,
  table_name        VARCHAR(100) NOT NULL,
  record_id         UUID NOT NULL,
  client_data       JSONB NOT NULL,
  server_data       JSONB NOT NULL,
  resolution        VARCHAR(20)
    CHECK (resolution IN ('client_wins', 'server_wins', 'merged', 'manual', 'pending')),
  resolved_by       UUID,
  resolved_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS system.feature_flags (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID REFERENCES core.tenants(id),
  flag_key          VARCHAR(100) NOT NULL,
  flag_value        BOOLEAN DEFAULT false,
  description       TEXT,
  scope             VARCHAR(20) DEFAULT 'global'
    CHECK (scope IN ('global', 'tenant', 'user', 'percentage')),
  rollout_percent   INT DEFAULT 0 CHECK (rollout_percent BETWEEN 0 AND 100),
  target_users      JSONB DEFAULT '[]',
  metadata          JSONB DEFAULT '{}',
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version           INT NOT NULL DEFAULT 1,
  PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_feature_flags_tenant_key
  ON system.feature_flags (COALESCE(tenant_id, '00000000-0000-0000-0000-000000000000'::UUID), flag_key);

CREATE TABLE IF NOT EXISTS system.device_registry (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  user_id           UUID,
  device_id         VARCHAR(200) NOT NULL,
  device_type       VARCHAR(50) NOT NULL
    CHECK (device_type IN ('scoring_panel', 'mobile', 'tablet', 'desktop', 'kiosk')),
  device_name       VARCHAR(200),
  os_info           VARCHAR(100),
  app_version       VARCHAR(50),
  push_token        TEXT,
  last_sync_at      TIMESTAMPTZ,
  last_seen_at      TIMESTAMPTZ,
  status            VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'blocked', 'pending')),
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id),
  UNIQUE (tenant_id, device_id)
);

CREATE TABLE IF NOT EXISTS system.notification_queue (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  user_id           UUID,
  channel           VARCHAR(20) NOT NULL
    CHECK (channel IN ('push', 'email', 'sms', 'in_app', 'websocket')),
  title             VARCHAR(200) NOT NULL,
  body              TEXT NOT NULL,
  data              JSONB DEFAULT '{}',
  priority          VARCHAR(10) DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status            VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  scheduled_at      TIMESTAMPTZ,
  sent_at           TIMESTAMPTZ,
  read_at           TIMESTAMPTZ,
  retry_count       INT DEFAULT 0,
  last_error        TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS system.data_audit_log (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  table_name        VARCHAR(100) NOT NULL,
  record_id         UUID NOT NULL,
  action            VARCHAR(10) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data          JSONB,
  new_data          JSONB,
  changed_fields    JSONB DEFAULT '[]',
  user_id           UUID,
  ip_address        INET,
  user_agent        TEXT,
  request_id        VARCHAR(100),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS system.schema_versions (
  id                UUID DEFAULT uuidv7() PRIMARY KEY,
  version           VARCHAR(50) NOT NULL,
  description       TEXT,
  applied_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  applied_by        VARCHAR(100),
  checksum          VARCHAR(64),
  execution_time_ms INT
);

-- ════════════════════════════════════════════════════════
-- SYSTEM INDEXES (BRIN for append-only tables)
-- ════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON system.sync_queue(tenant_id, status)
  WHERE status IN ('pending', 'processing');
CREATE INDEX IF NOT EXISTS idx_sync_queue_device ON system.sync_queue(tenant_id, device_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_created_brin ON system.sync_queue USING BRIN (created_at);

CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON system.feature_flags(flag_key) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_device_registry_user ON system.device_registry(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_device_registry_type ON system.device_registry(tenant_id, device_type)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_notifications_user ON system.notification_queue(tenant_id, user_id)
  WHERE status IN ('pending', 'sent');
CREATE INDEX IF NOT EXISTS idx_notifications_created_brin ON system.notification_queue USING BRIN (created_at);

CREATE INDEX IF NOT EXISTS idx_audit_log_table ON system.data_audit_log(tenant_id, table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON system.data_audit_log(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_brin ON system.data_audit_log USING BRIN (created_at);

-- RLS
DO $$
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'system.sync_queue', 'system.sync_conflicts', 'system.device_registry',
    'system.notification_queue', 'system.data_audit_log'
  ]) LOOP
    EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %s USING (tenant_id = COALESCE(current_setting(''app.current_tenant'', true)::UUID, ''00000000-0000-7000-8000-000000000001''::UUID))',
      tbl
    );
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════
-- API VIEWS (Stable contracts — never query tables directly)
-- Views join across schemas to return unified API payloads
-- ════════════════════════════════════════════════════════

-- Athletes View
CREATE OR REPLACE VIEW api_v1.athletes AS
SELECT
  a.id, a.tenant_id, a.ho_ten AS full_name,
  a.ngay_sinh AS date_of_birth,
  a.gioi_tinh AS gender,
  a.can_nang AS weight,
  a.belt_rank_id,
  r.name_vi AS belt_rank_name,
  a.tournament_id,
  t.name AS tournament_name,
  a.team_id,
  tm.ten AS team_name,
  a.current_club_id AS club_id,
  a.trang_thai AS status,
  a.national_id,
  a.insurance_number,
  a.is_deleted,
  a.created_at,
  a.updated_at,
  a.metadata
FROM athletes a
LEFT JOIN ref_belt_ranks r ON a.belt_rank_id = r.id
LEFT JOIN tournaments t ON a.tournament_id = t.id
LEFT JOIN teams tm ON a.team_id = tm.id
WHERE a.is_deleted = false;

-- Tournaments View
CREATE OR REPLACE VIEW api_v1.tournaments AS
SELECT
  t.id, t.tenant_id, t.name,
  t.start_date,
  t.end_date,
  t.location,
  t.status,
  t.is_deleted,
  t.created_at,
  t.updated_at,
  t.metadata,
  (SELECT COUNT(*) FROM athletes a WHERE a.tournament_id = t.id AND a.is_deleted = false) AS athlete_count,
  (SELECT COUNT(*) FROM teams tm WHERE tm.tournament_id = t.id AND tm.is_deleted = false) AS team_count,
  (SELECT COUNT(*) FROM combat_matches m WHERE m.tournament_id = t.id AND m.is_deleted = false) AS match_count
FROM tournaments t
WHERE t.is_deleted = false;

-- Coaches View
CREATE OR REPLACE VIEW api_v1.coaches AS
SELECT
  c.id, c.tenant_id, c.full_name,
  c.date_of_birth, c.gender, c.phone, c.email,
  c.specialization, c.experience_years,
  c.belt_rank_id, c.status, c.avatar_url,
  c.is_deleted, c.created_at, c.updated_at
FROM people.coaches c
WHERE c.is_deleted = false;

-- Martial Schools View
CREATE OR REPLACE VIEW api_v1.martial_schools AS
SELECT
  ms.id, ms.tenant_id, ms.name, ms.name_han_nom,
  ms.code, ms.founder, ms.founded_year,
  ms.origin_location, ms.description,
  ms.logo_url, ms.is_recognized, ms.status,
  ms.created_at, ms.updated_at,
  (SELECT COUNT(*) FROM platform.lineage_nodes ln WHERE ln.school_id = ms.id) AS lineage_count,
  (SELECT COUNT(*) FROM platform.heritage_techniques ht WHERE ht.school_id = ms.id AND ht.is_deleted = false) AS technique_count
FROM platform.martial_schools ms
WHERE ms.is_deleted = false;

-- Matches View (for live scoring)
CREATE OR REPLACE VIEW api_v1.matches AS
SELECT
  m.id, m.tenant_id, m.tournament_id,
  m.content_category_id,
  m.vong AS round,
  m.bracket_position AS match_number,
  m.trang_thai AS status,
  m.arena_id,
  ar.ten AS arena_name,
  m.thoi_gian_bat_dau AS match_date,
  m.is_deleted,
  m.created_at,
  m.updated_at
FROM combat_matches m
LEFT JOIN arenas ar ON m.arena_id = ar.id
WHERE m.is_deleted = false;

-- Rankings View
CREATE OR REPLACE VIEW api_v1.rankings AS
SELECT
  r.id, r.tenant_id,
  r.category, r.weight_class,
  r.national_rank AS rank,
  r.points,
  r.athlete_id,
  a.ho_ten AS athlete_name,
  r.metadata,
  r.last_updated AS updated_at
FROM rankings r
LEFT JOIN athletes a ON r.athlete_id = a.id
WHERE r.is_deleted = false;

-- Feature Flags View (non-tenant-specific)
CREATE OR REPLACE VIEW api_v1.feature_flags AS
SELECT
  ff.flag_key, ff.flag_value, ff.scope,
  ff.rollout_percent, ff.description
FROM system.feature_flags ff
WHERE ff.is_active = true;

-- ════════════════════════════════════════════════════════
-- SEED DEFAULT FEATURE FLAGS
-- ════════════════════════════════════════════════════════

INSERT INTO system.feature_flags (flag_key, flag_value, description, scope) VALUES
  ('scoring.live_enabled', true, 'Enable live scoring via WebSocket', 'global'),
  ('scoring.video_review', false, 'Enable video review for matches', 'global'),
  ('community.posts_enabled', true, 'Enable community posts', 'global'),
  ('community.marketplace_enabled', false, 'Enable marketplace', 'global'),
  ('training.elearning_enabled', false, 'Enable e-learning courses', 'global'),
  ('finance.online_payment', false, 'Enable online payment processing', 'global'),
  ('heritage.public_lineage', true, 'Allow public viewing of lineage trees', 'global'),
  ('system.offline_mode', true, 'Enable offline scoring capability', 'global'),
  ('system.maintenance_mode', false, 'Put system in maintenance mode', 'global'),
  ('system.multi_language', false, 'Enable multi-language support', 'global')
ON CONFLICT DO NOTHING;

COMMIT;


-- ─── Source: 0012_advanced_enterprise.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0012: ADVANCED ENTERPRISE (Phase 2A)
-- Table Partitioning, Vietnamese FTS, Transactional Outbox,
-- Generic Auto Audit Trigger
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. EXTENSIONS
-- ════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS unaccent;

-- ════════════════════════════════════════════════════════
-- 2. VIETNAMESE FULL-TEXT SEARCH CONFIGURATION
-- ════════════════════════════════════════════════════════

DO $$
BEGIN
  CREATE TEXT SEARCH CONFIGURATION vietnamese (COPY = simple);
EXCEPTION WHEN unique_violation THEN
  NULL; -- already exists
END $$;

ALTER TEXT SEARCH CONFIGURATION vietnamese
  ALTER MAPPING FOR hword, hword_part, word
  WITH unaccent, simple;

-- ════════════════════════════════════════════════════════
-- 3. PARTITIONED MATCH EVENTS
--    Declarative RANGE partitioning on recorded_at
--    Each partition = 1 quarter (~90 days)
--    PG17: partition pruning is automatic at query time
-- ════════════════════════════════════════════════════════

-- 3a. Create new partitioned table in tournament schema
CREATE TABLE IF NOT EXISTS tournament.match_events (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL,
  match_id          UUID NOT NULL,
  event_type        VARCHAR(50) NOT NULL,
  event_data        JSONB NOT NULL DEFAULT '{}',
  sequence_number   BIGINT NOT NULL,
  recorded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recorded_by       UUID,
  device_id         VARCHAR(100),
  round_number      INT,
  is_confirmed      BOOLEAN DEFAULT false,
  source            VARCHAR(20) DEFAULT 'panel',
  is_deleted        BOOLEAN DEFAULT false,
  metadata          JSONB DEFAULT '{}',
  -- PK must include partition key
  PRIMARY KEY (recorded_at, tenant_id, id)
) PARTITION BY RANGE (recorded_at);

-- 3b. Create partitions: Q4-2025 through Q4-2026 (5 quarters ahead)
CREATE TABLE IF NOT EXISTS tournament.match_events_2025_q4
  PARTITION OF tournament.match_events
  FOR VALUES FROM ('2025-10-01') TO ('2026-01-01');

CREATE TABLE IF NOT EXISTS tournament.match_events_2026_q1
  PARTITION OF tournament.match_events
  FOR VALUES FROM ('2026-01-01') TO ('2026-04-01');

CREATE TABLE IF NOT EXISTS tournament.match_events_2026_q2
  PARTITION OF tournament.match_events
  FOR VALUES FROM ('2026-04-01') TO ('2026-07-01');

CREATE TABLE IF NOT EXISTS tournament.match_events_2026_q3
  PARTITION OF tournament.match_events
  FOR VALUES FROM ('2026-07-01') TO ('2026-10-01');

CREATE TABLE IF NOT EXISTS tournament.match_events_2026_q4
  PARTITION OF tournament.match_events
  FOR VALUES FROM ('2026-10-01') TO ('2027-01-01');

-- 3c. DEFAULT partition for anything outside defined ranges
CREATE TABLE IF NOT EXISTS tournament.match_events_default
  PARTITION OF tournament.match_events DEFAULT;

-- 3d. Migrate existing data from public.match_events → tournament.match_events
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'match_events'
  ) THEN
    INSERT INTO tournament.match_events
      (id, tenant_id, match_id, event_type, event_data,
       sequence_number, recorded_at, recorded_by, device_id,
       round_number, is_confirmed, source, is_deleted, metadata)
    SELECT
      id,
      COALESCE(tenant_id, '00000000-0000-7000-8000-000000000001'),
      match_id, event_type,
      COALESCE(event_data, '{}'),
      sequence_number,
      COALESCE(recorded_at, NOW()),
      recorded_by, device_id, round_number,
      false,
      'panel',
      COALESCE(is_deleted, false),
      COALESCE(metadata, '{}')
    FROM public.match_events
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 3e. Indexes on partitioned table (applied to all partitions)
CREATE INDEX IF NOT EXISTS idx_tmatch_events_match_seq
  ON tournament.match_events(match_id, sequence_number);

CREATE INDEX IF NOT EXISTS idx_tmatch_events_tenant_match
  ON tournament.match_events(tenant_id, match_id);

CREATE INDEX IF NOT EXISTS idx_tmatch_events_brin
  ON tournament.match_events USING BRIN (recorded_at)
  WITH (pages_per_range = 16);

-- 3f. RLS
ALTER TABLE tournament.match_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON tournament.match_events
  USING (tenant_id = COALESCE(
    current_setting('app.current_tenant', true)::UUID,
    '00000000-0000-7000-8000-000000000001'::UUID
  ));

-- ════════════════════════════════════════════════════════
-- 4. PARTITIONED AUDIT LOG
--    Monthly partitions (higher volume than match events)
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.audit_log_partitioned (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL,
  table_name        VARCHAR(100) NOT NULL,
  record_id         UUID NOT NULL,
  action            VARCHAR(10) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data          JSONB,
  new_data          JSONB,
  changed_fields    JSONB DEFAULT '[]',
  user_id           UUID,
  ip_address        INET,
  user_agent        TEXT,
  request_id        VARCHAR(100),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (created_at, tenant_id, id)
) PARTITION BY RANGE (created_at);

-- Monthly partitions: 2026 Jan-Dec
DO $$
DECLARE
  m INT;
  start_date TEXT;
  end_date TEXT;
  part_name TEXT;
BEGIN
  FOR m IN 1..12 LOOP
    start_date := format('2026-%s-01', lpad(m::TEXT, 2, '0'));
    IF m = 12 THEN
      end_date := '2027-01-01';
    ELSE
      end_date := format('2026-%s-01', lpad((m+1)::TEXT, 2, '0'));
    END IF;
    part_name := format('system.audit_log_2026_%s', lpad(m::TEXT, 2, '0'));
    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS %s PARTITION OF system.audit_log_partitioned FOR VALUES FROM (%L) TO (%L)',
      part_name, start_date, end_date
    );
  END LOOP;
END $$;

-- Default partition
CREATE TABLE IF NOT EXISTS system.audit_log_default
  PARTITION OF system.audit_log_partitioned DEFAULT;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_part_table
  ON system.audit_log_partitioned(tenant_id, table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_part_user
  ON system.audit_log_partitioned(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_audit_part_brin
  ON system.audit_log_partitioned USING BRIN (created_at)
  WITH (pages_per_range = 32);

-- RLS
ALTER TABLE system.audit_log_partitioned ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON system.audit_log_partitioned
  USING (tenant_id = COALESCE(
    current_setting('app.current_tenant', true)::UUID,
    '00000000-0000-7000-8000-000000000001'::UUID
  ));

-- ════════════════════════════════════════════════════════
-- 5. GENERIC AUTO AUDIT TRIGGER FUNCTION
--    Attach to any table → auto-logs to partitioned audit
--    Uses NEW audit_log_partitioned (not legacy data_audit_log)
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION trigger_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  v_old     JSONB;
  v_new     JSONB;
  v_changed JSONB;
  v_tenant  UUID;
  v_record  UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_old := to_jsonb(OLD);
    v_new := NULL;
    v_tenant := OLD.tenant_id;
    v_record := OLD.id;
  ELSIF TG_OP = 'INSERT' THEN
    v_old := NULL;
    v_new := to_jsonb(NEW);
    v_tenant := NEW.tenant_id;
    v_record := NEW.id;
  ELSE -- UPDATE
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
    v_tenant := NEW.tenant_id;
    v_record := NEW.id;
    -- Compute changed fields (exclude updated_at, version)
    SELECT jsonb_agg(key) INTO v_changed
    FROM jsonb_each(v_new) AS n(key, val)
    WHERE v_old -> key IS DISTINCT FROM val
      AND key NOT IN ('updated_at', 'version');
    -- Skip if nothing meaningful changed
    IF v_changed IS NULL OR jsonb_array_length(v_changed) = 0 THEN
      RETURN NEW;
    END IF;
  END IF;

  INSERT INTO system.audit_log_partitioned
    (tenant_id, table_name, record_id, action, old_data, new_data, changed_fields, user_id)
  VALUES (
    COALESCE(v_tenant, '00000000-0000-7000-8000-000000000001'),
    TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
    v_record,
    TG_OP,
    v_old, v_new,
    COALESCE(v_changed, '[]'),
    NULLIF(current_setting('app.current_user', true), '')::UUID
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Attach to critical tables
DO $$
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'tournaments', 'athletes', 'teams', 'combat_matches',
    'registrations', 'referees', 'rankings'
  ]) LOOP
    BEGIN
      EXECUTE format(
        'CREATE TRIGGER audit_log AFTER INSERT OR UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION trigger_audit_log()',
        tbl
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;

-- Audit on new-schema tables
DO $$
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'platform.payments', 'platform.invoices',
    'platform.sponsorships', 'people.coaches',
    'core.users', 'core.roles'
  ]) LOOP
    BEGIN
      EXECUTE format(
        'CREATE TRIGGER audit_log AFTER INSERT OR UPDATE OR DELETE ON %s FOR EACH ROW EXECUTE FUNCTION trigger_audit_log()',
        tbl
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════
-- 6. TRANSACTIONAL OUTBOX
--    Guarantees at-least-once event delivery
--    Worker polls → publishes to NATS → marks published
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.event_outbox (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  tenant_id       UUID NOT NULL,
  aggregate_type  VARCHAR(100) NOT NULL,   -- 'match', 'tournament', 'payment'
  aggregate_id    UUID NOT NULL,
  event_type      VARCHAR(100) NOT NULL,   -- 'MatchScoreRecorded', 'PaymentConfirmed'
  event_data      JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at    TIMESTAMPTZ,             -- NULL = not yet published
  retry_count     INT DEFAULT 0,
  last_error      TEXT
);

-- Only scan unpublished events (hot path)
CREATE INDEX IF NOT EXISTS idx_outbox_pending
  ON system.event_outbox(created_at)
  WHERE published_at IS NULL;

-- For correlation queries
CREATE INDEX IF NOT EXISTS idx_outbox_aggregate
  ON system.event_outbox(aggregate_type, aggregate_id);

-- BRIN for time-based archival
CREATE INDEX IF NOT EXISTS idx_outbox_brin
  ON system.event_outbox USING BRIN (created_at);

-- ════════════════════════════════════════════════════════
-- 7. FULL-TEXT SEARCH COLUMNS + TRIGGERS
-- ════════════════════════════════════════════════════════

-- 7a. Athletes
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

CREATE OR REPLACE FUNCTION trigger_athletes_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('vietnamese', COALESCE(NEW.ho_ten, '')), 'A') ||
    setweight(to_tsvector('vietnamese', COALESCE(NEW.national_id, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER set_search_vector BEFORE INSERT OR UPDATE OF ho_ten, national_id
    ON athletes FOR EACH ROW EXECUTE FUNCTION trigger_athletes_search_vector();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_athletes_fts ON athletes USING GIN (search_vector);

-- 7b. Martial Schools
ALTER TABLE platform.martial_schools ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

CREATE OR REPLACE FUNCTION trigger_schools_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('vietnamese', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('vietnamese', COALESCE(NEW.name_han_nom, '')), 'A') ||
    setweight(to_tsvector('vietnamese', COALESCE(NEW.founder, '')), 'B') ||
    setweight(to_tsvector('vietnamese', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER set_search_vector BEFORE INSERT OR UPDATE OF name, name_han_nom, founder, description
    ON platform.martial_schools FOR EACH ROW EXECUTE FUNCTION trigger_schools_search_vector();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_schools_fts ON platform.martial_schools USING GIN (search_vector);

-- 7c. Posts
ALTER TABLE platform.posts ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

CREATE OR REPLACE FUNCTION trigger_posts_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('vietnamese', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('vietnamese', COALESCE(NEW.content, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER set_search_vector BEFORE INSERT OR UPDATE OF title, content
    ON platform.posts FOR EACH ROW EXECUTE FUNCTION trigger_posts_search_vector();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_posts_fts ON platform.posts USING GIN (search_vector);

-- 7d. Heritage Glossary
ALTER TABLE platform.heritage_glossary ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

CREATE OR REPLACE FUNCTION trigger_glossary_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('vietnamese', COALESCE(NEW.term_vi, '')), 'A') ||
    setweight(to_tsvector('vietnamese', COALESCE(NEW.term_han_nom, '')), 'A') ||
    setweight(to_tsvector('vietnamese', COALESCE(NEW.definition, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER set_search_vector BEFORE INSERT OR UPDATE OF term_vi, term_han_nom, definition
    ON platform.heritage_glossary FOR EACH ROW EXECUTE FUNCTION trigger_glossary_search_vector();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_glossary_fts ON platform.heritage_glossary USING GIN (search_vector);

-- 7e. Tournaments
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

CREATE OR REPLACE FUNCTION trigger_tournaments_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('vietnamese', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('vietnamese', COALESCE(NEW.location, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER set_search_vector BEFORE INSERT OR UPDATE OF name, location
    ON tournaments FOR EACH ROW EXECUTE FUNCTION trigger_tournaments_search_vector();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_tournaments_fts ON tournaments USING GIN (search_vector);

-- 7f. Heritage Techniques
ALTER TABLE platform.heritage_techniques ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

CREATE OR REPLACE FUNCTION trigger_heritage_tech_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('vietnamese', COALESCE(NEW.name_vi, '')), 'A') ||
    setweight(to_tsvector('vietnamese', COALESCE(NEW.name_han_nom, '')), 'A') ||
    setweight(to_tsvector('vietnamese', COALESCE(NEW.name_en, '')), 'B') ||
    setweight(to_tsvector('vietnamese', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER set_search_vector BEFORE INSERT OR UPDATE OF name_vi, name_han_nom, name_en, description
    ON platform.heritage_techniques FOR EACH ROW EXECUTE FUNCTION trigger_heritage_tech_search_vector();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_heritage_tech_fts ON platform.heritage_techniques USING GIN (search_vector);

COMMIT;


-- ─── Source: 0013_materialized_counters.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0013: MATERIALIZED + COUNTERS (Phase 2B)
-- Materialized views, counter triggers, idempotency keys
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. MATERIALIZED VIEW: TOURNAMENT DASHBOARD
--    Replaces correlated subqueries with pre-computed aggregates
--    REFRESH CONCURRENTLY every 30s or on-demand
-- ════════════════════════════════════════════════════════

CREATE MATERIALIZED VIEW IF NOT EXISTS api_v1.tournament_dashboard AS
SELECT
  t.id,
  t.tenant_id,
  t.name,
  t.status,
  t.start_date,
  t.end_date,
  t.location,
  COUNT(DISTINCT a.id)
    FILTER (WHERE a.is_deleted = false) AS athlete_count,
  COUNT(DISTINCT tm.id)
    FILTER (WHERE tm.is_deleted = false) AS team_count,
  COUNT(DISTINCT m.id)
    FILTER (WHERE m.is_deleted = false) AS match_count,
  COUNT(DISTINCT m.id)
    FILTER (WHERE m.trang_thai = 'ket_thuc' AND m.is_deleted = false) AS completed_matches,
  COUNT(DISTINCT m.id)
    FILTER (WHERE m.trang_thai = 'dang_dau' AND m.is_deleted = false) AS live_matches,
  t.created_at,
  t.updated_at
FROM tournaments t
LEFT JOIN athletes a ON a.tournament_id = t.id
LEFT JOIN teams tm ON tm.tournament_id = t.id
LEFT JOIN combat_matches m ON m.tournament_id = t.id
WHERE t.is_deleted = false
GROUP BY t.id, t.tenant_id, t.name, t.status,
         t.start_date, t.end_date, t.location,
         t.created_at, t.updated_at
WITH NO DATA;

-- Unique index required for REFRESH CONCURRENTLY
CREATE UNIQUE INDEX IF NOT EXISTS idx_tournament_dashboard_pk
  ON api_v1.tournament_dashboard(id);

CREATE INDEX IF NOT EXISTS idx_tournament_dashboard_tenant
  ON api_v1.tournament_dashboard(tenant_id);

CREATE INDEX IF NOT EXISTS idx_tournament_dashboard_status
  ON api_v1.tournament_dashboard(tenant_id, status);

-- Initial refresh
REFRESH MATERIALIZED VIEW api_v1.tournament_dashboard;

-- ════════════════════════════════════════════════════════
-- 2. MATERIALIZED VIEW: RANKINGS LEADERBOARD
-- ════════════════════════════════════════════════════════

CREATE MATERIALIZED VIEW IF NOT EXISTS api_v1.rankings_leaderboard AS
SELECT
  r.id,
  r.tenant_id,
  r.category,
  r.weight_class,
  r.national_rank AS rank,
  r.points,
  r.athlete_id,
  a.ho_ten AS athlete_name,
  a.gioi_tinh AS gender,
  a.current_club_id,
  r.metadata,
  r.last_updated AS updated_at
FROM rankings r
JOIN athletes a ON r.athlete_id = a.id AND a.is_deleted = false
WHERE r.is_deleted = false
WITH NO DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_rankings_lb_pk
  ON api_v1.rankings_leaderboard(id);

CREATE INDEX IF NOT EXISTS idx_rankings_lb_tenant_cat
  ON api_v1.rankings_leaderboard(tenant_id, category, weight_class);

REFRESH MATERIALIZED VIEW api_v1.rankings_leaderboard;

-- ════════════════════════════════════════════════════════
-- 3. REPLACE api_v1.tournaments VIEW
--    Use matviews instead of correlated subqueries
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW api_v1.tournaments AS
SELECT
  t.id, t.tenant_id, t.name,
  t.start_date,
  t.end_date,
  t.location,
  t.status,
  t.is_deleted,
  t.created_at,
  t.updated_at,
  t.metadata,
  COALESCE(d.athlete_count, 0) AS athlete_count,
  COALESCE(d.team_count, 0) AS team_count,
  COALESCE(d.match_count, 0) AS match_count,
  COALESCE(d.completed_matches, 0) AS completed_matches,
  COALESCE(d.live_matches, 0) AS live_matches
FROM tournaments t
LEFT JOIN api_v1.tournament_dashboard d ON d.id = t.id
WHERE t.is_deleted = false;

-- ════════════════════════════════════════════════════════
-- 4. COUNTER TRIGGERS — COMMUNITY
--    Atomic counter update on reaction/comment INSERT/DELETE
--    Uses GREATEST(0) to prevent negative counters
-- ════════════════════════════════════════════════════════

-- 4a. Reaction counter → posts.like_count
CREATE OR REPLACE FUNCTION trigger_update_post_reactions()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.target_type = 'post' THEN
      UPDATE platform.posts
        SET like_count = like_count + 1
        WHERE id = NEW.target_id AND tenant_id = NEW.tenant_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.target_type = 'post' THEN
      UPDATE platform.posts
        SET like_count = GREATEST(like_count - 1, 0)
        WHERE id = OLD.target_id AND tenant_id = OLD.tenant_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER update_reactions_count
    AFTER INSERT OR DELETE ON platform.reactions
    FOR EACH ROW EXECUTE FUNCTION trigger_update_post_reactions();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4b. Comment counter → posts.comment_count
CREATE OR REPLACE FUNCTION trigger_update_post_comments()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE platform.posts
      SET comment_count = comment_count + 1
      WHERE id = NEW.post_id AND tenant_id = NEW.tenant_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE platform.posts
      SET comment_count = GREATEST(comment_count - 1, 0)
      WHERE id = OLD.post_id AND tenant_id = OLD.tenant_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER update_comments_count
    AFTER INSERT OR DELETE ON platform.comments
    FOR EACH ROW EXECUTE FUNCTION trigger_update_post_comments();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4c. Group member counter → community_groups.member_count
CREATE OR REPLACE FUNCTION trigger_update_group_members()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    UPDATE platform.community_groups
      SET member_count = member_count + 1
      WHERE id = NEW.group_id AND tenant_id = NEW.tenant_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
    UPDATE platform.community_groups
      SET member_count = GREATEST(member_count - 1, 0)
      WHERE id = OLD.group_id AND tenant_id = OLD.tenant_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle status change
    IF OLD.status = 'active' AND NEW.status != 'active' THEN
      UPDATE platform.community_groups
        SET member_count = GREATEST(member_count - 1, 0)
        WHERE id = NEW.group_id AND tenant_id = NEW.tenant_id;
    ELSIF OLD.status != 'active' AND NEW.status = 'active' THEN
      UPDATE platform.community_groups
        SET member_count = member_count + 1
        WHERE id = NEW.group_id AND tenant_id = NEW.tenant_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER update_group_members_count
    AFTER INSERT OR UPDATE OR DELETE ON platform.group_memberships
    FOR EACH ROW EXECUTE FUNCTION trigger_update_group_members();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ════════════════════════════════════════════════════════
-- 5. IDEMPOTENCY KEY — PAYMENTS
--    Prevents duplicate payments on retry
-- ════════════════════════════════════════════════════════

ALTER TABLE platform.payments
  ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(100);

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_idempotency
  ON platform.payments(tenant_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- ════════════════════════════════════════════════════════
-- 6. FOLLOW COUNTER TRIGGERS
--    follower_count, following_count don't exist on user table
--    but we pre-compute for clubs and athletes
-- ════════════════════════════════════════════════════════

-- Add follower_count to key entities
ALTER TABLE clubs
  ADD COLUMN IF NOT EXISTS follower_count INT DEFAULT 0;

ALTER TABLE platform.martial_schools
  ADD COLUMN IF NOT EXISTS follower_count INT DEFAULT 0;

CREATE OR REPLACE FUNCTION trigger_update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.following_type = 'club' THEN
      UPDATE clubs SET follower_count = follower_count + 1
        WHERE id = NEW.following_id;
    ELSIF NEW.following_type = 'school' THEN
      UPDATE platform.martial_schools SET follower_count = follower_count + 1
        WHERE id = NEW.following_id AND tenant_id = NEW.tenant_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.following_type = 'club' THEN
      UPDATE clubs SET follower_count = GREATEST(follower_count - 1, 0)
        WHERE id = OLD.following_id;
    ELSIF OLD.following_type = 'school' THEN
      UPDATE platform.martial_schools SET follower_count = GREATEST(follower_count - 1, 0)
        WHERE id = OLD.following_id AND tenant_id = OLD.tenant_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER update_follow_counts
    AFTER INSERT OR DELETE ON platform.follows
    FOR EACH ROW EXECUTE FUNCTION trigger_update_follow_counts();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMIT;


-- ─── Source: 0014_infrastructure.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0014: INFRASTRUCTURE (Phase 2C)
-- Job Queue (SKIP LOCKED), Rate Limiting, Scheduled Tasks
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. JOB QUEUE
--    General-purpose background job processing
--    Workers use SELECT ... FOR UPDATE SKIP LOCKED
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.job_queue (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  tenant_id       UUID,
  job_type        VARCHAR(100) NOT NULL,
  payload         JSONB NOT NULL DEFAULT '{}',
  result          JSONB,
  priority        INT DEFAULT 0,
  status          VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'dead', 'cancelled')),
  max_retries     INT DEFAULT 3,
  retry_count     INT DEFAULT 0,
  run_at          TIMESTAMPTZ DEFAULT NOW(),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  locked_by       VARCHAR(100),       -- worker hostname/ID
  locked_at       TIMESTAMPTZ,
  timeout_seconds INT DEFAULT 300,     -- 5 min default
  last_error      TEXT,
  tags            JSONB DEFAULT '[]',  -- for filtering/routing
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hot index: pending jobs ready to run
CREATE INDEX IF NOT EXISTS idx_jobs_pending
  ON system.job_queue(priority DESC, run_at, created_at)
  WHERE status = 'pending';

-- For cleanup: completed/dead jobs
CREATE INDEX IF NOT EXISTS idx_jobs_completed
  ON system.job_queue(completed_at)
  WHERE status IN ('completed', 'dead');

-- For monitoring: stuck jobs
CREATE INDEX IF NOT EXISTS idx_jobs_processing
  ON system.job_queue(locked_at)
  WHERE status = 'processing';

-- Type-based routing
CREATE INDEX IF NOT EXISTS idx_jobs_type
  ON system.job_queue(job_type)
  WHERE status = 'pending';

-- BRIN for time-based archival
CREATE INDEX IF NOT EXISTS idx_jobs_created_brin
  ON system.job_queue USING BRIN (created_at);

-- ════════════════════════════════════════════════════════
-- 2. JOB HELPER FUNCTIONS
-- ════════════════════════════════════════════════════════

-- Claim a job (called by Go worker)
CREATE OR REPLACE FUNCTION system.claim_job(
  p_job_types TEXT[] DEFAULT NULL,
  p_worker_id TEXT DEFAULT '',
  p_limit INT DEFAULT 1
)
RETURNS SETOF system.job_queue AS $$
BEGIN
  RETURN QUERY
  UPDATE system.job_queue
  SET status = 'processing',
      started_at = NOW(),
      locked_by = p_worker_id,
      locked_at = NOW()
  WHERE id IN (
    SELECT id FROM system.job_queue
    WHERE status = 'pending'
      AND run_at <= NOW()
      AND (p_job_types IS NULL OR job_type = ANY(p_job_types))
    ORDER BY priority DESC, created_at
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  )
  RETURNING *;
END;
$$ LANGUAGE plpgsql;

-- Complete a job
CREATE OR REPLACE FUNCTION system.complete_job(
  p_job_id UUID,
  p_result JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE system.job_queue
  SET status = 'completed',
      completed_at = NOW(),
      result = p_result,
      locked_by = NULL,
      locked_at = NULL
  WHERE id = p_job_id;
END;
$$ LANGUAGE plpgsql;

-- Fail a job (with retry logic)
CREATE OR REPLACE FUNCTION system.fail_job(
  p_job_id UUID,
  p_error TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE system.job_queue
  SET retry_count = retry_count + 1,
      last_error = p_error,
      locked_by = NULL,
      locked_at = NULL,
      status = CASE
        WHEN retry_count + 1 >= max_retries THEN 'dead'
        ELSE 'pending'
      END,
      -- Exponential backoff: 30s, 2min, 8min, 32min...
      run_at = CASE
        WHEN retry_count + 1 < max_retries
        THEN NOW() + (POWER(4, retry_count) * INTERVAL '30 seconds')
        ELSE run_at
      END
  WHERE id = p_job_id;
END;
$$ LANGUAGE plpgsql;

-- Reap stuck jobs (timeout exceeded)
CREATE OR REPLACE FUNCTION system.reap_stuck_jobs(p_timeout_seconds INT DEFAULT 600)
RETURNS INT AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE system.job_queue
  SET status = 'pending',
      locked_by = NULL,
      locked_at = NULL,
      last_error = 'Reaped: exceeded lock timeout'
  WHERE status = 'processing'
    AND locked_at < NOW() - (p_timeout_seconds || ' seconds')::INTERVAL;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 3. RATE LIMITING
--    Sliding window per (tenant, identifier, endpoint)
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.rate_limits (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  tenant_id       UUID NOT NULL,
  identifier      VARCHAR(200) NOT NULL,     -- user_id, ip_address, api_key
  endpoint        VARCHAR(200) NOT NULL,     -- '/api/v1/scoring/*', '/api/v1/auth/login'
  window_start    TIMESTAMPTZ NOT NULL,
  request_count   INT NOT NULL DEFAULT 1,
  max_requests    INT NOT NULL DEFAULT 100,
  UNIQUE (tenant_id, identifier, endpoint, window_start)
);

-- BRIN: time-based cleanup is the hot path
CREATE INDEX IF NOT EXISTS idx_rate_limits_window
  ON system.rate_limits USING BRIN (window_start);

-- For checking current rate
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup
  ON system.rate_limits(tenant_id, identifier, endpoint, window_start DESC);

-- Rate check function (returns true if allowed)
CREATE OR REPLACE FUNCTION system.check_rate_limit(
  p_tenant_id UUID,
  p_identifier TEXT,
  p_endpoint TEXT,
  p_max_requests INT DEFAULT 100,
  p_window_seconds INT DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
  v_window TIMESTAMPTZ;
  v_count INT;
BEGIN
  -- Current window (floored to p_window_seconds)
  v_window := date_trunc('minute', NOW());

  -- Upsert and return count
  INSERT INTO system.rate_limits (tenant_id, identifier, endpoint, window_start, request_count, max_requests)
  VALUES (p_tenant_id, p_identifier, p_endpoint, v_window, 1, p_max_requests)
  ON CONFLICT (tenant_id, identifier, endpoint, window_start)
  DO UPDATE SET request_count = system.rate_limits.request_count + 1
  RETURNING request_count INTO v_count;

  RETURN v_count <= p_max_requests;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 4. SCHEDULED TASKS TABLE
--    Replaces pg_cron dependency with app-managed scheduling
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.scheduled_tasks (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  name            VARCHAR(100) NOT NULL UNIQUE,
  description     TEXT,
  cron_expression VARCHAR(50) NOT NULL,     -- '*/5 * * * *' (every 5 min)
  job_type        VARCHAR(100) NOT NULL,    -- maps to Go handler
  payload         JSONB DEFAULT '{}',
  is_active       BOOLEAN DEFAULT true,
  last_run_at     TIMESTAMPTZ,
  next_run_at     TIMESTAMPTZ,
  last_duration_ms INT,
  last_error      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed: scheduled tasks for matview refresh, cleanup, etc.
INSERT INTO system.scheduled_tasks (name, cron_expression, job_type, description, payload) VALUES
  ('refresh_tournament_dashboard', '*/2 * * * *', 'matview_refresh',
   'Refresh tournament dashboard materialized view every 2 min',
   '{"view": "api_v1.tournament_dashboard", "concurrently": true}'),

  ('refresh_rankings_leaderboard', '*/5 * * * *', 'matview_refresh',
   'Refresh rankings leaderboard every 5 min',
   '{"view": "api_v1.rankings_leaderboard", "concurrently": true}'),

  ('cleanup_expired_sessions', '0 * * * *', 'cleanup',
   'Remove expired sessions every hour',
   '{"table": "core.sessions", "condition": "expires_at < NOW()"}'),

  ('cleanup_rate_limits', '*/15 * * * *', 'cleanup',
   'Cleanup old rate limit windows every 15 min',
   '{"table": "system.rate_limits", "condition": "window_start < NOW() - INTERVAL ''2 hours''"}'),

  ('reap_stuck_jobs', '*/5 * * * *', 'job_reaper',
   'Reap stuck jobs every 5 min',
   '{"timeout_seconds": 600}'),

  ('publish_outbox_events', '*/10 * * * *', 'outbox_publisher',
   'Publish pending outbox events to NATS every 10 sec (Go worker polls faster)',
   '{"batch_size": 100}'),

  ('archive_old_audit_logs', '0 3 * * *', 'archiver',
   'Archive audit logs older than 90 days at 3 AM',
   '{"retention_days": 90}'),

  ('cleanup_dead_jobs', '0 4 * * *', 'cleanup',
   'Remove dead jobs older than 30 days at 4 AM',
   '{"table": "system.job_queue", "condition": "status = ''dead'' AND completed_at < NOW() - INTERVAL ''30 days''"}')
ON CONFLICT (name) DO NOTHING;

-- Trigger for updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON system.scheduled_tasks
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ════════════════════════════════════════════════════════
-- 5. API KEY MANAGEMENT
--    For external integrations (scoring panels, mobile apps)
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.api_keys (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES core.tenants(id),
  name            VARCHAR(100) NOT NULL,
  key_hash        VARCHAR(255) NOT NULL,     -- SHA-256 of the actual key
  key_prefix      VARCHAR(10) NOT NULL,      -- First 8 chars for identification
  permissions     JSONB DEFAULT '[]',
  rate_limit      INT DEFAULT 1000,          -- requests per minute
  expires_at      TIMESTAMPTZ,
  last_used_at    TIMESTAMPTZ,
  is_active       BOOLEAN DEFAULT true,
  created_by      UUID,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version         INT NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_api_keys_hash
  ON system.api_keys(key_hash)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_api_keys_tenant
  ON system.api_keys(tenant_id)
  WHERE is_active = true;

-- RLS
ALTER TABLE system.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON system.api_keys
  USING (tenant_id = COALESCE(
    current_setting('app.current_tenant', true)::UUID,
    '00000000-0000-7000-8000-000000000001'::UUID
  ));

CREATE TRIGGER set_updated_at BEFORE UPDATE ON system.api_keys
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMIT;


-- ─── Source: 0015_structural_hardening.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0015: STRUCTURAL HARDENING (Phase 3A)
-- RLS write policies, immutable columns, generated columns,
-- LISTEN/NOTIFY for live scoring, domain types
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. RLS WITH CHECK — CRITICAL SECURITY FIX
--    Without WITH CHECK, tenant A can INSERT rows into tenant B
--    We add FOR INSERT + FOR UPDATE policies with WITH CHECK
-- ════════════════════════════════════════════════════════

-- Helper: batch-apply write isolation to ALL tenant-aware tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    -- core.*
    'core.users', 'core.roles', 'core.user_roles',
    'core.sessions', 'core.auth_audit_log',
    -- public (legacy)
    'tournaments', 'teams', 'athletes', 'registrations',
    'referees', 'arenas', 'combat_matches', 'form_performances',
    'appeals', 'match_events', 'rankings', 'federations', 'clubs',
    -- training.*
    'training.curricula', 'training.curriculum_levels',
    'training.techniques', 'training.technique_media',
    'training.curriculum_techniques', 'training.training_plans',
    'training.training_sessions', 'training.attendance_records',
    'training.belt_examinations', 'training.belt_exam_results',
    'training.courses', 'training.course_enrollments',
    -- people.*
    'people.club_branches', 'people.club_memberships',
    'people.coaches', 'people.coach_certifications',
    'people.athlete_belt_history', 'people.athlete_weight_history',
    -- platform.* (finance)
    'platform.fee_schedules', 'platform.payments', 'platform.invoices',
    'platform.invoice_items', 'platform.sponsorships',
    'platform.tournament_budgets', 'platform.budget_items',
    -- platform.* (heritage)
    'platform.martial_schools', 'platform.school_lineage',
    'platform.lineage_nodes', 'platform.heritage_techniques',
    'platform.heritage_media', 'platform.heritage_glossary',
    'platform.heritage_events',
    -- platform.* (community)
    'platform.posts', 'platform.comments', 'platform.reactions',
    'platform.follows', 'platform.community_groups',
    'platform.group_memberships', 'platform.marketplace_listings',
    -- system.*
    'system.sync_queue', 'system.sync_conflicts',
    'system.device_registry', 'system.notification_queue'
  ]) LOOP
    BEGIN
      -- INSERT policy: enforce tenant_id matches session
      EXECUTE format(
        'CREATE POLICY tenant_write_%s ON %s
          FOR INSERT
          WITH CHECK (tenant_id = COALESCE(
            current_setting(''app.current_tenant'', true)::UUID,
            ''00000000-0000-7000-8000-000000000001''::UUID
          ))',
        replace(replace(tbl, '.', '_'), ' ', ''), tbl
      );

      -- UPDATE policy: add WITH CHECK to prevent changing tenant_id
      EXECUTE format(
        'CREATE POLICY tenant_update_%s ON %s
          FOR UPDATE
          USING (tenant_id = COALESCE(
            current_setting(''app.current_tenant'', true)::UUID,
            ''00000000-0000-7000-8000-000000000001''::UUID
          ))
          WITH CHECK (tenant_id = COALESCE(
            current_setting(''app.current_tenant'', true)::UUID,
            ''00000000-0000-7000-8000-000000000001''::UUID
          ))',
        replace(replace(tbl, '.', '_'), ' ', ''), tbl
      );
    EXCEPTION
      WHEN undefined_table THEN NULL;
      WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;

-- System admin bypass for write operations too
DO $$
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'core.users', 'core.roles', 'tournaments', 'athletes',
    'teams', 'combat_matches'
  ]) LOOP
    BEGIN
      EXECUTE format(
        'CREATE POLICY system_admin_write_%s ON %s
          FOR ALL
          USING (current_setting(''app.is_system_admin'', true) = ''true'')
          WITH CHECK (current_setting(''app.is_system_admin'', true) = ''true'')',
        replace(replace(tbl, '.', '_'), ' ', ''), tbl
      );
    EXCEPTION
      WHEN undefined_table THEN NULL;
      WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════
-- 2. IMMUTABLE COLUMN TRIGGERS
--    Prevent modification of critical fields after status change
-- ════════════════════════════════════════════════════════

-- 2a. Payment: after confirmed, lock amount/method/payer
CREATE OR REPLACE FUNCTION trigger_immutable_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IN ('confirmed', 'refunded') THEN
    IF NEW.amount IS DISTINCT FROM OLD.amount THEN
      RAISE EXCEPTION 'Cannot modify payment amount after confirmation (id: %)', OLD.id;
    END IF;
    IF NEW.payment_method IS DISTINCT FROM OLD.payment_method THEN
      RAISE EXCEPTION 'Cannot modify payment method after confirmation (id: %)', OLD.id;
    END IF;
    IF NEW.payer_user_id IS DISTINCT FROM OLD.payer_user_id THEN
      RAISE EXCEPTION 'Cannot modify payer after confirmation (id: %)', OLD.id;
    END IF;
    IF NEW.currency IS DISTINCT FROM OLD.currency THEN
      RAISE EXCEPTION 'Cannot modify currency after confirmation (id: %)', OLD.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER immutable_payment_fields
    BEFORE UPDATE ON platform.payments
    FOR EACH ROW EXECUTE FUNCTION trigger_immutable_payment();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2b. Match: after ket_thuc, lock scores
CREATE OR REPLACE FUNCTION trigger_immutable_match()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.trang_thai = 'ket_thuc' THEN
    IF NEW.trang_thai NOT IN ('ket_thuc', 'huy') THEN
      RAISE EXCEPTION 'Cannot re-open a completed match (id: %)', OLD.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER immutable_match_status
    BEFORE UPDATE ON combat_matches
    FOR EACH ROW EXECUTE FUNCTION trigger_immutable_match();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2c. Belt exam result: after passed, prevent changing
CREATE OR REPLACE FUNCTION trigger_immutable_belt_result()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.result = 'passed' THEN
    IF NEW.result IS DISTINCT FROM OLD.result THEN
      RAISE EXCEPTION 'Cannot change a confirmed belt exam result (id: %)', OLD.id;
    END IF;
    IF NEW.score IS DISTINCT FROM OLD.score THEN
      RAISE EXCEPTION 'Cannot modify score after passing (id: %)', OLD.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER immutable_belt_result
    BEFORE UPDATE ON training.belt_exam_results
    FOR EACH ROW EXECUTE FUNCTION trigger_immutable_belt_result();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ════════════════════════════════════════════════════════
-- 3. LISTEN/NOTIFY — REAL-TIME SCORING
--    PostgreSQL pushes event to Go listener → WebSocket hub
-- ════════════════════════════════════════════════════════

-- 3a. New match event → push to Go
CREATE OR REPLACE FUNCTION notify_match_event()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'match_events',
    json_build_object(
      'match_id', NEW.match_id,
      'event_type', NEW.event_type,
      'event_data', NEW.event_data,
      'sequence', NEW.sequence_number,
      'tenant_id', NEW.tenant_id,
      'recorded_at', NEW.recorded_at
    )::TEXT
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to the partitioned table (propagates to all partitions in PG17)
DO $$ BEGIN
  CREATE TRIGGER notify_on_event
    AFTER INSERT ON tournament.match_events
    FOR EACH ROW EXECUTE FUNCTION notify_match_event();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3b. Match status change → push to Go
CREATE OR REPLACE FUNCTION notify_match_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.trang_thai IS DISTINCT FROM NEW.trang_thai THEN
    PERFORM pg_notify(
      'match_status',
      json_build_object(
        'match_id', NEW.id,
        'old_status', OLD.trang_thai,
        'new_status', NEW.trang_thai,
        'tournament_id', NEW.tournament_id,
        'tenant_id', NEW.tenant_id
      )::TEXT
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER notify_on_status_change
    AFTER UPDATE ON combat_matches
    FOR EACH ROW EXECUTE FUNCTION notify_match_status_change();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3c. Tournament registration → push notification
CREATE OR REPLACE FUNCTION notify_registration_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.trang_thai IS DISTINCT FROM NEW.trang_thai THEN
    PERFORM pg_notify(
      'registrations',
      json_build_object(
        'registration_id', NEW.id,
        'tournament_id', NEW.tournament_id,
        'status', NEW.trang_thai,
        'tenant_id', NEW.tenant_id
      )::TEXT
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER notify_on_registration
    AFTER UPDATE ON registrations
    FOR EACH ROW EXECUTE FUNCTION notify_registration_change();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ════════════════════════════════════════════════════════
-- 4. STATUS TRANSITION VALIDATION
--    Enforce valid state machine transitions
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION trigger_validate_tournament_status()
RETURNS TRIGGER AS $$
DECLARE
  valid_transitions JSONB := '{
    "nhap": ["dang_ky", "huy"],
    "dang_ky": ["khoa_dk", "huy"],
    "khoa_dk": ["thi_dau", "dang_ky", "huy"],
    "thi_dau": ["ket_thuc", "huy"],
    "ket_thuc": [],
    "huy": []
  }'::JSONB;
  allowed JSONB;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    allowed := valid_transitions -> OLD.status;
    IF allowed IS NULL OR NOT (allowed ? NEW.status) THEN
      RAISE EXCEPTION 'Invalid tournament status transition: % → % (id: %)',
        OLD.status, NEW.status, OLD.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER validate_tournament_status
    BEFORE UPDATE ON tournaments
    FOR EACH ROW EXECUTE FUNCTION trigger_validate_tournament_status();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Match status machine
CREATE OR REPLACE FUNCTION trigger_validate_match_status()
RETURNS TRIGGER AS $$
DECLARE
  valid_transitions JSONB := '{
    "chua_dau": ["dang_dau", "huy"],
    "dang_dau": ["tam_dung", "ket_thuc", "huy"],
    "tam_dung": ["dang_dau", "ket_thuc", "huy"],
    "ket_thuc": ["huy"],
    "huy": []
  }'::JSONB;
  allowed JSONB;
BEGIN
  IF OLD.trang_thai IS DISTINCT FROM NEW.trang_thai THEN
    allowed := valid_transitions -> OLD.trang_thai;
    IF allowed IS NULL OR NOT (allowed ? NEW.trang_thai) THEN
      RAISE EXCEPTION 'Invalid match status transition: % → % (id: %)',
        OLD.trang_thai, NEW.trang_thai, OLD.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER validate_match_status
    BEFORE UPDATE ON combat_matches
    FOR EACH ROW EXECUTE FUNCTION trigger_validate_match_status();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Payment status machine
CREATE OR REPLACE FUNCTION trigger_validate_payment_status()
RETURNS TRIGGER AS $$
DECLARE
  valid_transitions JSONB := '{
    "pending": ["confirmed", "failed", "cancelled"],
    "confirmed": ["refunded"],
    "failed": ["pending"],
    "refunded": [],
    "cancelled": []
  }'::JSONB;
  allowed JSONB;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    allowed := valid_transitions -> OLD.status;
    IF allowed IS NULL OR NOT (allowed ? NEW.status) THEN
      RAISE EXCEPTION 'Invalid payment status transition: % → % (id: %)',
        OLD.status, NEW.status, OLD.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER validate_payment_status
    BEFORE UPDATE ON platform.payments
    FOR EACH ROW EXECUTE FUNCTION trigger_validate_payment_status();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ════════════════════════════════════════════════════════
-- 5. STATISTICS TARGETS (Better Query Plans)
-- ════════════════════════════════════════════════════════

DO $$ BEGIN
  ALTER TABLE athletes ALTER COLUMN trang_thai SET STATISTICS 1000;
  ALTER TABLE combat_matches ALTER COLUMN trang_thai SET STATISTICS 1000;
  ALTER TABLE tournaments ALTER COLUMN status SET STATISTICS 500;
  ALTER TABLE platform.payments ALTER COLUMN status SET STATISTICS 500;
  ALTER TABLE platform.posts ALTER COLUMN post_type SET STATISTICS 500;
  ALTER TABLE registrations ALTER COLUMN trang_thai SET STATISTICS 500;
EXCEPTION WHEN undefined_column OR undefined_table THEN NULL;
END $$;

COMMIT;


-- ─── Source: 0016_fk_exclusion.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0016: FK + EXCLUSION (Phase 3B)
-- Cross-schema FK constraints, exclusion constraints,
-- prevent scheduling conflicts
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. EXTENSION: btree_gist (needed for EXCLUDE)
-- ════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ════════════════════════════════════════════════════════
-- 2. CROSS-SCHEMA FOREIGN KEY CONSTRAINTS
--    Fix orphan UUID references
--    Note: FK to composite PK (tenant_id, id) uses (tenant_id, col)
-- ════════════════════════════════════════════════════════

-- platform.posts.author_id → core.users
DO $$ BEGIN
  ALTER TABLE platform.posts
    ADD CONSTRAINT fk_posts_author
    FOREIGN KEY (author_id) REFERENCES core.users(id) ON DELETE RESTRICT;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- platform.comments.author_id → core.users
DO $$ BEGIN
  ALTER TABLE platform.comments
    ADD CONSTRAINT fk_comments_author
    FOREIGN KEY (author_id) REFERENCES core.users(id) ON DELETE RESTRICT;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- platform.reactions.user_id → core.users
DO $$ BEGIN
  ALTER TABLE platform.reactions
    ADD CONSTRAINT fk_reactions_user
    FOREIGN KEY (user_id) REFERENCES core.users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- platform.follows.follower_id → core.users
DO $$ BEGIN
  ALTER TABLE platform.follows
    ADD CONSTRAINT fk_follows_follower
    FOREIGN KEY (follower_id) REFERENCES core.users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- platform.community_groups.owner_id → core.users
DO $$ BEGIN
  ALTER TABLE platform.community_groups
    ADD CONSTRAINT fk_groups_owner
    FOREIGN KEY (owner_id) REFERENCES core.users(id) ON DELETE RESTRICT;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- platform.group_memberships.user_id → core.users
DO $$ BEGIN
  ALTER TABLE platform.group_memberships
    ADD CONSTRAINT fk_group_members_user
    FOREIGN KEY (user_id) REFERENCES core.users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- platform.marketplace_listings.seller_id → core.users
DO $$ BEGIN
  ALTER TABLE platform.marketplace_listings
    ADD CONSTRAINT fk_listings_seller
    FOREIGN KEY (seller_id) REFERENCES core.users(id) ON DELETE RESTRICT;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- platform.payments.payer_user_id → core.users (nullable)
DO $$ BEGIN
  ALTER TABLE platform.payments
    ADD CONSTRAINT fk_payments_payer
    FOREIGN KEY (payer_user_id) REFERENCES core.users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- training.training_plans.coach_id → people.coaches (same tenant needed)
-- Note: people.coaches has composite PK (tenant_id, id), but coach_id alone
-- We reference just the id for loose coupling, enforce tenant via RLS
DO $$ BEGIN
  ALTER TABLE training.course_enrollments
    ADD CONSTRAINT fk_enrollments_user
    FOREIGN KEY (user_id) REFERENCES core.users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ════════════════════════════════════════════════════════
-- 3. EXCLUSION CONSTRAINTS — PREVENT SCHEDULING OVERLAPS
--    Using btree_gist for range overlap detection
-- ════════════════════════════════════════════════════════

-- 3a. Training sessions: no overlapping sessions at same location
-- We need start/end as TIMESTAMPTZ for range construction
ALTER TABLE training.training_sessions
  ADD COLUMN IF NOT EXISTS session_start TIMESTAMPTZ
    GENERATED ALWAYS AS (session_date + start_time) STORED;
ALTER TABLE training.training_sessions
  ADD COLUMN IF NOT EXISTS session_end TIMESTAMPTZ
    GENERATED ALWAYS AS (session_date + end_time) STORED;

DO $$ BEGIN
  ALTER TABLE training.training_sessions
    ADD CONSTRAINT no_overlapping_training
    EXCLUDE USING GIST (
      tenant_id WITH =,
      CAST(location AS TEXT) WITH =,
      tstzrange(session_start, session_end) WITH &&
    ) WHERE (is_deleted = false AND location IS NOT NULL);
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN feature_not_supported THEN
    RAISE NOTICE 'Exclusion constraint requires all column types to have gist operator class';
END $$;

-- ════════════════════════════════════════════════════════
-- 4. PREVENT TENANT_ID MUTATION
--    No one should ever UPDATE tenant_id on any row
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION trigger_prevent_tenant_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.tenant_id IS DISTINCT FROM NEW.tenant_id THEN
    RAISE EXCEPTION 'Cannot change tenant_id on % (id: %). This is an immutable field.',
      TG_TABLE_NAME, OLD.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to critical tables
DO $$
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'tournaments', 'athletes', 'teams', 'combat_matches',
    'platform.payments', 'platform.invoices',
    'core.users', 'core.roles'
  ]) LOOP
    BEGIN
      EXECUTE format(
        'CREATE TRIGGER prevent_tenant_change BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION trigger_prevent_tenant_change()',
        tbl
      );
    EXCEPTION
      WHEN duplicate_object THEN NULL;
      WHEN undefined_table THEN NULL;
    END;
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════
-- 5. DOMAIN TYPES — Reusable validated types
-- ════════════════════════════════════════════════════════

DO $$ BEGIN CREATE DOMAIN core.email_address AS VARCHAR(255)
  CHECK (VALUE ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE DOMAIN core.phone_number AS VARCHAR(20)
  CHECK (VALUE ~ '^\+?[0-9\s\-\(\)]{6,20}$');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE DOMAIN core.positive_money AS DECIMAL(15,2)
  CHECK (VALUE >= 0);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE DOMAIN core.percentage AS DECIMAL(5,2)
  CHECK (VALUE >= 0 AND VALUE <= 100);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ════════════════════════════════════════════════════════
-- 6. ADDITIONAL SAFETY CONSTRAINTS
-- ════════════════════════════════════════════════════════

-- Prevent negative counters (belt-and-suspenders with GREATEST in triggers)
DO $$ BEGIN
  ALTER TABLE platform.posts ADD CONSTRAINT chk_like_count_positive CHECK (like_count >= 0);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE platform.posts ADD CONSTRAINT chk_comment_count_positive CHECK (comment_count >= 0);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE platform.posts ADD CONSTRAINT chk_share_count_positive CHECK (share_count >= 0);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE platform.community_groups ADD CONSTRAINT chk_member_count_positive CHECK (member_count >= 0);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Invoice amounts must be non-negative
DO $$ BEGIN
  ALTER TABLE platform.invoices ADD CONSTRAINT chk_invoice_subtotal CHECK (subtotal >= 0);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE platform.invoices ADD CONSTRAINT chk_invoice_tax CHECK (tax_amount >= 0);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Sponsorship end date must be after start date
DO $$ BEGIN
  ALTER TABLE platform.sponsorships ADD CONSTRAINT chk_sponsorship_dates
    CHECK (contract_end IS NULL OR contract_end >= contract_start);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Training session end_time must be after start_time
DO $$ BEGIN
  ALTER TABLE training.training_sessions ADD CONSTRAINT chk_session_times
    CHECK (end_time > start_time);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Belt exam registration deadline before exam date
DO $$ BEGIN
  ALTER TABLE training.belt_examinations ADD CONSTRAINT chk_exam_deadline
    CHECK (registration_deadline IS NULL OR registration_deadline <= exam_date);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMIT;


-- ─── Source: 0017_pii_advisory.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0017: PII + ADVISORY LOCKS (Phase 3C)
-- PII encryption layer, advisory locks, connection security
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. PII ENCRYPTION LAYER
--    pgcrypto for hashing; app-level AES for encrypt/decrypt
--    DB stores: encrypted bytes + deterministic hash for lookup
-- ════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1a. Add encrypted PII columns to core.users
ALTER TABLE core.users
  ADD COLUMN IF NOT EXISTS email_encrypted BYTEA,
  ADD COLUMN IF NOT EXISTS phone_encrypted BYTEA,
  ADD COLUMN IF NOT EXISTS email_hash VARCHAR(64);  -- SHA-256 for lookups

-- Unique lookup by email hash (faster than decrypting every row)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_hash
  ON core.users(tenant_id, email_hash)
  WHERE email_hash IS NOT NULL AND is_deleted = false;

-- 1b. PII columns in invoices (customer data)
ALTER TABLE platform.invoices
  ADD COLUMN IF NOT EXISTS customer_email_hash VARCHAR(64);

-- 1c. Sponsorships contact PII
ALTER TABLE platform.sponsorships
  ADD COLUMN IF NOT EXISTS contact_email_hash VARCHAR(64);

-- 1d. Helper: hash function for deterministic lookups
CREATE OR REPLACE FUNCTION core.hash_pii(val TEXT)
RETURNS VARCHAR(64) AS $$
BEGIN
  IF val IS NULL OR val = '' THEN
    RETURN NULL;
  END IF;
  RETURN encode(digest(lower(trim(val)), 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 1e. Auto-hash email on INSERT/UPDATE
CREATE OR REPLACE FUNCTION trigger_hash_user_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email IS NOT NULL THEN
    NEW.email_hash := core.hash_pii(NEW.email);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER auto_hash_email
    BEFORE INSERT OR UPDATE OF email ON core.users
    FOR EACH ROW EXECUTE FUNCTION trigger_hash_user_email();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ════════════════════════════════════════════════════════
-- 2. ADVISORY LOCKS — DISTRIBUTED COORDINATION
--    Lightweight locks for bracket generation, scoring,
--    payment processing. No table-level locks needed.
-- ════════════════════════════════════════════════════════

-- Hash-based lock key generator
CREATE OR REPLACE FUNCTION system.advisory_lock_key(
  p_category TEXT,  -- 'bracket', 'scoring', 'payment'
  p_entity_id UUID
)
RETURNS BIGINT AS $$
BEGIN
  -- Combine category + entity UUID into unique int8 lock key
  RETURN ('x' || left(md5(p_category || '::' || p_entity_id::TEXT), 15))::BIT(60)::BIGINT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Convenience wrappers (called from Go)
-- pg_try_advisory_lock returns true if lock acquired
-- pg_advisory_unlock releases the lock

-- Example usage from Go:
-- SELECT pg_try_advisory_lock(system.advisory_lock_key('bracket', $1))
-- ... do bracket generation ...
-- SELECT pg_advisory_unlock(system.advisory_lock_key('bracket', $1))

-- ════════════════════════════════════════════════════════
-- 3. DATA RETENTION POLICIES
--    Metadata table defining auto-archival rules
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.data_retention_policies (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  table_name      VARCHAR(100) NOT NULL UNIQUE,
  retention_days  INT NOT NULL CHECK (retention_days > 0),
  archive_strategy VARCHAR(20) NOT NULL DEFAULT 'soft_delete'
    CHECK (archive_strategy IN ('soft_delete', 'move_to_archive', 'hard_delete_allowed')),
  archive_table   VARCHAR(100),     -- target for move_to_archive
  condition       TEXT,             -- WHERE clause for archival
  is_active       BOOLEAN DEFAULT true,
  last_run_at     TIMESTAMPTZ,
  last_archived   INT DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed retention policies
INSERT INTO system.data_retention_policies
  (table_name, retention_days, archive_strategy, condition) VALUES
  ('system.rate_limits', 1, 'hard_delete_allowed',
   'window_start < NOW() - INTERVAL ''1 day'''),
  ('core.sessions', 30, 'hard_delete_allowed',
   'expires_at < NOW() - INTERVAL ''30 days'''),
  ('system.job_queue', 90, 'soft_delete',
   'status IN (''completed'', ''dead'') AND completed_at < NOW() - INTERVAL ''90 days'''),
  ('system.event_outbox', 30, 'hard_delete_allowed',
   'published_at IS NOT NULL AND published_at < NOW() - INTERVAL ''30 days'''),
  ('system.notification_queue', 60, 'soft_delete',
   'is_read = true AND created_at < NOW() - INTERVAL ''60 days'''),
  ('system.audit_log_partitioned', 365, 'move_to_archive',
   'created_at < NOW() - INTERVAL ''365 days'''),
  ('core.auth_audit_log', 180, 'hard_delete_allowed',
   'created_at < NOW() - INTERVAL ''180 days''')
ON CONFLICT (table_name) DO NOTHING;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON system.data_retention_policies
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ════════════════════════════════════════════════════════
-- 4. QUERY PERFORMANCE VIEWS
--    Monitor slow queries, index usage, table bloat
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW system.v_index_usage AS
SELECT
  schemaname, relname AS tablename, indexrelname AS indexname,
  idx_scan AS times_used,
  idx_tup_read AS rows_read,
  idx_tup_fetch AS rows_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

CREATE OR REPLACE VIEW system.v_table_sizes AS
SELECT
  s.schemaname, s.relname AS tablename,
  pg_size_pretty(pg_total_relation_size(s.relid)) AS total_size,
  pg_size_pretty(pg_relation_size(s.relid)) AS table_size,
  pg_size_pretty(pg_indexes_size(s.relid)) AS indexes_size,
  s.n_live_tup AS live_rows,
  s.n_dead_tup AS dead_rows,
  CASE WHEN s.n_live_tup > 0
    THEN round(s.n_dead_tup::NUMERIC / s.n_live_tup * 100, 2)
    ELSE 0
  END AS dead_row_pct,
  s.last_autovacuum, s.last_autoanalyze
FROM pg_stat_user_tables s
ORDER BY pg_total_relation_size(s.relid) DESC;

CREATE OR REPLACE VIEW system.v_unused_indexes AS
SELECT
  schemaname, relname AS tablename, indexrelname AS indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE '%_pkey'
  AND indexrelname NOT LIKE '%unique%'
ORDER BY pg_relation_size(indexrelid) DESC;

-- ════════════════════════════════════════════════════════
-- 5. HEALTH CHECK FUNCTION
--    Single call returns system health metrics
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION system.health_check()
RETURNS TABLE (
  metric TEXT,
  value TEXT,
  status TEXT
) AS $$
BEGIN
  -- Database size
  RETURN QUERY SELECT 'db_size'::TEXT,
    pg_size_pretty(pg_database_size(current_database())),
    'info'::TEXT;

  -- Active connections
  RETURN QUERY SELECT 'active_connections'::TEXT,
    (SELECT count(*)::TEXT FROM pg_stat_activity WHERE state = 'active'),
    CASE WHEN (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') > 50
      THEN 'warning' ELSE 'ok' END;

  -- Pending jobs
  RETURN QUERY SELECT 'pending_jobs'::TEXT,
    (SELECT count(*)::TEXT FROM system.job_queue WHERE status = 'pending'),
    CASE WHEN (SELECT count(*) FROM system.job_queue WHERE status = 'pending') > 1000
      THEN 'warning' ELSE 'ok' END;

  -- Dead jobs
  RETURN QUERY SELECT 'dead_jobs'::TEXT,
    (SELECT count(*)::TEXT FROM system.job_queue WHERE status = 'dead'),
    CASE WHEN (SELECT count(*) FROM system.job_queue WHERE status = 'dead') > 10
      THEN 'warning' ELSE 'ok' END;

  -- Unpublished outbox events
  RETURN QUERY SELECT 'outbox_pending'::TEXT,
    (SELECT count(*)::TEXT FROM system.event_outbox WHERE published_at IS NULL),
    CASE WHEN (SELECT count(*) FROM system.event_outbox WHERE published_at IS NULL) > 100
      THEN 'warning' ELSE 'ok' END;

  -- Unread notifications
  RETURN QUERY SELECT 'unread_notifications'::TEXT,
    (SELECT count(*)::TEXT FROM system.notification_queue WHERE is_read = false),
    'info'::TEXT;
END;
$$ LANGUAGE plpgsql;

COMMIT;


-- ─── Source: 0018_permissions_workflows.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0018: PERMISSIONS + WORKFLOWS (Phase 4A)
-- Fine-grained RBAC, approval workflows, notification templates,
-- webhook management
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. FINE-GRAINED PERMISSION SYSTEM
--    Replaces coarse JSON permissions in core.roles
--    Resource + Action matrix with deny/allow
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS core.permissions (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  resource        VARCHAR(100) NOT NULL,     -- 'tournament', 'athlete', 'payment'
  action          VARCHAR(50) NOT NULL,      -- 'create', 'read', 'update', 'delete', 'approve', 'export'
  description     TEXT,
  is_system       BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (resource, action)
);

-- Role ↔ Permission mapping
CREATE TABLE IF NOT EXISTS core.role_permissions (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES core.tenants(id),
  role_id         UUID NOT NULL REFERENCES core.roles(id) ON DELETE CASCADE,
  permission_id   UUID NOT NULL REFERENCES core.permissions(id) ON DELETE CASCADE,
  effect          VARCHAR(10) NOT NULL DEFAULT 'allow'
    CHECK (effect IN ('allow', 'deny')),
  conditions      JSONB DEFAULT '{}',   -- {"own_only": true, "max_amount": 1000000}
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, role_id, permission_id)
);

-- Seed essential permissions
INSERT INTO core.permissions (resource, action, description, is_system) VALUES
  -- Tournament
  ('tournament', 'create', 'Tạo giải đấu', true),
  ('tournament', 'read', 'Xem giải đấu', true),
  ('tournament', 'update', 'Cập nhật giải đấu', true),
  ('tournament', 'delete', 'Xóa giải đấu', true),
  ('tournament', 'approve', 'Phê duyệt giải đấu', true),
  ('tournament', 'manage_brackets', 'Quản lý bảng đấu', true),
  -- Athlete
  ('athlete', 'create', 'Đăng ký VĐV', true),
  ('athlete', 'read', 'Xem VĐV', true),
  ('athlete', 'update', 'Cập nhật VĐV', true),
  ('athlete', 'approve_registration', 'Phê duyệt đăng ký', true),
  -- Scoring
  ('scoring', 'record', 'Ghi điểm trận đấu', true),
  ('scoring', 'override', 'Ghi đè điểm', true),
  ('scoring', 'read', 'Xem điểm', true),
  -- Payment
  ('payment', 'create', 'Tạo thanh toán', true),
  ('payment', 'confirm', 'Xác nhận thanh toán', true),
  ('payment', 'refund', 'Hoàn tiền', true),
  ('payment', 'read', 'Xem thanh toán', true),
  ('payment', 'export', 'Xuất báo cáo tài chính', true),
  -- Training
  ('training', 'create', 'Tạo buổi tập', true),
  ('training', 'read', 'Xem lịch tập', true),
  ('training', 'manage_attendance', 'Quản lý điểm danh', true),
  ('training', 'manage_exams', 'Quản lý thi đai', true),
  -- Heritage
  ('heritage', 'create', 'Tạo nội dung di sản', true),
  ('heritage', 'read', 'Xem di sản', true),
  ('heritage', 'approve', 'Phê duyệt nội dung di sản', true),
  -- Community
  ('community', 'create_post', 'Đăng bài', true),
  ('community', 'moderate', 'Kiểm duyệt nội dung', true),
  ('community', 'manage_groups', 'Quản lý nhóm', true),
  -- System
  ('system', 'manage_users', 'Quản lý người dùng', true),
  ('system', 'manage_tenants', 'Quản lý tenants', true),
  ('system', 'view_audit', 'Xem audit log', true),
  ('system', 'manage_config', 'Cấu hình hệ thống', true),
  ('system', 'manage_api_keys', 'Quản lý API keys', true)
ON CONFLICT (resource, action) DO NOTHING;

-- RLS
ALTER TABLE core.role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON core.role_permissions
  USING (tenant_id = COALESCE(
    current_setting('app.current_tenant', true)::UUID,
    '00000000-0000-7000-8000-000000000001'::UUID
  ));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_role_perms_role ON core.role_permissions(tenant_id, role_id);
CREATE INDEX IF NOT EXISTS idx_perms_resource ON core.permissions(resource, action);

-- Permission check function (called from Go middleware)
CREATE OR REPLACE FUNCTION core.has_permission(
  p_user_id UUID,
  p_resource TEXT,
  p_action TEXT,
  p_tenant_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_tenant UUID;
  v_result BOOLEAN := false;
BEGIN
  v_tenant := COALESCE(p_tenant_id,
    current_setting('app.current_tenant', true)::UUID);

  -- Check if any active role grants this permission (allow wins over deny)
  SELECT EXISTS(
    SELECT 1
    FROM core.user_roles ur
    JOIN core.role_permissions rp ON rp.role_id = ur.role_id AND rp.tenant_id = ur.tenant_id
    JOIN core.permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = p_user_id
      AND ur.tenant_id = v_tenant
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
      AND p.resource = p_resource
      AND p.action = p_action
      AND rp.effect = 'allow'
      -- Check no explicit deny exists
      AND NOT EXISTS (
        SELECT 1
        FROM core.user_roles ur2
        JOIN core.role_permissions rp2 ON rp2.role_id = ur2.role_id AND rp2.tenant_id = ur2.tenant_id
        JOIN core.permissions p2 ON p2.id = rp2.permission_id
        WHERE ur2.user_id = p_user_id
          AND ur2.tenant_id = v_tenant
          AND p2.resource = p_resource
          AND p2.action = p_action
          AND rp2.effect = 'deny'
      )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE;

-- ════════════════════════════════════════════════════════
-- 2. APPROVAL WORKFLOW ENGINE
--    Generic multi-step approval for tournaments, payments,
--    belt promotions, heritage content
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS core.approval_workflows (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES core.tenants(id),
  name            VARCHAR(200) NOT NULL,
  entity_type     VARCHAR(100) NOT NULL,     -- 'tournament', 'payment_refund', 'belt_promotion'
  steps           JSONB NOT NULL,            -- [{step: 1, role: 'FEDERATION_ADMIN', action: 'approve'}, ...]
  is_active       BOOLEAN DEFAULT true,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version         INT NOT NULL DEFAULT 1,
  UNIQUE (tenant_id, entity_type)
);

CREATE TABLE IF NOT EXISTS core.approval_requests (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES core.tenants(id),
  workflow_id     UUID NOT NULL REFERENCES core.approval_workflows(id),
  entity_type     VARCHAR(100) NOT NULL,
  entity_id       UUID NOT NULL,
  current_step    INT NOT NULL DEFAULT 1,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'cancelled', 'expired')),
  requested_by    UUID NOT NULL REFERENCES core.users(id),
  requested_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  notes           TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version         INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS core.approval_actions (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES core.tenants(id),
  request_id      UUID NOT NULL REFERENCES core.approval_requests(id) ON DELETE CASCADE,
  step_number     INT NOT NULL,
  action          VARCHAR(20) NOT NULL CHECK (action IN ('approve', 'reject', 'comment', 'delegate')),
  actor_id        UUID NOT NULL REFERENCES core.users(id),
  comment         TEXT,
  delegated_to    UUID REFERENCES core.users(id),
  acted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE core.approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.approval_actions ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'core.approval_workflows', 'core.approval_requests', 'core.approval_actions'
  ]) LOOP
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %s USING (tenant_id = COALESCE(current_setting(''app.current_tenant'', true)::UUID, ''00000000-0000-7000-8000-000000000001''::UUID))',
      tbl
    );
  END LOOP;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_approval_req_entity ON core.approval_requests(tenant_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_approval_req_status ON core.approval_requests(tenant_id, status) WHERE status IN ('pending', 'in_review');
CREATE INDEX IF NOT EXISTS idx_approval_actions_req ON core.approval_actions(request_id, step_number);

-- Triggers
CREATE TRIGGER set_updated_at BEFORE UPDATE ON core.approval_workflows
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON core.approval_requests
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ════════════════════════════════════════════════════════
-- 3. NOTIFICATION TEMPLATES
--    Structured, multi-channel notification system
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.notification_templates (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  tenant_id       UUID REFERENCES core.tenants(id),  -- NULL = system-wide
  code            VARCHAR(100) NOT NULL,              -- 'tournament_approved', 'payment_confirmed'
  channel         VARCHAR(20) NOT NULL
    CHECK (channel IN ('email', 'sms', 'push', 'in_app', 'webhook')),
  subject         TEXT,
  body_template   TEXT NOT NULL,           -- Go template: "Xin chào {{.UserName}}"
  variables       JSONB DEFAULT '[]',      -- ["UserName", "TournamentName", ...]
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, code, channel)
);

-- Seed templates
INSERT INTO system.notification_templates (code, channel, subject, body_template, variables) VALUES
  ('tournament_created', 'in_app', 'Giải đấu mới', 'Giải đấu "{{.TournamentName}}" đã được tạo.', '["TournamentName"]'),
  ('tournament_approved', 'in_app', 'Giải đấu phê duyệt', 'Giải đấu "{{.TournamentName}}" đã được phê duyệt bởi {{.ApproverName}}.', '["TournamentName", "ApproverName"]'),
  ('registration_approved', 'in_app', 'Đăng ký được duyệt', 'Đăng ký của VĐV {{.AthleteName}} cho {{.TournamentName}} đã được duyệt.', '["AthleteName", "TournamentName"]'),
  ('payment_confirmed', 'in_app', 'Thanh toán xác nhận', 'Thanh toán {{.Amount}} {{.Currency}} đã được xác nhận.', '["Amount", "Currency"]'),
  ('match_starting', 'push', 'Trận đấu sắp bắt đầu', 'Trận {{.MatchName}} sẽ bắt đầu trong 5 phút tại {{.Arena}}.', '["MatchName", "Arena"]'),
  ('belt_promotion', 'in_app', 'Thăng đai', 'Chúc mừng {{.AthleteName}} đã đạt đai {{.BeltName}}!', '["AthleteName", "BeltName"]'),
  ('training_reminder', 'push', 'Nhắc nhở tập luyện', 'Buổi tập "{{.SessionTitle}}" bắt đầu lúc {{.StartTime}} hôm nay.', '["SessionTitle", "StartTime"]')
ON CONFLICT DO NOTHING;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON system.notification_templates
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ════════════════════════════════════════════════════════
-- 4. WEBHOOK MANAGEMENT
--    Outgoing webhooks for external integrations
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.webhooks (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES core.tenants(id),
  name            VARCHAR(200) NOT NULL,
  url             TEXT NOT NULL,
  secret          VARCHAR(255) NOT NULL,    -- HMAC signing key
  events          JSONB NOT NULL DEFAULT '[]',  -- ["tournament.created", "payment.confirmed"]
  headers         JSONB DEFAULT '{}',        -- Custom headers
  is_active       BOOLEAN DEFAULT true,
  retry_count     INT DEFAULT 3,
  timeout_seconds INT DEFAULT 10,
  last_triggered_at TIMESTAMPTZ,
  last_status     INT,                       -- HTTP status code
  failure_count   INT DEFAULT 0,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version         INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS system.webhook_deliveries (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  tenant_id       UUID NOT NULL,
  webhook_id      UUID NOT NULL REFERENCES system.webhooks(id) ON DELETE CASCADE,
  event_type      VARCHAR(100) NOT NULL,
  payload         JSONB NOT NULL,
  response_status INT,
  response_body   TEXT,
  response_time_ms INT,
  attempt_number  INT DEFAULT 1,
  status          VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'success', 'failed', 'retrying')),
  error           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE system.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE system.webhook_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON system.webhooks
  USING (tenant_id = COALESCE(current_setting('app.current_tenant', true)::UUID, '00000000-0000-7000-8000-000000000001'::UUID));
CREATE POLICY tenant_isolation ON system.webhook_deliveries
  USING (tenant_id = COALESCE(current_setting('app.current_tenant', true)::UUID, '00000000-0000-7000-8000-000000000001'::UUID));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_webhooks_tenant_active ON system.webhooks(tenant_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook ON system.webhook_deliveries(webhook_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_pending ON system.webhook_deliveries(created_at)
  WHERE status IN ('pending', 'retrying');

CREATE TRIGGER set_updated_at BEFORE UPDATE ON system.webhooks
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMIT;


-- ─── Source: 0019_geo_analytics.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0019: GEO + ANALYTICS (Phase 4B)
-- PostGIS for location-based queries, analytics pre-aggregation,
-- multi-currency exchange rates
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. POSTGIS — LOCATION-BASED FEATURES
--    Find nearby clubs, tournament venues within radius
-- ════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS postgis;

-- 1a. Add geospatial columns to venues/clubs/branches
ALTER TABLE arenas
  ADD COLUMN IF NOT EXISTS coordinates GEOGRAPHY(POINT, 4326),
  ADD COLUMN IF NOT EXISTS full_address TEXT;

ALTER TABLE clubs
  ADD COLUMN IF NOT EXISTS coordinates GEOGRAPHY(POINT, 4326),
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS province VARCHAR(100);

ALTER TABLE people.club_branches
  ADD COLUMN IF NOT EXISTS coordinates GEOGRAPHY(POINT, 4326);

ALTER TABLE platform.martial_schools
  ADD COLUMN IF NOT EXISTS coordinates GEOGRAPHY(POINT, 4326),
  ADD COLUMN IF NOT EXISTS city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS province VARCHAR(100);

-- 1b. Spatial indexes (GIST for geography)
CREATE INDEX IF NOT EXISTS idx_arenas_geo ON arenas USING GIST (coordinates);
CREATE INDEX IF NOT EXISTS idx_clubs_geo ON clubs USING GIST (coordinates);
CREATE INDEX IF NOT EXISTS idx_branches_geo ON people.club_branches USING GIST (coordinates);
CREATE INDEX IF NOT EXISTS idx_schools_geo ON platform.martial_schools USING GIST (coordinates);

-- 1c. Province/City lookup table
CREATE TABLE IF NOT EXISTS core.locations (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  code            VARCHAR(10) NOT NULL UNIQUE,   -- '01' = Hà Nội
  name            VARCHAR(200) NOT NULL,
  name_en         VARCHAR(200),
  parent_code     VARCHAR(10),
  level           VARCHAR(20) NOT NULL
    CHECK (level IN ('country', 'province', 'district', 'ward')),
  coordinates     GEOGRAPHY(POINT, 4326),
  metadata        JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_locations_parent ON core.locations(parent_code);
CREATE INDEX IF NOT EXISTS idx_locations_level ON core.locations(level, code);

-- 1d. Nearby search function
CREATE OR REPLACE FUNCTION core.find_nearby_clubs(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_radius_km INT DEFAULT 10,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  club_id UUID, club_name VARCHAR, distance_km DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id, c.ten,
    ROUND(ST_Distance(
      c.coordinates,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::GEOGRAPHY
    )::NUMERIC / 1000, 2)::DOUBLE PRECISION AS dist_km
  FROM clubs c
  WHERE c.coordinates IS NOT NULL
    AND c.is_deleted = false
    AND ST_DWithin(
      c.coordinates,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::GEOGRAPHY,
      p_radius_km * 1000   -- meters
    )
  ORDER BY dist_km
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ════════════════════════════════════════════════════════
-- 2. ANALYTICS PRE-AGGREGATION
--    Time-series rollup tables for dashboards
--    Updated by scheduled jobs (no real-time overhead)
-- ════════════════════════════════════════════════════════

-- 2a. Daily stats per tenant
CREATE TABLE IF NOT EXISTS system.analytics_daily (
  id              UUID DEFAULT uuidv7() NOT NULL,
  tenant_id       UUID NOT NULL,
  date            DATE NOT NULL,
  metric          VARCHAR(100) NOT NULL,    -- 'active_users', 'new_athletes', 'matches_played'
  dimension       VARCHAR(100),             -- 'province=HN', 'weight_class=60'
  value           BIGINT NOT NULL DEFAULT 0,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (date, tenant_id, metric, id)
) PARTITION BY RANGE (date);

-- Monthly partitions for analytics
DO $$
DECLARE m INT; start_d TEXT; end_d TEXT;
BEGIN
  FOR m IN 1..12 LOOP
    start_d := format('2026-%s-01', lpad(m::TEXT, 2, '0'));
    IF m = 12 THEN end_d := '2027-01-01';
    ELSE end_d := format('2026-%s-01', lpad((m+1)::TEXT, 2, '0'));
    END IF;
    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS system.analytics_daily_2026_%s PARTITION OF system.analytics_daily FOR VALUES FROM (%L) TO (%L)',
      lpad(m::TEXT, 2, '0'), start_d, end_d
    );
  END LOOP;
END $$;

CREATE TABLE IF NOT EXISTS system.analytics_daily_default
  PARTITION OF system.analytics_daily DEFAULT;

CREATE INDEX IF NOT EXISTS idx_analytics_daily_metric
  ON system.analytics_daily(tenant_id, metric, date DESC);

-- 2b. Reporting materialized view: Tournament summary by month
CREATE MATERIALIZED VIEW IF NOT EXISTS api_v1.tournament_monthly_stats AS
SELECT
  date_trunc('month', t.start_date) AS month,
  t.tenant_id,
  COUNT(t.id) AS tournament_count,
  COUNT(t.id) FILTER (WHERE t.status = 'ket_thuc') AS completed,
  COUNT(t.id) FILTER (WHERE t.status = 'huy') AS cancelled,
  SUM(COALESCE(d.athlete_count, 0)) AS total_athletes,
  SUM(COALESCE(d.match_count, 0)) AS total_matches
FROM tournaments t
LEFT JOIN api_v1.tournament_dashboard d ON d.id = t.id
WHERE t.is_deleted = false AND t.start_date IS NOT NULL
GROUP BY date_trunc('month', t.start_date), t.tenant_id
WITH NO DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tournament_monthly_pk
  ON api_v1.tournament_monthly_stats(month, tenant_id);

-- ════════════════════════════════════════════════════════
-- 3. MULTI-CURRENCY EXCHANGE RATES
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS platform.exchange_rates (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  from_currency   VARCHAR(10) NOT NULL,
  to_currency     VARCHAR(10) NOT NULL,
  rate            DECIMAL(20,10) NOT NULL CHECK (rate > 0),
  effective_date  DATE NOT NULL,
  source          VARCHAR(100) DEFAULT 'manual',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (from_currency, to_currency, effective_date)
);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_lookup
  ON platform.exchange_rates(from_currency, to_currency, effective_date DESC);

-- Currency conversion helper
CREATE OR REPLACE FUNCTION platform.convert_currency(
  p_amount DECIMAL,
  p_from VARCHAR,
  p_to VARCHAR,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS DECIMAL AS $$
DECLARE v_rate DECIMAL;
BEGIN
  IF p_from = p_to THEN RETURN p_amount; END IF;

  SELECT rate INTO v_rate
  FROM platform.exchange_rates
  WHERE from_currency = p_from AND to_currency = p_to
    AND effective_date <= p_date
  ORDER BY effective_date DESC
  LIMIT 1;

  IF v_rate IS NULL THEN
    RAISE EXCEPTION 'No exchange rate found for % → % on %', p_from, p_to, p_date;
  END IF;

  RETURN ROUND(p_amount * v_rate, 2);
END;
$$ LANGUAGE plpgsql STABLE;

-- ════════════════════════════════════════════════════════
-- 4. FILE/MEDIA TRACKING
--    Centralized file registry (S3-compatible)
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.media_files (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES core.tenants(id),
  uploaded_by     UUID REFERENCES core.users(id),
  file_name       VARCHAR(500) NOT NULL,
  original_name   VARCHAR(500),
  mime_type       VARCHAR(100) NOT NULL,
  file_size       BIGINT NOT NULL CHECK (file_size > 0),
  storage_path    TEXT NOT NULL,             -- 's3://bucket/tenant/2026/03/file.jpg'
  storage_backend VARCHAR(20) DEFAULT 'local'
    CHECK (storage_backend IN ('local', 's3', 'gcs', 'azure')),
  checksum_sha256 VARCHAR(64),
  is_public       BOOLEAN DEFAULT false,
  usage_context   VARCHAR(50),              -- 'avatar', 'tournament_logo', 'heritage_media'
  entity_type     VARCHAR(100),             -- 'athlete', 'tournament', 'heritage_technique'
  entity_id       UUID,
  width           INT,
  height          INT,
  duration_seconds INT,                      -- for videos
  metadata        JSONB DEFAULT '{}',
  is_deleted      BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE system.media_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON system.media_files
  USING (tenant_id = COALESCE(current_setting('app.current_tenant', true)::UUID, '00000000-0000-7000-8000-000000000001'::UUID));

CREATE INDEX IF NOT EXISTS idx_media_tenant ON system.media_files(tenant_id, usage_context) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_media_entity ON system.media_files(entity_type, entity_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_media_checksum ON system.media_files(checksum_sha256);

COMMIT;


-- ─── Source: 0020_bulk_config_i18n.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0020: BULK IMPORT + CONFIG (Phase 4C)
-- CSV/Excel import staging, versioned config, i18n support,
-- data export tracking
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. BULK IMPORT STAGING
--    CSV/Excel imports land here first → validated → committed
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.import_jobs (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES core.tenants(id),
  name            VARCHAR(200) NOT NULL,
  entity_type     VARCHAR(100) NOT NULL,    -- 'athletes', 'clubs', 'payments'
  file_name       VARCHAR(500) NOT NULL,
  file_size       BIGINT,
  total_rows      INT DEFAULT 0,
  processed_rows  INT DEFAULT 0,
  success_rows    INT DEFAULT 0,
  error_rows      INT DEFAULT 0,
  status          VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'validating', 'validated', 'importing',
                      'completed', 'failed', 'cancelled', 'partial')),
  error_summary   JSONB DEFAULT '[]',
  mapping_config  JSONB DEFAULT '{}',        -- column mapping
  options         JSONB DEFAULT '{}',        -- skip_duplicates, update_existing, etc
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  imported_by     UUID REFERENCES core.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version         INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS system.import_rows (
  id              UUID DEFAULT uuidv7() NOT NULL,
  tenant_id       UUID NOT NULL,
  job_id          UUID NOT NULL REFERENCES system.import_jobs(id) ON DELETE CASCADE,
  row_number      INT NOT NULL,
  raw_data        JSONB NOT NULL,            -- original CSV row as JSON
  validated_data  JSONB,                     -- after validation/transformation
  status          VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'valid', 'invalid', 'imported', 'skipped')),
  errors          JSONB DEFAULT '[]',        -- [{field: "email", error: "invalid format"}]
  entity_id       UUID,                      -- ID of created/updated entity
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (job_id, row_number)           -- natural partition key
);

-- RLS
ALTER TABLE system.import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system.import_rows ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON system.import_jobs
  USING (tenant_id = COALESCE(current_setting('app.current_tenant', true)::UUID, '00000000-0000-7000-8000-000000000001'::UUID));
CREATE POLICY tenant_isolation ON system.import_rows
  USING (tenant_id = COALESCE(current_setting('app.current_tenant', true)::UUID, '00000000-0000-7000-8000-000000000001'::UUID));

CREATE INDEX IF NOT EXISTS idx_import_jobs_tenant ON system.import_jobs(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_import_rows_status ON system.import_rows(job_id, status);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON system.import_jobs
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ════════════════════════════════════════════════════════
-- 2. VERSIONED CONFIGURATION
--    System-wide and tenant-specific config with history
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.configurations (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  tenant_id       UUID REFERENCES core.tenants(id),  -- NULL = system-wide
  category        VARCHAR(100) NOT NULL,     -- 'scoring', 'registration', 'notification'
  key             VARCHAR(200) NOT NULL,     -- 'scoring.max_points', 'reg.auto_approve'
  value           JSONB NOT NULL,
  value_type      VARCHAR(20) NOT NULL DEFAULT 'string'
    CHECK (value_type IN ('string', 'number', 'boolean', 'json', 'array')),
  description     TEXT,
  is_secure       BOOLEAN DEFAULT false,     -- encrypted values
  is_readonly     BOOLEAN DEFAULT false,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by      UUID,
  version         INT NOT NULL DEFAULT 1,
  UNIQUE (tenant_id, key)
);

CREATE TABLE IF NOT EXISTS system.configuration_history (
  id              UUID DEFAULT uuidv7() NOT NULL,
  config_id       UUID NOT NULL REFERENCES system.configurations(id) ON DELETE CASCADE,
  old_value       JSONB,
  new_value       JSONB NOT NULL,
  changed_by      UUID,
  changed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  change_reason   TEXT,
  PRIMARY KEY (changed_at, config_id, id)
) PARTITION BY RANGE (changed_at);

-- Default partition
CREATE TABLE IF NOT EXISTS system.config_history_default
  PARTITION OF system.configuration_history DEFAULT;

-- Auto-track config changes
CREATE OR REPLACE FUNCTION trigger_config_history()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.value IS DISTINCT FROM NEW.value THEN
    INSERT INTO system.configuration_history
      (config_id, old_value, new_value, changed_by)
    VALUES (
      NEW.id, OLD.value, NEW.value,
      NULLIF(current_setting('app.current_user', true), '')::UUID
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER track_config_changes
    AFTER UPDATE ON system.configurations
    FOR EACH ROW EXECUTE FUNCTION trigger_config_history();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON system.configurations
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Seed default configs
INSERT INTO system.configurations (category, key, value, value_type, description) VALUES
  ('scoring', '"scoring.points.thang"', '"3"', 'number', 'Điểm thắng trận'),
  ('scoring', '"scoring.points.hoa"', '"1"', 'number', 'Điểm hòa trận'),
  ('scoring', '"scoring.points.thua"', '"0"', 'number', 'Điểm thua trận'),
  ('scoring', '"scoring.round.duration_seconds"', '"120"', 'number', 'Thời gian 1 hiệp (giây)'),
  ('scoring', '"scoring.round.count"', '"3"', 'number', 'Số hiệp tối đa'),
  ('registration', '"reg.auto_approve"', 'false', 'boolean', 'Tự động duyệt đăng ký'),
  ('registration', '"reg.max_athletes_per_club"', '"50"', 'number', 'Số VĐV tối đa mỗi CLB'),
  ('notification', '"notif.email_enabled"', 'true', 'boolean', 'Gửi email thông báo'),
  ('notification', '"notif.push_enabled"', 'true', 'boolean', 'Push notification'),
  ('tournament', '"tournament.bracket.seeding"', '"ranking"', 'string', 'Phương pháp xếp hạt giống'),
  ('platform', '"platform.maintenance_mode"', 'false', 'boolean', 'Chế độ bảo trì')
ON CONFLICT DO NOTHING;

-- Config lookup function (tenant override → system fallback)
CREATE OR REPLACE FUNCTION system.get_config(
  p_key TEXT,
  p_tenant_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE v_val JSONB;
BEGIN
  -- Try tenant-specific first
  IF p_tenant_id IS NOT NULL THEN
    SELECT value INTO v_val FROM system.configurations
    WHERE key = p_key AND tenant_id = p_tenant_id;
    IF v_val IS NOT NULL THEN RETURN v_val; END IF;
  END IF;
  -- Fall back to system-wide
  SELECT value INTO v_val FROM system.configurations
  WHERE key = p_key AND tenant_id IS NULL;
  RETURN v_val;
END;
$$ LANGUAGE plpgsql STABLE;

-- ════════════════════════════════════════════════════════
-- 3. I18N TRANSLATIONS
--    Multi-language support at DB level
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.translations (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  tenant_id       UUID REFERENCES core.tenants(id),  -- NULL = system
  locale          VARCHAR(10) NOT NULL,       -- 'vi', 'en', 'zh'
  namespace       VARCHAR(100) NOT NULL,      -- 'tournament', 'scoring', 'ui'
  key             VARCHAR(500) NOT NULL,      -- 'tournament.status.nhap'
  value           TEXT NOT NULL,
  is_approved     BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, locale, namespace, key)
);

CREATE INDEX IF NOT EXISTS idx_translations_lookup
  ON system.translations(locale, namespace);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON system.translations
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ════════════════════════════════════════════════════════
-- 4. DATA EXPORT TRACKING
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.export_jobs (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES core.tenants(id),
  entity_type     VARCHAR(100) NOT NULL,
  format          VARCHAR(20) NOT NULL
    CHECK (format IN ('csv', 'xlsx', 'pdf', 'json')),
  filters         JSONB DEFAULT '{}',
  status          VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  total_rows      INT DEFAULT 0,
  file_path       TEXT,
  file_size       BIGINT,
  download_count  INT DEFAULT 0,
  expires_at      TIMESTAMPTZ,
  exported_by     UUID REFERENCES core.users(id),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  error           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE system.export_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON system.export_jobs
  USING (tenant_id = COALESCE(current_setting('app.current_tenant', true)::UUID, '00000000-0000-7000-8000-000000000001'::UUID));

CREATE INDEX IF NOT EXISTS idx_export_jobs_tenant ON system.export_jobs(tenant_id, status);

COMMIT;


-- ─── Source: 0021_event_sourcing.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0021: EVENT SOURCING + CQRS (Phase 5A)
-- Event store for match scoring, scoring projections,
-- bracket generation procedures, graph queries
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. EVENT STORE — IMMUTABLE APPEND-ONLY
--    All match scoring writes go here first.
--    Projections (read models) are derived from events.
--    Enables: replay, undo, audit trail, conflict resolution.
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tournament.event_store (
  id              UUID DEFAULT uuidv7() NOT NULL,
  tenant_id       UUID NOT NULL,
  stream_type     VARCHAR(50) NOT NULL,      -- 'match', 'tournament', 'bracket'
  stream_id       UUID NOT NULL,             -- match_id, tournament_id
  event_type      VARCHAR(100) NOT NULL,     -- 'ScoreRecorded', 'PenaltyIssued', 'RoundStarted'
  event_version   BIGINT NOT NULL,           -- monotonic within stream
  event_data      JSONB NOT NULL,
  metadata        JSONB DEFAULT '{}',        -- {causation_id, correlation_id, user_id}
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recorded_by     UUID,
  -- Composite PK: stream + version = unique event sequence
  PRIMARY KEY (recorded_at, tenant_id, stream_id, event_version)
) PARTITION BY RANGE (recorded_at);

-- Quarterly partitions
CREATE TABLE IF NOT EXISTS tournament.event_store_2026_q1
  PARTITION OF tournament.event_store
  FOR VALUES FROM ('2026-01-01') TO ('2026-04-01');
CREATE TABLE IF NOT EXISTS tournament.event_store_2026_q2
  PARTITION OF tournament.event_store
  FOR VALUES FROM ('2026-04-01') TO ('2026-07-01');
CREATE TABLE IF NOT EXISTS tournament.event_store_2026_q3
  PARTITION OF tournament.event_store
  FOR VALUES FROM ('2026-07-01') TO ('2026-10-01');
CREATE TABLE IF NOT EXISTS tournament.event_store_2026_q4
  PARTITION OF tournament.event_store
  FOR VALUES FROM ('2026-10-01') TO ('2027-01-01');
CREATE TABLE IF NOT EXISTS tournament.event_store_default
  PARTITION OF tournament.event_store DEFAULT;

-- Optimistic concurrency: UNIQUE on stream ensures no duplicate versions
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_store_stream_version
  ON tournament.event_store(tenant_id, stream_id, event_version, recorded_at);

CREATE INDEX IF NOT EXISTS idx_event_store_type
  ON tournament.event_store(tenant_id, stream_type, event_type);

CREATE INDEX IF NOT EXISTS idx_event_store_brin
  ON tournament.event_store USING BRIN (recorded_at) WITH (pages_per_range = 16);

-- RLS
ALTER TABLE tournament.event_store ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tournament.event_store
  USING (tenant_id = COALESCE(current_setting('app.current_tenant', true)::UUID, '00000000-0000-7000-8000-000000000001'::UUID));

-- Append event function (enforces monotonic version)
CREATE OR REPLACE FUNCTION tournament.append_event(
  p_tenant_id UUID,
  p_stream_type TEXT,
  p_stream_id UUID,
  p_event_type TEXT,
  p_event_data JSONB,
  p_metadata JSONB DEFAULT '{}',
  p_expected_version BIGINT DEFAULT NULL  -- optimistic concurrency
)
RETURNS tournament.event_store AS $$
DECLARE
  v_current BIGINT;
  v_result tournament.event_store;
BEGIN
  -- Get current max version for this stream
  SELECT COALESCE(MAX(event_version), 0) INTO v_current
  FROM tournament.event_store
  WHERE tenant_id = p_tenant_id AND stream_id = p_stream_id;

  -- Optimistic concurrency check
  IF p_expected_version IS NOT NULL AND v_current != p_expected_version THEN
    RAISE EXCEPTION 'Concurrency conflict on stream %: expected version %, current %',
      p_stream_id, p_expected_version, v_current;
  END IF;

  INSERT INTO tournament.event_store
    (tenant_id, stream_type, stream_id, event_type, event_version, event_data, metadata, recorded_by)
  VALUES (
    p_tenant_id, p_stream_type, p_stream_id, p_event_type,
    v_current + 1, p_event_data, p_metadata,
    NULLIF(current_setting('app.current_user', true), '')::UUID
  )
  RETURNING * INTO v_result;

  -- Notify listeners for real-time
  PERFORM pg_notify('event_store', json_build_object(
    'stream_type', p_stream_type,
    'stream_id', p_stream_id,
    'event_type', p_event_type,
    'version', v_current + 1,
    'tenant_id', p_tenant_id
  )::TEXT);

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 2. SCORING PROJECTION (CQRS Read Model)
--    Derived from event_store, updated by triggers/workers
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tournament.match_scores (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  tenant_id       UUID NOT NULL,
  match_id        UUID NOT NULL,
  athlete_red_id  UUID,
  athlete_blue_id UUID,
  -- Current scores
  red_score       INT DEFAULT 0,
  blue_score      INT DEFAULT 0,
  red_penalties   INT DEFAULT 0,
  blue_penalties  INT DEFAULT 0,
  red_warnings    INT DEFAULT 0,
  blue_warnings   INT DEFAULT 0,
  -- Round tracking
  current_round   INT DEFAULT 1,
  round_scores    JSONB DEFAULT '[]',        -- [{round: 1, red: 3, blue: 2}, ...]
  -- Status
  status          VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  winner_id       UUID,
  win_method      VARCHAR(50),               -- 'points', 'knockout', 'disqualification', 'withdrawal'
  -- Sync
  last_event_version BIGINT DEFAULT 0,       -- last processed event version
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version         INT NOT NULL DEFAULT 1,
  UNIQUE (tenant_id, match_id)
);

CREATE INDEX IF NOT EXISTS idx_match_scores_tenant
  ON tournament.match_scores(tenant_id, status);

ALTER TABLE tournament.match_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tournament.match_scores
  USING (tenant_id = COALESCE(current_setting('app.current_tenant', true)::UUID, '00000000-0000-7000-8000-000000000001'::UUID));

CREATE TRIGGER set_updated_at BEFORE UPDATE ON tournament.match_scores
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ════════════════════════════════════════════════════════
-- 3. BRACKET GENERATION PROCEDURE
--    Seeded single-elimination bracket via stored procedure
--    Uses advisory locks for mutual exclusion
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION tournament.generate_bracket(
  p_tournament_id UUID,
  p_category VARCHAR,
  p_weight_class VARCHAR,
  p_seeding_method VARCHAR DEFAULT 'ranking'  -- 'ranking', 'random', 'manual'
)
RETURNS TABLE (
  match_number INT,
  round_number INT,
  red_athlete_id UUID,
  blue_athlete_id UUID,
  is_bye BOOLEAN
) AS $$
DECLARE
  v_lock_key BIGINT;
  v_athletes UUID[];
  v_count INT;
  v_padded INT;
  v_tenant UUID;
  i INT;
BEGIN
  v_tenant := current_setting('app.current_tenant', true)::UUID;

  -- Advisory lock on tournament + category
  v_lock_key := system.advisory_lock_key('bracket', p_tournament_id);
  IF NOT pg_try_advisory_lock(v_lock_key) THEN
    RAISE EXCEPTION 'Bracket generation already in progress for tournament %', p_tournament_id;
  END IF;

  BEGIN
    -- Get seeded athletes
    IF p_seeding_method = 'ranking' THEN
      SELECT ARRAY_AGG(a.id ORDER BY COALESCE(r.points, 0) DESC, a.created_at)
      INTO v_athletes
      FROM athletes a
      LEFT JOIN rankings r ON r.athlete_id = a.id AND r.category = p_category
      WHERE a.tournament_id = p_tournament_id
        AND a.trang_thai = 'da_duyet'
        AND a.is_deleted = false;
    ELSE
      SELECT ARRAY_AGG(a.id ORDER BY random())
      INTO v_athletes
      FROM athletes a
      WHERE a.tournament_id = p_tournament_id
        AND a.trang_thai = 'da_duyet'
        AND a.is_deleted = false;
    END IF;

    v_count := COALESCE(array_length(v_athletes, 1), 0);
    IF v_count < 2 THEN
      PERFORM pg_advisory_unlock(v_lock_key);
      RAISE EXCEPTION 'Need at least 2 athletes, got %', v_count;
    END IF;

    -- Pad to next power of 2
    v_padded := 1;
    WHILE v_padded < v_count LOOP
      v_padded := v_padded * 2;
    END LOOP;

    -- Generate bracket matches
    match_number := 0;
    round_number := 1;
    FOR i IN 1..v_padded/2 LOOP
      match_number := match_number + 1;
      red_athlete_id := CASE WHEN i*2-1 <= v_count THEN v_athletes[i*2-1] ELSE NULL END;
      blue_athlete_id := CASE WHEN i*2 <= v_count THEN v_athletes[i*2] ELSE NULL END;
      is_bye := (red_athlete_id IS NULL OR blue_athlete_id IS NULL);
      RETURN NEXT;
    END LOOP;

    PERFORM pg_advisory_unlock(v_lock_key);
  EXCEPTION WHEN OTHERS THEN
    PERFORM pg_advisory_unlock(v_lock_key);
    RAISE;
  END;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 4. GRAPH QUERIES — LINEAGE + SOCIAL
--    Recursive CTE functions for tree traversal
-- ════════════════════════════════════════════════════════

-- Get full lineage tree (ancestors → descendants)
CREATE OR REPLACE FUNCTION platform.get_lineage_tree(
  p_school_id UUID,
  p_direction VARCHAR DEFAULT 'both',  -- 'ancestors', 'descendants', 'both'
  p_max_depth INT DEFAULT 10
)
RETURNS TABLE (
  node_id UUID, school_name VARCHAR, parent_id UUID,
  depth INT, path UUID[]
) AS $$
BEGIN
  IF p_direction IN ('ancestors', 'both') THEN
    RETURN QUERY
    WITH RECURSIVE ancestors AS (
      SELECT s.id, s.name, sl.parent_school_id, 0 AS d, ARRAY[s.id] AS p
      FROM platform.martial_schools s
      LEFT JOIN platform.school_lineage sl ON sl.child_school_id = s.id
      WHERE s.id = p_school_id AND s.is_deleted = false

      UNION ALL

      SELECT s.id, s.name, sl2.parent_school_id, a.d + 1, a.p || s.id
      FROM ancestors a
      JOIN platform.school_lineage sl2 ON sl2.child_school_id = a.parent_id
      JOIN platform.martial_schools s ON s.id = sl2.parent_school_id AND s.is_deleted = false
      WHERE a.d < p_max_depth AND NOT s.id = ANY(a.p)
    )
    SELECT a.id, a.name, a.parent_school_id, a.d, a.p
    FROM ancestors a WHERE a.d > 0;
  END IF;

  IF p_direction IN ('descendants', 'both') THEN
    RETURN QUERY
    WITH RECURSIVE descendants AS (
      SELECT s.id, s.name, sl.parent_school_id, 0 AS d, ARRAY[s.id] AS p
      FROM platform.martial_schools s
      LEFT JOIN platform.school_lineage sl ON sl.child_school_id = s.id
      WHERE s.id = p_school_id AND s.is_deleted = false

      UNION ALL

      SELECT s.id, s.name, p_school_id, de.d + 1, de.p || s.id
      FROM descendants de
      JOIN platform.school_lineage sl2 ON sl2.parent_school_id = de.node_id
      JOIN platform.martial_schools s ON s.id = sl2.child_school_id AND s.is_deleted = false
      WHERE de.d < p_max_depth AND NOT s.id = ANY(de.p)
    )
    SELECT d.node_id, d.school_name, d.parent_id, d.depth, d.path
    FROM descendants d WHERE d.depth > 0;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- ════════════════════════════════════════════════════════
-- 5. SNAPSHOT TABLE (Event Sourcing Optimization)
--    Periodic snapshots to avoid replaying entire stream
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tournament.event_snapshots (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  tenant_id       UUID NOT NULL,
  stream_type     VARCHAR(50) NOT NULL,
  stream_id       UUID NOT NULL,
  snapshot_version BIGINT NOT NULL,          -- event_version at snapshot time
  state           JSONB NOT NULL,            -- serialized aggregate state
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, stream_id, snapshot_version)
);

CREATE INDEX IF NOT EXISTS idx_snapshots_stream
  ON tournament.event_snapshots(tenant_id, stream_id, snapshot_version DESC);

ALTER TABLE tournament.event_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tournament.event_snapshots
  USING (tenant_id = COALESCE(current_setting('app.current_tenant', true)::UUID, '00000000-0000-7000-8000-000000000001'::UUID));

COMMIT;


-- ─── Source: 0022_gdpr_masking.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0022: GDPR + DATA MASKING (Phase 5B)
-- Right to erasure, data portability, dynamic masking,
-- consent management, activity logging
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. GDPR CONSENT MANAGEMENT
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS core.user_consents (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES core.tenants(id),
  user_id         UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  consent_type    VARCHAR(100) NOT NULL,     -- 'data_processing', 'marketing', 'analytics', 'photo_video'
  status          VARCHAR(20) NOT NULL DEFAULT 'granted'
    CHECK (status IN ('granted', 'revoked', 'expired')),
  granted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at      TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  ip_address      INET,
  consent_text    TEXT,                      -- version of consent at time
  metadata        JSONB DEFAULT '{}',
  version         INT NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_user_consents_active
  ON core.user_consents(tenant_id, user_id, consent_type)
  WHERE status = 'granted';

ALTER TABLE core.user_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON core.user_consents
  USING (tenant_id = COALESCE(current_setting('app.current_tenant', true)::UUID, '00000000-0000-7000-8000-000000000001'::UUID));

-- ════════════════════════════════════════════════════════
-- 2. DATA ERASURE REQUESTS (Right to Be Forgotten)
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS core.erasure_requests (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES core.tenants(id),
  user_id         UUID NOT NULL REFERENCES core.users(id),
  request_type    VARCHAR(30) NOT NULL DEFAULT 'full_erasure'
    CHECK (request_type IN ('full_erasure', 'partial_erasure', 'data_portability')),
  status          VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected', 'expired')),
  requested_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deadline_at     TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',  -- GDPR 30-day deadline
  completed_at    TIMESTAMPTZ,
  processed_by    UUID,
  -- Track what was erased
  erased_tables   JSONB DEFAULT '[]',        -- ["core.users", "platform.posts"]
  erased_records  INT DEFAULT 0,
  rejection_reason TEXT,
  notes           TEXT,
  metadata        JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_erasure_pending
  ON core.erasure_requests(status, deadline_at)
  WHERE status IN ('pending', 'in_progress');

-- ════════════════════════════════════════════════════════
-- 3. RIGHT TO ERASURE PROCEDURE
--    Anonymize PII across all tables for a given user
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION core.execute_erasure(
  p_request_id UUID,
  p_dry_run BOOLEAN DEFAULT true
)
RETURNS TABLE (
  table_name TEXT,
  records_affected INT,
  action_taken TEXT
) AS $$
DECLARE
  v_user_id UUID;
  v_tenant_id UUID;
  v_count INT;
BEGIN
  SELECT user_id, tenant_id INTO v_user_id, v_tenant_id
  FROM core.erasure_requests WHERE id = p_request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Erasure request % not found', p_request_id;
  END IF;

  -- Anonymize core.users
  table_name := 'core.users';
  IF p_dry_run THEN
    SELECT count(*) INTO v_count FROM core.users WHERE id = v_user_id;
  ELSE
    UPDATE core.users SET
      full_name = 'ERASED_USER_' || left(id::TEXT, 8),
      email = 'erased_' || left(id::TEXT, 8) || '@erased.local',
      email_encrypted = NULL,
      phone_encrypted = NULL,
      email_hash = NULL,
      avatar_url = NULL,
      metadata = '{"erased": true}'::JSONB,
      is_active = false,
      updated_at = NOW()
    WHERE id = v_user_id;
    GET DIAGNOSTICS v_count = ROW_COUNT;
  END IF;
  records_affected := v_count;
  action_taken := CASE WHEN p_dry_run THEN 'DRY_RUN' ELSE 'anonymized' END;
  RETURN NEXT;

  -- Anonymize posts
  table_name := 'platform.posts';
  IF p_dry_run THEN
    SELECT count(*) INTO v_count FROM platform.posts WHERE author_id = v_user_id;
  ELSE
    UPDATE platform.posts SET
      content = '[Nội dung đã bị xóa theo yêu cầu GDPR]',
      media_urls = '[]'::JSONB,
      author_id = v_user_id,  -- keep for FK
      updated_at = NOW()
    WHERE author_id = v_user_id AND tenant_id = v_tenant_id;
    GET DIAGNOSTICS v_count = ROW_COUNT;
  END IF;
  records_affected := v_count;
  action_taken := CASE WHEN p_dry_run THEN 'DRY_RUN' ELSE 'content_erased' END;
  RETURN NEXT;

  -- Anonymize comments
  table_name := 'platform.comments';
  IF p_dry_run THEN
    SELECT count(*) INTO v_count FROM platform.comments WHERE author_id = v_user_id;
  ELSE
    UPDATE platform.comments SET
      content = '[Bình luận đã bị xóa]',
      updated_at = NOW()
    WHERE author_id = v_user_id AND tenant_id = v_tenant_id;
    GET DIAGNOSTICS v_count = ROW_COUNT;
  END IF;
  records_affected := v_count;
  action_taken := CASE WHEN p_dry_run THEN 'DRY_RUN' ELSE 'content_erased' END;
  RETURN NEXT;

  -- Soft-delete reactions, follows
  table_name := 'platform.reactions+follows';
  IF NOT p_dry_run THEN
    DELETE FROM platform.reactions WHERE user_id = v_user_id AND tenant_id = v_tenant_id;
    DELETE FROM platform.follows WHERE follower_id = v_user_id AND tenant_id = v_tenant_id;
    GET DIAGNOSTICS v_count = ROW_COUNT;
  ELSE
    SELECT count(*) INTO v_count FROM platform.reactions WHERE user_id = v_user_id;
  END IF;
  records_affected := v_count;
  action_taken := CASE WHEN p_dry_run THEN 'DRY_RUN' ELSE 'deleted' END;
  RETURN NEXT;

  -- Revoke all sessions
  table_name := 'core.sessions';
  IF NOT p_dry_run THEN
    DELETE FROM core.sessions WHERE user_id = v_user_id;
    GET DIAGNOSTICS v_count = ROW_COUNT;
  ELSE
    SELECT count(*) INTO v_count FROM core.sessions WHERE user_id = v_user_id;
  END IF;
  records_affected := v_count;
  action_taken := CASE WHEN p_dry_run THEN 'DRY_RUN' ELSE 'revoked' END;
  RETURN NEXT;

  -- Mark request as completed
  IF NOT p_dry_run THEN
    UPDATE core.erasure_requests SET
      status = 'completed',
      completed_at = NOW(),
      erased_tables = '["core.users","platform.posts","platform.comments","platform.reactions","platform.follows","core.sessions"]'::JSONB
    WHERE id = p_request_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 4. DATA PORTABILITY (Export user's data as JSON)
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION core.export_user_data(
  p_user_id UUID,
  p_tenant_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_tenant UUID;
  v_result JSONB := '{}';
BEGIN
  v_tenant := COALESCE(p_tenant_id,
    current_setting('app.current_tenant', true)::UUID);

  -- User profile
  SELECT jsonb_build_object(
    'profile', row_to_json(u),
    'roles', (
      SELECT COALESCE(jsonb_agg(row_to_json(r)), '[]'::JSONB)
      FROM core.user_roles ur JOIN core.roles r ON r.id = ur.role_id
      WHERE ur.user_id = p_user_id AND ur.tenant_id = v_tenant
    ),
    'consents', (
      SELECT COALESCE(jsonb_agg(row_to_json(c)), '[]'::JSONB)
      FROM core.user_consents c
      WHERE c.user_id = p_user_id AND c.tenant_id = v_tenant
    ),
    'posts', (
      SELECT COALESCE(jsonb_agg(row_to_json(p)), '[]'::JSONB)
      FROM platform.posts p
      WHERE p.author_id = p_user_id AND p.tenant_id = v_tenant AND p.is_deleted = false
    ),
    'comments', (
      SELECT COALESCE(jsonb_agg(row_to_json(cm)), '[]'::JSONB)
      FROM platform.comments cm
      WHERE cm.author_id = p_user_id AND cm.tenant_id = v_tenant AND cm.is_deleted = false
    ),
    'export_timestamp', NOW()
  )
  INTO v_result
  FROM core.users u
  WHERE u.id = p_user_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE;

-- ════════════════════════════════════════════════════════
-- 5. DYNAMIC DATA MASKING
--    Views that mask PII based on current role
-- ════════════════════════════════════════════════════════

-- Masked user view (for non-admin roles)
CREATE OR REPLACE VIEW api_v1.users_masked AS
SELECT
  id,
  tenant_id,
  CASE
    WHEN current_setting('app.is_system_admin', true) = 'true' THEN full_name
    ELSE left(full_name, 1) || '***'
  END AS full_name,
  CASE
    WHEN current_setting('app.is_system_admin', true) = 'true' THEN email
    ELSE left(email, 2) || '***@' || split_part(email, '@', 2)
  END AS email,
  avatar_url,
  is_active,
  created_at
FROM core.users
WHERE is_deleted = false;

-- Masked athlete view (for public display)
CREATE OR REPLACE VIEW api_v1.athletes_public AS
SELECT
  a.id,
  a.tenant_id,
  a.ho_ten,
  a.ngay_sinh,
  a.gioi_tinh,
  a.can_nang,
  a.current_club_id,
  a.trang_thai,
  -- Mask personal details
  CASE
    WHEN current_setting('app.is_system_admin', true) = 'true'
      OR current_setting('app.current_user', true)::UUID = a.user_id
    THEN a.national_id
    ELSE '***' || right(COALESCE(a.national_id, ''), 3)
  END AS national_id_masked,
  a.belt_rank_id,
  a.created_at
FROM athletes a
WHERE a.is_deleted = false;

-- ════════════════════════════════════════════════════════
-- 6. ACTIVITY LOG (User-level audit for compliance)
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS core.user_activity_log (
  id              UUID DEFAULT uuidv7() NOT NULL,
  tenant_id       UUID NOT NULL,
  user_id         UUID NOT NULL,
  activity_type   VARCHAR(100) NOT NULL,     -- 'login', 'view_athlete', 'export_data'
  resource_type   VARCHAR(100),
  resource_id     UUID,
  ip_address      INET,
  user_agent      TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (created_at, tenant_id, id)
) PARTITION BY RANGE (created_at);

-- Monthly partitions
DO $$
DECLARE m INT; start_d TEXT; end_d TEXT;
BEGIN
  FOR m IN 1..12 LOOP
    start_d := format('2026-%s-01', lpad(m::TEXT, 2, '0'));
    IF m = 12 THEN end_d := '2027-01-01';
    ELSE end_d := format('2026-%s-01', lpad((m+1)::TEXT, 2, '0'));
    END IF;
    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS core.user_activity_2026_%s PARTITION OF core.user_activity_log FOR VALUES FROM (%L) TO (%L)',
      lpad(m::TEXT, 2, '0'), start_d, end_d
    );
  END LOOP;
END $$;

CREATE TABLE IF NOT EXISTS core.user_activity_default
  PARTITION OF core.user_activity_log DEFAULT;

CREATE INDEX IF NOT EXISTS idx_activity_user
  ON core.user_activity_log(tenant_id, user_id, created_at DESC);

ALTER TABLE core.user_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON core.user_activity_log
  USING (tenant_id = COALESCE(current_setting('app.current_tenant', true)::UUID, '00000000-0000-7000-8000-000000000001'::UUID));

COMMIT;


-- ─── Source: 0023_flags_circuit_breaker.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0023: FEATURE FLAGS + CIRCUIT BREAKER
--    + JSON validation, connection pooling hints (Phase 5C)
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. FEATURE FLAGS
--    Toggle features per tenant without deployments
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.feature_flags (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  flag_key        VARCHAR(200) NOT NULL UNIQUE,
  description     TEXT,
  flag_value      BOOLEAN DEFAULT false,
  scope           VARCHAR(20) DEFAULT 'global',
  rollout_percent INT DEFAULT 0,
  target_users    JSONB DEFAULT '[]',
  metadata        JSONB DEFAULT '{}',
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version         INT NOT NULL DEFAULT 1,
  tenant_id       UUID
);

-- Add columns needed by flag feature system
ALTER TABLE system.feature_flags
  ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS rollout_pct INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS target_rules JSONB DEFAULT '{}';

CREATE TABLE IF NOT EXISTS system.feature_flag_overrides (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  flag_id         UUID NOT NULL REFERENCES system.feature_flags(id) ON DELETE CASCADE,
  tenant_id       UUID REFERENCES core.tenants(id),
  user_id         UUID REFERENCES core.users(id),
  is_enabled      BOOLEAN NOT NULL,
  reason          TEXT,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (flag_id, tenant_id, user_id)
);

-- Check if feature is enabled for current context
CREATE OR REPLACE FUNCTION system.is_feature_enabled(
  p_flag_name TEXT,
  p_user_id UUID DEFAULT NULL,
  p_tenant_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_flag system.feature_flags%ROWTYPE;
  v_override BOOLEAN;
  v_tenant UUID;
BEGIN
  v_tenant := COALESCE(p_tenant_id,
    current_setting('app.current_tenant', true)::UUID);

  SELECT * INTO v_flag FROM system.feature_flags WHERE flag_key = p_flag_name;
  IF NOT FOUND THEN RETURN false; END IF;

  -- Check user-specific override
  IF p_user_id IS NOT NULL THEN
    SELECT is_enabled INTO v_override
    FROM system.feature_flag_overrides
    WHERE flag_id = v_flag.id AND user_id = p_user_id
      AND (expires_at IS NULL OR expires_at > NOW());
    IF v_override IS NOT NULL THEN RETURN v_override; END IF;
  END IF;

  -- Check tenant-specific override
  SELECT is_enabled INTO v_override
  FROM system.feature_flag_overrides
  WHERE flag_id = v_flag.id AND tenant_id = v_tenant AND user_id IS NULL
    AND (expires_at IS NULL OR expires_at > NOW());
  IF v_override IS NOT NULL THEN RETURN v_override; END IF;

  -- Global flag
  RETURN v_flag.is_enabled;
END;
$$ LANGUAGE plpgsql STABLE;

-- Seed default flags
DO $$
BEGIN
  INSERT INTO system.feature_flags (flag_key, description, is_enabled, flag_value) VALUES
    ('live_scoring', 'Tính năng chấm điểm trực tiếp', true, true),
    ('event_sourcing', 'Event sourcing cho trận đấu', false, false),
    ('ai_bracket_prediction', 'Dự đoán bảng đấu bằng AI', false, false),
    ('bulk_import', 'Upload danh sách VĐV từ Excel', true, true),
    ('multi_currency', 'Thanh toán đa tiền tệ', false, false),
    ('heritage_3d', 'Xem kỹ thuật di sản 3D', false, false),
    ('community_marketplace', 'Chợ trao đổi cộng đồng', true, true),
    ('geospatial_search', 'Tìm CLB theo vị trí', true, true),
    ('video_streaming', 'Phát trực tiếp trận đấu', false, false),
    ('advanced_analytics', 'Phân tích nâng cao', false, false);
EXCEPTION WHEN unique_violation THEN NULL;
END $$;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON system.feature_flags
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ════════════════════════════════════════════════════════
-- 2. CIRCUIT BREAKER PATTERN
--    Track external service health, auto-disable on failures
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.circuit_breakers (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  service_name    VARCHAR(200) NOT NULL UNIQUE,   -- 'nats', 's3', 'meilisearch', 'email_provider'
  status          VARCHAR(20) NOT NULL DEFAULT 'closed'
    CHECK (status IN ('closed', 'open', 'half_open')),
  failure_count   INT DEFAULT 0,
  success_count   INT DEFAULT 0,
  failure_threshold INT DEFAULT 5,
  reset_timeout_seconds INT DEFAULT 60,
  last_failure_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  opened_at       TIMESTAMPTZ,
  half_open_at    TIMESTAMPTZ,
  metadata        JSONB DEFAULT '{}',
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Record failure/success + auto-transition states
CREATE OR REPLACE FUNCTION system.circuit_breaker_record(
  p_service TEXT,
  p_success BOOLEAN
)
RETURNS system.circuit_breakers AS $$
DECLARE
  v_cb system.circuit_breakers;
BEGIN
  -- Upsert
  INSERT INTO system.circuit_breakers (service_name) VALUES (p_service)
  ON CONFLICT (service_name) DO NOTHING;

  SELECT * INTO v_cb FROM system.circuit_breakers WHERE service_name = p_service FOR UPDATE;

  IF p_success THEN
    -- Success
    IF v_cb.status = 'half_open' THEN
      UPDATE system.circuit_breakers SET
        status = 'closed', failure_count = 0,
        success_count = success_count + 1,
        last_success_at = NOW(), updated_at = NOW()
      WHERE id = v_cb.id RETURNING * INTO v_cb;
    ELSE
      UPDATE system.circuit_breakers SET
        success_count = success_count + 1,
        last_success_at = NOW(), updated_at = NOW()
      WHERE id = v_cb.id RETURNING * INTO v_cb;
    END IF;
  ELSE
    -- Failure
    UPDATE system.circuit_breakers SET
      failure_count = failure_count + 1,
      last_failure_at = NOW(), updated_at = NOW()
    WHERE id = v_cb.id RETURNING * INTO v_cb;

    -- Trip breaker if threshold exceeded
    IF v_cb.failure_count >= v_cb.failure_threshold AND v_cb.status = 'closed' THEN
      UPDATE system.circuit_breakers SET
        status = 'open', opened_at = NOW(), updated_at = NOW()
      WHERE id = v_cb.id RETURNING * INTO v_cb;

      PERFORM pg_notify('circuit_breaker', json_build_object(
        'service', p_service, 'status', 'open', 'failures', v_cb.failure_count
      )::TEXT);
    END IF;
  END IF;

  RETURN v_cb;
END;
$$ LANGUAGE plpgsql;

-- Check if service is available
CREATE OR REPLACE FUNCTION system.is_circuit_open(p_service TEXT)
RETURNS BOOLEAN AS $$
DECLARE v_cb system.circuit_breakers;
BEGIN
  SELECT * INTO v_cb FROM system.circuit_breakers WHERE service_name = p_service;
  IF NOT FOUND THEN RETURN false; END IF;

  -- Auto-transition open → half_open after timeout
  IF v_cb.status = 'open'
    AND v_cb.opened_at + (v_cb.reset_timeout_seconds || ' seconds')::INTERVAL < NOW()
  THEN
    UPDATE system.circuit_breakers SET status = 'half_open', half_open_at = NOW()
    WHERE id = v_cb.id;
    RETURN false;  -- allow a trial request
  END IF;

  RETURN v_cb.status = 'open';
END;
$$ LANGUAGE plpgsql;

-- Seed common services
INSERT INTO system.circuit_breakers (service_name, failure_threshold, reset_timeout_seconds) VALUES
  ('nats', 5, 30),
  ('smtp', 3, 120),
  ('s3_storage', 5, 60),
  ('meilisearch', 5, 60),
  ('payment_gateway', 3, 180)
ON CONFLICT (service_name) DO NOTHING;

-- ════════════════════════════════════════════════════════
-- 3. JSONB SCHEMA VALIDATION
--    Enforce structure on JSONB columns
-- ════════════════════════════════════════════════════════

-- Validate required keys exist in a JSONB object
CREATE OR REPLACE FUNCTION system.validate_jsonb_keys(
  p_data JSONB,
  p_required_keys TEXT[]
)
RETURNS BOOLEAN AS $$
DECLARE k TEXT;
BEGIN
  FOREACH k IN ARRAY p_required_keys LOOP
    IF NOT (p_data ? k) THEN
      RETURN false;
    END IF;
  END LOOP;
  RETURN true;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Enforce scoring event_data has required fields
DO $$ BEGIN
  ALTER TABLE tournament.match_scores
    ADD CONSTRAINT chk_round_scores_valid
    CHECK (
      jsonb_typeof(round_scores) = 'array'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Event store metadata validation
DO $$ BEGIN
  ALTER TABLE tournament.event_store
    ADD CONSTRAINT chk_event_data_object
    CHECK (jsonb_typeof(event_data) = 'object');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Webhook events must be an array
DO $$ BEGIN
  ALTER TABLE system.webhooks
    ADD CONSTRAINT chk_webhook_events_array
    CHECK (jsonb_typeof(events) = 'array');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ════════════════════════════════════════════════════════
-- 4. SYSTEM ANNOUNCEMENTS
--    Platform-wide announcements for maintenance, upgrades
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.announcements (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  tenant_id       UUID REFERENCES core.tenants(id),  -- NULL = all tenants
  title           VARCHAR(500) NOT NULL,
  content         TEXT NOT NULL,
  severity        VARCHAR(20) NOT NULL DEFAULT 'info'
    CHECK (severity IN ('info', 'warning', 'critical', 'maintenance')),
  starts_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at         TIMESTAMPTZ,
  is_dismissible  BOOLEAN DEFAULT true,
  target_roles    JSONB DEFAULT '[]',     -- empty = all roles
  is_active       BOOLEAN DEFAULT true,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_active
  ON system.announcements(starts_at, ends_at)
  WHERE is_active = true;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON system.announcements
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ════════════════════════════════════════════════════════
-- 5. AGGREGATE SCORING VIEWS (Final read models)
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW api_v1.live_matches AS
SELECT
  m.id AS match_id,
  m.tournament_id,
  m.trang_thai AS match_status,
  ms.red_score,
  ms.blue_score,
  ms.current_round,
  ms.status AS scoring_status,
  ms.winner_id,
  ms.win_method,
  m.arena_id,
  m.thoi_gian_bat_dau AS match_date,
  m.tenant_id,
  m.updated_at
FROM combat_matches m
LEFT JOIN tournament.match_scores ms ON ms.match_id = m.id AND ms.tenant_id = m.tenant_id
WHERE m.is_deleted = false
  AND m.trang_thai IN ('dang_dau', 'tam_dung');

COMMIT;


-- ─── Source: 0024_cross_cutting_fixes.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0024: CROSS-CUTTING FIXES (Phase 6A)
-- Resolve duplicate tables, legacy views, optimistic locking,
-- missing RLS on Phase 4-5 tables, covering indexes,
-- trigger execution ordering
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. RESOLVE DUPLICATE: system.feature_flags (0011 vs 0023)
--    0011 created system.feature_flags with (flag_key, flag_value)
--    0023 created SEPARATE system.feature_flags with (name, is_enabled)
--    Fix: merge 0011 version into 0023 structure
-- ════════════════════════════════════════════════════════

-- The 0023 version uses CREATE TABLE IF NOT EXISTS, so if 0011's ran first,
-- 0023's table creation was silently skipped. We need to ensure the columns
-- from 0023 exist on whatever table was created.

DO $$
BEGIN
  -- Add 0023 columns if they're missing (0011 schema was used)
  ALTER TABLE system.feature_flags ADD COLUMN IF NOT EXISTS name VARCHAR(200);
  ALTER TABLE system.feature_flags ADD COLUMN IF NOT EXISTS description TEXT;
  ALTER TABLE system.feature_flags ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT false;
  ALTER TABLE system.feature_flags ADD COLUMN IF NOT EXISTS rollout_pct INT DEFAULT 0;
  ALTER TABLE system.feature_flags ADD COLUMN IF NOT EXISTS target_rules JSONB DEFAULT '{}';

  -- Migrate 0011 data → 0023 format
  UPDATE system.feature_flags
  SET name = flag_key,
      is_enabled = COALESCE(flag_value, false),
      rollout_pct = COALESCE(rollout_percent, 0)
  WHERE name IS NULL AND flag_key IS NOT NULL;

  -- Ensure unique constraint on name
  BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS idx_feature_flags_name
      ON system.feature_flags(name) WHERE name IS NOT NULL;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
EXCEPTION WHEN undefined_column THEN
  -- 0023 schema was used (0011 never ran), nothing to migrate
  NULL;
END $$;

-- ════════════════════════════════════════════════════════
-- 2. LEGACY TABLE BRIDGE VIEWS
--    0002 created public.users, 0004 created core.users
--    Both exist. Create views to bridge queries.
-- ════════════════════════════════════════════════════════

-- View: query legacy public.users → gets core.users data
CREATE OR REPLACE VIEW api_v1.users_legacy AS
SELECT
  u.id, u.full_name, u.email, u.avatar_url, u.is_active,
  u.tenant_id, u.created_at, u.updated_at
FROM core.users u
WHERE u.is_deleted = false;

-- ════════════════════════════════════════════════════════
-- 3. OPTIMISTIC LOCKING ENFORCEMENT
--    version column exists on 100+ tables but no trigger
--    enforces "UPDATE WHERE version = X" pattern.
--    The trigger_set_updated_at auto-bumps version, but
--    nothing REJECTS a stale version.
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION trigger_optimistic_lock()
RETURNS TRIGGER AS $$
BEGIN
  -- If caller explicitly sets version (from app layer), validate it
  -- App sends: UPDATE ... SET version = OLD.version WHERE id = X
  -- Trigger checks: if NEW.version == OLD.version (not bumped by app), OK
  -- If NEW.version < OLD.version → stale write attempt
  IF NEW.version IS NOT NULL AND OLD.version IS NOT NULL THEN
    IF NEW.version < OLD.version THEN
      RAISE EXCEPTION 'Optimistic lock violation on %.%: expected version %, got % (id: %)',
        TG_TABLE_SCHEMA, TG_TABLE_NAME, OLD.version, NEW.version, OLD.id
        USING ERRCODE = '40001';  -- serialization_failure
    END IF;
  END IF;
  -- Always bump version (trigger_set_updated_at does this too, but belt-and-suspenders)
  NEW.version := COALESCE(OLD.version, 0) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to critical high-contention tables
DO $$
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'tournaments', 'combat_matches', 'athletes', 'teams',
    'registrations', 'platform.payments', 'platform.invoices',
    'platform.sponsorships', 'core.users',
    'training.curricula', 'training.training_plans'
  ]) LOOP
    BEGIN
      EXECUTE format(
        'CREATE TRIGGER optimistic_lock BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION trigger_optimistic_lock()',
        tbl
      );
    EXCEPTION
      WHEN duplicate_object THEN NULL;
      WHEN undefined_table THEN NULL;
    END;
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════
-- 4. MISSING RLS ON PHASE 4-5 TABLES
--    Tables created in 0018-0023 need RLS + WITH CHECK
-- ════════════════════════════════════════════════════════

DO $$
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    -- Phase 4 (0018)
    'core.role_permissions', 'core.approval_workflows',
    'core.approval_requests', 'core.approval_actions',
    'system.webhooks', 'system.webhook_deliveries',
    -- Phase 4 (0019)
    'system.media_files',
    -- Phase 4 (0020)
    'system.import_jobs', 'system.import_rows',
    'system.export_jobs',
    -- Phase 5 (0021)
    'tournament.event_store', 'tournament.match_scores',
    'tournament.event_snapshots',
    -- Phase 5 (0022)
    'core.user_consents', 'core.user_activity_log'
  ]) LOOP
    BEGIN
      -- Ensure RLS enabled
      EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', tbl);
      -- Add WITH CHECK for INSERT
      EXECUTE format(
        'CREATE POLICY tenant_write_%s ON %s FOR INSERT WITH CHECK (
          tenant_id = COALESCE(current_setting(''app.current_tenant'', true)::UUID,
          ''00000000-0000-7000-8000-000000000001''::UUID)
        )',
        replace(replace(tbl, '.', '_'), ' ', ''), tbl
      );
      -- Add WITH CHECK for UPDATE
      EXECUTE format(
        'CREATE POLICY tenant_update_%s ON %s FOR UPDATE
          USING (tenant_id = COALESCE(current_setting(''app.current_tenant'', true)::UUID,
            ''00000000-0000-7000-8000-000000000001''::UUID))
          WITH CHECK (tenant_id = COALESCE(current_setting(''app.current_tenant'', true)::UUID,
            ''00000000-0000-7000-8000-000000000001''::UUID))',
        replace(replace(tbl, '.', '_'), ' ', ''), tbl
      );
    EXCEPTION
      WHEN undefined_table THEN NULL;
      WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════
-- 5. COVERING INDEXES (Include common SELECT columns)
--    Avoids heap lookups for the most common queries
-- ════════════════════════════════════════════════════════

-- Tournament list page: filter by status, show name+dates
CREATE INDEX IF NOT EXISTS idx_tournaments_covering
  ON tournaments(tenant_id, status, start_date DESC)
  INCLUDE (name, code, location)
  WHERE is_deleted = false;

-- Athlete lookup by tournament + status
CREATE INDEX IF NOT EXISTS idx_athletes_covering
  ON athletes(tenant_id, tournament_id, trang_thai)
  INCLUDE (ho_ten, can_nang)
  WHERE is_deleted = false;

-- Match list by tournament
CREATE INDEX IF NOT EXISTS idx_matches_covering
  ON combat_matches(tenant_id, tournament_id, trang_thai)
  INCLUDE (arena_id)
  WHERE is_deleted = false;

-- Payment lookup by status
CREATE INDEX IF NOT EXISTS idx_payments_covering
  ON platform.payments(tenant_id, status, created_at DESC)
  INCLUDE (amount, currency, payment_method)
  WHERE is_deleted = false;

-- Post feed (timeline)
CREATE INDEX IF NOT EXISTS idx_posts_covering
  ON platform.posts(tenant_id, created_at DESC)
  INCLUDE (author_id, title, post_type, like_count, comment_count)
  WHERE is_deleted = false;

-- Event store: stream replay
CREATE INDEX IF NOT EXISTS idx_events_covering
  ON tournament.event_store(tenant_id, stream_id, event_version)
  INCLUDE (event_type, event_data)
  WHERE TRUE;

-- ════════════════════════════════════════════════════════
-- 6. TRIGGER EXECUTION ORDERING
--    combat_matches now has 6+ triggers. Ensure correct order:
--    1. validate_match_status (BEFORE UPDATE) - state machine
--    2. immutable_match_status (BEFORE UPDATE) - lock after ket_thuc
--    3. prevent_tenant_change (BEFORE UPDATE) - tenant immutability
--    4. optimistic_lock (BEFORE UPDATE) - version check
--    5. set_updated_at (BEFORE UPDATE) - timestamp + version bump
--    6. notify_on_status_change (AFTER UPDATE) - LISTEN/NOTIFY
--    7. counter triggers (AFTER INSERT/DELETE) - counters
--    8. audit trigger (AFTER INSERT/UPDATE/DELETE) - logging
--
--    PostgreSQL fires triggers in alphabetical order within
--    same timing/event. We name them 01_validate, 02_immutable, etc.
-- ════════════════════════════════════════════════════════

-- Rename triggers for deterministic ordering on combat_matches
DO $$
BEGIN
  -- Drop old names, recreate with ordered names
  DROP TRIGGER IF EXISTS validate_match_status ON combat_matches;
  CREATE TRIGGER a01_validate_match_status
    BEFORE UPDATE ON combat_matches
    FOR EACH ROW EXECUTE FUNCTION trigger_validate_match_status();

  DROP TRIGGER IF EXISTS immutable_match_status ON combat_matches;
  CREATE TRIGGER a02_immutable_match_status
    BEFORE UPDATE ON combat_matches
    FOR EACH ROW EXECUTE FUNCTION trigger_immutable_match();

  DROP TRIGGER IF EXISTS prevent_tenant_change ON combat_matches;
  CREATE TRIGGER a03_prevent_tenant_change
    BEFORE UPDATE ON combat_matches
    FOR EACH ROW EXECUTE FUNCTION trigger_prevent_tenant_change();

  DROP TRIGGER IF EXISTS optimistic_lock ON combat_matches;
  CREATE TRIGGER a04_optimistic_lock
    BEFORE UPDATE ON combat_matches
    FOR EACH ROW EXECUTE FUNCTION trigger_optimistic_lock();

  DROP TRIGGER IF EXISTS set_updated_at ON combat_matches;
  CREATE TRIGGER a05_set_updated_at
    BEFORE UPDATE ON combat_matches
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

  DROP TRIGGER IF EXISTS notify_on_status_change ON combat_matches;
  CREATE TRIGGER z01_notify_on_status_change
    AFTER UPDATE ON combat_matches
    FOR EACH ROW EXECUTE FUNCTION notify_match_status_change();
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Same for tournaments
DO $$
BEGIN
  DROP TRIGGER IF EXISTS validate_tournament_status ON tournaments;
  CREATE TRIGGER a01_validate_tournament_status
    BEFORE UPDATE ON tournaments
    FOR EACH ROW EXECUTE FUNCTION trigger_validate_tournament_status();

  DROP TRIGGER IF EXISTS prevent_tenant_change ON tournaments;
  CREATE TRIGGER a02_prevent_tenant_change
    BEFORE UPDATE ON tournaments
    FOR EACH ROW EXECUTE FUNCTION trigger_prevent_tenant_change();

  DROP TRIGGER IF EXISTS optimistic_lock ON tournaments;
  CREATE TRIGGER a03_optimistic_lock
    BEFORE UPDATE ON tournaments
    FOR EACH ROW EXECUTE FUNCTION trigger_optimistic_lock();

  DROP TRIGGER IF EXISTS set_updated_at ON tournaments;
  CREATE TRIGGER a04_set_updated_at
    BEFORE UPDATE ON tournaments
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Same for payments
DO $$
BEGIN
  DROP TRIGGER IF EXISTS validate_payment_status ON platform.payments;
  CREATE TRIGGER a01_validate_payment_status
    BEFORE UPDATE ON platform.payments
    FOR EACH ROW EXECUTE FUNCTION trigger_validate_payment_status();

  DROP TRIGGER IF EXISTS immutable_payment_fields ON platform.payments;
  CREATE TRIGGER a02_immutable_payment_fields
    BEFORE UPDATE ON platform.payments
    FOR EACH ROW EXECUTE FUNCTION trigger_immutable_payment();

  DROP TRIGGER IF EXISTS prevent_tenant_change ON platform.payments;
  CREATE TRIGGER a03_prevent_tenant_change
    BEFORE UPDATE ON platform.payments
    FOR EACH ROW EXECUTE FUNCTION trigger_prevent_tenant_change();

  DROP TRIGGER IF EXISTS optimistic_lock ON platform.payments;
  CREATE TRIGGER a04_optimistic_lock
    BEFORE UPDATE ON platform.payments
    FOR EACH ROW EXECUTE FUNCTION trigger_optimistic_lock();

  DROP TRIGGER IF EXISTS set_updated_at ON platform.payments;
  CREATE TRIGGER a05_set_updated_at
    BEFORE UPDATE ON platform.payments
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ════════════════════════════════════════════════════════
-- 7. SOFT-DELETE CASCADING
--    When parent is soft-deleted, cascade to children
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION trigger_cascade_soft_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_deleted = true AND OLD.is_deleted = false THEN
    NEW.deleted_at := COALESCE(NEW.deleted_at, NOW());
    NEW.deleted_by := COALESCE(NEW.deleted_by,
      NULLIF(current_setting('app.current_user', true), '')::UUID);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tournament soft-delete → cascade to matches, registrations
CREATE OR REPLACE FUNCTION trigger_cascade_tournament_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_deleted = true AND OLD.is_deleted = false THEN
    UPDATE combat_matches SET
      is_deleted = true, deleted_at = NOW(), deleted_by = NEW.deleted_by
    WHERE tournament_id = NEW.id AND is_deleted = false;

    UPDATE registrations SET
      is_deleted = true, deleted_at = NOW(), deleted_by = NEW.deleted_by
    WHERE tournament_id = NEW.id AND is_deleted = false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER z02_cascade_soft_delete
    AFTER UPDATE OF is_deleted ON tournaments
    FOR EACH ROW EXECUTE FUNCTION trigger_cascade_tournament_delete();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Post soft-delete → cascade to comments
CREATE OR REPLACE FUNCTION trigger_cascade_post_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_deleted = true AND OLD.is_deleted = false THEN
    UPDATE platform.comments SET
      is_deleted = true, deleted_at = NOW(), deleted_by = NEW.deleted_by
    WHERE post_id = NEW.id AND is_deleted = false;

    UPDATE platform.reactions SET
      is_deleted = true, deleted_at = NOW()
    WHERE target_id = NEW.id AND is_deleted = false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER z02_cascade_soft_delete
    AFTER UPDATE OF is_deleted ON platform.posts
    FOR EACH ROW EXECUTE FUNCTION trigger_cascade_post_delete();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMIT;


-- ─── Source: 0025_maintenance_patterns.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0025: QUERY PATTERNS + MAINTENANCE (6B)
-- Common query functions, partition maintenance, vacuum hints,
-- connection advisory, deadlock prevention
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. PAGINATION HELPERS
--    Cursor-based pagination for large tables
--    (Better than OFFSET which gets slower with depth)
-- ════════════════════════════════════════════════════════

-- Generic cursor pagination info type
DO $$ BEGIN
  CREATE TYPE api_v1.pagination_info AS (
    has_next_page BOOLEAN,
    has_prev_page BOOLEAN,
    total_count BIGINT,
    cursor_value TEXT
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ════════════════════════════════════════════════════════
-- 2. PARTITION MAINTENANCE
--    Auto-create future partitions, detach/archive old ones
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION system.maintain_partitions()
RETURNS TABLE (
  parent_table TEXT,
  action TEXT,
  partition_name TEXT,
  range_info TEXT
) AS $$
DECLARE
  v_next_quarter DATE;
  v_next_month DATE;
  v_start TEXT;
  v_end TEXT;
  v_name TEXT;
BEGIN
  -- ── Event Store: create next quarter ──
  v_next_quarter := date_trunc('quarter', NOW() + INTERVAL '3 months');
  v_start := v_next_quarter::TEXT;
  v_end := (v_next_quarter + INTERVAL '3 months')::TEXT;
  v_name := 'tournament.event_store_' ||
    to_char(v_next_quarter, 'YYYY') || '_q' ||
    EXTRACT(QUARTER FROM v_next_quarter)::TEXT;

  BEGIN
    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS %s PARTITION OF tournament.event_store FOR VALUES FROM (%L) TO (%L)',
      v_name, v_start, v_end
    );
    parent_table := 'tournament.event_store';
    action := 'created';
    partition_name := v_name;
    range_info := v_start || ' → ' || v_end;
    RETURN NEXT;
  EXCEPTION WHEN duplicate_table THEN NULL;
  END;

  -- ── Match Events: create next quarter ──
  v_name := 'tournament.match_events_' ||
    to_char(v_next_quarter, 'YYYY') || '_q' ||
    EXTRACT(QUARTER FROM v_next_quarter)::TEXT;

  BEGIN
    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS %s PARTITION OF tournament.match_events FOR VALUES FROM (%L) TO (%L)',
      v_name, v_start, v_end
    );
    parent_table := 'tournament.match_events';
    action := 'created';
    partition_name := v_name;
    range_info := v_start || ' → ' || v_end;
    RETURN NEXT;
  EXCEPTION WHEN duplicate_table THEN NULL;
  END;

  -- ── Analytics Daily: create next month ──
  v_next_month := date_trunc('month', NOW() + INTERVAL '1 month');
  v_start := v_next_month::TEXT;
  v_end := (v_next_month + INTERVAL '1 month')::TEXT;
  v_name := 'system.analytics_daily_' ||
    to_char(v_next_month, 'YYYY_MM');

  BEGIN
    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS %s PARTITION OF system.analytics_daily FOR VALUES FROM (%L) TO (%L)',
      v_name, v_start, v_end
    );
    parent_table := 'system.analytics_daily';
    action := 'created';
    partition_name := v_name;
    range_info := v_start || ' → ' || v_end;
    RETURN NEXT;
  EXCEPTION WHEN duplicate_table THEN NULL;
  END;

  -- ── Audit Log: create next month ──
  v_name := 'system.audit_log_' ||
    to_char(v_next_month, 'YYYY_MM');

  BEGIN
    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS %s PARTITION OF system.audit_log_partitioned FOR VALUES FROM (%L) TO (%L)',
      v_name, v_start, v_end
    );
    parent_table := 'system.audit_log_partitioned';
    action := 'created';
    partition_name := v_name;
    range_info := v_start || ' → ' || v_end;
    RETURN NEXT;
  EXCEPTION WHEN duplicate_table THEN NULL;
  END;

  -- ── User Activity: create next month ──
  v_name := 'core.user_activity_' ||
    to_char(v_next_month, 'YYYY_MM');

  BEGIN
    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS %s PARTITION OF core.user_activity_log FOR VALUES FROM (%L) TO (%L)',
      v_name, v_start, v_end
    );
    parent_table := 'core.user_activity_log';
    action := 'created';
    partition_name := v_name;
    range_info := v_start || ' → ' || v_end;
    RETURN NEXT;
  EXCEPTION WHEN duplicate_table THEN NULL;
  END;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 3. DATA CLEANUP / ARCHIVAL FUNCTION
--    Executes retention policies defined in 0017
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION system.execute_retention_policies(
  p_dry_run BOOLEAN DEFAULT true
)
RETURNS TABLE (
  policy_table TEXT,
  strategy TEXT,
  rows_affected INT,
  was_dry_run BOOLEAN
) AS $$
DECLARE
  pol RECORD;
  v_count INT;
BEGIN
  FOR pol IN
    SELECT * FROM system.data_retention_policies
    WHERE is_active = true
    ORDER BY table_name
  LOOP
    policy_table := pol.table_name;
    strategy := pol.archive_strategy;
    was_dry_run := p_dry_run;

    IF p_dry_run THEN
      EXECUTE format(
        'SELECT count(*) FROM %s WHERE %s',
        pol.table_name, pol.condition
      ) INTO v_count;
    ELSE
      IF pol.archive_strategy = 'hard_delete_allowed' THEN
        EXECUTE format(
          'DELETE FROM %s WHERE %s',
          pol.table_name, pol.condition
        );
        GET DIAGNOSTICS v_count = ROW_COUNT;
      ELSIF pol.archive_strategy = 'soft_delete' THEN
        EXECUTE format(
          'UPDATE %s SET is_deleted = true, deleted_at = NOW() WHERE %s AND is_deleted = false',
          pol.table_name, pol.condition
        );
        GET DIAGNOSTICS v_count = ROW_COUNT;
      END IF;

      -- Update last run info
      UPDATE system.data_retention_policies
      SET last_run_at = NOW(), last_archived = v_count
      WHERE id = pol.id;
    END IF;

    rows_affected := v_count;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 4. MATERIALIZED VIEW REFRESH (Concurrent, Safe)
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION system.refresh_all_matviews()
RETURNS TABLE (
  view_name TEXT,
  refresh_time_ms BIGINT,
  status TEXT
) AS $$
DECLARE
  v_start TIMESTAMPTZ;
  v_views TEXT[] := ARRAY[
    'api_v1.tournament_dashboard',
    'api_v1.rankings_leaderboard',
    'api_v1.tournament_monthly_stats'
  ];
  v TEXT;
BEGIN
  FOREACH v IN ARRAY v_views LOOP
    view_name := v;
    v_start := clock_timestamp();
    BEGIN
      EXECUTE format('REFRESH MATERIALIZED VIEW CONCURRENTLY %s', v);
      refresh_time_ms := EXTRACT(MILLISECONDS FROM clock_timestamp() - v_start)::BIGINT;
      status := 'ok';
    EXCEPTION WHEN OTHERS THEN
      refresh_time_ms := EXTRACT(MILLISECONDS FROM clock_timestamp() - v_start)::BIGINT;
      status := 'error: ' || SQLERRM;
    END;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 5. DEADLOCK PREVENTION ADVISORY
--    Consistent lock ordering function
-- ════════════════════════════════════════════════════════

-- When updating multiple rows, always sort by ID first
-- This prevents AB/BA deadlocks
CREATE OR REPLACE FUNCTION system.lock_rows_in_order(
  p_table TEXT,
  p_ids UUID[]
)
RETURNS VOID AS $$
DECLARE sorted_ids UUID[];
BEGIN
  -- Sort IDs to ensure consistent lock order
  SELECT ARRAY_AGG(id ORDER BY id) INTO sorted_ids
  FROM unnest(p_ids) AS id;

  -- Lock each row in order
  EXECUTE format(
    'SELECT 1 FROM %s WHERE id = ANY($1) ORDER BY id FOR UPDATE',
    p_table
  ) USING sorted_ids;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 6. SESSION CLEANUP FUNCTION
--    Remove expired sessions, consolidate device info
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION core.cleanup_expired_sessions()
RETURNS INT AS $$
DECLARE v_count INT;
BEGIN
  DELETE FROM core.sessions
  WHERE expires_at < NOW() - INTERVAL '1 day';
  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- Also clean legacy sessions
  BEGIN
    DELETE FROM sessions
    WHERE expires_at < NOW() - INTERVAL '1 day';
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Add to scheduled tasks
DO $$
BEGIN
  INSERT INTO system.scheduled_tasks (name, description, cron_expression, job_type, is_active)
  VALUES
    ('maintain_partitions', 'Auto-create future partitions', '0 0 * * 0', 'system.maintain_partitions', true),
    ('execute_retention', 'Execute data retention policies', '0 3 * * *', 'system.execute_retention_policies', true),
    ('cleanup_sessions', 'Remove expired sessions', '0 4 * * *', 'core.cleanup_expired_sessions', true);
EXCEPTION WHEN unique_violation THEN NULL;
END $$;

COMMIT;


-- ─── Source: 0026_production_readiness.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0026: PRODUCTION READINESS (Phase 6C)
-- Search path, GIN indexes on JSONB, row estimates,
-- table statistics, connection hints, final API views
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. SEARCH PATH SECURITY
--    Prevent schema injection attacks
-- ════════════════════════════════════════════════════════

-- Set secure search_path for all functions
-- (Prevents CREATE FUNCTION ... SET search_path attacks)
DO $$
DECLARE
  fn RECORD;
BEGIN
  FOR fn IN
    SELECT p.oid, n.nspname, p.proname
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname IN ('core', 'tournament', 'platform', 'system', 'api_v1')
    AND p.prokind = 'f'
  LOOP
    BEGIN
      EXECUTE format(
        'ALTER FUNCTION %I.%I SET search_path = %I, public',
        fn.nspname, fn.proname, fn.nspname
      );
    EXCEPTION WHEN OTHERS THEN
      -- Some functions have multiple overloads, skip errors
      NULL;
    END;
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════
-- 2. GIN INDEXES ON JSONB COLUMNS
--    For queries like WHERE metadata @> '{"key": "value"}'
-- ════════════════════════════════════════════════════════

-- Only add GIN on tables where JSONB is actually queried
CREATE INDEX IF NOT EXISTS idx_tournaments_config_gin
  ON tournaments USING GIN (config jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_athletes_metadata_gin
  ON athletes USING GIN (metadata jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_event_store_data_gin
  ON tournament.event_store USING GIN (event_data jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_event_store_metadata_gin
  ON tournament.event_store USING GIN (metadata jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_notifications_data_gin
  ON system.notification_queue USING GIN (data jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_import_errors_gin
  ON system.import_rows USING GIN (errors jsonb_path_ops)
  WHERE status = 'invalid';

CREATE INDEX IF NOT EXISTS idx_feature_flags_rules_gin
  ON system.feature_flags USING GIN (target_rules jsonb_path_ops);

-- ════════════════════════════════════════════════════════
-- 3. ROW COUNT ESTIMATION FUNCTION
--    For fast approximate counts (no seq scan on large tables)
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION system.estimate_count(
  p_table TEXT
)
RETURNS BIGINT AS $$
DECLARE v_count BIGINT;
BEGIN
  SELECT reltuples::BIGINT
  INTO v_count
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname || '.' || c.relname = p_table
     OR c.relname = p_table;

  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- ════════════════════════════════════════════════════════
-- 4. COMPREHENSIVE DASHBOARD VIEW
--    Single query → full system stats
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW api_v1.system_dashboard AS
SELECT
  (SELECT count(*) FROM core.tenants WHERE is_active = true) AS active_tenants,
  (SELECT system.estimate_count('core.users')) AS total_users,
  (SELECT count(*) FROM tournaments WHERE status = 'thi_dau' AND is_deleted = false) AS active_tournaments,
  (SELECT count(*) FROM combat_matches WHERE trang_thai = 'dang_dau' AND is_deleted = false) AS live_matches,
  (SELECT count(*) FROM system.job_queue WHERE status = 'pending') AS pending_jobs,
  (SELECT count(*) FROM system.notification_queue WHERE status = 'pending') AS pending_notifications,
  (SELECT count(*) FROM core.erasure_requests WHERE status = 'pending') AS pending_erasure_requests,
  (SELECT count(*) FROM system.circuit_breakers WHERE status = 'open') AS open_circuit_breakers,
  (SELECT count(*) FROM system.import_jobs WHERE status IN ('validating', 'importing')) AS active_imports,
  (SELECT pg_database_size(current_database())) AS database_size_bytes,
  NOW() AS snapshot_at;

-- ════════════════════════════════════════════════════════
-- 5. CONNECTION POOL ADVISORY VIEWS
--    Help PgBouncer / app decide pool sizing
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW system.v_connection_stats AS
SELECT
  count(*) AS total_connections,
  count(*) FILTER (WHERE state = 'active') AS active,
  count(*) FILTER (WHERE state = 'idle') AS idle,
  count(*) FILTER (WHERE state = 'idle in transaction') AS idle_in_txn,
  count(*) FILTER (WHERE wait_event_type = 'Lock') AS waiting_on_lock,
  max(EXTRACT(EPOCH FROM NOW() - xact_start))::INT AS longest_txn_seconds,
  max(EXTRACT(EPOCH FROM NOW() - query_start))::INT AS longest_query_seconds
FROM pg_stat_activity
WHERE datname = current_database()
  AND pid != pg_backend_pid();

-- ════════════════════════════════════════════════════════
-- 6. LONG RUNNING QUERY KILLER
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION system.kill_long_queries(
  p_max_seconds INT DEFAULT 300,
  p_dry_run BOOLEAN DEFAULT true
)
RETURNS TABLE (
  pid INT,
  duration_seconds INT,
  query TEXT,
  action TEXT
) AS $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT
      sa.pid,
      EXTRACT(EPOCH FROM NOW() - sa.query_start)::INT AS dur,
      left(sa.query, 200) AS q
    FROM pg_stat_activity sa
    WHERE sa.state = 'active'
      AND sa.pid != pg_backend_pid()
      AND sa.datname = current_database()
      AND EXTRACT(EPOCH FROM NOW() - sa.query_start) > p_max_seconds
    ORDER BY sa.query_start
  LOOP
    pid := r.pid;
    duration_seconds := r.dur;
    query := r.q;
    IF p_dry_run THEN
      action := 'DRY_RUN (would cancel)';
    ELSE
      PERFORM pg_cancel_backend(r.pid);
      action := 'cancelled';
    END IF;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 7. ENUM-LIKE CHECK CONSTRAINT SUMMARY VIEW
--    Show all CHECK constraints with allowed values
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW system.v_check_constraints AS
SELECT
  tc.table_schema,
  tc.table_name,
  cc.constraint_name,
  cc.check_clause
FROM information_schema.check_constraints cc
JOIN information_schema.table_constraints tc
  ON cc.constraint_name = tc.constraint_name
  AND cc.constraint_schema = tc.constraint_schema
WHERE tc.table_schema NOT IN ('pg_catalog', 'information_schema')
  AND cc.check_clause LIKE '%IN%'
ORDER BY tc.table_schema, tc.table_name;

-- ════════════════════════════════════════════════════════
-- 8. TOURNAMENT SUMMARY VIEW
--    Complete tournament with aggregated stats
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW api_v1.tournament_detail AS
SELECT
  t.id,
  t.tenant_id,
  t.name,
  t.code,
  t.status,
  t.start_date,
  t.end_date,
  t.location,
  t.config,
  -- Aggregated stats
  (SELECT count(*) FROM athletes a
   WHERE a.tournament_id = t.id AND a.is_deleted = false) AS athlete_count,
  (SELECT count(*) FROM teams tm
   WHERE tm.tournament_id = t.id AND tm.is_deleted = false) AS team_count,
  (SELECT count(*) FROM combat_matches m
   WHERE m.tournament_id = t.id AND m.is_deleted = false) AS match_count,
  (SELECT count(*) FROM combat_matches m
   WHERE m.tournament_id = t.id AND m.trang_thai = 'ket_thuc'
     AND m.is_deleted = false) AS completed_matches,
  (SELECT count(*) FROM registrations r
   WHERE r.tournament_id = t.id AND r.is_deleted = false) AS registration_count,
  (SELECT count(DISTINCT a.current_club_id) FROM athletes a
   WHERE a.tournament_id = t.id AND a.is_deleted = false
     AND a.current_club_id IS NOT NULL) AS club_count,
  t.created_at,
  t.updated_at
FROM tournaments t
WHERE t.is_deleted = false;

-- ════════════════════════════════════════════════════════
-- 9. GRANT READ ACCESS ON API VIEWS TO READONLY ROLE
-- ════════════════════════════════════════════════════════

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'vct_readonly') THEN
    CREATE ROLE vct_readonly NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'vct_api') THEN
    CREATE ROLE vct_api NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'vct_admin') THEN
    CREATE ROLE vct_admin NOLOGIN;
  END IF;

  -- api_v1 views → readonly
  GRANT USAGE ON SCHEMA api_v1 TO vct_readonly;
  GRANT SELECT ON ALL TABLES IN SCHEMA api_v1 TO vct_readonly;

  -- api_v1 + write schemas → api role
  GRANT USAGE ON SCHEMA api_v1 TO vct_api;
  GRANT USAGE ON SCHEMA core TO vct_api;
  GRANT USAGE ON SCHEMA tournament TO vct_api;
  GRANT USAGE ON SCHEMA people TO vct_api;
  GRANT USAGE ON SCHEMA training TO vct_api;
  GRANT USAGE ON SCHEMA platform TO vct_api;
  GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA core TO vct_api;
  GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA tournament TO vct_api;
  GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA people TO vct_api;
  GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA training TO vct_api;
  GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA platform TO vct_api;
  GRANT SELECT ON ALL TABLES IN SCHEMA api_v1 TO vct_api;

  -- Admin: full access
  GRANT ALL ON ALL TABLES IN SCHEMA core TO vct_admin;
  GRANT ALL ON ALL TABLES IN SCHEMA tournament TO vct_admin;
  GRANT ALL ON ALL TABLES IN SCHEMA people TO vct_admin;
  GRANT ALL ON ALL TABLES IN SCHEMA training TO vct_admin;
  GRANT ALL ON ALL TABLES IN SCHEMA platform TO vct_admin;
  GRANT ALL ON ALL TABLES IN SCHEMA system TO vct_admin;
  GRANT ALL ON ALL TABLES IN SCHEMA api_v1 TO vct_admin;
EXCEPTION WHEN OTHERS THEN
  -- Roles may already have grants
  NULL;
END $$;

-- Default privileges for future tables
DO $$
BEGIN
  ALTER DEFAULT PRIVILEGES IN SCHEMA api_v1 GRANT SELECT ON TABLES TO vct_readonly;
  ALTER DEFAULT PRIVILEGES IN SCHEMA api_v1 GRANT SELECT ON TABLES TO vct_api;
  ALTER DEFAULT PRIVILEGES IN SCHEMA core GRANT SELECT, INSERT, UPDATE ON TABLES TO vct_api;
  ALTER DEFAULT PRIVILEGES IN SCHEMA tournament GRANT SELECT, INSERT, UPDATE ON TABLES TO vct_api;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

COMMIT;


-- ─── Source: 0027_v7_layer_a_contradiction_fixes.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0027: V7.0 LAYER A
-- Fix 5 internal contradictions from V6.0
-- Tables: athlete_data_keys, erasure_tombstones, sync_conflicts,
--         conflict_resolution_rules, view_contracts,
--         config_changelog, cross_aggregate_references
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. CRYPTO-SHREDDING: athlete_data_keys
--    Per-athlete Data Encryption Key for right-to-erasure
--    GDPR Article 17 compliance via key destruction
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS core.athlete_data_keys (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    athlete_id UUID NOT NULL,
    key_purpose TEXT NOT NULL DEFAULT 'PII_ENCRYPTION',

    -- DEK encrypted by Key Encryption Key (KEK) from KMS
    encrypted_dek BYTEA NOT NULL,
    kek_reference TEXT NOT NULL,          -- 'vault:vct/kek/2026-q1'
    key_version INTEGER NOT NULL DEFAULT 1,

    status TEXT NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'PENDING_DESTRUCTION', 'DESTROYED')),

    -- When DESTROYED: all data encrypted with this DEK
    -- becomes unreadable = effectively deleted
    -- but events remain intact (only PII fields unreadable)
    destruction_requested_at TIMESTAMPTZ,
    destruction_requested_by TEXT,        -- 'athlete_self' or 'legal_request'
    destruction_executed_at TIMESTAMPTZ,
    destruction_certificate TEXT,         -- Proof of destruction for audit

    created_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_athlete_data_keys_athlete
    ON core.athlete_data_keys(athlete_id);
CREATE INDEX IF NOT EXISTS idx_athlete_data_keys_status
    ON core.athlete_data_keys(status) WHERE status != 'DESTROYED';

COMMENT ON TABLE core.athlete_data_keys IS
    'V7.0 Layer A: Per-athlete DEK for crypto-shredding pattern (GDPR right-to-erasure)';

-- ════════════════════════════════════════════════════════
-- 2. ERASURE TOMBSTONES
--    Track who has been erased and why
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS core.erasure_tombstones (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    original_athlete_id UUID NOT NULL,
    erasure_type TEXT NOT NULL
        CHECK (erasure_type IN ('FULL', 'PARTIAL', 'PSEUDONYMIZED')),

    affected_tables TEXT[] NOT NULL,
    affected_event_count INTEGER,
    legal_basis TEXT NOT NULL,            -- 'GDPR_ART17', 'VN_CYBERSEC_2018', 'ATHLETE_REQUEST'
    legal_reference TEXT,                -- Document reference number

    -- Retention override: keep what for statistical purposes?
    retained_fields TEXT[],              -- ['birth_year', 'gender', 'weight_class'] (anonymized)
    retention_justification TEXT,        -- 'Legitimate interest: tournament statistics'

    requested_at TIMESTAMPTZ NOT NULL,
    executed_at TIMESTAMPTZ,
    verified_by UUID,
    verification_at TIMESTAMPTZ,

    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_erasure_tombstones_athlete
    ON core.erasure_tombstones(original_athlete_id);

COMMENT ON TABLE core.erasure_tombstones IS
    'V7.0 Layer A: Tombstone records tracking data erasure compliance';

-- ════════════════════════════════════════════════════════
-- 3. SYNC CONFLICTS
--    Detect conflicts when 2 offline devices edit the same data
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.conflict_resolution_rules (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    table_name TEXT NOT NULL,
    field_name TEXT,                      -- NULL = whole record

    strategy TEXT NOT NULL
        CHECK (strategy IN (
            'LAST_WRITE_WINS', 'HIGHER_AUTHORITY', 'MANUAL', 'MERGE', 'DOMAIN_RULE'
        )),
    priority_field TEXT,                 -- For 'HIGHER_AUTHORITY': which field to compare rank
    merge_logic JSONB,                   -- For 'MERGE': {"keep_fields_from": "latest", "sum_fields": ["score"]}
    domain_logic TEXT,                   -- For 'DOMAIN_RULE': logic description

    -- Context
    applies_when JSONB,                  -- {"match_status": "IN_PROGRESS"} — only apply when

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'
);

COMMENT ON TABLE system.conflict_resolution_rules IS
    'V7.0 Layer A: Configurable merge strategy rules for offline sync conflicts';

-- Add columns that may be missing from earlier version of this table
ALTER TABLE system.conflict_resolution_rules
  ADD COLUMN IF NOT EXISTS strategy TEXT,
  ADD COLUMN IF NOT EXISTS priority_field TEXT,
  ADD COLUMN IF NOT EXISTS merge_logic JSONB,
  ADD COLUMN IF NOT EXISTS domain_logic TEXT,
  ADD COLUMN IF NOT EXISTS applies_when JSONB,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add columns that may be missing from earlier version of sync_conflicts
ALTER TABLE system.sync_conflicts
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'DETECTED',
  ADD COLUMN IF NOT EXISTS version_a JSONB,
  ADD COLUMN IF NOT EXISTS version_a_device_id UUID,
  ADD COLUMN IF NOT EXISTS version_a_timestamp TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS version_a_user_id UUID,
  ADD COLUMN IF NOT EXISTS version_b JSONB,
  ADD COLUMN IF NOT EXISTS version_b_device_id UUID,
  ADD COLUMN IF NOT EXISTS version_b_timestamp TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS version_b_user_id UUID,
  ADD COLUMN IF NOT EXISTS resolution_strategy TEXT DEFAULT 'MANUAL',
  ADD COLUMN IF NOT EXISTS domain_rule_id UUID,
  ADD COLUMN IF NOT EXISTS resolved_version JSONB,
  ADD COLUMN IF NOT EXISTS resolution_notes TEXT,
  ADD COLUMN IF NOT EXISTS detected_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

CREATE TABLE IF NOT EXISTS system.sync_conflicts (
    id UUID PRIMARY KEY DEFAULT uuidv7(),

    -- Conflicting records
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,

    -- Two competing versions
    version_a JSONB NOT NULL,
    version_a_device_id UUID NOT NULL,
    version_a_timestamp TIMESTAMPTZ NOT NULL,
    version_a_user_id UUID NOT NULL,

    version_b JSONB NOT NULL,
    version_b_device_id UUID NOT NULL,
    version_b_timestamp TIMESTAMPTZ NOT NULL,
    version_b_user_id UUID NOT NULL,

    -- Resolution
    resolution_strategy TEXT NOT NULL DEFAULT 'MANUAL'
        CHECK (resolution_strategy IN (
            'LAST_WRITE_WINS', 'HIGHER_AUTHORITY', 'MANUAL', 'MERGE', 'DOMAIN_RULE'
        )),

    domain_rule_id UUID REFERENCES system.conflict_resolution_rules(id),

    status TEXT NOT NULL DEFAULT 'DETECTED'
        CHECK (status IN ('DETECTED', 'AUTO_RESOLVED', 'PENDING_MANUAL', 'RESOLVED', 'ESCALATED')),
    resolved_version JSONB,
    resolved_by UUID,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,

    detected_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_sync_conflicts_status
    ON system.sync_conflicts(status) WHERE status NOT IN ('RESOLVED');
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_table_record
    ON system.sync_conflicts(table_name, record_id);

COMMENT ON TABLE system.sync_conflicts IS
    'V7.0 Layer A: Offline merge conflict detection and resolution';
-- Seed default resolution rules
INSERT INTO system.conflict_resolution_rules (table_name, field_name, strategy, domain_logic)
VALUES
    ('judge_scores', NULL, 'MANUAL', 'Judge scores must be decided by Jury President on conflict'),
    ('match_events', NULL, 'LAST_WRITE_WINS', 'Events are append-only, conflict = duplicate detection'),
    ('weigh_ins', 'weight_value', 'MANUAL', 'Weight has only one correct value, requires verification')
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════
-- 4. VIEW CONTRACTS
--    Contract testing for API views post-migration
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.view_contracts (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    view_name TEXT NOT NULL,               -- 'api_v1.athletes'
    version INTEGER NOT NULL,

    -- Contract definition
    expected_columns JSONB NOT NULL,
    -- [{"name": "id", "type": "uuid", "nullable": false}, ...]

    -- Backward compatibility
    breaking_changes TEXT[],
    additive_changes TEXT[],

    -- Consumers
    consumed_by TEXT[] NOT NULL,            -- ['mobile_app_v2.3', 'web_dashboard']
    min_consumer_version TEXT,

    -- Validation
    last_validated_at TIMESTAMPTZ,
    validation_status TEXT DEFAULT 'PENDING'
        CHECK (validation_status IN ('VALID', 'BROKEN', 'PENDING', 'DEPRECATED')),
    validation_errors JSONB,

    published_at TIMESTAMPTZ DEFAULT now(),
    deprecated_at TIMESTAMPTZ,
    sunset_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_view_contracts_unique
    ON system.view_contracts(view_name, version);

COMMENT ON TABLE system.view_contracts IS
    'V7.0 Layer A: API view contract testing metadata';

-- ════════════════════════════════════════════════════════
-- 5. CONFIG CHANGELOG
--    Configuration versioning + rollback support
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.config_changelog (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    config_table TEXT NOT NULL,
    config_id UUID NOT NULL,

    change_type TEXT NOT NULL
        CHECK (change_type IN ('CREATE', 'UPDATE', 'DEACTIVATE', 'ROLLBACK')),

    previous_value JSONB,
    new_value JSONB NOT NULL,
    diff JSONB,

    -- Context
    reason TEXT NOT NULL,
    tournament_id UUID,

    -- Rollback support
    is_rollback_of UUID REFERENCES system.config_changelog(id),
    can_rollback BOOLEAN DEFAULT true,

    changed_by UUID NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT now(),

    -- Approval workflow
    requires_approval BOOLEAN DEFAULT false,
    approved_by UUID,
    approved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_config_changelog_table_id
    ON system.config_changelog(config_table, config_id);
CREATE INDEX IF NOT EXISTS idx_config_changelog_changed_at
    ON system.config_changelog(changed_at DESC);

COMMENT ON TABLE system.config_changelog IS
    'V7.0 Layer A: Configuration versioning with rollback support';

-- ════════════════════════════════════════════════════════
-- 6. CROSS-AGGREGATE REFERENCES
--    Document soft FK references between aggregates
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.cross_aggregate_references (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    source_schema TEXT NOT NULL,
    source_table TEXT NOT NULL,
    source_column TEXT NOT NULL,
    target_schema TEXT NOT NULL,
    target_table TEXT NOT NULL,
    target_column TEXT NOT NULL,
    reference_type TEXT NOT NULL
        CHECK (reference_type IN ('SOFT_FK', 'EVENT_DRIVEN', 'CACHED_COPY')),
    sync_strategy TEXT,                  -- 'ON_DEMAND', 'EVENT_SUBSCRIPTION', 'PERIODIC'
    staleness_tolerance TEXT,            -- '5_MINUTES', '1_HOUR', 'EVENTUAL'
    metadata JSONB DEFAULT '{}'
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cross_agg_ref_unique
    ON system.cross_aggregate_references(
        source_schema, source_table, source_column,
        target_schema, target_table, target_column
    );

COMMENT ON TABLE system.cross_aggregate_references IS
    'V7.0 Layer A: Cross-aggregate soft FK reference documentation';

COMMIT;


-- ─── Source: 0028_v7_layer_b_new_dimensions.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0028: V7.0 LAYER B
-- 7 new measurement dimensions (Dimensions 19-25)
-- Tables: event_schemas, authorization_tuples, authorization_rules,
--         digital_signatures, signing_keys, translations,
--         federation_locales, data_quality_rules, data_quality_results,
--         data_quality_scores, access_audit_log,
--         notification_preferences, notification_deliveries,
--         notification_templates
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- DIM 19: EVENT SCHEMA GOVERNANCE
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tournament.event_schemas (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    event_type TEXT NOT NULL,                -- 'MATCH_STARTED', 'SCORE_AWARDED'
    schema_version INTEGER NOT NULL,

    -- Schema definition (JSON Schema format)
    schema_definition JSONB NOT NULL,

    -- Compatibility
    compatibility_mode TEXT NOT NULL DEFAULT 'BACKWARD'
        CHECK (compatibility_mode IN ('BACKWARD', 'FORWARD', 'FULL', 'NONE')),

    -- Lifecycle
    status TEXT NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'ACTIVE', 'DEPRECATED', 'RETIRED')),

    -- Ownership
    owner_service TEXT NOT NULL,              -- 'competition_service'
    consumers TEXT[],                         -- ['results_service', 'analytics']

    -- Validation stats
    total_events_validated BIGINT DEFAULT 0,
    validation_failure_count BIGINT DEFAULT 0,
    last_validation_failure JSONB,

    published_at TIMESTAMPTZ,
    deprecated_at TIMESTAMPTZ,
    retired_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_event_schemas_type_version
    ON tournament.event_schemas(event_type, schema_version);

COMMENT ON TABLE tournament.event_schemas IS
    'V7.0 Dim 19: Event schema registry for governance and validation';

-- ════════════════════════════════════════════════════════
-- DIM 20: ReBAC — RELATIONSHIP-BASED ACCESS CONTROL
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS core.authorization_tuples (
    id UUID PRIMARY KEY DEFAULT uuidv7(),

    -- Object (resource being accessed)
    object_type TEXT NOT NULL,             -- 'tournament', 'club', 'athlete', 'match'
    object_id UUID NOT NULL,

    -- Relation
    relation TEXT NOT NULL,                -- 'owner', 'member', 'coach', 'guardian'

    -- Subject (who has the relationship)
    subject_type TEXT NOT NULL,            -- 'user', 'role', 'group'
    subject_id UUID NOT NULL,

    -- Conditional
    condition JSONB,                       -- {"time_bound": "2026-03-15/2026-03-17"}

    -- Lifecycle
    granted_by UUID,
    granted_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    revoked_by UUID,

    metadata JSONB DEFAULT '{}'
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_authz_tuple_unique
    ON core.authorization_tuples(object_type, object_id, relation, subject_type, subject_id);
CREATE INDEX IF NOT EXISTS idx_authz_object
    ON core.authorization_tuples(object_type, object_id, relation);
CREATE INDEX IF NOT EXISTS idx_authz_subject
    ON core.authorization_tuples(subject_type, subject_id);

COMMENT ON TABLE core.authorization_tuples IS
    'V7.0 Dim 20: Zanzibar-style ReBAC relationship tuples';

CREATE TABLE IF NOT EXISTS core.authorization_rules (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    rule_name TEXT NOT NULL UNIQUE,
    description TEXT,

    -- Rule definition
    source_relation TEXT NOT NULL,        -- 'coach'
    source_object_type TEXT NOT NULL,     -- 'club'
    derived_permission TEXT NOT NULL,     -- 'view'
    target_object_type TEXT NOT NULL,     -- 'athlete'
    traversal_path TEXT NOT NULL,         -- 'club.members'

    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'
);

COMMENT ON TABLE core.authorization_rules IS
    'V7.0 Dim 20: Permission derivation rules for ReBAC';

-- ════════════════════════════════════════════════════════
-- DIM 21: CRYPTOGRAPHIC INTEGRITY — DIGITAL SIGNATURES
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS core.signing_keys (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    key_owner_type TEXT NOT NULL,         -- 'FEDERATION', 'TOURNAMENT', 'PLATFORM'
    key_owner_id UUID,

    public_key BYTEA NOT NULL,
    algorithm TEXT NOT NULL DEFAULT 'Ed25519',
    fingerprint TEXT NOT NULL UNIQUE,     -- SHA256 of public key

    status TEXT NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'ROTATED', 'REVOKED')),

    valid_from TIMESTAMPTZ DEFAULT now(),
    valid_until TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,

    -- Certificate chain (PKI structure)
    issuer_key_id UUID REFERENCES core.signing_keys(id),

    created_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'
);

COMMENT ON TABLE core.signing_keys IS
    'V7.0 Dim 21: PKI public key management for verification';

CREATE TABLE IF NOT EXISTS core.digital_signatures (
    id UUID PRIMARY KEY DEFAULT uuidv7(),

    -- What was signed
    signed_table TEXT NOT NULL,
    signed_record_id UUID NOT NULL,
    signed_data_hash TEXT NOT NULL,       -- SHA256 of data at signing time

    -- Signature
    signature BYTEA NOT NULL,
    signing_algorithm TEXT NOT NULL DEFAULT 'Ed25519',
    signer_public_key_id UUID NOT NULL REFERENCES core.signing_keys(id),

    -- Context
    signature_type TEXT NOT NULL
        CHECK (signature_type IN (
            'RESULT_CERTIFICATION', 'MEDAL_AWARD', 'BELT_PROMOTION',
            'DOPING_CLEARANCE', 'REFEREE_LICENSE', 'TOURNAMENT_SANCTION'
        )),

    -- Verification
    is_valid BOOLEAN DEFAULT true,
    revoked_at TIMESTAMPTZ,
    revocation_reason TEXT,

    -- Chain: link signatures for audit chain
    previous_signature_id UUID REFERENCES core.digital_signatures(id),
    chain_hash TEXT,

    signed_at TIMESTAMPTZ DEFAULT now(),
    signed_by UUID NOT NULL,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_digital_signatures_record
    ON core.digital_signatures(signed_table, signed_record_id);
CREATE INDEX IF NOT EXISTS idx_digital_signatures_type
    ON core.digital_signatures(signature_type);

COMMENT ON TABLE core.digital_signatures IS
    'V7.0 Dim 21: Tamper-proof digital signatures for legal documents';

-- ════════════════════════════════════════════════════════
-- DIM 22: INTERNATIONALIZATION (i18n)
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS platform.translations (
    id UUID PRIMARY KEY DEFAULT uuidv7(),

    entity_type TEXT NOT NULL,            -- 'tournament_category', 'scoring_criteria'
    entity_id UUID NOT NULL,
    field_name TEXT NOT NULL,             -- 'name', 'description', 'rules_text'

    -- Translation
    locale TEXT NOT NULL,                 -- BCP-47: 'vi-VN', 'en-US', 'th-TH'
    translated_text TEXT NOT NULL,

    -- Quality
    translation_status TEXT DEFAULT 'DRAFT'
        CHECK (translation_status IN ('DRAFT', 'MACHINE', 'HUMAN_REVIEWED', 'OFFICIAL')),
    translated_by UUID,
    reviewed_by UUID,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_translations_unique
    ON platform.translations(entity_type, entity_id, field_name, locale);

COMMENT ON TABLE platform.translations IS
    'V7.0 Dim 22: Centralized i18n translation store';

CREATE TABLE IF NOT EXISTS platform.federation_locales (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    federation_id UUID NOT NULL,
    locale TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_federation_locales_unique
    ON platform.federation_locales(federation_id, locale);

COMMENT ON TABLE platform.federation_locales IS
    'V7.0 Dim 22: Supported locales per federation';

-- ════════════════════════════════════════════════════════
-- DIM 23: DATA QUALITY FRAMEWORK
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.data_quality_rules (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    rule_name TEXT NOT NULL UNIQUE,

    table_name TEXT NOT NULL,

    rule_type TEXT NOT NULL
        CHECK (rule_type IN (
            'COMPLETENESS', 'ACCURACY', 'CONSISTENCY',
            'TIMELINESS', 'UNIQUENESS', 'REFERENTIAL', 'CUSTOM'
        )),

    check_sql TEXT NOT NULL,             -- SQL returning violation count
    severity TEXT NOT NULL DEFAULT 'WARNING'
        CHECK (severity IN ('CRITICAL', 'WARNING', 'INFO')),

    threshold_warning DECIMAL(5,2),
    threshold_critical DECIMAL(5,2),

    is_active BOOLEAN DEFAULT true,
    schedule TEXT DEFAULT 'DAILY',       -- 'HOURLY', 'DAILY', 'WEEKLY', 'ON_DEMAND'
    metadata JSONB DEFAULT '{}'
);

COMMENT ON TABLE system.data_quality_rules IS
    'V7.0 Dim 23: Data quality monitoring rules';

CREATE TABLE IF NOT EXISTS system.data_quality_results (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    rule_id UUID NOT NULL REFERENCES system.data_quality_rules(id),

    total_records BIGINT NOT NULL,
    violation_count BIGINT NOT NULL,
    violation_rate DECIMAL(7,4),

    sample_violations JSONB,

    status TEXT NOT NULL
        CHECK (status IN ('PASS', 'WARNING', 'CRITICAL')),

    previous_result_id UUID REFERENCES system.data_quality_results(id),
    rate_change DECIMAL(7,4),

    checked_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dq_results_rule
    ON system.data_quality_results(rule_id, checked_at DESC);

COMMENT ON TABLE system.data_quality_results IS
    'V7.0 Dim 23: Data quality check results';

CREATE TABLE IF NOT EXISTS system.data_quality_scores (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    table_name TEXT NOT NULL,
    overall_score DECIMAL(5,2) NOT NULL,

    completeness_score DECIMAL(5,2),
    accuracy_score DECIMAL(5,2),
    consistency_score DECIMAL(5,2),
    timeliness_score DECIMAL(5,2),

    calculated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE system.data_quality_scores IS
    'V7.0 Dim 23: Aggregate quality scores per table';

-- ════════════════════════════════════════════════════════
-- DIM 24: READ ACCESS AUDIT
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.access_audit_log (
    id UUID PRIMARY KEY DEFAULT uuidv7(),

    user_id UUID NOT NULL,
    user_role TEXT,
    session_id UUID,
    ip_address INET,
    device_id UUID,

    resource_type TEXT NOT NULL,          -- 'athlete_medical_record', 'doping_test'
    resource_id UUID NOT NULL,
    accessed_fields TEXT[],

    access_type TEXT NOT NULL
        CHECK (access_type IN (
            'VIEW', 'EXPORT', 'API_READ',
            'REPORT_INCLUDE', 'SEARCH_RESULT', 'BULK_EXPORT'
        )),

    access_justification TEXT,

    endpoint TEXT,
    query_params JSONB,

    accessed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_access_audit_user
    ON system.access_audit_log(user_id, accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_audit_resource
    ON system.access_audit_log(resource_type, resource_id);

COMMENT ON TABLE system.access_audit_log IS
    'V7.0 Dim 24: Read access audit log for confidential data';

-- ════════════════════════════════════════════════════════
-- DIM 25: NOTIFICATION ORCHESTRATION
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID NOT NULL,

    category TEXT NOT NULL,                -- 'MATCH_CALL', 'RESULT_ANNOUNCEMENT', etc.

    channels JSONB NOT NULL DEFAULT '{}',

    quiet_hours_start TIME,
    quiet_hours_end TIME,
    quiet_hours_timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',
    quiet_hours_override TEXT[],           -- ['MATCH_CALL'] — bypass quiet hours

    preferred_locale TEXT DEFAULT 'vi-VN',

    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_prefs_unique
    ON system.notification_preferences(user_id, category);

COMMENT ON TABLE system.notification_preferences IS
    'V7.0 Dim 25: Multi-channel notification preferences per user';

CREATE TABLE IF NOT EXISTS system.notification_deliveries (
    id UUID PRIMARY KEY DEFAULT uuidv7(),

    user_id UUID NOT NULL,

    category TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    action_url TEXT,

    source_event_id UUID,
    source_context JSONB,

    channels_attempted TEXT[] NOT NULL,
    channels_delivered TEXT[],
    channels_failed TEXT[],
    channel_details JSONB,

    status TEXT NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'CANCELLED')),

    created_at TIMESTAMPTZ DEFAULT now(),
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_notification_deliveries_user
    ON system.notification_deliveries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_status
    ON system.notification_deliveries(status) WHERE status IN ('PENDING', 'SENT');

COMMENT ON TABLE system.notification_deliveries IS
    'V7.0 Dim 25: Notification delivery tracking';

-- Add columns that may be missing from earlier version of notification_templates
ALTER TABLE system.notification_templates
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'vi-VN',
  ADD COLUMN IF NOT EXISTS title_template TEXT,
  ADD COLUMN IF NOT EXISTS required_variables TEXT[],
  ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

CREATE TABLE IF NOT EXISTS system.notification_templates (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    category TEXT NOT NULL,
    channel TEXT NOT NULL,                  -- 'push', 'sms', 'email', 'zalo'
    locale TEXT NOT NULL DEFAULT 'vi-VN',

    title_template TEXT NOT NULL,
    body_template TEXT NOT NULL,

    required_variables TEXT[] NOT NULL,

    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    metadata JSONB DEFAULT '{}'
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_templates_unique
    ON system.notification_templates(category, channel, locale, version);

COMMENT ON TABLE system.notification_templates IS
    'V7.0 Dim 25: Localized notification templates';

COMMIT;


-- ─── Source: 0029_v7_layer_c_enterprise_patterns.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0029: V7.0 LAYER C
-- Enterprise-grade patterns (SportRadar/SPORTDATA benchmark)
-- Tables: resource_availability, scheduling_constraints,
--         generated_schedules, document_templates,
--         issued_documents, integrity_alerts, scoring_baselines
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- ENTERPRISE 1: RESOURCE SCHEDULING OPTIMIZATION
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tournament.resource_availability (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    resource_type TEXT NOT NULL,          -- 'TATAMI', 'REFEREE', 'MEDICAL_TEAM', 'JUDGE_PANEL'
    resource_id UUID NOT NULL,

    available_from TIMESTAMPTZ NOT NULL,
    available_until TIMESTAMPTZ NOT NULL,

    max_continuous_hours DECIMAL(4,2),
    break_minutes INTEGER,

    conflict_resource_ids UUID[],        -- Conflict of interest

    tournament_id UUID NOT NULL,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_resource_avail_tournament
    ON tournament.resource_availability(tournament_id, resource_type);

COMMENT ON TABLE tournament.resource_availability IS
    'V7.0 Enterprise: Resource availability windows for scheduling optimization';

CREATE TABLE IF NOT EXISTS tournament.scheduling_constraints (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    tournament_id UUID NOT NULL,

    constraint_type TEXT NOT NULL
        CHECK (constraint_type IN (
            'SAME_ATHLETE_GAP', 'CATEGORY_ORDER', 'CATEGORY_NOT_PARALLEL',
            'MEDAL_CEREMONY_SLOT', 'VIP_TIMESLOT', 'BROADCAST_WINDOW', 'CUSTOM'
        )),

    parameters JSONB NOT NULL,

    priority INTEGER DEFAULT 5,
    is_hard_constraint BOOLEAN DEFAULT false,

    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_scheduling_constraints_tournament
    ON tournament.scheduling_constraints(tournament_id);

COMMENT ON TABLE tournament.scheduling_constraints IS
    'V7.0 Enterprise: Constraint-based scheduling rules';

CREATE TABLE IF NOT EXISTS tournament.generated_schedules (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    tournament_id UUID NOT NULL,

    version INTEGER NOT NULL,
    status TEXT DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'OPTIMIZING', 'READY', 'PUBLISHED', 'SUPERSEDED')),

    total_duration_minutes INTEGER,
    utilization_rate DECIMAL(5,2),
    constraint_violations INTEGER,
    optimization_score DECIMAL(7,4),

    schedule_data JSONB NOT NULL,

    generated_by TEXT,
    generated_at TIMESTAMPTZ DEFAULT now(),
    published_at TIMESTAMPTZ,
    published_by UUID,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_generated_schedules_tournament
    ON tournament.generated_schedules(tournament_id, version DESC);

COMMENT ON TABLE tournament.generated_schedules IS
    'V7.0 Enterprise: Optimized schedule output from constraint solver';

-- ════════════════════════════════════════════════════════
-- ENTERPRISE 2: CERTIFICATE & DOCUMENT GENERATION
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS platform.document_templates (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    template_type TEXT NOT NULL
        CHECK (template_type IN (
            'MEDAL_CERTIFICATE', 'PARTICIPATION_CERT', 'BELT_PROMOTION_CERT',
            'REFEREE_LICENSE', 'TOURNAMENT_SANCTION', 'CLUB_REGISTRATION',
            'ATHLETE_CARD', 'MEDICAL_CLEARANCE', 'CUSTOM'
        )),

    template_html TEXT NOT NULL,
    template_css TEXT,

    required_fields TEXT[] NOT NULL,

    federation_id UUID,                  -- NULL = platform default

    version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT true,

    metadata JSONB DEFAULT '{}'
);

COMMENT ON TABLE platform.document_templates IS
    'V7.0 Enterprise: Certificate/document HTML templates';

CREATE TABLE IF NOT EXISTS platform.issued_documents (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    template_id UUID NOT NULL REFERENCES platform.document_templates(id),

    recipient_type TEXT NOT NULL,         -- 'ATHLETE', 'REFEREE', 'CLUB'
    recipient_id UUID NOT NULL,

    document_data JSONB NOT NULL,
    document_number TEXT NOT NULL UNIQUE, -- 'VCT-2026-MC-001234'

    signature_id UUID,                   -- References core.digital_signatures if signed

    verification_code TEXT NOT NULL UNIQUE,
    verification_url TEXT,

    pdf_storage_path TEXT,

    issued_at TIMESTAMPTZ DEFAULT now(),
    issued_by UUID NOT NULL,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    revocation_reason TEXT,

    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_issued_documents_recipient
    ON platform.issued_documents(recipient_type, recipient_id);

COMMENT ON TABLE platform.issued_documents IS
    'V7.0 Enterprise: Issued document tracking with QR verification';

-- ════════════════════════════════════════════════════════
-- ENTERPRISE 3: COMPETITION INTEGRITY — ANTI-MATCH-FIXING
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tournament.integrity_alerts (
    id UUID PRIMARY KEY DEFAULT uuidv7(),

    alert_type TEXT NOT NULL
        CHECK (alert_type IN (
            'UNUSUAL_SCORING_PATTERN', 'SUSPICIOUS_WITHDRAWAL',
            'REPEATED_PAIRING_ANOMALY', 'REFEREE_CONFLICT_OF_INTEREST',
            'BETTING_ANOMALY', 'IDENTITY_FRAUD', 'AGE_MANIPULATION',
            'WEIGHT_MANIPULATION', 'MANUAL_REPORT'
        )),

    severity TEXT NOT NULL DEFAULT 'MEDIUM'
        CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),

    trigger_source TEXT NOT NULL,         -- 'SYSTEM_AUTO', 'REFEREE_REPORT', 'AI_DETECTION'
    trigger_data JSONB NOT NULL,

    tournament_id UUID,
    match_id UUID,
    athlete_ids UUID[],
    referee_ids UUID[],

    status TEXT NOT NULL DEFAULT 'NEW'
        CHECK (status IN (
            'NEW', 'UNDER_REVIEW', 'INVESTIGATING',
            'SUBSTANTIATED', 'UNSUBSTANTIATED', 'CLOSED'
        )),
    assigned_to UUID,
    investigation_notes TEXT,

    outcome TEXT,
    disciplinary_action_ids UUID[],

    reported_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_integrity_alerts_status
    ON tournament.integrity_alerts(status) WHERE status NOT IN ('CLOSED', 'UNSUBSTANTIATED');
CREATE INDEX IF NOT EXISTS idx_integrity_alerts_tournament
    ON tournament.integrity_alerts(tournament_id);

COMMENT ON TABLE tournament.integrity_alerts IS
    'V7.0 Enterprise: Anti-match-fixing integrity alert system';

CREATE TABLE IF NOT EXISTS tournament.scoring_baselines (
    id UUID PRIMARY KEY DEFAULT uuidv7(),

    category_type TEXT NOT NULL,          -- 'DOI_KHANG_NAM_60KG'
    stat_type TEXT NOT NULL,              -- 'avg_score', 'score_stddev', 'ko_rate'

    baseline_value DECIMAL(10,4),
    sample_size INTEGER,
    confidence_interval DECIMAL(5,4),

    warning_deviation DECIMAL(5,2),
    critical_deviation DECIMAL(5,2),

    calculated_from TIMESTAMPTZ,
    calculated_to TIMESTAMPTZ,
    calculated_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'
);

COMMENT ON TABLE tournament.scoring_baselines IS
    'V7.0 Enterprise: Statistical baselines for anomaly detection';

COMMIT;


-- ─── Source: 0030_v7_layer_d_stress_tests.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0030: V7.0 LAYER D
-- Stress test support
-- Tables: federation_merges, sport_profiles, team_entries,
--         match_bouts, athlete_daily_loads,
--         auth_provider_mappings, storage_provider_mappings
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- STRESS 1: FEDERATION MERGES
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS core.federation_merges (
    id UUID PRIMARY KEY DEFAULT uuidv7(),

    source_federation_id UUID NOT NULL,
    target_federation_id UUID NOT NULL,

    status TEXT NOT NULL DEFAULT 'PLANNED'
        CHECK (status IN (
            'PLANNED', 'MAPPING', 'EXECUTING',
            'VALIDATING', 'COMPLETED', 'ROLLED_BACK'
        )),

    entity_mappings JSONB NOT NULL DEFAULT '{}',

    duplicate_athletes JSONB,
    duplicate_clubs JSONB,

    rollback_snapshot_id UUID,

    planned_at TIMESTAMPTZ DEFAULT now(),
    executed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    executed_by UUID,
    metadata JSONB DEFAULT '{}'
);

COMMENT ON TABLE core.federation_merges IS
    'V7.0 Stress 1: Federation merge/acquisition tracking';

-- ════════════════════════════════════════════════════════
-- STRESS 2: MULTI-SPORT PROFILES
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS platform.sport_profiles (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    sport_code TEXT NOT NULL UNIQUE,       -- 'VCT', 'TKD', 'JUD', 'KAR'
    sport_name TEXT NOT NULL,

    competition_types JSONB NOT NULL,
    weight_class_config JSONB NOT NULL,
    default_match_config JSONB NOT NULL,

    ranking_config JSONB,
    equipment_config JSONB,

    international_federation TEXT,
    national_federation TEXT,

    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'
);

COMMENT ON TABLE platform.sport_profiles IS
    'V7.0 Stress 2: Multi-sport configuration (VCT/TKD/JUD)';

-- Seed VCT sport profile
INSERT INTO platform.sport_profiles (
    sport_code, sport_name,
    competition_types, weight_class_config, default_match_config,
    international_federation, national_federation
) VALUES (
    'VCT', 'Vovinam - Việt Võ Đạo',
    '["DOI_KHANG", "QUYEN", "BINH_KHI", "SONG_LUYEN", "DA_LUYEN"]'::JSONB,
    '{"units": "kg", "classes_by_gender": true}'::JSONB,
    '{"rounds": 3, "round_duration_sec": 120, "break_sec": 60, "judges": 5, "scoring_type": "FLAG"}'::JSONB,
    'WVVF', 'LVNVN'
) ON CONFLICT (sport_code) DO NOTHING;

-- ════════════════════════════════════════════════════════
-- STRESS 3: TEAM EVENTS
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tournament.team_entries (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    entry_id UUID NOT NULL,              -- References tournament_entries

    athlete_id UUID NOT NULL,
    role_in_team TEXT NOT NULL,             -- 'CAPTAIN', 'MEMBER', 'RESERVE'
    order_in_team INTEGER,

    weight_class TEXT,

    status TEXT DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'SUBSTITUTED', 'WITHDRAWN', 'DISQUALIFIED')),
    substituted_by UUID,
    substitution_reason TEXT,

    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_team_entries_entry
    ON tournament.team_entries(entry_id);
CREATE INDEX IF NOT EXISTS idx_team_entries_athlete
    ON tournament.team_entries(athlete_id);

COMMENT ON TABLE tournament.team_entries IS
    'V7.0 Stress 3: Team event athlete composition';

CREATE TABLE IF NOT EXISTS tournament.match_bouts (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    match_id UUID NOT NULL,
    bout_number INTEGER NOT NULL,

    red_athlete_id UUID NOT NULL,
    blue_athlete_id UUID NOT NULL,

    winner_athlete_id UUID,
    result_type TEXT,                     -- 'POINTS', 'KO', 'SUBMISSION', 'WALKOVER'
    red_score JSONB,
    blue_score JSONB,

    status TEXT DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),

    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_match_bouts_match
    ON tournament.match_bouts(match_id, bout_number);

COMMENT ON TABLE tournament.match_bouts IS
    'V7.0 Stress 3: Individual bouts within team matches';

-- ════════════════════════════════════════════════════════
-- STRESS 4: ATHLETE DAILY LOAD TRACKING
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tournament.athlete_daily_loads (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    athlete_id UUID NOT NULL,
    tournament_id UUID NOT NULL,
    competition_date DATE NOT NULL,

    total_matches INTEGER DEFAULT 0,
    total_rounds INTEGER DEFAULT 0,
    total_competition_minutes INTEGER DEFAULT 0,
    total_rest_minutes INTEGER DEFAULT 0,

    max_matches_per_day INTEGER,
    max_rounds_per_day INTEGER,
    max_competition_minutes_per_day INTEGER,
    min_rest_between_matches_minutes INTEGER,

    load_status TEXT DEFAULT 'NORMAL'
        CHECK (load_status IN ('NORMAL', 'HIGH', 'EXCESSIVE', 'BLOCKED')),

    medical_clearance BOOLEAN DEFAULT false,
    medical_cleared_by UUID,

    last_updated TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_athlete_daily_load_unique
    ON tournament.athlete_daily_loads(athlete_id, tournament_id, competition_date);

COMMENT ON TABLE tournament.athlete_daily_loads IS
    'V7.0 Stress 4: Safety load tracking per athlete per day';

-- ════════════════════════════════════════════════════════
-- STRESS 5: VENDOR ABSTRACTION
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS core.auth_provider_mappings (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    internal_user_id UUID NOT NULL,

    provider TEXT NOT NULL,              -- 'SUPABASE', 'AUTH0', 'FIREBASE', 'KEYCLOAK'
    provider_user_id TEXT NOT NULL,

    migrated_from_provider TEXT,
    migrated_at TIMESTAMPTZ,

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_provider_unique
    ON core.auth_provider_mappings(provider, provider_user_id);
CREATE INDEX IF NOT EXISTS idx_auth_provider_internal_user
    ON core.auth_provider_mappings(internal_user_id);

COMMENT ON TABLE core.auth_provider_mappings IS
    'V7.0 Stress 5: Auth vendor abstraction layer';

CREATE TABLE IF NOT EXISTS system.storage_provider_mappings (
    id UUID PRIMARY KEY DEFAULT uuidv7(),

    logical_path TEXT NOT NULL UNIQUE,    -- 'athletes/photos/uuid.jpg'

    provider TEXT NOT NULL,              -- 'SUPABASE_STORAGE', 'S3', 'GCS'
    provider_path TEXT NOT NULL,
    provider_bucket TEXT,

    file_size BIGINT,
    content_type TEXT,
    checksum TEXT,

    uploaded_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'
);

COMMENT ON TABLE system.storage_provider_mappings IS
    'V7.0 Stress 5: Storage vendor abstraction layer';

COMMIT;


-- ─── Source: 0031_uuid_v7_upgrade.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0031: UUID v7 Upgrade
-- Replace gen_random_uuid() (v4) with time-ordered UUID v7
-- RFC 9562 compliant — sortable, better B-tree locality
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. CREATE uuidv7() FUNCTION
--    Pure PL/pgSQL — no extensions required
--    Layout: [48-bit timestamp_ms][4-bit version=7][12-bit rand_a][2-bit variant=10][62-bit rand_b]
-- ════════════════════════════════════════════════════════

-- Skip uuidv7() creation on Neon (built-in function)
DO $outer$
BEGIN
  CREATE OR REPLACE FUNCTION uuidv7() RETURNS UUID AS $$
  DECLARE
      v_time  BIGINT;
      v_bytes BYTEA;
      v_hex   TEXT;
  BEGIN
      v_time := (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT;
      v_bytes := gen_random_bytes(16);
      v_bytes := set_byte(v_bytes, 0, ((v_time >> 40) & 255)::INT);
      v_bytes := set_byte(v_bytes, 1, ((v_time >> 32) & 255)::INT);
      v_bytes := set_byte(v_bytes, 2, ((v_time >> 24) & 255)::INT);
      v_bytes := set_byte(v_bytes, 3, ((v_time >> 16) & 255)::INT);
      v_bytes := set_byte(v_bytes, 4, ((v_time >>  8) & 255)::INT);
      v_bytes := set_byte(v_bytes, 5, ( v_time        & 255)::INT);
      v_bytes := set_byte(v_bytes, 6, (get_byte(v_bytes, 6) & 15) | 112);
      v_bytes := set_byte(v_bytes, 8, (get_byte(v_bytes, 8) & 63) | 128);
      v_hex := encode(v_bytes, 'hex');
      RETURN (
          substr(v_hex,  1, 8) || '-' ||
          substr(v_hex,  9, 4) || '-' ||
          substr(v_hex, 13, 4) || '-' ||
          substr(v_hex, 17, 4) || '-' ||
          substr(v_hex, 21, 12)
      )::UUID;
  END;
  $$ LANGUAGE plpgsql VOLATILE;
EXCEPTION WHEN insufficient_privilege THEN
  -- uuidv7() is a built-in function on Neon, skip
  RAISE NOTICE 'uuidv7() is a built-in function, skipping creation';
END $outer$;

-- ════════════════════════════════════════════════════════
-- 2. ALTER ALL EXISTING TABLE DEFAULTS
--    Change from gen_random_uuid() → uuidv7()
-- ════════════════════════════════════════════════════════

-- ── Core tables (from 0002 relational schema via postgres_store) ──
ALTER TABLE IF EXISTS users              ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS tournaments        ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS age_groups         ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS content_categories ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS weight_classes     ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS teams              ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS athletes           ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS registrations      ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS referees           ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS arenas             ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS referee_assignments ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS combat_matches     ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS form_performances  ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS weigh_ins          ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS schedule_entries   ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS appeals            ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS notifications      ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS medical_records    ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS media_files        ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS data_audit_log     ALTER COLUMN id SET DEFAULT uuidv7();

-- ── Scoring & Events (from 0003) ──
ALTER TABLE IF EXISTS tournament.scoring_criteria     ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS tournament.judge_scores         ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS tournament.match_events         ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS tournament.tournament_results   ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS tournament.tournament_entries   ALTER COLUMN id SET DEFAULT uuidv7();

-- ── Audit Logs (from 0025) ──
ALTER TABLE IF EXISTS system.audit_logs              ALTER COLUMN id SET DEFAULT uuidv7();

-- ── V7.0 Layer A (from 0027) ──
ALTER TABLE IF EXISTS core.athlete_data_keys           ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS core.erasure_tombstones          ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS system.conflict_resolution_rules ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS system.sync_conflicts            ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS system.view_contracts            ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS system.config_changelog          ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS system.cross_aggregate_references ALTER COLUMN id SET DEFAULT uuidv7();

-- ── V7.0 Layer B (from 0028) ──
ALTER TABLE IF EXISTS tournament.event_schemas           ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS core.authorization_tuples          ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS core.authorization_rules           ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS core.signing_keys                  ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS core.digital_signatures            ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS platform.translations              ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS platform.federation_locales        ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS system.data_quality_rules          ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS system.data_quality_results        ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS system.data_quality_scores         ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS system.access_audit_log            ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS system.notification_preferences    ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS system.notification_deliveries     ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS system.notification_templates      ALTER COLUMN id SET DEFAULT uuidv7();

-- ── V7.0 Layer C (from 0029) ──
ALTER TABLE IF EXISTS tournament.resource_availability   ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS tournament.scheduling_constraints  ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS tournament.generated_schedules     ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS platform.document_templates        ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS platform.issued_documents          ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS tournament.integrity_alerts        ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS tournament.scoring_baselines       ALTER COLUMN id SET DEFAULT uuidv7();

-- ── V7.0 Layer D (from 0030) ──
ALTER TABLE IF EXISTS core.federation_merges             ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS platform.sport_profiles            ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS tournament.team_entries             ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS tournament.match_bouts              ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS tournament.athlete_daily_loads      ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS core.auth_provider_mappings         ALTER COLUMN id SET DEFAULT uuidv7();
ALTER TABLE IF EXISTS system.storage_provider_mappings    ALTER COLUMN id SET DEFAULT uuidv7();

COMMIT;


-- ─── Source: 0032_v7_seeds_functions_indexes.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0032: V7.0 SEEDS, FUNCTIONS & INDEXES
-- Seed data, validate_view_contract() function, comprehensive indexes
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. SEED DATA — Conflict Resolution Rules
--    (Referenced in prompt lines 172-175)
-- ════════════════════════════════════════════════════════

INSERT INTO system.conflict_resolution_rules (table_name, field_name, strategy, domain_logic, is_active)
VALUES
    ('judge_scores', NULL, 'MANUAL',
     'Điểm trọng tài phải do Jury President quyết định khi conflict', true),
    ('match_events', NULL, 'LAST_WRITE_WINS',
     'Events append-only, conflict = duplicate detection', true),
    ('weigh_ins', 'weight_value', 'MANUAL',
     'Cân nặng chỉ có 1 giá trị đúng, cần xác minh thực tế', true),
    ('registrations', NULL, 'LAST_WRITE_WINS',
     'Hồ sơ đăng ký — version mới nhất thắng', true),
    ('athletes', 'status', 'HIGHER_AUTHORITY',
     'Trạng thái VĐV — role cao hơn quyết định', true)
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════
-- 2. FUNCTION: validate_view_contract()
--    Checks actual view columns vs expected_columns
--    Updates validation_status in view_contracts
--    (Referenced in prompt lines 222-224)
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION validate_view_contract(
    p_view_name TEXT,
    p_version INTEGER
) RETURNS TABLE (
    contract_id UUID,
    validation_status TEXT,
    errors JSONB
) AS $$
DECLARE
    v_contract_id UUID;
    v_expected JSONB;
    v_actual JSONB;
    v_errors JSONB := '[]'::JSONB;
    v_schema TEXT;
    v_view TEXT;
    v_parts TEXT[];
    rec RECORD;
BEGIN
    -- 1) Find the contract
    SELECT vc.id, vc.expected_columns INTO v_contract_id, v_expected
    FROM system.view_contracts vc
    WHERE vc.view_name = p_view_name AND vc.version = p_version;

    IF v_contract_id IS NULL THEN
        RETURN QUERY SELECT NULL::UUID, 'NOT_FOUND'::TEXT, '["Contract not found"]'::JSONB;
        RETURN;
    END IF;

    -- 2) Parse schema.view_name
    v_parts := string_to_array(p_view_name, '.');
    IF array_length(v_parts, 1) = 2 THEN
        v_schema := v_parts[1];
        v_view := v_parts[2];
    ELSE
        v_schema := 'public';
        v_view := p_view_name;
    END IF;

    -- 3) Get actual columns from information_schema
    SELECT jsonb_agg(
        jsonb_build_object(
            'name', c.column_name,
            'type', c.data_type,
            'nullable', CASE WHEN c.is_nullable = 'YES' THEN true ELSE false END
        ) ORDER BY c.ordinal_position
    ) INTO v_actual
    FROM information_schema.columns c
    WHERE c.table_schema = v_schema AND c.table_name = v_view;

    IF v_actual IS NULL THEN
        UPDATE system.view_contracts
        SET validation_status = 'BROKEN',
            validation_errors = '["View does not exist"]'::JSONB,
            last_validated_at = now()
        WHERE id = v_contract_id;

        RETURN QUERY SELECT v_contract_id, 'BROKEN'::TEXT, '["View does not exist"]'::JSONB;
        RETURN;
    END IF;

    -- 4) Compare expected vs actual
    FOR rec IN SELECT * FROM jsonb_array_elements(v_expected) AS e(col)
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM jsonb_array_elements(v_actual) AS a(col)
            WHERE a.col->>'name' = rec.col->>'name'
        ) THEN
            v_errors := v_errors || jsonb_build_array(
                format('Missing column: %s', rec.col->>'name')
            );
        END IF;
    END LOOP;

    -- 5) Update contract
    IF jsonb_array_length(v_errors) = 0 THEN
        UPDATE system.view_contracts
        SET validation_status = 'VALID',
            validation_errors = NULL,
            last_validated_at = now()
        WHERE id = v_contract_id;

        RETURN QUERY SELECT v_contract_id, 'VALID'::TEXT, NULL::JSONB;
    ELSE
        UPDATE system.view_contracts
        SET validation_status = 'BROKEN',
            validation_errors = v_errors,
            last_validated_at = now()
        WHERE id = v_contract_id;

        RETURN QUERY SELECT v_contract_id, 'BROKEN'::TEXT, v_errors;
    END IF;

    RETURN;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_view_contract(TEXT, INTEGER) IS
    'V7.0 Contract Testing: validates view columns against view_contracts.expected_columns';

-- ════════════════════════════════════════════════════════
-- 3. COMPREHENSIVE INDEXES FOR V7.0 TABLES
-- ════════════════════════════════════════════════════════

-- ── Layer A ──

-- athlete_data_keys
DO $$
DECLARE
  v_indexes TEXT[] := ARRAY[
    'CREATE INDEX IF NOT EXISTS idx_adk_athlete ON core.athlete_data_keys(athlete_id)',
    'CREATE INDEX IF NOT EXISTS idx_adk_status ON core.athlete_data_keys(status) WHERE status = ''ACTIVE''',
    'CREATE INDEX IF NOT EXISTS idx_tombstones_athlete ON core.erasure_tombstones(original_athlete_id)',
    'CREATE INDEX IF NOT EXISTS idx_tombstones_executed ON core.erasure_tombstones(executed_at) WHERE executed_at IS NOT NULL',
    'CREATE INDEX IF NOT EXISTS idx_sync_conflicts_status ON system.sync_conflicts(status) WHERE status != ''RESOLVED''',
    'CREATE INDEX IF NOT EXISTS idx_sync_conflicts_record ON system.sync_conflicts(table_name, record_id)',
    'CREATE INDEX IF NOT EXISTS idx_config_changelog_table ON system.config_changelog(config_table, config_id)',
    'CREATE INDEX IF NOT EXISTS idx_config_changelog_tournament ON system.config_changelog(tournament_id) WHERE tournament_id IS NOT NULL',
    'CREATE INDEX IF NOT EXISTS idx_config_changelog_time ON system.config_changelog(changed_at DESC)',
    'CREATE INDEX IF NOT EXISTS idx_view_contracts_name ON system.view_contracts(view_name, version)',
    'CREATE INDEX IF NOT EXISTS idx_view_contracts_status ON system.view_contracts(validation_status) WHERE validation_status = ''BROKEN''',
    'CREATE INDEX IF NOT EXISTS idx_event_schemas_type ON tournament.event_schemas(event_type, schema_version)',
    'CREATE INDEX IF NOT EXISTS idx_event_schemas_active ON tournament.event_schemas(status) WHERE status = ''ACTIVE''',
    'CREATE INDEX IF NOT EXISTS idx_authz_object ON core.authorization_tuples(object_type, object_id, relation)',
    'CREATE INDEX IF NOT EXISTS idx_authz_subject ON core.authorization_tuples(subject_type, subject_id)',
    'CREATE INDEX IF NOT EXISTS idx_authz_active ON core.authorization_tuples(object_type, object_id, relation, subject_type, subject_id) WHERE revoked_at IS NULL',
    'CREATE INDEX IF NOT EXISTS idx_signatures_record ON core.digital_signatures(signed_table, signed_record_id)',
    'CREATE INDEX IF NOT EXISTS idx_signatures_chain ON core.digital_signatures(previous_signature_id) WHERE previous_signature_id IS NOT NULL',
    'CREATE INDEX IF NOT EXISTS idx_translations_entity ON platform.translations(entity_type, entity_id, field_name, locale)',
    'CREATE INDEX IF NOT EXISTS idx_dq_rules_table ON system.data_quality_rules(table_name) WHERE is_active = true',
    'CREATE INDEX IF NOT EXISTS idx_dq_results_rule ON system.data_quality_results(rule_id, checked_at DESC)',
    'CREATE INDEX IF NOT EXISTS idx_dq_results_status ON system.data_quality_results(status) WHERE status IN (''WARNING'', ''CRITICAL'')',
    'CREATE INDEX IF NOT EXISTS idx_dq_scores_table ON system.data_quality_scores(table_name, calculated_at DESC)',
    'CREATE INDEX IF NOT EXISTS idx_access_audit_user ON system.access_audit_log(user_id, accessed_at DESC)',
    'CREATE INDEX IF NOT EXISTS idx_access_audit_resource ON system.access_audit_log(resource_type, resource_id)',
    'CREATE INDEX IF NOT EXISTS idx_access_audit_time ON system.access_audit_log(accessed_at DESC)',
    'CREATE INDEX IF NOT EXISTS idx_notif_pref_user ON system.notification_preferences(user_id, category)',
    'CREATE INDEX IF NOT EXISTS idx_notif_delivery_user ON system.notification_deliveries(user_id, status)',
    'CREATE INDEX IF NOT EXISTS idx_notif_delivery_pending ON system.notification_deliveries(status, created_at) WHERE status IN (''PENDING'', ''SENT'')',
    'CREATE INDEX IF NOT EXISTS idx_notif_templates_active ON system.notification_templates(category, channel, locale) WHERE is_active = true',
    'CREATE INDEX IF NOT EXISTS idx_resource_avail_tournament ON tournament.resource_availability(tournament_id)',
    'CREATE INDEX IF NOT EXISTS idx_resource_avail_type ON tournament.resource_availability(resource_type, resource_id)',
    'CREATE INDEX IF NOT EXISTS idx_sched_constraints_tournament ON tournament.scheduling_constraints(tournament_id)',
    'CREATE INDEX IF NOT EXISTS idx_gen_schedules_tournament ON tournament.generated_schedules(tournament_id, version DESC)',
    'CREATE INDEX IF NOT EXISTS idx_gen_schedules_published ON tournament.generated_schedules(status) WHERE status = ''PUBLISHED''',
    'CREATE INDEX IF NOT EXISTS idx_doc_templates_type ON platform.document_templates(template_type) WHERE is_active = true',
    'CREATE INDEX IF NOT EXISTS idx_issued_docs_recipient ON platform.issued_documents(recipient_type, recipient_id)',
    'CREATE INDEX IF NOT EXISTS idx_issued_docs_number ON platform.issued_documents(document_number)',
    'CREATE INDEX IF NOT EXISTS idx_issued_docs_verification ON platform.issued_documents(verification_code)',
    'CREATE INDEX IF NOT EXISTS idx_integrity_alerts_tournament ON tournament.integrity_alerts(tournament_id, status)',
    'CREATE INDEX IF NOT EXISTS idx_integrity_alerts_severity ON tournament.integrity_alerts(severity) WHERE status NOT IN (''CLOSED'', ''UNSUBSTANTIATED'')',
    'CREATE INDEX IF NOT EXISTS idx_integrity_alerts_assigned ON tournament.integrity_alerts(assigned_to) WHERE assigned_to IS NOT NULL AND status IN (''UNDER_REVIEW'', ''INVESTIGATING'')',
    'CREATE INDEX IF NOT EXISTS idx_scoring_baselines_category ON tournament.scoring_baselines(category_type, stat_type)',
    'CREATE INDEX IF NOT EXISTS idx_federation_merges_status ON core.federation_merges(status) WHERE status NOT IN (''COMPLETED'', ''ROLLED_BACK'')',
    'CREATE INDEX IF NOT EXISTS idx_sport_profiles_code ON platform.sport_profiles(sport_code) WHERE is_active = true',
    'CREATE INDEX IF NOT EXISTS idx_team_entries_entry ON tournament.team_entries(entry_id)',
    'CREATE INDEX IF NOT EXISTS idx_team_entries_athlete ON tournament.team_entries(athlete_id)',
    'CREATE INDEX IF NOT EXISTS idx_match_bouts_match ON tournament.match_bouts(match_id, bout_number)',
    'CREATE INDEX IF NOT EXISTS idx_daily_loads_athlete ON tournament.athlete_daily_loads(athlete_id, competition_date)',
    'CREATE INDEX IF NOT EXISTS idx_daily_loads_tournament ON tournament.athlete_daily_loads(tournament_id, competition_date)',
    'CREATE INDEX IF NOT EXISTS idx_daily_loads_status ON tournament.athlete_daily_loads(load_status) WHERE load_status IN (''HIGH'', ''EXCESSIVE'', ''BLOCKED'')',
    'CREATE INDEX IF NOT EXISTS idx_auth_provider_user ON core.auth_provider_mappings(internal_user_id)',
    'CREATE INDEX IF NOT EXISTS idx_auth_provider_external ON core.auth_provider_mappings(provider, provider_user_id)',
    'CREATE INDEX IF NOT EXISTS idx_storage_provider_path ON system.storage_provider_mappings(logical_path)'
  ];
  v_sql TEXT;
  v_ok INT := 0;
  v_skip INT := 0;
BEGIN
  FOREACH v_sql IN ARRAY v_indexes LOOP
    BEGIN
      EXECUTE v_sql;
      v_ok := v_ok + 1;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipped index: %', SQLERRM;
      v_skip := v_skip + 1;
    END;
  END LOOP;
  RAISE NOTICE 'V7 indexes: % created, % skipped', v_ok, v_skip;
END $$;

COMMIT;


-- ─── Source: 0033_v7_aggregate_schemas.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0033: V7.0 AGGREGATE ENFORCEMENT SCHEMAS
-- Additional schemas per V7.0 DDD aggregate boundaries
-- (Complement to 0004's core/tournament/people/training/platform/system/api_v1)
-- ===============================================================

BEGIN;

-- V7.0 specifies aggregate-level schema isolation:
-- "Mỗi aggregate = 1 schema"
-- 0004 created: core, tournament, people, training, platform, system, api_v1
-- V7.0 adds these additional bounded context schemas:

CREATE SCHEMA IF NOT EXISTS iam;             -- Identity & Access Management (ReBAC lives here)
CREATE SCHEMA IF NOT EXISTS athlete;         -- Athlete lifecycle aggregate
CREATE SCHEMA IF NOT EXISTS registration;    -- Registration workflow aggregate
CREATE SCHEMA IF NOT EXISTS competition;     -- Live competition aggregate
CREATE SCHEMA IF NOT EXISTS results;         -- Results certification aggregate
CREATE SCHEMA IF NOT EXISTS governance;      -- Disciplinary & compliance aggregate
CREATE SCHEMA IF NOT EXISTS heritage;        -- Cultural preservation aggregate
CREATE SCHEMA IF NOT EXISTS community;       -- News, forums, announcements
CREATE SCHEMA IF NOT EXISTS infrastructure;  -- Cross-aggregate references, vendor abstraction
CREATE SCHEMA IF NOT EXISTS api;             -- Cross-aggregate stable views (V7.0 addition)

-- Grant usage to application role (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'vct_app') THEN
        EXECUTE 'GRANT USAGE ON SCHEMA iam TO vct_app';
        EXECUTE 'GRANT USAGE ON SCHEMA athlete TO vct_app';
        EXECUTE 'GRANT USAGE ON SCHEMA registration TO vct_app';
        EXECUTE 'GRANT USAGE ON SCHEMA competition TO vct_app';
        EXECUTE 'GRANT USAGE ON SCHEMA results TO vct_app';
        EXECUTE 'GRANT USAGE ON SCHEMA governance TO vct_app';
        EXECUTE 'GRANT USAGE ON SCHEMA heritage TO vct_app';
        EXECUTE 'GRANT USAGE ON SCHEMA community TO vct_app';
        EXECUTE 'GRANT USAGE ON SCHEMA infrastructure TO vct_app';
        EXECUTE 'GRANT USAGE ON SCHEMA api TO vct_app';
    END IF;
END $$;

COMMENT ON SCHEMA iam IS 'V7.0: Identity & Access Management — ReBAC tuples, authorization rules';
COMMENT ON SCHEMA athlete IS 'V7.0: Athlete lifecycle — profiles, data keys, erasure';
COMMENT ON SCHEMA registration IS 'V7.0: Registration workflow — entries, team entries, weigh-ins';
COMMENT ON SCHEMA competition IS 'V7.0: Live competition — matches, bouts, scoring, events';
COMMENT ON SCHEMA results IS 'V7.0: Results certification — digital signatures, certificates';
COMMENT ON SCHEMA governance IS 'V7.0: Governance — integrity alerts, disciplinary actions';
COMMENT ON SCHEMA heritage IS 'V7.0: Cultural preservation — heritage artifacts, oral history';
COMMENT ON SCHEMA community IS 'V7.0: Community — news, announcements, forums';
COMMENT ON SCHEMA infrastructure IS 'V7.0: Infrastructure — cross-aggregate refs, vendor mappings, config';
COMMENT ON SCHEMA api IS 'V7.0: Cross-aggregate stable views for application layer';

COMMIT;


-- ─── Source: 0034_v7_api_views.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0034: V7.0 API STABLE VIEWS
-- Read-only views in api_v1 schema for application consumption
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. DATA QUALITY DASHBOARD VIEW
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW api_v1.data_quality_dashboard AS
SELECT
    s.table_name,
    s.overall_score,
    s.completeness_score,
    s.accuracy_score,
    s.consistency_score,
    s.timeliness_score,
    s.calculated_at,
    (
        SELECT count(*) FROM system.data_quality_results r
        JOIN system.data_quality_rules rl ON rl.id = r.rule_id
        WHERE rl.table_name = s.table_name AND r.status = 'CRITICAL'
    ) AS critical_count,
    (
        SELECT count(*) FROM system.data_quality_results r
        JOIN system.data_quality_rules rl ON rl.id = r.rule_id
        WHERE rl.table_name = s.table_name AND r.status = 'WARNING'
    ) AS warning_count
FROM system.data_quality_scores s
WHERE s.calculated_at = (
    SELECT MAX(s2.calculated_at) FROM system.data_quality_scores s2
    WHERE s2.table_name = s.table_name
);

-- ════════════════════════════════════════════════════════
-- 2. DATA QUALITY RULES STATUS VIEW
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW api_v1.data_quality_rules_status AS
SELECT
    rl.id AS rule_id,
    rl.rule_name,
    rl.table_name,
    rl.rule_type,
    rl.severity,
    rl.is_active,
    r.status AS last_status,
    r.violation_count AS last_violations,
    r.total_records AS last_total,
    r.violation_rate AS last_rate,
    r.checked_at AS last_checked
FROM system.data_quality_rules rl
LEFT JOIN LATERAL (
    SELECT * FROM system.data_quality_results res
    WHERE res.rule_id = rl.id
    ORDER BY res.checked_at DESC LIMIT 1
) r ON true
WHERE rl.is_active = true;

-- ════════════════════════════════════════════════════════
-- 3. NOTIFICATION HISTORY VIEW
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW api_v1.notification_history AS
SELECT
    d.id,
    d.user_id,
    d.category,
    d.title,
    d.body,
    d.action_url,
    d.status,
    d.channels_attempted,
    d.channels_delivered,
    d.channels_failed,
    d.created_at,
    d.delivered_at,
    d.read_at
FROM system.notification_deliveries d
ORDER BY d.created_at DESC;

-- ════════════════════════════════════════════════════════
-- 4. ACTIVE INTEGRITY ALERTS VIEW
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW api_v1.active_integrity_alerts AS
SELECT
    ia.id,
    ia.alert_type,
    ia.severity,
    ia.trigger_source,
    ia.tournament_id,
    ia.match_id,
    ia.athlete_ids,
    ia.referee_ids,
    ia.status,
    ia.assigned_to,
    ia.investigation_notes,
    ia.reported_at,
    ia.resolved_at,
    ia.metadata
FROM tournament.integrity_alerts ia
WHERE ia.status NOT IN ('CLOSED', 'UNSUBSTANTIATED')
ORDER BY
    CASE ia.severity
        WHEN 'CRITICAL' THEN 1
        WHEN 'HIGH' THEN 2
        WHEN 'MEDIUM' THEN 3
        WHEN 'LOW' THEN 4
    END,
    ia.reported_at DESC;

-- ════════════════════════════════════════════════════════
-- 5. ISSUED DOCUMENTS VIEW (with verification)
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW api_v1.issued_documents_list AS
SELECT
    doc.id,
    doc.document_number,
    dt.template_type,
    doc.recipient_type,
    doc.recipient_id,
    doc.document_data,
    doc.verification_code,
    doc.verification_url,
    doc.issued_at,
    doc.expires_at,
    doc.revoked_at,
    CASE
        WHEN doc.revoked_at IS NOT NULL THEN 'REVOKED'
        WHEN doc.expires_at IS NOT NULL AND doc.expires_at < now() THEN 'EXPIRED'
        ELSE 'VALID'
    END AS document_status
FROM platform.issued_documents doc
JOIN platform.document_templates dt ON dt.id = doc.template_id
ORDER BY doc.issued_at DESC;

-- ════════════════════════════════════════════════════════
-- 6. AUTHORIZATION CHECK VIEW (simplified ReBAC lookup)
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW api_v1.active_authorizations AS
SELECT
    at.id,
    at.object_type,
    at.object_id,
    at.relation,
    at.subject_type,
    at.subject_id,
    at.condition,
    at.granted_at,
    at.expires_at
FROM core.authorization_tuples at
WHERE at.revoked_at IS NULL
    AND (at.expires_at IS NULL OR at.expires_at > now());

-- ════════════════════════════════════════════════════════
-- 7. SYNC CONFLICTS PENDING VIEW
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW api_v1.pending_sync_conflicts AS
SELECT
    sc.id,
    sc.table_name,
    sc.record_id,
    sc.resolution_strategy,
    sc.status,
    sc.version_a,
    sc.version_a_timestamp,
    sc.version_b,
    sc.version_b_timestamp,
    sc.detected_at
FROM system.sync_conflicts sc
WHERE sc.status IN ('DETECTED', 'PENDING_MANUAL', 'ESCALATED')
ORDER BY sc.detected_at DESC;

-- ════════════════════════════════════════════════════════
-- 8. RESOURCE SCHEDULING VIEW
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW api_v1.resource_schedule AS
SELECT
    ra.id,
    ra.resource_type,
    ra.resource_id,
    ra.tournament_id,
    ra.available_from,
    ra.available_until,
    ra.max_continuous_hours,
    ra.break_minutes,
    ra.conflict_resource_ids
FROM tournament.resource_availability ra
ORDER BY ra.tournament_id, ra.resource_type, ra.available_from;

COMMIT;


-- ─── Source: 0035_associations.sql ──────────────────────────
-- ════════════════════════════════════════════════════════════════
-- VCT PLATFORM — Migration #0035: Associations & Sub-Associations
-- Adds tables for district-level associations (Hội) and
-- ward-level sub-associations (Chi hội).
-- ════════════════════════════════════════════════════════════════

-- ── Prerequisite: provinces table ──
CREATE TABLE IF NOT EXISTS provinces (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    code            TEXT NOT NULL UNIQUE,
    region          TEXT,
    population      INT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Prerequisite: provincial_clubs table ──
CREATE TABLE IF NOT EXISTS provincial_clubs (
    id              TEXT PRIMARY KEY,
    province_id     TEXT NOT NULL REFERENCES provinces(id),
    name            TEXT NOT NULL,
    code            TEXT UNIQUE,
    address         TEXT,
    phone           TEXT,
    email           TEXT,
    president_name  TEXT,
    status          TEXT NOT NULL DEFAULT 'active',
    total_members   INT NOT NULL DEFAULT 0,
    founded_date    DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Association status type ──
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'association_status') THEN
        CREATE TYPE association_status AS ENUM
            ('pending','active','suspended','inactive','rejected');
    END IF;
END $$;

-- ── Provincial Associations (Hội Quận/Huyện) ──
CREATE TABLE IF NOT EXISTS provincial_associations (
    id              TEXT PRIMARY KEY,
    province_id     TEXT NOT NULL REFERENCES provinces(id),
    name            TEXT NOT NULL,
    short_name      TEXT,
    code            TEXT NOT NULL UNIQUE,
    district        TEXT NOT NULL,
    address         TEXT,
    phone           TEXT,
    email           TEXT,
    president_name  TEXT NOT NULL,
    president_phone TEXT,
    founded_date    DATE,
    decision_no     TEXT,
    status          association_status NOT NULL DEFAULT 'pending',
    total_sub_assoc INT NOT NULL DEFAULT 0,
    total_clubs     INT NOT NULL DEFAULT 0,
    total_athletes  INT NOT NULL DEFAULT 0,
    total_coaches   INT NOT NULL DEFAULT 0,
    term            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prov_assoc_province
    ON provincial_associations(province_id);
CREATE INDEX IF NOT EXISTS idx_prov_assoc_status
    ON provincial_associations(status);

-- ── Provincial Sub-Associations (Chi hội Phường/Xã) ──
CREATE TABLE IF NOT EXISTS provincial_sub_associations (
    id               TEXT PRIMARY KEY,
    province_id      TEXT NOT NULL REFERENCES provinces(id),
    association_id   TEXT NOT NULL REFERENCES provincial_associations(id),
    name             TEXT NOT NULL,
    short_name       TEXT,
    code             TEXT NOT NULL UNIQUE,
    ward             TEXT NOT NULL,
    address          TEXT,
    phone            TEXT,
    email            TEXT,
    leader_name      TEXT NOT NULL,
    leader_phone     TEXT,
    founded_date     DATE,
    decision_no      TEXT,
    status           association_status NOT NULL DEFAULT 'pending',
    total_clubs      INT NOT NULL DEFAULT 0,
    total_athletes   INT NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prov_sub_assoc_province
    ON provincial_sub_associations(province_id);
CREATE INDEX IF NOT EXISTS idx_prov_sub_assoc_association
    ON provincial_sub_associations(association_id);
CREATE INDEX IF NOT EXISTS idx_prov_sub_assoc_status
    ON provincial_sub_associations(status);

-- ── Link Clubs to Associations ──
ALTER TABLE provincial_clubs
    ADD COLUMN IF NOT EXISTS association_id TEXT
        REFERENCES provincial_associations(id),
    ADD COLUMN IF NOT EXISTS sub_association_id TEXT
        REFERENCES provincial_sub_associations(id);

CREATE INDEX IF NOT EXISTS idx_prov_clubs_association
    ON provincial_clubs(association_id);
CREATE INDEX IF NOT EXISTS idx_prov_clubs_sub_association
    ON provincial_clubs(sub_association_id);


-- ─── Source: 0036_audit_logs.sql ──────────────────────────
-- Migration 0025: Audit logs persistence
-- Store auth and system audit logs in the database instead of in-memory

-- Create audit_logs table in the system schema (created in 0004)
CREATE TABLE IF NOT EXISTS system.audit_logs (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action        TEXT NOT NULL,                  -- e.g. 'auth.login', 'auth.refresh', 'auth.revoke'
    actor         TEXT NOT NULL DEFAULT '',        -- username or system identifier
    role          TEXT NOT NULL DEFAULT '',        -- role at time of action
    success       BOOLEAN NOT NULL DEFAULT true,
    ip_address    TEXT NOT NULL DEFAULT '',
    user_agent    TEXT NOT NULL DEFAULT '',
    details       JSONB,                          -- additional context
    error_message TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_audit_logs_action     ON system.audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor      ON system.audit_logs (actor);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON system.audit_logs (created_at DESC);

-- Composite index for filtered queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_action
    ON system.audit_logs (actor, action, created_at DESC);

-- Comment
COMMENT ON TABLE system.audit_logs IS 'Persistent audit trail for auth and system events';


-- ─── Source: 0037_federation_core.sql ──────────────────────────
-- ═══════════════════════════════════════════════════════════════
-- VCT PLATFORM — Migration 0037: Federation Core Tables
-- Provinces, federation units, personnel assignments
-- ═══════════════════════════════════════════════════════════════

-- 1. Provinces (tỉnh/thành phố)
CREATE TABLE IF NOT EXISTS federation_provinces (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code          VARCHAR(10) NOT NULL UNIQUE,        -- e.g. "HCM", "HN"
    name          TEXT        NOT NULL,                -- e.g. "TP Hồ Chí Minh"
    region        VARCHAR(20) NOT NULL DEFAULT 'south', -- north, central, south
    has_fed       BOOLEAN     NOT NULL DEFAULT FALSE,
    fed_unit_id   UUID,
    club_count    INT         NOT NULL DEFAULT 0,
    coach_count   INT         NOT NULL DEFAULT 0,
    vdv_count     INT         NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fed_provinces_region ON federation_provinces (region);
CREATE INDEX idx_fed_provinces_code   ON federation_provinces (code);

-- 2. Federation units (đơn vị tổ chức)
CREATE TABLE IF NOT EXISTS federation_units (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name         TEXT         NOT NULL,
    short_name   TEXT,
    type         VARCHAR(20)  NOT NULL DEFAULT 'province', -- central, province, district, committee
    parent_id    UUID         REFERENCES federation_units(id) ON DELETE SET NULL,
    province_id  UUID         REFERENCES federation_provinces(id) ON DELETE SET NULL,
    status       VARCHAR(20)  NOT NULL DEFAULT 'active',
    address      TEXT,
    phone        VARCHAR(20),
    email        VARCHAR(255),
    website      TEXT,
    founded_date VARCHAR(10),
    leader_name  TEXT,
    leader_title TEXT,
    club_count   INT          NOT NULL DEFAULT 0,
    member_count INT          NOT NULL DEFAULT 0,
    metadata     JSONB,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fed_units_type      ON federation_units (type);
CREATE INDEX idx_fed_units_parent    ON federation_units (parent_id);
CREATE INDEX idx_fed_units_province  ON federation_units (province_id);
CREATE INDEX idx_fed_units_status    ON federation_units (status);

-- 3. Personnel assignments (bổ nhiệm nhân sự)
CREATE TABLE IF NOT EXISTS federation_personnel (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID        NOT NULL,
    user_name    TEXT        NOT NULL,
    unit_id      UUID        NOT NULL REFERENCES federation_units(id) ON DELETE CASCADE,
    unit_name    TEXT        NOT NULL,
    position     TEXT        NOT NULL,        -- e.g. "Chủ tịch", "Phó CT", "Ủy viên"
    role_code    VARCHAR(50),                 -- maps to auth role
    start_date   VARCHAR(10) NOT NULL,
    end_date     VARCHAR(10),
    is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
    decision_no  TEXT,                        -- QĐ bổ nhiệm
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fed_personnel_unit   ON federation_personnel (unit_id);
CREATE INDEX idx_fed_personnel_user   ON federation_personnel (user_id);
CREATE INDEX idx_fed_personnel_active ON federation_personnel (is_active);

-- 4. Organizations (tổ chức thành viên)
CREATE TABLE IF NOT EXISTS federation_organizations (
    id               UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
    type             VARCHAR(20)        NOT NULL DEFAULT 'PROVINCIAL', -- NATIONAL, PROVINCIAL, SECTOR
    name             TEXT               NOT NULL,
    abbreviation     VARCHAR(20),
    region           VARCHAR(20),
    province_id      UUID               REFERENCES federation_provinces(id) ON DELETE SET NULL,
    contact_name     TEXT,
    contact_phone    VARCHAR(20),
    contact_email    VARCHAR(255),
    address          TEXT,
    status           VARCHAR(20)        NOT NULL DEFAULT 'ACTIVE',
    established_date VARCHAR(10),
    created_at       TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fed_orgs_type   ON federation_organizations (type);
CREATE INDEX idx_fed_orgs_status ON federation_organizations (status);
CREATE INDEX idx_fed_orgs_region ON federation_organizations (region);


-- ─── Source: 0038_federation_master_data.sql ──────────────────────────
-- ═══════════════════════════════════════════════════════════════
-- VCT PLATFORM — Migration 0038: Federation Master Data Tables
-- Belts, weight classes, age groups, competition contents
-- ═══════════════════════════════════════════════════════════════

-- 1. Master belts (hệ thống đai)
CREATE TABLE IF NOT EXISTS master_belts (
    level            INT          NOT NULL,
    name             TEXT         NOT NULL,
    color_hex        VARCHAR(7)   NOT NULL DEFAULT '#FFFFFF',
    required_time_min INT         NOT NULL DEFAULT 0,
    is_dan_level     BOOLEAN      NOT NULL DEFAULT FALSE,
    description      TEXT,
    scope            VARCHAR(20)  NOT NULL DEFAULT 'NATIONAL',  -- NATIONAL, PROVINCIAL, SCHOOL
    scope_id         UUID,
    inherits_from    TEXT,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    PRIMARY KEY (scope, scope_id, level)
);

-- Partial unique index for national scope
CREATE UNIQUE INDEX IF NOT EXISTS idx_master_belts_national_level
    ON master_belts (level) WHERE scope = 'NATIONAL' AND scope_id IS NULL;

-- 2. Master weight classes (hạng cân)
CREATE TABLE IF NOT EXISTS master_weight_classes (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    gender        VARCHAR(10) NOT NULL,          -- MALE, FEMALE
    category      VARCHAR(30) NOT NULL DEFAULT 'Kyorugi',
    min_weight    NUMERIC(5,1) NOT NULL DEFAULT 0,
    max_weight    NUMERIC(5,1) NOT NULL DEFAULT 0,
    is_heavy      BOOLEAN     NOT NULL DEFAULT FALSE,
    scope         VARCHAR(20) NOT NULL DEFAULT 'NATIONAL',
    scope_id      UUID,
    inherits_from TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_master_weights_gender ON master_weight_classes (gender);
CREATE INDEX idx_master_weights_scope  ON master_weight_classes (scope);

-- 3. Master age groups (nhóm tuổi)
CREATE TABLE IF NOT EXISTS master_age_groups (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT        NOT NULL,
    min_age       INT         NOT NULL DEFAULT 0,
    max_age       INT         NOT NULL DEFAULT 99,
    scope         VARCHAR(20) NOT NULL DEFAULT 'NATIONAL',
    scope_id      UUID,
    inherits_from TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_master_ages_scope ON master_age_groups (scope);

-- 4. Master competition contents (nội dung thi đấu)
CREATE TABLE IF NOT EXISTS master_competition_contents (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(50) NOT NULL,     -- e.g. "doi_khang", "quyen"
    name            TEXT        NOT NULL,
    description     TEXT,
    requires_weight BOOLEAN     NOT NULL DEFAULT FALSE,
    is_team_event   BOOLEAN     NOT NULL DEFAULT FALSE,
    min_athletes    INT         NOT NULL DEFAULT 1,
    max_athletes    INT         NOT NULL DEFAULT 1,
    has_weapon      BOOLEAN     NOT NULL DEFAULT FALSE,
    scope           VARCHAR(20) NOT NULL DEFAULT 'NATIONAL',
    scope_id        UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_master_contents_code  ON master_competition_contents (code);
CREATE INDEX idx_master_contents_scope ON master_competition_contents (scope);


-- ─── Source: 0039_federation_approvals.sql ──────────────────────────
-- ═══════════════════════════════════════════════════════════════
-- VCT PLATFORM — Migration 0039: Approval Workflow Tables
-- Generic approval request system for federation operations
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS approval_requests (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_code  VARCHAR(50) NOT NULL,         -- e.g. "club_registration", "belt_promotion"
    entity_type    VARCHAR(50) NOT NULL,         -- e.g. "club", "belt_exam"
    entity_id      UUID        NOT NULL,
    requester_id   UUID        NOT NULL,
    requester_name TEXT        NOT NULL,
    current_step   INT         NOT NULL DEFAULT 1,
    status         VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, DRAFT
    notes          TEXT,
    submitted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_approvals_status       ON approval_requests (status);
CREATE INDEX idx_approvals_workflow     ON approval_requests (workflow_code);
CREATE INDEX idx_approvals_requester    ON approval_requests (requester_id);
CREATE INDEX idx_approvals_entity       ON approval_requests (entity_type, entity_id);
CREATE INDEX idx_approvals_submitted_at ON approval_requests (submitted_at DESC);


-- ─── Source: 0040_federation_seed_data.sql ──────────────────────────
-- ═══════════════════════════════════════════════════════════════
-- VCT PLATFORM — Migration 0040: Federation Seed Data
-- 34 tỉnh/thành phố (sau sáp nhập 2025) + Central federation unit
-- ═══════════════════════════════════════════════════════════════

-- ── Central Federation Unit ──
INSERT INTO federation_units (id, name, short_name, type, status, leader_name, leader_title)
VALUES (
    'f0000000-0000-0000-0000-000000000001',
    'Liên đoàn Võ Cổ Truyền Việt Nam',
    'LĐ VCT VN',
    'central',
    'active',
    'Chủ tịch Liên đoàn',
    'Chủ tịch'
) ON CONFLICT DO NOTHING;

-- ── 34 Provinces (Sau sáp nhập 2025) ──
INSERT INTO federation_provinces (code, name, region, has_fed, club_count, vdv_count, coach_count) VALUES
-- Miền Bắc (15)
('HN',   'Hà Nội',           'north', true,  60, 1500, 110),
('HP',   'Hải Phòng',        'north', true,  30, 700,  45),
('QN',   'Quảng Ninh',       'north', true,  15, 300,  20),
('BN',   'Bắc Ninh',         'north', true,  20, 400,  25),
('HY',   'Hưng Yên',         'north', true,  15, 250,  18),
('NB',   'Ninh Bình',        'north', true,  25, 550,  35),
('PT',   'Phú Thọ',          'north', true,  18, 400,  28),
('TN',   'Thái Nguyên',      'north', true,  12, 200,  15),
('TQ',   'Tuyên Quang',      'north', false,  8, 120,   8),
('LCI',  'Lào Cai',          'north', true,   9, 150,  10),
('CB',   'Cao Bằng',         'north', false,  5,  80,   5),
('LS',   'Lạng Sơn',         'north', false,  6,  90,   6),
('SL',   'Sơn La',           'north', false,  7, 100,   8),
('DB',   'Điện Biên',        'north', false,  4,  60,   4),
('LC',   'Lai Châu',         'north', false,  3,  40,   3),
-- Miền Trung & Tây Nguyên (11)
('TH',   'Thanh Hóa',        'central', true,  30, 800,  50),
('NA',   'Nghệ An',          'central', true,  25, 600,  40),
('HT',   'Hà Tĩnh',          'central', true,  15, 300,  20),
('HUE',  'Huế',              'central', true,  20, 450,  30),
('DN',   'Đà Nẵng',          'central', true,  25, 650,  45),
('QT',   'Quảng Trị',        'central', true,  12, 250,  15),
('QNG',  'Quảng Ngãi',       'central', true,  18, 400,  25),
('KH',   'Khánh Hòa',        'central', true,  20, 450,  30),
('GL',   'Gia Lai',          'central', true,  14, 300,  20),
('DL',   'Đắk Lắk',          'central', true,  22, 500,  35),
('LDO',  'Lâm Đồng',         'central', true,  20, 450,  30),
-- Miền Nam (8)
('HCM',  'Hồ Chí Minh',      'south', true,  80, 2500, 180),
('CT',   'Cần Thơ',          'south', true,  25, 650,  40),
('DNI',  'Đồng Nai',         'south', true,  40, 1100, 75),
('AG',   'An Giang',         'south', true,  20, 500,  35),
('CM',   'Cà Mau',           'south', true,  15, 350,  22),
('DT',   'Đồng Tháp',        'south', true,  18, 400,  28),
('TNI',  'Tây Ninh',         'south', true,  12, 250,  15),
('VL',   'Vĩnh Long',        'south', true,   8, 180,  12)
ON CONFLICT (code) DO NOTHING;


-- ─── Source: 0041_federation_pr.sql ──────────────────────────
-- ═══════════════════════════════════════════════════════════════
-- VCT PLATFORM — FEDERATION PR: news_articles
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS federation_news_articles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL,
    summary         TEXT NOT NULL DEFAULT '',
    content         TEXT NOT NULL DEFAULT '',
    category        VARCHAR(50) NOT NULL DEFAULT 'Giải đấu',
    image_url       TEXT DEFAULT '',
    author          VARCHAR(200) NOT NULL DEFAULT '',
    author_id       VARCHAR(100) DEFAULT '',
    status          VARCHAR(20) NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'review', 'published')),
    published_at    TIMESTAMPTZ,
    view_count      INTEGER NOT NULL DEFAULT 0,
    tags            TEXT[] DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fed_articles_status ON federation_news_articles(status);
CREATE INDEX idx_fed_articles_category ON federation_news_articles(category);
CREATE INDEX idx_fed_articles_published ON federation_news_articles(published_at DESC)
    WHERE status = 'published';

-- Seed data
INSERT INTO federation_news_articles (title, summary, category, author, status, view_count) VALUES
('Giải Vô địch Võ Cổ Truyền Toàn quốc 2024 chính thức khởi tranh',
 'Giải đấu quy tụ hơn 500 VĐV từ 42 tỉnh/thành.', 'Giải đấu', 'Ban TT', 'published', 3420),
('Liên đoàn ký kết hợp tác với Liên đoàn Wushu Trung Quốc',
 'Thỏa thuận hợp tác đào tạo HLV và trao đổi VĐV.', 'Quốc tế', 'Ban ĐN', 'published', 2180),
('Khai mạc lớp tập huấn Trọng tài quốc gia 2024',
 '120 trọng tài từ 30 tỉnh/thành tham dự.', 'Đào tạo', 'Ban TT', 'published', 1560),
('Thông báo sửa đổi Luật thi đấu 128/2024',
 'Cập nhật điểm số, quy tắc phạt và hạng cân mới.', 'Quy chế', 'Ban KHVB', 'published', 4200),
('VĐV Bình Định giành 3 HCV tại SEA Games',
 'Đoàn Bình Định xuất sắc thi đấu tại SEA Games.', 'Thành tích', 'Ban TT', 'draft', 0),
('Kế hoạch phát triển phong trào Võ Cổ Truyền 2024-2026',
 'Chiến lược 3 năm phát triển VCT toàn quốc.', 'Chiến lược', 'BCH LĐ', 'review', 0)
ON CONFLICT DO NOTHING;


-- ─── Source: 0042_federation_international.sql ──────────────────────────
-- ═══════════════════════════════════════════════════════════════
-- VCT PLATFORM — FEDERATION INTERNATIONAL: partners + events
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS federation_intl_partners (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    abbreviation    VARCHAR(50) DEFAULT '',
    country         VARCHAR(100) NOT NULL DEFAULT '',
    country_code    VARCHAR(10) DEFAULT '',
    type            VARCHAR(50) NOT NULL DEFAULT 'Lưỡng phương',
    contact_name    VARCHAR(200) DEFAULT '',
    contact_email   VARCHAR(200) DEFAULT '',
    website         TEXT DEFAULT '',
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('active', 'pending', 'expired')),
    partner_since   VARCHAR(4) DEFAULT '',
    notes           TEXT DEFAULT '',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fed_partners_status ON federation_intl_partners(status);
CREATE INDEX idx_fed_partners_country ON federation_intl_partners(country_code);

CREATE TABLE IF NOT EXISTS federation_intl_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    location        VARCHAR(200) NOT NULL DEFAULT '',
    country         VARCHAR(100) NOT NULL DEFAULT '',
    start_date      DATE,
    end_date        DATE,
    athlete_count   INTEGER NOT NULL DEFAULT 0,
    coach_count     INTEGER NOT NULL DEFAULT 0,
    medal_gold      INTEGER NOT NULL DEFAULT 0,
    medal_silver    INTEGER NOT NULL DEFAULT 0,
    medal_bronze    INTEGER NOT NULL DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'planning'
                    CHECK (status IN ('planning', 'confirmed', 'ongoing', 'completed')),
    description     TEXT DEFAULT '',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fed_intl_events_status ON federation_intl_events(status);
CREATE INDEX idx_fed_intl_events_date ON federation_intl_events(start_date DESC);

-- Seed partners
INSERT INTO federation_intl_partners (name, abbreviation, country, country_code, type, status, partner_since) VALUES
('World Martial Arts Union', 'WoMAU', 'Hàn Quốc', 'KR', 'Liên đoàn Quốc tế', 'active', '2018'),
('Asian Martial Arts Federation', '', 'Nhật Bản', 'JP', 'Liên đoàn Châu Á', 'active', '2019'),
('Chinese Wushu Association', '', 'Trung Quốc', 'CN', 'Lưỡng phương', 'active', '2023'),
('SEA Games Federation', '', 'Đông Nam Á', 'ASEAN', 'Đa phương', 'active', '2015'),
('French Martial Arts Federation', '', 'Pháp', 'FR', 'Lưỡng phương', 'pending', '2024')
ON CONFLICT DO NOTHING;

-- Seed events
INSERT INTO federation_intl_events (name, location, country, start_date, end_date, athlete_count, medal_gold, medal_silver, medal_bronze, status) VALUES
('SEA Games 2025 — Võ Cổ Truyền', 'Bangkok', 'Thái Lan', '2025-12-01', '2025-12-07', 12, 0, 0, 0, 'planning'),
('Asian Martial Arts Championship', 'Seoul', 'Hàn Quốc', '2024-08-15', '2024-08-20', 8, 2, 3, 1, 'completed'),
('World Martial Arts Festival', 'Chungju', 'Hàn Quốc', '2024-10-10', '2024-10-15', 15, 0, 0, 0, 'confirmed')
ON CONFLICT DO NOTHING;


-- ─── Source: 0043_federation_workflows.sql ──────────────────────────
-- ═══════════════════════════════════════════════════════════════
-- VCT PLATFORM — FEDERATION WORKFLOW DEFINITIONS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS federation_workflow_definitions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(100) NOT NULL UNIQUE,
    name            TEXT NOT NULL,
    description     TEXT NOT NULL DEFAULT '',
    category        VARCHAR(50) NOT NULL DEFAULT '',
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS federation_workflow_steps (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id     UUID NOT NULL REFERENCES federation_workflow_definitions(id) ON DELETE CASCADE,
    step_order      INTEGER NOT NULL,
    name            TEXT NOT NULL,
    description     TEXT NOT NULL DEFAULT '',
    role_code       VARCHAR(100) NOT NULL DEFAULT '',
    auto_approve    BOOLEAN NOT NULL DEFAULT false,
    UNIQUE (workflow_id, step_order)
);

CREATE INDEX idx_fed_wf_active ON federation_workflow_definitions(is_active);
CREATE INDEX idx_fed_wf_steps_wf ON federation_workflow_steps(workflow_id);

-- Seed workflows
INSERT INTO federation_workflow_definitions (code, name, description, category) VALUES
('club_registration',    'Đăng ký CLB mới',       'Quy trình phê duyệt thành lập CLB Võ Cổ Truyền',         'CLB'),
('belt_promotion',       'Thi thăng đai',         'Quy trình xét duyệt kết quả thi đai từ CLB → Tỉnh → LĐ', 'Đai'),
('coach_cert',           'Cấp chứng chỉ HLV',    'Quy trình xét duyệt và cấp chứng chỉ huấn luyện viên',   'HLV'),
('referee_cert',         'Cấp thẻ Trọng tài',    'Quy trình đào tạo và cấp thẻ trọng tài quốc gia',        'Trọng tài'),
('tournament_approval',  'Phê duyệt Giải đấu',   'Quy trình phê duyệt tổ chức giải đấu cấp tỉnh/quốc gia', 'Giải đấu'),
('discipline_case',      'Xử lý Kỷ luật',        'Quy trình điều tra, xét xử và ra quyết định kỷ luật',     'Kỷ luật'),
('document_publish',     'Ban hành Văn bản',      'Quy trình soạn thảo, duyệt và ban hành công văn',         'Văn bản')
ON CONFLICT (code) DO NOTHING;

-- Seed steps for club_registration
INSERT INTO federation_workflow_steps (workflow_id, step_order, name, role_code)
SELECT id, 1, 'Nộp hồ sơ', 'club_admin'         FROM federation_workflow_definitions WHERE code = 'club_registration'
UNION ALL
SELECT id, 2, 'Xét duyệt cấp tỉnh', 'provincial_admin'  FROM federation_workflow_definitions WHERE code = 'club_registration'
UNION ALL
SELECT id, 3, 'Phê duyệt liên đoàn', 'federation_secretary' FROM federation_workflow_definitions WHERE code = 'club_registration'
ON CONFLICT DO NOTHING;

-- Seed steps for belt_promotion
INSERT INTO federation_workflow_steps (workflow_id, step_order, name, role_code)
SELECT id, 1, 'CLB đề nghị', 'club_admin'           FROM federation_workflow_definitions WHERE code = 'belt_promotion'
UNION ALL
SELECT id, 2, 'Hội đồng thi', 'national_referee'    FROM federation_workflow_definitions WHERE code = 'belt_promotion'
UNION ALL
SELECT id, 3, 'Xác nhận tỉnh', 'provincial_admin'   FROM federation_workflow_definitions WHERE code = 'belt_promotion'
UNION ALL
SELECT id, 4, 'Phê duyệt LĐ', 'federation_president' FROM federation_workflow_definitions WHERE code = 'belt_promotion'
ON CONFLICT DO NOTHING;

-- Seed steps for tournament_approval
INSERT INTO federation_workflow_steps (workflow_id, step_order, name, role_code)
SELECT id, 1, 'Nộp kế hoạch', 'provincial_admin'    FROM federation_workflow_definitions WHERE code = 'tournament_approval'
UNION ALL
SELECT id, 2, 'Rà soát kỹ thuật', 'national_referee'FROM federation_workflow_definitions WHERE code = 'tournament_approval'
UNION ALL
SELECT id, 3, 'Xét duyệt', 'federation_secretary'   FROM federation_workflow_definitions WHERE code = 'tournament_approval'
UNION ALL
SELECT id, 4, 'Phê duyệt', 'federation_president'   FROM federation_workflow_definitions WHERE code = 'tournament_approval'
ON CONFLICT DO NOTHING;


-- ─── Source: 0044_scoring_tables.sql ──────────────────────────
-- ════════════════════════════════════════════════════════════════
-- Migration 0044: Scoring — Match Events & Judge Scores
-- Supports the scoring.ScoringRepository (event sourcing pattern)
-- ════════════════════════════════════════════════════════════════

-- Match events (event sourcing — append-only)
CREATE TABLE IF NOT EXISTS scoring_match_events (
    id              TEXT PRIMARY KEY,
    match_id        TEXT NOT NULL,
    match_type      TEXT NOT NULL DEFAULT 'combat',  -- combat, forms
    event_type      TEXT NOT NULL,
    event_data      JSONB NOT NULL DEFAULT '{}',
    sequence_number BIGINT NOT NULL,
    round_number    INT NOT NULL DEFAULT 0,
    recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recorded_by     TEXT NOT NULL DEFAULT '',
    device_id       TEXT NOT NULL DEFAULT '',
    sync_status     TEXT NOT NULL DEFAULT 'synced'
);

CREATE INDEX IF NOT EXISTS idx_scoring_events_match ON scoring_match_events (match_id, sequence_number);
CREATE UNIQUE INDEX IF NOT EXISTS idx_scoring_events_unique ON scoring_match_events (match_id, sequence_number);

-- Judge scores (for forms/quyền thuật scoring)
CREATE TABLE IF NOT EXISTS scoring_judge_scores (
    id           TEXT PRIMARY KEY,
    match_id     TEXT NOT NULL,
    referee_id   TEXT NOT NULL,
    athlete_id   TEXT NOT NULL,
    score        NUMERIC(5,2) NOT NULL DEFAULT 0,
    penalties    NUMERIC(5,2) NOT NULL DEFAULT 0,
    is_final     BOOLEAN NOT NULL DEFAULT FALSE,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scoring_judges_match ON scoring_judge_scores (match_id);


-- ─── Source: 0045_tournament_management.sql ──────────────────────────
-- ═══════════════════════════════════════════════════════════════
-- VCT PLATFORM — 0041 TOURNAMENT MANAGEMENT
-- Categories, Registrations, Schedule, Arena, Results, Standings
-- ═══════════════════════════════════════════════════════════════

-- ── Tournament Categories ────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournament_categories (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL,
    content_type TEXT NOT NULL,          -- doi_khang, quyen, song_luyen, etc.
    age_group    TEXT NOT NULL DEFAULT '',
    weight_class TEXT NOT NULL DEFAULT '',
    gender       TEXT NOT NULL,          -- nam, nu
    name         TEXT NOT NULL,
    max_athletes INT NOT NULL DEFAULT 0,
    min_athletes INT NOT NULL DEFAULT 0,
    is_team_event BOOLEAN NOT NULL DEFAULT FALSE,
    status       TEXT NOT NULL DEFAULT 'active',  -- active, closed, cancelled
    sort_order   INT NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tournament_categories_tid ON tournament_categories(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_categories_content ON tournament_categories(content_type);

-- ── Tournament Registrations ─────────────────────────────────
CREATE TABLE IF NOT EXISTS tournament_registrations (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id  UUID NOT NULL,
    team_id        TEXT NOT NULL DEFAULT '',
    team_name      TEXT NOT NULL,
    province       TEXT NOT NULL DEFAULT '',
    team_type      TEXT NOT NULL DEFAULT 'doan_tinh',  -- doan_tinh, clb, ca_nhan
    status         TEXT NOT NULL DEFAULT 'nhap',       -- nhap, cho_duyet, da_duyet, tu_choi, yeu_cau_bo_sung
    head_coach     TEXT NOT NULL DEFAULT '',
    head_coach_id  TEXT NOT NULL DEFAULT '',
    total_athletes INT NOT NULL DEFAULT 0,
    total_contents INT NOT NULL DEFAULT 0,
    submitted_at   TIMESTAMPTZ,
    approved_by    TEXT NOT NULL DEFAULT '',
    approved_at    TIMESTAMPTZ,
    rejected_by    TEXT NOT NULL DEFAULT '',
    reject_reason  TEXT NOT NULL DEFAULT '',
    notes          TEXT NOT NULL DEFAULT '',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tournament_registrations_tid ON tournament_registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_status ON tournament_registrations(status);

-- ── Registration Athletes ────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournament_registration_athletes (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id  UUID NOT NULL REFERENCES tournament_registrations(id) ON DELETE CASCADE,
    athlete_id       TEXT NOT NULL DEFAULT '',
    athlete_name     TEXT NOT NULL,
    date_of_birth    TEXT NOT NULL DEFAULT '',
    gender           TEXT NOT NULL DEFAULT '',
    weight           NUMERIC(6,2) NOT NULL DEFAULT 0,
    belt_rank        TEXT NOT NULL DEFAULT '',
    category_ids     TEXT[] NOT NULL DEFAULT '{}',
    status           TEXT NOT NULL DEFAULT 'cho_xac_nhan',
    notes            TEXT NOT NULL DEFAULT '',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reg_athletes_rid ON tournament_registration_athletes(registration_id);

-- ── Schedule Slots ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournament_schedule_slots (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL,
    arena_id      TEXT NOT NULL DEFAULT '',
    arena_name    TEXT NOT NULL DEFAULT '',
    date          TEXT NOT NULL,
    session       TEXT NOT NULL DEFAULT '',    -- sang, chieu, toi
    start_time    TEXT NOT NULL DEFAULT '',    -- HH:MM
    end_time      TEXT NOT NULL DEFAULT '',    -- HH:MM
    category_id   TEXT NOT NULL DEFAULT '',
    category_name TEXT NOT NULL DEFAULT '',
    content_type  TEXT NOT NULL DEFAULT '',
    match_count   INT NOT NULL DEFAULT 0,
    status        TEXT NOT NULL DEFAULT 'du_kien',  -- du_kien, xac_nhan, dang_dien_ra, hoan_thanh, hoan
    notes         TEXT NOT NULL DEFAULT '',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schedule_slots_tid ON tournament_schedule_slots(tournament_id);
CREATE INDEX IF NOT EXISTS idx_schedule_slots_date ON tournament_schedule_slots(date, session);

-- ── Arena Assignments ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournament_arena_assignments (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL,
    arena_id      TEXT NOT NULL,
    arena_name    TEXT NOT NULL DEFAULT '',
    date          TEXT NOT NULL,
    content_types TEXT[] NOT NULL DEFAULT '{}',
    session       TEXT NOT NULL DEFAULT 'ca_ngay',
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_arena_assignments_tid ON tournament_arena_assignments(tournament_id);

-- ── Tournament Results ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournament_results (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL,
    category_id   TEXT NOT NULL,
    category_name TEXT NOT NULL DEFAULT '',
    content_type  TEXT NOT NULL DEFAULT '',
    gold_id       TEXT NOT NULL DEFAULT '',
    gold_name     TEXT NOT NULL DEFAULT '',
    gold_team     TEXT NOT NULL DEFAULT '',
    silver_id     TEXT NOT NULL DEFAULT '',
    silver_name   TEXT NOT NULL DEFAULT '',
    silver_team   TEXT NOT NULL DEFAULT '',
    bronze1_id    TEXT NOT NULL DEFAULT '',
    bronze1_name  TEXT NOT NULL DEFAULT '',
    bronze1_team  TEXT NOT NULL DEFAULT '',
    bronze2_id    TEXT NOT NULL DEFAULT '',
    bronze2_name  TEXT NOT NULL DEFAULT '',
    bronze2_team  TEXT NOT NULL DEFAULT '',
    is_finalized  BOOLEAN NOT NULL DEFAULT FALSE,
    finalized_by  TEXT NOT NULL DEFAULT '',
    finalized_at  TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tournament_results_tid ON tournament_results(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_results_cat ON tournament_results(category_id);

-- ── Team Standings (Toàn đoàn) ──────────────────────────────
CREATE TABLE IF NOT EXISTS tournament_team_standings (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL,
    team_id       TEXT NOT NULL,
    team_name     TEXT NOT NULL DEFAULT '',
    province      TEXT NOT NULL DEFAULT '',
    gold          INT NOT NULL DEFAULT 0,
    silver        INT NOT NULL DEFAULT 0,
    bronze        INT NOT NULL DEFAULT 0,
    total_medals  INT NOT NULL DEFAULT 0,
    points        INT NOT NULL DEFAULT 0,
    rank          INT NOT NULL DEFAULT 0,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tournament_id, team_id)
);

CREATE INDEX IF NOT EXISTS idx_team_standings_tid ON tournament_team_standings(tournament_id);
CREATE INDEX IF NOT EXISTS idx_team_standings_rank ON tournament_team_standings(tournament_id, rank);


-- ─── Source: 0046_club_voduong.sql ──────────────────────────
-- ════════════════════════════════════════════════════════════════
-- Migration 0041: Club / Võ Đường — Attendance, Equipment, Facilities
-- ════════════════════════════════════════════════════════════════

-- Attendance records (điểm danh)
CREATE TABLE IF NOT EXISTS club_attendance (
    id               TEXT PRIMARY KEY,
    club_id          TEXT NOT NULL,
    class_id         TEXT NOT NULL,
    class_name       TEXT NOT NULL DEFAULT '',
    member_id        TEXT NOT NULL,
    member_name      TEXT NOT NULL DEFAULT '',
    date             DATE NOT NULL,
    status           TEXT NOT NULL DEFAULT 'present',  -- present, absent, late, excused
    notes            TEXT NOT NULL DEFAULT '',
    recorded_by      TEXT NOT NULL DEFAULT '',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_club_attendance_club  ON club_attendance (club_id);
CREATE INDEX IF NOT EXISTS idx_club_attendance_class ON club_attendance (club_id, class_id);
CREATE INDEX IF NOT EXISTS idx_club_attendance_date  ON club_attendance (club_id, date);

-- Equipment inventory (trang thiết bị)
CREATE TABLE IF NOT EXISTS club_equipment (
    id               TEXT PRIMARY KEY,
    club_id          TEXT NOT NULL,
    name             TEXT NOT NULL,
    category         TEXT NOT NULL DEFAULT 'other',   -- protective, training, weapon, uniform, medical, other
    quantity         INT NOT NULL DEFAULT 0,
    condition        TEXT NOT NULL DEFAULT 'new',     -- new, good, worn, damaged, retired
    purchase_date    DATE,
    unit_value       NUMERIC(15,2) NOT NULL DEFAULT 0,
    total_value      NUMERIC(15,2) NOT NULL DEFAULT 0,
    supplier         TEXT NOT NULL DEFAULT '',
    notes            TEXT NOT NULL DEFAULT '',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_club_equipment_club ON club_equipment (club_id);

-- Facilities (cơ sở vật chất)
CREATE TABLE IF NOT EXISTS club_facilities (
    id                     TEXT PRIMARY KEY,
    club_id                TEXT NOT NULL,
    name                   TEXT NOT NULL,
    type                   TEXT NOT NULL DEFAULT 'other',     -- training_hall, arena, gym, storage, office, changing_room, other
    area_sqm               NUMERIC(10,2) NOT NULL DEFAULT 0,
    capacity               INT NOT NULL DEFAULT 0,
    status                 TEXT NOT NULL DEFAULT 'active',    -- active, maintenance, closed
    address                TEXT NOT NULL DEFAULT '',
    last_maintenance_date  DATE,
    next_maintenance_date  DATE,
    monthly_rent           NUMERIC(15,2) NOT NULL DEFAULT 0,
    notes                  TEXT NOT NULL DEFAULT '',
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_club_facilities_club ON club_facilities (club_id);


-- ─── Source: 0047_athlete_profiles.sql ──────────────────────────
-- ════════════════════════════════════════════════════════════════
-- Migration 0043: Athlete Profile, Membership, Tournament Entries
-- Supports the athlete.AthleteProfileRepository,
-- athlete.ClubMembershipRepository, athlete.TournamentEntryRepository
-- ════════════════════════════════════════════════════════════════

-- Athlete profiles (hồ sơ thể thao)
CREATE TABLE IF NOT EXISTS athlete_profiles (
    id               TEXT PRIMARY KEY,
    user_id          TEXT NOT NULL UNIQUE,
    full_name        TEXT NOT NULL,
    gender           TEXT NOT NULL DEFAULT '',
    date_of_birth    TEXT NOT NULL DEFAULT '',
    weight           NUMERIC(6,2) NOT NULL DEFAULT 0,
    height           NUMERIC(6,2) NOT NULL DEFAULT 0,
    belt_rank        TEXT NOT NULL DEFAULT 'none',
    belt_label       TEXT NOT NULL DEFAULT '',
    coach_name       TEXT NOT NULL DEFAULT '',
    phone            TEXT NOT NULL DEFAULT '',
    email            TEXT NOT NULL DEFAULT '',
    photo_url        TEXT NOT NULL DEFAULT '',
    address          TEXT NOT NULL DEFAULT '',
    id_number        TEXT NOT NULL DEFAULT '',
    province         TEXT NOT NULL DEFAULT '',
    nationality      TEXT NOT NULL DEFAULT 'Việt Nam',
    ho_so            JSONB NOT NULL DEFAULT '{}',
    status           TEXT NOT NULL DEFAULT 'draft',
    belt_history     JSONB NOT NULL DEFAULT '[]',
    goals            JSONB NOT NULL DEFAULT '[]',
    skill_stats      JSONB NOT NULL DEFAULT '[]',
    total_clubs       INT NOT NULL DEFAULT 0,
    total_tournaments INT NOT NULL DEFAULT 0,
    total_medals      INT NOT NULL DEFAULT 0,
    elo_rating        INT NOT NULL DEFAULT 1200,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_athlete_profiles_user   ON athlete_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_athlete_profiles_status ON athlete_profiles (status);
CREATE INDEX IF NOT EXISTS idx_athlete_profiles_prov   ON athlete_profiles (province);

-- Club memberships
CREATE TABLE IF NOT EXISTS athlete_memberships (
    id          TEXT PRIMARY KEY,
    athlete_id  TEXT NOT NULL,
    club_id     TEXT NOT NULL,
    club_name   TEXT NOT NULL DEFAULT '',
    role        TEXT NOT NULL DEFAULT 'member',
    join_date   TEXT NOT NULL DEFAULT '',
    status      TEXT NOT NULL DEFAULT 'pending',
    coach_name  TEXT NOT NULL DEFAULT '',
    province_id TEXT NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_athlete_memberships_athlete ON athlete_memberships (athlete_id);
CREATE INDEX IF NOT EXISTS idx_athlete_memberships_club    ON athlete_memberships (club_id);

-- Tournament entries
CREATE TABLE IF NOT EXISTS athlete_tournament_entries (
    id              TEXT PRIMARY KEY,
    athlete_id      TEXT NOT NULL,
    athlete_name    TEXT NOT NULL DEFAULT '',
    tournament_id   TEXT NOT NULL,
    tournament_name TEXT NOT NULL DEFAULT '',
    doan_id         TEXT NOT NULL DEFAULT '',
    doan_name       TEXT NOT NULL DEFAULT '',
    categories      JSONB NOT NULL DEFAULT '[]',
    ho_so           JSONB NOT NULL DEFAULT '{}',
    status          TEXT NOT NULL DEFAULT 'nhap',
    weigh_in_result TEXT NOT NULL DEFAULT '',
    start_date      TEXT NOT NULL DEFAULT '',
    notes           TEXT NOT NULL DEFAULT '',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_athlete_entries_athlete    ON athlete_tournament_entries (athlete_id);
CREATE INDEX IF NOT EXISTS idx_athlete_entries_tournament ON athlete_tournament_entries (tournament_id);


-- ─── Source: 0048_btc_parent_training_tables.sql ──────────────────────────
-- ═══════════════════════════════════════════════════════════════
-- VCT Platform — Migration 0048: BTC, Parent, Training Tables
-- Migrates in-memory stores to persistent PostgreSQL tables.
-- ═══════════════════════════════════════════════════════════════

-- ── BTC Members ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS btc_members (
    id          TEXT PRIMARY KEY,
    ten         TEXT NOT NULL,
    chuc_vu     TEXT NOT NULL DEFAULT '',
    ban         TEXT NOT NULL DEFAULT '',
    cap         INT  NOT NULL DEFAULT 3,
    sdt         TEXT NOT NULL DEFAULT '',
    email       TEXT NOT NULL DEFAULT '',
    don_vi      TEXT NOT NULL DEFAULT '',
    giai_id     TEXT NOT NULL DEFAULT '',
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_btc_members_giai ON btc_members(giai_id);

-- ── BTC Weigh-Ins ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS btc_weigh_ins (
    id          TEXT PRIMARY KEY,
    giai_id     TEXT NOT NULL,
    vdv_id      TEXT NOT NULL,
    vdv_ten     TEXT NOT NULL DEFAULT '',
    doan_id     TEXT NOT NULL DEFAULT '',
    doan_ten    TEXT NOT NULL DEFAULT '',
    hang_can    TEXT NOT NULL DEFAULT '',
    can_nang    DOUBLE PRECISION NOT NULL DEFAULT 0,
    gioi_han    DOUBLE PRECISION NOT NULL DEFAULT 0,
    sai_so      DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    ket_qua     TEXT NOT NULL DEFAULT 'cho_can',
    lan_can     INT  NOT NULL DEFAULT 1,
    ghi_chu     TEXT NOT NULL DEFAULT '',
    nguoi_can   TEXT NOT NULL DEFAULT '',
    thoi_gian   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_btc_weigh_ins_giai ON btc_weigh_ins(giai_id);

-- ── BTC Draws ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS btc_draws (
    id          TEXT PRIMARY KEY,
    giai_id     TEXT NOT NULL,
    noi_dung_id TEXT NOT NULL DEFAULT '',
    noi_dung_ten TEXT NOT NULL DEFAULT '',
    loai_nd     TEXT NOT NULL DEFAULT '',
    hang_can    TEXT NOT NULL DEFAULT '',
    lua_tuoi    TEXT NOT NULL DEFAULT '',
    so_vdv      INT  NOT NULL DEFAULT 0,
    nhanh       JSONB NOT NULL DEFAULT '[]',
    thu_tu      JSONB NOT NULL DEFAULT '[]',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by  TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_btc_draws_giai ON btc_draws(giai_id);

-- ── BTC Referee Assignments ─────────────────────────────────
CREATE TABLE IF NOT EXISTS btc_assignments (
    id             TEXT PRIMARY KEY,
    giai_id        TEXT NOT NULL,
    trong_tai_id   TEXT NOT NULL,
    trong_tai_ten  TEXT NOT NULL DEFAULT '',
    cap_bac        TEXT NOT NULL DEFAULT '',
    chuyen_mon     TEXT NOT NULL DEFAULT '',
    san_id         TEXT NOT NULL DEFAULT '',
    san_ten        TEXT NOT NULL DEFAULT '',
    ngay           TEXT NOT NULL DEFAULT '',
    phien          TEXT NOT NULL DEFAULT '',
    vai_tro        TEXT NOT NULL DEFAULT '',
    trang_thai     TEXT NOT NULL DEFAULT 'phan_cong',
    ghi_chu        TEXT NOT NULL DEFAULT '',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_btc_assignments_giai ON btc_assignments(giai_id);

-- ── BTC Team Results ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS btc_team_results (
    id       TEXT PRIMARY KEY,
    giai_id  TEXT NOT NULL,
    doan_id  TEXT NOT NULL DEFAULT '',
    doan_ten TEXT NOT NULL DEFAULT '',
    tinh     TEXT NOT NULL DEFAULT '',
    hcv      INT  NOT NULL DEFAULT 0,
    hcb      INT  NOT NULL DEFAULT 0,
    hcd      INT  NOT NULL DEFAULT 0,
    tong_hc  INT  NOT NULL DEFAULT 0,
    diem     INT  NOT NULL DEFAULT 0,
    xep_hang INT  NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_btc_team_results_giai ON btc_team_results(giai_id);

-- ── BTC Content Results ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS btc_content_results (
    id           TEXT PRIMARY KEY,
    giai_id      TEXT NOT NULL,
    noi_dung_id  TEXT NOT NULL DEFAULT '',
    noi_dung_ten TEXT NOT NULL DEFAULT '',
    hang_can     TEXT NOT NULL DEFAULT '',
    lua_tuoi     TEXT NOT NULL DEFAULT '',
    vdv_id_nhat  TEXT NOT NULL DEFAULT '',
    vdv_ten_nhat TEXT NOT NULL DEFAULT '',
    doan_nhat    TEXT NOT NULL DEFAULT '',
    vdv_id_nhi   TEXT NOT NULL DEFAULT '',
    vdv_ten_nhi  TEXT NOT NULL DEFAULT '',
    doan_nhi     TEXT NOT NULL DEFAULT '',
    vdv_id_ba_1  TEXT NOT NULL DEFAULT '',
    vdv_ten_ba_1 TEXT NOT NULL DEFAULT '',
    doan_ba_1    TEXT NOT NULL DEFAULT '',
    vdv_id_ba_2  TEXT NOT NULL DEFAULT '',
    vdv_ten_ba_2 TEXT NOT NULL DEFAULT '',
    doan_ba_2    TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_btc_content_results_giai ON btc_content_results(giai_id);

-- ── BTC Finance ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS btc_finance (
    id         TEXT PRIMARY KEY,
    giai_id    TEXT NOT NULL,
    loai       TEXT NOT NULL DEFAULT 'thu',
    danh_muc   TEXT NOT NULL DEFAULT '',
    mo_ta      TEXT NOT NULL DEFAULT '',
    so_tien    DOUBLE PRECISION NOT NULL DEFAULT 0,
    doan_id    TEXT NOT NULL DEFAULT '',
    doan_ten   TEXT NOT NULL DEFAULT '',
    trang_thai TEXT NOT NULL DEFAULT 'chua_thu',
    ngay_gd    TEXT NOT NULL DEFAULT '',
    ghi_chu    TEXT NOT NULL DEFAULT '',
    created_by TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_btc_finance_giai ON btc_finance(giai_id);

-- ── BTC Technical Meetings ──────────────────────────────────
CREATE TABLE IF NOT EXISTS btc_meetings (
    id           TEXT PRIMARY KEY,
    giai_id      TEXT NOT NULL,
    tieu_de      TEXT NOT NULL DEFAULT '',
    ngay         TEXT NOT NULL DEFAULT '',
    dia_diem     TEXT NOT NULL DEFAULT '',
    chu_tri      TEXT NOT NULL DEFAULT '',
    tham_du      JSONB NOT NULL DEFAULT '[]',
    noi_dung     TEXT NOT NULL DEFAULT '',
    quyet_dinh   JSONB NOT NULL DEFAULT '[]',
    bien_ban_file TEXT NOT NULL DEFAULT '',
    trang_thai   TEXT NOT NULL DEFAULT 'du_kien',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_btc_meetings_giai ON btc_meetings(giai_id);

-- ── BTC Protests ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS btc_protests (
    id         TEXT PRIMARY KEY,
    giai_id    TEXT NOT NULL,
    tran_id    TEXT NOT NULL DEFAULT '',
    tran_mo_ta TEXT NOT NULL DEFAULT '',
    nguoi_nop  TEXT NOT NULL DEFAULT '',
    doan_ten   TEXT NOT NULL DEFAULT '',
    loai_kn    TEXT NOT NULL DEFAULT '',
    ly_do      TEXT NOT NULL DEFAULT '',
    trang_thai TEXT NOT NULL DEFAULT 'moi',
    has_video  BOOLEAN NOT NULL DEFAULT FALSE,
    quyet_dinh TEXT NOT NULL DEFAULT '',
    nguoi_xl   TEXT NOT NULL DEFAULT '',
    ngay_nop   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ngay_xl    TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_btc_protests_giai ON btc_protests(giai_id);

-- ═══════════════════════════════════════════════════════════════
-- PARENT MODULE
-- ═══════════════════════════════════════════════════════════════

-- ── Parent Links ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS parent_links (
    id           TEXT PRIMARY KEY,
    parent_id    TEXT NOT NULL,
    parent_name  TEXT NOT NULL DEFAULT '',
    athlete_id   TEXT NOT NULL,
    athlete_name TEXT NOT NULL DEFAULT '',
    club_name    TEXT NOT NULL DEFAULT '',
    belt_level   TEXT NOT NULL DEFAULT '',
    relation     TEXT NOT NULL DEFAULT '',
    status       TEXT NOT NULL DEFAULT 'pending',
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_parent_links_parent ON parent_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_links_athlete ON parent_links(athlete_id);

-- ── Parent Consents ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS parent_consents (
    id           TEXT PRIMARY KEY,
    parent_id    TEXT NOT NULL,
    athlete_id   TEXT NOT NULL,
    athlete_name TEXT NOT NULL DEFAULT '',
    type         TEXT NOT NULL DEFAULT '',
    title        TEXT NOT NULL DEFAULT '',
    description  TEXT NOT NULL DEFAULT '',
    status       TEXT NOT NULL DEFAULT 'active',
    signed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at   TIMESTAMPTZ,
    revoked_at   TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_parent_consents_parent ON parent_consents(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_consents_athlete ON parent_consents(athlete_id);

-- ── Parent Attendance (child attendance view) ───────────────
CREATE TABLE IF NOT EXISTS parent_attendance (
    id         SERIAL PRIMARY KEY,
    athlete_id TEXT NOT NULL,
    date       TEXT NOT NULL DEFAULT '',
    session    TEXT NOT NULL DEFAULT '',
    status     TEXT NOT NULL DEFAULT 'present',
    coach      TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_parent_attendance_athlete ON parent_attendance(athlete_id);

-- ── Parent Results (child competition results) ──────────────
CREATE TABLE IF NOT EXISTS parent_results (
    id         SERIAL PRIMARY KEY,
    athlete_id TEXT NOT NULL,
    tournament TEXT NOT NULL DEFAULT '',
    category   TEXT NOT NULL DEFAULT '',
    result     TEXT NOT NULL DEFAULT '',
    date       TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_parent_results_athlete ON parent_results(athlete_id);

-- ═══════════════════════════════════════════════════════════════
-- TRAINING MODULE
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS training_sessions (
    id          TEXT PRIMARY KEY,
    athlete_id  TEXT NOT NULL,
    coach_id    TEXT NOT NULL DEFAULT '',
    club_id     TEXT NOT NULL DEFAULT '',
    date        TEXT NOT NULL DEFAULT '',
    start_time  TEXT NOT NULL DEFAULT '',
    end_time    TEXT NOT NULL DEFAULT '',
    type        TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    notes       TEXT NOT NULL DEFAULT '',
    status      TEXT NOT NULL DEFAULT 'scheduled',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_training_sessions_athlete ON training_sessions(athlete_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_club ON training_sessions(club_id);


-- ─── Source: 0049_tenant_isolation_new_tables.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0049: TENANT ISOLATION FOR NEW TABLES
-- P0 Critical: Add tenant_id + RLS to all 0044-0048 tables
-- Covers: btc_*, tournament_*, parent_*, training_sessions
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. ADD tenant_id COLUMN TO ALL TABLES MISSING IT
-- ════════════════════════════════════════════════════════

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    -- BTC module (0048)
    'btc_members', 'btc_weigh_ins', 'btc_draws',
    'btc_assignments', 'btc_team_results', 'btc_content_results',
    'btc_finance', 'btc_meetings', 'btc_protests',
    -- Tournament management (0045)
    'tournament_categories', 'tournament_registrations',
    'tournament_registration_athletes', 'tournament_schedule_slots',
    'tournament_arena_assignments', 'tournament_results',
    'tournament_team_standings',
    -- Parent module (0048)
    'parent_links', 'parent_consents', 'parent_attendance',
    'parent_results',
    -- Training (0048)
    'training_sessions'
  ]) LOOP
    BEGIN
      EXECUTE format(
        'ALTER TABLE %I ADD COLUMN IF NOT EXISTS tenant_id UUID',
        tbl
      );
      RAISE NOTICE 'Added tenant_id to %', tbl;
    EXCEPTION WHEN undefined_table THEN
      RAISE NOTICE 'Table % does not exist, skipping', tbl;
    END;
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════
-- 2. SET DEFAULT tenant_id FOR EXISTING ROWS
--    Uses the default development tenant
-- ════════════════════════════════════════════════════════

DO $$
DECLARE
  tbl TEXT;
  default_tenant UUID := '00000000-0000-7000-8000-000000000001';
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'btc_members', 'btc_weigh_ins', 'btc_draws',
    'btc_assignments', 'btc_team_results', 'btc_content_results',
    'btc_finance', 'btc_meetings', 'btc_protests',
    'tournament_categories', 'tournament_registrations',
    'tournament_registration_athletes', 'tournament_schedule_slots',
    'tournament_arena_assignments', 'tournament_results',
    'tournament_team_standings',
    'parent_links', 'parent_consents', 'parent_attendance',
    'parent_results', 'training_sessions'
  ]) LOOP
    BEGIN
      EXECUTE format(
        'UPDATE %I SET tenant_id = %L WHERE tenant_id IS NULL',
        tbl, default_tenant
      );
    EXCEPTION WHEN undefined_table THEN NULL;
    END;
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════
-- 3. ENABLE RLS + CREATE POLICIES
-- ════════════════════════════════════════════════════════

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'btc_members', 'btc_weigh_ins', 'btc_draws',
    'btc_assignments', 'btc_team_results', 'btc_content_results',
    'btc_finance', 'btc_meetings', 'btc_protests',
    'tournament_categories', 'tournament_registrations',
    'tournament_registration_athletes', 'tournament_schedule_slots',
    'tournament_arena_assignments', 'tournament_results',
    'tournament_team_standings',
    'parent_links', 'parent_consents', 'parent_attendance',
    'parent_results', 'training_sessions'
  ]) LOOP
    BEGIN
      -- Enable RLS
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);

      -- SELECT/UPDATE policy (tenant read/write isolation)
      EXECUTE format(
        'CREATE POLICY tenant_isolation ON %I
          USING (tenant_id = COALESCE(
            current_setting(''app.current_tenant'', true)::UUID,
            ''00000000-0000-7000-8000-000000000001''::UUID
          ))',
        tbl
      );

      -- INSERT policy (enforce correct tenant_id on write)
      EXECUTE format(
        'CREATE POLICY tenant_write_%s ON %I
          FOR INSERT
          WITH CHECK (tenant_id = COALESCE(
            current_setting(''app.current_tenant'', true)::UUID,
            ''00000000-0000-7000-8000-000000000001''::UUID
          ))',
        replace(tbl, '.', '_'), tbl
      );

      -- UPDATE policy (prevent tenant_id mutation)
      EXECUTE format(
        'CREATE POLICY tenant_update_%s ON %I
          FOR UPDATE
          USING (tenant_id = COALESCE(
            current_setting(''app.current_tenant'', true)::UUID,
            ''00000000-0000-7000-8000-000000000001''::UUID
          ))
          WITH CHECK (tenant_id = COALESCE(
            current_setting(''app.current_tenant'', true)::UUID,
            ''00000000-0000-7000-8000-000000000001''::UUID
          ))',
        replace(tbl, '.', '_'), tbl
      );

      RAISE NOTICE 'RLS enabled for %', tbl;

    EXCEPTION
      WHEN undefined_table THEN
        RAISE NOTICE 'Table % does not exist, skipping RLS', tbl;
      WHEN duplicate_object THEN
        RAISE NOTICE 'Policy already exists for %, skipping', tbl;
    END;
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════
-- 4. ADD tenant_id INDEXES FOR QUERY PERFORMANCE
-- ════════════════════════════════════════════════════════

-- BTC tables (all filtered by giai_id + tenant)
CREATE INDEX IF NOT EXISTS idx_btc_members_tenant ON btc_members(tenant_id, giai_id);
CREATE INDEX IF NOT EXISTS idx_btc_weigh_ins_tenant ON btc_weigh_ins(tenant_id, giai_id);
CREATE INDEX IF NOT EXISTS idx_btc_draws_tenant ON btc_draws(tenant_id, giai_id);
CREATE INDEX IF NOT EXISTS idx_btc_assignments_tenant ON btc_assignments(tenant_id, giai_id);
CREATE INDEX IF NOT EXISTS idx_btc_team_results_tenant ON btc_team_results(tenant_id, giai_id);
CREATE INDEX IF NOT EXISTS idx_btc_content_results_tenant ON btc_content_results(tenant_id, giai_id);
CREATE INDEX IF NOT EXISTS idx_btc_finance_tenant ON btc_finance(tenant_id, giai_id);
CREATE INDEX IF NOT EXISTS idx_btc_meetings_tenant ON btc_meetings(tenant_id, giai_id);
CREATE INDEX IF NOT EXISTS idx_btc_protests_tenant ON btc_protests(tenant_id, giai_id);

-- Tournament management
CREATE INDEX IF NOT EXISTS idx_tourn_categories_tenant ON tournament_categories(tenant_id, tournament_id);
CREATE INDEX IF NOT EXISTS idx_tourn_registrations_tenant ON tournament_registrations(tenant_id, tournament_id);
CREATE INDEX IF NOT EXISTS idx_tourn_reg_athletes_tenant ON tournament_registration_athletes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tourn_schedule_tenant ON tournament_schedule_slots(tenant_id, tournament_id);
CREATE INDEX IF NOT EXISTS idx_tourn_arena_assign_tenant ON tournament_arena_assignments(tenant_id, tournament_id);
CREATE INDEX IF NOT EXISTS idx_tourn_results_tenant ON tournament_results(tenant_id, tournament_id);
CREATE INDEX IF NOT EXISTS idx_tourn_standings_tenant ON tournament_team_standings(tenant_id, tournament_id);

-- Parent module
CREATE INDEX IF NOT EXISTS idx_parent_links_tenant ON parent_links(tenant_id);
CREATE INDEX IF NOT EXISTS idx_parent_consents_tenant ON parent_consents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_parent_attendance_tenant ON parent_attendance(tenant_id);
CREATE INDEX IF NOT EXISTS idx_parent_results_tenant ON parent_results(tenant_id);

-- Training
CREATE INDEX IF NOT EXISTS idx_training_sess_tenant ON training_sessions(tenant_id);

-- ════════════════════════════════════════════════════════
-- 5. ADD updated_at TRIGGER WHERE MISSING
-- ════════════════════════════════════════════════════════

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'btc_members', 'btc_weigh_ins', 'btc_draws',
    'btc_assignments', 'btc_finance', 'btc_meetings', 'btc_protests',
    'tournament_categories', 'tournament_registrations',
    'tournament_schedule_slots', 'tournament_results',
    'parent_links', 'parent_consents', 'training_sessions'
  ]) LOOP
    BEGIN
      -- Add updated_at column if missing
      EXECUTE format(
        'ALTER TABLE %I ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()',
        tbl
      );
      -- Add trigger
      EXECUTE format(
        'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
          FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()',
        tbl
      );
    EXCEPTION
      WHEN undefined_table THEN NULL;
      WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════
-- 6. ADD is_deleted + SOFT DELETE TRIGGER WHERE MISSING
-- ════════════════════════════════════════════════════════

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'btc_members', 'btc_weigh_ins', 'btc_draws',
    'btc_assignments', 'btc_finance', 'btc_meetings', 'btc_protests',
    'tournament_categories', 'tournament_registrations',
    'tournament_registration_athletes', 'tournament_schedule_slots',
    'tournament_arena_assignments', 'tournament_results',
    'tournament_team_standings',
    'parent_links', 'parent_consents',
    'training_sessions'
  ]) LOOP
    BEGIN
      EXECUTE format(
        'ALTER TABLE %I ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false',
        tbl
      );
      EXECUTE format(
        'ALTER TABLE %I ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ',
        tbl
      );
    EXCEPTION WHEN undefined_table THEN NULL;
    END;
  END LOOP;
END $$;

COMMIT;


-- ─── Source: 0050_fk_constraints_integrity.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0050: FK CONSTRAINTS + DATA INTEGRITY
-- P0 Critical: Add foreign key constraints and UUID references
-- to tables from 0044-0048 that use TEXT IDs
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. TOURNAMENT MANAGEMENT — ADD FK CONSTRAINTS
--    Tables from 0045 reference tournaments by UUID but
--    lack actual FK constraints
-- ════════════════════════════════════════════════════════

-- tournament_categories → tournaments
ALTER TABLE tournament_categories
  ADD CONSTRAINT fk_tc_tournament
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
  NOT VALID;

ALTER TABLE tournament_categories
  VALIDATE CONSTRAINT fk_tc_tournament;

-- tournament_registrations → tournaments (tournament_id is UUID)
DO $$ BEGIN
  ALTER TABLE tournament_registrations
    ALTER COLUMN tournament_id TYPE UUID USING tournament_id::UUID;
EXCEPTION WHEN others THEN NULL;
END $$;

ALTER TABLE tournament_registrations
  ADD CONSTRAINT fk_tr_tournament
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
  NOT VALID;

ALTER TABLE tournament_registrations
  VALIDATE CONSTRAINT fk_tr_tournament;

-- tournament_schedule_slots → tournaments
DO $$ BEGIN
  ALTER TABLE tournament_schedule_slots
    ALTER COLUMN tournament_id TYPE UUID USING tournament_id::UUID;
EXCEPTION WHEN others THEN NULL;
END $$;

ALTER TABLE tournament_schedule_slots
  ADD CONSTRAINT fk_tss_tournament
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
  NOT VALID;

ALTER TABLE tournament_schedule_slots
  VALIDATE CONSTRAINT fk_tss_tournament;

-- tournament_arena_assignments → tournaments
DO $$ BEGIN
  ALTER TABLE tournament_arena_assignments
    ALTER COLUMN tournament_id TYPE UUID USING tournament_id::UUID;
EXCEPTION WHEN others THEN NULL;
END $$;

ALTER TABLE tournament_arena_assignments
  ADD CONSTRAINT fk_taa_tournament
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
  NOT VALID;

ALTER TABLE tournament_arena_assignments
  VALIDATE CONSTRAINT fk_taa_tournament;

-- tournament_results → tournaments
DO $$ BEGIN
  ALTER TABLE tournament_results
    ALTER COLUMN tournament_id TYPE UUID USING tournament_id::UUID;
EXCEPTION WHEN others THEN NULL;
END $$;

ALTER TABLE tournament_results
  ADD CONSTRAINT fk_tres_tournament
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
  NOT VALID;

ALTER TABLE tournament_results
  VALIDATE CONSTRAINT fk_tres_tournament;

-- tournament_team_standings → tournaments
DO $$ BEGIN
  ALTER TABLE tournament_team_standings
    ALTER COLUMN tournament_id TYPE UUID USING tournament_id::UUID;
EXCEPTION WHEN others THEN NULL;
END $$;

ALTER TABLE tournament_team_standings
  ADD CONSTRAINT fk_tts_tournament
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
  NOT VALID;

ALTER TABLE tournament_team_standings
  VALIDATE CONSTRAINT fk_tts_tournament;

-- ════════════════════════════════════════════════════════
-- 2. BTC MODULE — ADD tournament_id UUID COLUMN + FK
--    BTC tables use giai_id (TEXT). Add UUID reference.
-- ════════════════════════════════════════════════════════

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'btc_members', 'btc_weigh_ins', 'btc_draws',
    'btc_assignments', 'btc_team_results', 'btc_content_results',
    'btc_finance', 'btc_meetings', 'btc_protests'
  ]) LOOP
    BEGIN
      -- Add UUID column for tournament reference
      EXECUTE format(
        'ALTER TABLE %I ADD COLUMN IF NOT EXISTS tournament_id UUID',
        tbl
      );
      -- Create FK (NOT VALID first for zero-downtime)
      EXECUTE format(
        'ALTER TABLE %I ADD CONSTRAINT fk_%s_tournament
          FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
          NOT VALID',
        tbl, replace(tbl, 'btc_', '')
      );
    EXCEPTION
      WHEN undefined_table THEN NULL;
      WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;

-- Validate all BTC FKs in a second pass (allows concurrent reads)
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'btc_members', 'btc_weigh_ins', 'btc_draws',
    'btc_assignments', 'btc_team_results', 'btc_content_results',
    'btc_finance', 'btc_meetings', 'btc_protests'
  ]) LOOP
    BEGIN
      EXECUTE format(
        'ALTER TABLE %I VALIDATE CONSTRAINT fk_%s_tournament',
        tbl, replace(tbl, 'btc_', '')
      );
    EXCEPTION WHEN others THEN NULL;
    END;
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════
-- 3. CHECK CONSTRAINTS — DATA VALIDATION
--    Add CHECK constraints for status fields using TEXT
-- ════════════════════════════════════════════════════════

-- Tournament registration status
ALTER TABLE tournament_registrations
  ADD CONSTRAINT chk_tr_status
  CHECK (status IN ('nhap', 'cho_duyet', 'da_duyet', 'tu_choi', 'yeu_cau_bo_sung'))
  NOT VALID;
ALTER TABLE tournament_registrations VALIDATE CONSTRAINT chk_tr_status;

-- Tournament category status
ALTER TABLE tournament_categories
  ADD CONSTRAINT chk_tc_status
  CHECK (status IN ('active', 'closed', 'cancelled'))
  NOT VALID;
ALTER TABLE tournament_categories VALIDATE CONSTRAINT chk_tc_status;

-- Schedule slot status
ALTER TABLE tournament_schedule_slots
  ADD CONSTRAINT chk_tss_status
  CHECK (status IN ('du_kien', 'xac_nhan', 'dang_dien_ra', 'hoan_thanh', 'hoan'))
  NOT VALID;
ALTER TABLE tournament_schedule_slots VALIDATE CONSTRAINT chk_tss_status;

-- BTC weigh-in result
ALTER TABLE btc_weigh_ins
  ADD CONSTRAINT chk_bwi_result
  CHECK (ket_qua IN ('cho_can', 'dat', 'khong_dat', 'can_lai'))
  NOT VALID;
ALTER TABLE btc_weigh_ins VALIDATE CONSTRAINT chk_bwi_result;

-- BTC assignment status
ALTER TABLE btc_assignments
  ADD CONSTRAINT chk_ba_status
  CHECK (trang_thai IN ('phan_cong', 'xac_nhan', 'tu_choi', 'hoan'))
  NOT VALID;
ALTER TABLE btc_assignments VALIDATE CONSTRAINT chk_ba_status;

-- BTC finance type
ALTER TABLE btc_finance
  ADD CONSTRAINT chk_bf_type
  CHECK (loai IN ('thu', 'chi'))
  NOT VALID;
ALTER TABLE btc_finance VALIDATE CONSTRAINT chk_bf_type;

-- BTC finance status
ALTER TABLE btc_finance
  ADD CONSTRAINT chk_bf_status
  CHECK (trang_thai IN ('chua_thu', 'da_thu', 'hoan', 'mien'))
  NOT VALID;
ALTER TABLE btc_finance VALIDATE CONSTRAINT chk_bf_status;

-- BTC meeting status
ALTER TABLE btc_meetings
  ADD CONSTRAINT chk_bm_status
  CHECK (trang_thai IN ('du_kien', 'dang_hop', 'hoan_thanh', 'huy'))
  NOT VALID;
ALTER TABLE btc_meetings VALIDATE CONSTRAINT chk_bm_status;

-- BTC protest status
ALTER TABLE btc_protests
  ADD CONSTRAINT chk_bp_status
  CHECK (trang_thai IN ('moi', 'dang_xu_ly', 'chap_nhan', 'bac_bo', 'rut_lai'))
  NOT VALID;
ALTER TABLE btc_protests VALIDATE CONSTRAINT chk_bp_status;

-- Parent link status
ALTER TABLE parent_links
  ADD CONSTRAINT chk_pl_status
  CHECK (status IN ('pending', 'approved', 'rejected', 'revoked'))
  NOT VALID;
ALTER TABLE parent_links VALIDATE CONSTRAINT chk_pl_status;

-- Parent consent status
ALTER TABLE parent_consents
  ADD CONSTRAINT chk_pc_status
  CHECK (status IN ('active', 'expired', 'revoked'))
  NOT VALID;
ALTER TABLE parent_consents VALIDATE CONSTRAINT chk_pc_status;

-- Training session status
ALTER TABLE training_sessions
  ADD CONSTRAINT chk_ts_status
  CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled'))
  NOT VALID;
ALTER TABLE training_sessions VALIDATE CONSTRAINT chk_ts_status;

-- ════════════════════════════════════════════════════════
-- 4. NOT NULL CONSTRAINTS (2-step for zero-downtime)
-- ════════════════════════════════════════════════════════

-- Tournament categories
ALTER TABLE tournament_categories
  ADD CONSTRAINT chk_tc_tid_nn CHECK (tournament_id IS NOT NULL) NOT VALID;
ALTER TABLE tournament_categories VALIDATE CONSTRAINT chk_tc_tid_nn;

-- Tournament registrations
ALTER TABLE tournament_registrations
  ADD CONSTRAINT chk_tr_tid_nn CHECK (tournament_id IS NOT NULL) NOT VALID;
ALTER TABLE tournament_registrations VALIDATE CONSTRAINT chk_tr_tid_nn;

COMMIT;


-- ─── Source: 0051_schema_consolidation.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0051: SCHEMA CONSOLIDATION
-- P0 Critical: Resolve dual-schema conflicts by creating
-- compatibility views and deprecating legacy duplicates
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. COMPATIBILITY VIEWS
--    Create unified views that JOIN legacy + new tables
--    API layer should query views, not tables directly
-- ════════════════════════════════════════════════════════

-- 1a. Unified Registrations View
-- Merges: public.registrations (0002) + tournament_registrations (0045)
CREATE OR REPLACE VIEW api_v1.registrations_unified AS
-- New-style registrations (0045)
SELECT
  tr.id,
  tr.tournament_id,
  tr.team_name,
  tr.province,
  tr.status,
  tr.head_coach,
  tr.total_athletes,
  tr.total_contents,
  tr.submitted_at,
  tr.approved_at,
  tr.notes,
  tr.created_at,
  tr.updated_at,
  tr.tenant_id,
  'v2' AS source_version
FROM tournament_registrations tr
WHERE tr.is_deleted = false

UNION ALL

-- Legacy registrations (0002) not in new system
SELECT
  r.id,
  r.tournament_id,
  '' AS team_name,
  '' AS province,
  r.trang_thai AS status,
  '' AS head_coach,
  0 AS total_athletes,
  0 AS total_contents,
  NULL AS submitted_at,
  NULL AS approved_at,
  r.ghi_chu AS notes,
  r.created_at,
  r.updated_at,
  r.tenant_id,
  'v1' AS source_version
FROM registrations r
WHERE r.is_deleted = false
  AND NOT EXISTS (
    SELECT 1 FROM tournament_registrations tr
    WHERE tr.tournament_id = r.tournament_id
  );

-- 1b. Unified Results View
-- Merges: public.results + public.medals (0003) + tournament_results (0045)
CREATE OR REPLACE VIEW api_v1.results_unified AS
SELECT
  tr.id,
  tr.tournament_id,
  tr.category_name,
  tr.content_type,
  tr.gold_name,
  tr.gold_team,
  tr.silver_name,
  tr.silver_team,
  tr.bronze1_name,
  tr.bronze1_team,
  tr.bronze2_name,
  tr.bronze2_team,
  tr.is_finalized,
  tr.created_at,
  tr.updated_at,
  tr.tenant_id,
  'v2' AS source_version
FROM tournament_results tr
WHERE tr.is_deleted = false;

-- 1c. Unified Team Standings View
CREATE OR REPLACE VIEW api_v1.standings_unified AS
SELECT
  ts.id,
  ts.tournament_id,
  ts.team_name,
  ts.province,
  ts.gold,
  ts.silver,
  ts.bronze,
  ts.total_medals,
  ts.points,
  ts.rank,
  ts.updated_at,
  ts.tenant_id
FROM tournament_team_standings ts;

-- ════════════════════════════════════════════════════════
-- 2. RENAME LEGACY TABLES (DEPRECATION MARKERS)
--    Add comments to mark legacy tables for future removal
-- ════════════════════════════════════════════════════════

COMMENT ON TABLE registrations IS 
  '[DEPRECATED] Use tournament_registrations (0045) instead. Kept for backward compatibility.';

DO $$ BEGIN
  COMMENT ON TABLE medals IS 
    '[DEPRECATED] Use tournament_results (0045) instead. Kept for backward compatibility.';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  COMMENT ON TABLE results IS 
    '[DEPRECATED] Use tournament_results (0045) instead. Kept for backward compatibility.';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ════════════════════════════════════════════════════════
-- 3. SCHEMA MAPPING TABLE
--    Track which tables are legacy vs active
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.schema_registry (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  table_schema    VARCHAR(50) NOT NULL,
  table_name      VARCHAR(100) NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'deprecated', 'archived', 'removed')),
  replaced_by     VARCHAR(200),          -- 'tournament_registrations'
  migration_ref   VARCHAR(20),           -- '0045'
  notes           TEXT,
  deprecated_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (table_schema, table_name)
);

-- Seed: mark deprecated tables
INSERT INTO system.schema_registry (table_schema, table_name, status, replaced_by, migration_ref, notes, deprecated_at)
VALUES
  ('public', 'registrations', 'deprecated', 'tournament_registrations', '0045',
   'Legacy registration system. New tables have team_type, province, approval workflow.', NOW()),
  ('public', 'medals', 'deprecated', 'tournament_results', '0045',
   'Legacy medal tracking. New tournament_results has full denormalized results.', NOW()),
  ('public', 'results', 'deprecated', 'tournament_results', '0045',
   'Legacy results. See tournament_results for unified results.', NOW())
ON CONFLICT (table_schema, table_name) DO NOTHING;

-- Mark active tables
INSERT INTO system.schema_registry (table_schema, table_name, status, migration_ref)
VALUES
  ('public', 'tournament_categories', 'active', '0045'),
  ('public', 'tournament_registrations', 'active', '0045'),
  ('public', 'tournament_registration_athletes', 'active', '0045'),
  ('public', 'tournament_schedule_slots', 'active', '0045'),
  ('public', 'tournament_arena_assignments', 'active', '0045'),
  ('public', 'tournament_results', 'active', '0045'),
  ('public', 'tournament_team_standings', 'active', '0045'),
  ('public', 'btc_members', 'active', '0048'),
  ('public', 'btc_weigh_ins', 'active', '0048'),
  ('public', 'btc_draws', 'active', '0048'),
  ('public', 'btc_assignments', 'active', '0048'),
  ('public', 'btc_team_results', 'active', '0048'),
  ('public', 'btc_content_results', 'active', '0048'),
  ('public', 'btc_finance', 'active', '0048'),
  ('public', 'btc_meetings', 'active', '0048'),
  ('public', 'btc_protests', 'active', '0048'),
  ('public', 'parent_links', 'active', '0048'),
  ('public', 'parent_consents', 'active', '0048'),
  ('public', 'parent_attendance', 'active', '0048'),
  ('public', 'parent_results', 'active', '0048'),
  ('public', 'training_sessions', 'active', '0048')
ON CONFLICT (table_schema, table_name) DO NOTHING;

COMMIT;


-- ─── Source: 0052_auto_partition_connection.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0052: AUTO-PARTITION + CONNECTION CONFIG
-- P1 High: Automated partition management + DB-level settings
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. AUTO-PARTITION MANAGEMENT FUNCTION
--    Creates future partitions automatically
--    Called by scheduled task monthly
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION system.ensure_future_partitions(
  p_months_ahead INT DEFAULT 3
)
RETURNS TABLE (
  partition_table TEXT,
  partition_name TEXT,
  date_range TEXT,
  action TEXT
) AS $$
DECLARE
  i INT;
  v_start DATE;
  v_end DATE;
  v_name TEXT;
  v_exists BOOLEAN;
BEGIN
  -- ── Match Events (quarterly partitions) ──
  FOR i IN 0..((p_months_ahead / 3) + 1) LOOP
    v_start := date_trunc('quarter', NOW() + ((i * 3) || ' months')::INTERVAL)::DATE;
    v_end := (v_start + INTERVAL '3 months')::DATE;
    v_name := format('tournament.match_events_%s_q%s',
      extract(YEAR FROM v_start)::INT,
      extract(QUARTER FROM v_start)::INT);

    SELECT EXISTS(
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname || '.' || c.relname = v_name
    ) INTO v_exists;

    IF NOT v_exists THEN
      BEGIN
        EXECUTE format(
          'CREATE TABLE IF NOT EXISTS %s PARTITION OF tournament.match_events
           FOR VALUES FROM (%L) TO (%L)',
          v_name, v_start, v_end);
        partition_table := 'tournament.match_events';
        partition_name := v_name;
        date_range := v_start || ' → ' || v_end;
        action := 'CREATED';
        RETURN NEXT;
      EXCEPTION WHEN others THEN
        partition_table := 'tournament.match_events';
        partition_name := v_name;
        date_range := v_start || ' → ' || v_end;
        action := 'ERROR: ' || SQLERRM;
        RETURN NEXT;
      END;
    END IF;
  END LOOP;

  -- ── Audit Log (monthly partitions) ──
  FOR i IN 0..p_months_ahead LOOP
    v_start := date_trunc('month', NOW() + (i || ' months')::INTERVAL)::DATE;
    v_end := (v_start + INTERVAL '1 month')::DATE;
    v_name := format('system.audit_log_%s_%s',
      extract(YEAR FROM v_start)::INT,
      lpad(extract(MONTH FROM v_start)::INT::TEXT, 2, '0'));

    SELECT EXISTS(
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname || '.' || c.relname = v_name
    ) INTO v_exists;

    IF NOT v_exists THEN
      BEGIN
        EXECUTE format(
          'CREATE TABLE IF NOT EXISTS %s PARTITION OF system.audit_log_partitioned
           FOR VALUES FROM (%L) TO (%L)',
          v_name, v_start, v_end);
        partition_table := 'system.audit_log_partitioned';
        partition_name := v_name;
        date_range := v_start || ' → ' || v_end;
        action := 'CREATED';
        RETURN NEXT;
      EXCEPTION WHEN others THEN
        partition_table := 'system.audit_log_partitioned';
        partition_name := v_name;
        date_range := v_start || ' → ' || v_end;
        action := 'ERROR: ' || SQLERRM;
        RETURN NEXT;
      END;
    END IF;
  END LOOP;

  -- ── Analytics Daily (monthly partitions) ──
  FOR i IN 0..p_months_ahead LOOP
    v_start := date_trunc('month', NOW() + (i || ' months')::INTERVAL)::DATE;
    v_end := (v_start + INTERVAL '1 month')::DATE;
    v_name := format('system.analytics_daily_%s_%s',
      extract(YEAR FROM v_start)::INT,
      lpad(extract(MONTH FROM v_start)::INT::TEXT, 2, '0'));

    SELECT EXISTS(
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname || '.' || c.relname = v_name
    ) INTO v_exists;

    IF NOT v_exists THEN
      BEGIN
        EXECUTE format(
          'CREATE TABLE IF NOT EXISTS %s PARTITION OF system.analytics_daily
           FOR VALUES FROM (%L) TO (%L)',
          v_name, v_start, v_end);
        partition_table := 'system.analytics_daily';
        partition_name := v_name;
        date_range := v_start || ' → ' || v_end;
        action := 'CREATED';
        RETURN NEXT;
      EXCEPTION WHEN others THEN
        partition_table := 'system.analytics_daily';
        partition_name := v_name;
        date_range := v_start || ' → ' || v_end;
        action := 'ERROR: ' || SQLERRM;
        RETURN NEXT;
      END;
    END IF;
  END LOOP;

  -- ── User Activity Log (monthly partitions) ──
  FOR i IN 0..p_months_ahead LOOP
    v_start := date_trunc('month', NOW() + (i || ' months')::INTERVAL)::DATE;
    v_end := (v_start + INTERVAL '1 month')::DATE;
    v_name := format('core.user_activity_%s_%s',
      extract(YEAR FROM v_start)::INT,
      lpad(extract(MONTH FROM v_start)::INT::TEXT, 2, '0'));

    SELECT EXISTS(
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname || '.' || c.relname = v_name
    ) INTO v_exists;

    IF NOT v_exists THEN
      BEGIN
        EXECUTE format(
          'CREATE TABLE IF NOT EXISTS %s PARTITION OF core.user_activity_log
           FOR VALUES FROM (%L) TO (%L)',
          v_name, v_start, v_end);
        partition_table := 'core.user_activity_log';
        partition_name := v_name;
        date_range := v_start || ' → ' || v_end;
        action := 'CREATED';
        RETURN NEXT;
      EXCEPTION WHEN others THEN
        partition_table := 'core.user_activity_log';
        partition_name := v_name;
        date_range := v_start || ' → ' || v_end;
        action := 'ERROR: ' || SQLERRM;
        RETURN NEXT;
      END;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 2. REGISTER PARTITION MAINTENANCE SCHEDULED TASK
-- ════════════════════════════════════════════════════════

INSERT INTO system.scheduled_tasks (name, cron_expression, job_type, description, payload)
VALUES (
  'create_future_partitions',
  '0 0 1 * *',          -- 1st of every month at midnight
  'partition_manager',
  'Auto-create partitions for next 3 months across all partitioned tables',
  '{"months_ahead": 3}'
)
ON CONFLICT (name) DO UPDATE SET
  cron_expression = EXCLUDED.cron_expression,
  description = EXCLUDED.description,
  payload = EXCLUDED.payload,
  updated_at = NOW();

-- Run immediately to ensure partitions exist
SELECT * FROM system.ensure_future_partitions(6);

-- ════════════════════════════════════════════════════════
-- 3. CONNECTION & QUERY SAFETY SETTINGS
--    Prevent long-running queries from blocking
-- ════════════════════════════════════════════════════════

-- Statement timeout: 30 seconds max per query
DO $$ BEGIN
  EXECUTE 'ALTER DATABASE ' || current_database() || ' SET statement_timeout = ''30s''';
EXCEPTION WHEN others THEN NULL;
END $$;

-- Idle transaction timeout: 60 seconds
DO $$ BEGIN
  EXECUTE 'ALTER DATABASE ' || current_database() || ' SET idle_in_transaction_session_timeout = ''60s''';
EXCEPTION WHEN others THEN NULL;
END $$;

-- Lock wait timeout: 10 seconds
DO $$ BEGIN
  EXECUTE 'ALTER DATABASE ' || current_database() || ' SET lock_timeout = ''10s''';
EXCEPTION WHEN others THEN NULL;
END $$;

-- ════════════════════════════════════════════════════════
-- 4. CONNECTION MONITORING VIEW
-- ════════════════════════════════════════════════════════

DROP VIEW IF EXISTS system.v_connection_stats CASCADE;
CREATE VIEW system.v_connection_stats AS
SELECT
  state,
  count(*) AS count,
  max(NOW() - state_change) AS max_duration,
  avg(NOW() - state_change) AS avg_duration,
  count(*) FILTER (WHERE wait_event_type = 'Lock') AS waiting_on_lock
FROM pg_stat_activity
WHERE datname = current_database()
  AND pid != pg_backend_pid()
GROUP BY state;

-- ════════════════════════════════════════════════════════
-- 5. PARTITION HEALTH CHECK VIEW
-- ════════════════════════════════════════════════════════

DROP VIEW IF EXISTS system.v_partition_health CASCADE;
CREATE VIEW system.v_partition_health AS
SELECT
  nmsp_parent.nspname  AS parent_schema,
  parent.relname       AS parent_table,
  nmsp_child.nspname   AS partition_schema,
  child.relname        AS partition_name,
  pg_size_pretty(pg_relation_size(child.oid)) AS partition_size,
  pg_stat_get_live_tuples(child.oid) AS live_rows,
  pg_stat_get_dead_tuples(child.oid) AS dead_rows
FROM pg_inherits
JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
JOIN pg_class child ON pg_inherits.inhrelid = child.oid
JOIN pg_namespace nmsp_parent ON parent.relnamespace = nmsp_parent.oid
JOIN pg_namespace nmsp_child ON child.relnamespace = nmsp_child.oid
WHERE parent.relkind = 'p'
ORDER BY parent.relname, child.relname;

COMMIT;


-- ─── Source: 0053_composite_covering_indexes.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0053: COMPOSITE & COVERING INDEXES
-- P1 High: Optimize query performance for common access patterns
-- Wrapped in exception handlers for schema resilience
-- ===============================================================

BEGIN;

-- Helper: create index safely (skip if column/table missing)
DO $$
DECLARE
  v_indexes TEXT[] := ARRAY[
    -- Athletes
    'CREATE INDEX IF NOT EXISTS idx_athletes_tournament_status ON athletes(tournament_id, trang_thai) WHERE is_deleted = false',
    'CREATE INDEX IF NOT EXISTS idx_athletes_club ON athletes(current_club_id, trang_thai) WHERE is_deleted = false AND current_club_id IS NOT NULL',
    'CREATE INDEX IF NOT EXISTS idx_athletes_belt_rank ON athletes(belt_rank_id) WHERE is_deleted = false AND belt_rank_id IS NOT NULL',
    -- Combat Matches
    'CREATE INDEX IF NOT EXISTS idx_matches_tournament_round ON combat_matches(tournament_id, vong, trang_thai) WHERE is_deleted = false',
    'CREATE INDEX IF NOT EXISTS idx_matches_arena_active ON combat_matches(arena_id, trang_thai) WHERE is_deleted = false AND trang_thai IN (''chua_dau'', ''dang_dau'', ''tam_dung'')',
    'CREATE INDEX IF NOT EXISTS idx_matches_category ON combat_matches(content_category_id, tournament_id) WHERE is_deleted = false',
    -- Tournaments
    'CREATE INDEX IF NOT EXISTS idx_tournaments_covering ON tournaments(tenant_id, status, start_date DESC) INCLUDE (name, end_date, location) WHERE is_deleted = false',
    'CREATE INDEX IF NOT EXISTS idx_tournaments_upcoming ON tournaments(start_date) WHERE is_deleted = false AND status IN (''nhap'', ''dang_ky'', ''khoa_dk'')',
    -- Payments
    'CREATE INDEX IF NOT EXISTS idx_payments_confirmed_date ON platform.payments(tenant_id, created_at DESC) WHERE status = ''confirmed''',
    'CREATE INDEX IF NOT EXISTS idx_payments_pending ON platform.payments(tenant_id, fee_schedule_id) WHERE status = ''pending''',
    'CREATE INDEX IF NOT EXISTS idx_invoices_status_date ON platform.invoices(tenant_id, status, due_date) WHERE is_deleted = false',
    -- Registrations
    'CREATE INDEX IF NOT EXISTS idx_new_reg_pending ON tournament_registrations(tournament_id, status) WHERE status IN (''nhap'', ''cho_duyet'')',
    'CREATE INDEX IF NOT EXISTS idx_new_reg_province ON tournament_registrations(province) WHERE status = ''da_duyet''',
    -- Community
    'CREATE INDEX IF NOT EXISTS idx_posts_feed ON platform.posts(tenant_id, created_at DESC) WHERE is_deleted = false AND visibility = ''public''',
    'CREATE INDEX IF NOT EXISTS idx_posts_author ON platform.posts(author_id, created_at DESC) WHERE is_deleted = false',
    'CREATE INDEX IF NOT EXISTS idx_comments_post ON platform.comments(post_id, created_at) WHERE is_deleted = false',
    -- Training
    'CREATE INDEX IF NOT EXISTS idx_training_sess_athlete_date ON training_sessions(athlete_id, date)',
    'CREATE INDEX IF NOT EXISTS idx_belt_exams_tenant_date ON training.belt_examinations(tenant_id, exam_date DESC) WHERE is_deleted = false',
    -- People
    'CREATE INDEX IF NOT EXISTS idx_coaches_club_status ON people.coaches(club_id, status) WHERE is_deleted = false',
    'CREATE INDEX IF NOT EXISTS idx_memberships_active ON people.club_memberships(club_id, status) WHERE status = ''active'' AND is_deleted = false',
    -- BTC
    'CREATE INDEX IF NOT EXISTS idx_btc_weigh_result ON btc_weigh_ins(giai_id, ket_qua)',
    'CREATE INDEX IF NOT EXISTS idx_btc_protests_pending ON btc_protests(giai_id, trang_thai) WHERE trang_thai IN (''moi'', ''dang_xu_ly'')',
    'CREATE INDEX IF NOT EXISTS idx_schedule_active ON tournament_schedule_slots(tournament_id, date, session) WHERE status != ''hoan''',
    -- Heritage
    'CREATE INDEX IF NOT EXISTS idx_heritage_tech_school ON platform.heritage_techniques(school_id, category) WHERE is_deleted = false',
    'CREATE INDEX IF NOT EXISTS idx_glossary_alpha ON platform.heritage_glossary(term_vi) WHERE is_deleted = false'
  ];
  v_sql TEXT;
  v_count INT := 0;
  v_skip INT := 0;
BEGIN
  FOREACH v_sql IN ARRAY v_indexes LOOP
    BEGIN
      EXECUTE v_sql;
      v_count := v_count + 1;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipped index: % — %', v_sql, SQLERRM;
      v_skip := v_skip + 1;
    END;
  END LOOP;
  RAISE NOTICE 'Indexes: % created, % skipped', v_count, v_skip;
END $$;

COMMIT;


-- ─── Source: 0054_matview_refresh_strategy.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0054: MATERIALIZED VIEW REFRESH STRATEGY
-- P1 High: Cached counters + smarter refresh patterns
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. CACHED COUNTERS ON TOURNAMENT TABLE
--    Avoid expensive COUNT(*) subqueries in API views
--    Updated by triggers on related tables
-- ════════════════════════════════════════════════════════

ALTER TABLE tournaments
  ADD COLUMN IF NOT EXISTS cached_athlete_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cached_team_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cached_match_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cached_registration_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS counts_refreshed_at TIMESTAMPTZ;

-- Trigger: update athlete count when athletes change
CREATE OR REPLACE FUNCTION trigger_update_tournament_athlete_count()
RETURNS TRIGGER AS $$
DECLARE
  v_tournament_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_tournament_id := OLD.tournament_id;
  ELSE
    v_tournament_id := NEW.tournament_id;
  END IF;

  IF v_tournament_id IS NOT NULL THEN
    UPDATE tournaments SET
      cached_athlete_count = (
        SELECT count(*) FROM athletes
        WHERE tournament_id = v_tournament_id AND is_deleted = false
      ),
      counts_refreshed_at = NOW()
    WHERE id = v_tournament_id;
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD;
  ELSE RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER update_tournament_athlete_count
    AFTER INSERT OR UPDATE OF tournament_id, is_deleted OR DELETE ON athletes
    FOR EACH ROW EXECUTE FUNCTION trigger_update_tournament_athlete_count();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Trigger: update team count
CREATE OR REPLACE FUNCTION trigger_update_tournament_team_count()
RETURNS TRIGGER AS $$
DECLARE
  v_tournament_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN v_tournament_id := OLD.tournament_id;
  ELSE v_tournament_id := NEW.tournament_id;
  END IF;

  IF v_tournament_id IS NOT NULL THEN
    UPDATE tournaments SET
      cached_team_count = (
        SELECT count(*) FROM teams
        WHERE tournament_id = v_tournament_id AND is_deleted = false
      ),
      counts_refreshed_at = NOW()
    WHERE id = v_tournament_id;
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD;
  ELSE RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER update_tournament_team_count
    AFTER INSERT OR UPDATE OF tournament_id, is_deleted OR DELETE ON teams
    FOR EACH ROW EXECUTE FUNCTION trigger_update_tournament_team_count();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Trigger: update match count
CREATE OR REPLACE FUNCTION trigger_update_tournament_match_count()
RETURNS TRIGGER AS $$
DECLARE
  v_tournament_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN v_tournament_id := OLD.tournament_id;
  ELSE v_tournament_id := NEW.tournament_id;
  END IF;

  IF v_tournament_id IS NOT NULL THEN
    UPDATE tournaments SET
      cached_match_count = (
        SELECT count(*) FROM combat_matches
        WHERE tournament_id = v_tournament_id AND is_deleted = false
      ),
      counts_refreshed_at = NOW()
    WHERE id = v_tournament_id;
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD;
  ELSE RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER update_tournament_match_count
    AFTER INSERT OR UPDATE OF tournament_id, is_deleted OR DELETE ON combat_matches
    FOR EACH ROW EXECUTE FUNCTION trigger_update_tournament_match_count();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ════════════════════════════════════════════════════════
-- 2. UPDATE API VIEW TO USE CACHED COUNTS
--    Replaces expensive correlated subqueries
-- ════════════════════════════════════════════════════════

DROP VIEW IF EXISTS api_v1.tournaments CASCADE;
CREATE VIEW api_v1.tournaments AS
SELECT
  t.id, t.tenant_id, t.name,
  t.start_date, t.end_date,
  t.location, t.status,
  t.is_deleted,
  t.created_at, t.updated_at,
  t.metadata,
  COALESCE(t.cached_athlete_count, 0) AS athlete_count,
  COALESCE(t.cached_team_count, 0) AS team_count,
  COALESCE(t.cached_match_count, 0) AS match_count,
  t.counts_refreshed_at
FROM tournaments t
WHERE t.is_deleted = false;

-- ════════════════════════════════════════════════════════
-- 3. BULK REFRESH FUNCTION (One-time backfill + maintenance)
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION system.refresh_tournament_counts()
RETURNS TABLE (
  tournament_id UUID,
  athletes INT,
  teams INT,
  matches INT
) AS $$
BEGIN
  RETURN QUERY
  UPDATE tournaments t SET
    cached_athlete_count = COALESCE(ac.cnt, 0),
    cached_team_count = COALESCE(tc.cnt, 0),
    cached_match_count = COALESCE(mc.cnt, 0),
    counts_refreshed_at = NOW()
  FROM (
    SELECT id FROM tournaments WHERE is_deleted = false
  ) src
  LEFT JOIN (
    SELECT a.tournament_id, count(*) AS cnt
    FROM athletes a WHERE a.is_deleted = false
    GROUP BY a.tournament_id
  ) ac ON ac.tournament_id = src.id
  LEFT JOIN (
    SELECT tm.tournament_id, count(*) AS cnt
    FROM teams tm WHERE tm.is_deleted = false
    GROUP BY tm.tournament_id
  ) tc ON tc.tournament_id = src.id
  LEFT JOIN (
    SELECT m.tournament_id, count(*) AS cnt
    FROM combat_matches m WHERE m.is_deleted = false
    GROUP BY m.tournament_id
  ) mc ON mc.tournament_id = src.id
  WHERE t.id = src.id
  RETURNING t.id AS tournament_id,
    COALESCE(ac.cnt, 0)::INT AS athletes,
    COALESCE(tc.cnt, 0)::INT AS teams,
    COALESCE(mc.cnt, 0)::INT AS matches;
END;
$$ LANGUAGE plpgsql;

-- Initial backfill
SELECT * FROM system.refresh_tournament_counts();

-- ════════════════════════════════════════════════════════
-- 4. SMART MATVIEW REFRESH
--    Only refresh if underlying data changed
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.matview_refresh_log (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  view_name       VARCHAR(200) NOT NULL,
  refreshed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_ms     INT,
  rows_affected   BIGINT,
  triggered_by    VARCHAR(50) DEFAULT 'scheduled',
  success         BOOLEAN DEFAULT true,
  error_message   TEXT
);

CREATE INDEX IF NOT EXISTS idx_matview_log_view
  ON system.matview_refresh_log(view_name, refreshed_at DESC);

-- Smart refresh function: checks if refresh is needed
CREATE OR REPLACE FUNCTION system.smart_matview_refresh(
  p_view_name TEXT,
  p_min_interval_seconds INT DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
  v_last_refresh TIMESTAMPTZ;
  v_start TIMESTAMPTZ;
  v_duration INT;
BEGIN
  -- Check when last refreshed
  SELECT refreshed_at INTO v_last_refresh
  FROM system.matview_refresh_log
  WHERE view_name = p_view_name AND success = true
  ORDER BY refreshed_at DESC
  LIMIT 1;

  -- Skip if refreshed recently
  IF v_last_refresh IS NOT NULL
    AND v_last_refresh > NOW() - (p_min_interval_seconds || ' seconds')::INTERVAL
  THEN
    RETURN false;
  END IF;

  -- Perform refresh
  v_start := clock_timestamp();
  BEGIN
    EXECUTE format('REFRESH MATERIALIZED VIEW %s', p_view_name);
    v_duration := extract(EPOCH FROM clock_timestamp() - v_start) * 1000;

    INSERT INTO system.matview_refresh_log (view_name, duration_ms, triggered_by, success)
    VALUES (p_view_name, v_duration, 'smart_refresh', true);

    RETURN true;
  EXCEPTION WHEN others THEN
    INSERT INTO system.matview_refresh_log (view_name, triggered_by, success, error_message)
    VALUES (p_view_name, 'smart_refresh', false, SQLERRM);
    RETURN false;
  END;
END;
$$ LANGUAGE plpgsql;

COMMIT;


-- ─── Source: 0055_audit_system_upgrade.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0055: AUDIT SYSTEM UPGRADE
-- P2 Medium: Auto-attach audit triggers to ALL tenant-aware tables
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. ENHANCED AUDIT TRIGGER FUNCTION
--    Captures request context (IP, user-agent, request-id)
--    from session variables set by Go middleware
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION trigger_audit_log_v2()
RETURNS TRIGGER AS $$
DECLARE
  v_old     JSONB;
  v_new     JSONB;
  v_changed JSONB;
  v_tenant  UUID;
  v_record  UUID;
  v_user    UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_old := to_jsonb(OLD);
    v_new := NULL;
    v_tenant := OLD.tenant_id;
    v_record := OLD.id;
  ELSIF TG_OP = 'INSERT' THEN
    v_old := NULL;
    v_new := to_jsonb(NEW);
    v_tenant := NEW.tenant_id;
    v_record := NEW.id;
  ELSE -- UPDATE
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
    v_tenant := NEW.tenant_id;
    v_record := NEW.id;
    
    -- Compute changed fields (exclude housekeeping columns)
    SELECT jsonb_agg(key) INTO v_changed
    FROM jsonb_each(v_new) AS n(key, val)
    WHERE v_old -> key IS DISTINCT FROM val
      AND key NOT IN ('updated_at', 'version', 'counts_refreshed_at',
                      'search_vector', 'cached_athlete_count',
                      'cached_team_count', 'cached_match_count',
                      'cached_registration_count');
    
    -- Skip if nothing meaningful changed
    IF v_changed IS NULL OR jsonb_array_length(v_changed) = 0 THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Get current user from session
  BEGIN
    v_user := NULLIF(current_setting('app.current_user', true), '')::UUID;
  EXCEPTION WHEN others THEN
    v_user := NULL;
  END;

  INSERT INTO system.audit_log_partitioned
    (tenant_id, table_name, record_id, action,
     old_data, new_data, changed_fields,
     user_id, ip_address, request_id)
  VALUES (
    COALESCE(v_tenant, '00000000-0000-7000-8000-000000000001'),
    TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
    v_record,
    TG_OP,
    v_old, v_new,
    COALESCE(v_changed, '[]'),
    v_user,
    NULLIF(current_setting('app.client_ip', true), '')::INET,
    NULLIF(current_setting('app.request_id', true), '')
  );

  IF TG_OP = 'DELETE' THEN RETURN OLD;
  ELSE RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 2. AUTO-ATTACH AUDIT TO ALL TENANT-AWARE TABLES
--    Discovers tables with tenant_id column dynamically
-- ════════════════════════════════════════════════════════

DO $$
DECLARE
  r RECORD;
  trigger_name TEXT;
BEGIN
  FOR r IN
    SELECT DISTINCT c.table_schema, c.table_name
    FROM information_schema.columns c
    JOIN information_schema.tables t
      ON t.table_schema = c.table_schema
      AND t.table_name = c.table_name
      AND t.table_type = 'BASE TABLE'
    WHERE c.column_name = 'tenant_id'
      AND c.table_schema NOT IN ('pg_catalog', 'information_schema')
      -- Skip partitioned parent tables (triggers are on children)
      AND NOT EXISTS (
        SELECT 1 FROM pg_partitioned_table pt
        JOIN pg_class pc ON pt.partrelid = pc.oid
        JOIN pg_namespace pn ON pc.relnamespace = pn.oid
        WHERE pn.nspname = c.table_schema AND pc.relname = c.table_name
      )
      -- Must have 'id' column for record_id
      AND EXISTS (
        SELECT 1 FROM information_schema.columns c2
        WHERE c2.table_schema = c.table_schema
          AND c2.table_name = c.table_name
          AND c2.column_name = 'id'
      )
  LOOP
    trigger_name := 'audit_log_v2';
    BEGIN
      EXECUTE format(
        'CREATE TRIGGER %I
          AFTER INSERT OR UPDATE OR DELETE ON %I.%I
          FOR EACH ROW EXECUTE FUNCTION trigger_audit_log_v2()',
        trigger_name, r.table_schema, r.table_name
      );
      RAISE NOTICE 'Audit trigger created on %.%', r.table_schema, r.table_name;
    EXCEPTION
      WHEN duplicate_object THEN
        RAISE NOTICE 'Audit trigger already exists on %.%', r.table_schema, r.table_name;
    END;
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════
-- 3. AUDIT SUMMARY VIEW
--    Quick overview of audit activity
-- ════════════════════════════════════════════════════════

DROP VIEW IF EXISTS system.v_audit_summary CASCADE;
CREATE VIEW system.v_audit_summary AS
SELECT
  date_trunc('hour', created_at) AS hour,
  table_name,
  action,
  count(*) AS event_count,
  count(DISTINCT user_id) AS unique_users
FROM system.audit_log_partitioned
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY date_trunc('hour', created_at), table_name, action
ORDER BY hour DESC, event_count DESC;

-- ════════════════════════════════════════════════════════
-- 4. AUDIT COVERAGE REPORT VIEW
--    Shows which tables have/lack audit triggers
-- ════════════════════════════════════════════════════════

DROP VIEW IF EXISTS system.v_audit_coverage CASCADE;
CREATE VIEW system.v_audit_coverage AS
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  EXISTS (
    SELECT 1 FROM pg_trigger t
    WHERE t.tgrelid = c.oid
    AND t.tgname LIKE 'audit_log%'
  ) AS has_audit_trigger,
  EXISTS (
    SELECT 1 FROM information_schema.columns ic
    WHERE ic.table_schema = n.nspname
    AND ic.table_name = c.relname
    AND ic.column_name = 'tenant_id'
  ) AS has_tenant_id,
  c.reltuples::BIGINT AS estimated_rows
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relkind = 'r'
  AND n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
ORDER BY n.nspname, c.relname;

COMMIT;


-- ─── Source: 0056_observability_views.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0056: OBSERVABILITY VIEWS
-- P2 Medium: Slow queries, table bloat, lock monitoring,
-- index health, overall system dashboard
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. SLOW QUERIES VIEW (requires pg_stat_statements)
-- ════════════════════════════════════════════════════════

-- Ensure extension is available
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

DROP VIEW IF EXISTS system.v_slow_queries CASCADE;
CREATE VIEW system.v_slow_queries AS
SELECT
  queryid,
  left(query, 200) AS query_preview,
  calls,
  ROUND(mean_exec_time::NUMERIC, 2) AS avg_ms,
  ROUND(total_exec_time::NUMERIC, 2) AS total_ms,
  rows,
  ROUND(shared_blks_hit::NUMERIC /
    NULLIF(shared_blks_hit + shared_blks_read, 0) * 100, 2
  ) AS cache_hit_pct,
  shared_blks_read AS disk_reads,
  shared_blks_written AS disk_writes
FROM pg_stat_statements
WHERE mean_exec_time > 50   -- > 50ms average
  AND calls > 5              -- at least 5 executions
  AND query NOT LIKE '%pg_stat%'
  AND query NOT LIKE '%system.%'
ORDER BY mean_exec_time DESC
LIMIT 50;

-- ════════════════════════════════════════════════════════
-- 2. TABLE BLOAT DETECTION
-- ════════════════════════════════════════════════════════

DROP VIEW IF EXISTS system.v_table_bloat CASCADE;
CREATE VIEW system.v_table_bloat AS
SELECT
  schemaname,
  relname AS table_name,
  n_live_tup AS live_rows,
  n_dead_tup AS dead_rows,
  CASE WHEN n_live_tup > 0
    THEN ROUND(n_dead_tup::NUMERIC / n_live_tup * 100, 2)
    ELSE 0
  END AS bloat_pct,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
  pg_size_pretty(pg_relation_size(relid)) AS table_size,
  pg_size_pretty(pg_indexes_size(relid)) AS index_size,
  last_autovacuum,
  last_autoanalyze,
  CASE
    WHEN n_dead_tup > n_live_tup * 0.2 THEN 'CRITICAL'
    WHEN n_dead_tup > n_live_tup * 0.1 THEN 'WARNING'
    ELSE 'OK'
  END AS health
FROM pg_stat_user_tables
WHERE n_live_tup > 100  -- skip tiny tables
ORDER BY n_dead_tup DESC;

-- ════════════════════════════════════════════════════════
-- 3. LOCK CONFLICT MONITORING
-- ════════════════════════════════════════════════════════

DROP VIEW IF EXISTS system.v_lock_conflicts CASCADE;
CREATE VIEW system.v_lock_conflicts AS
SELECT
  blocked.pid AS blocked_pid,
  blocked.usename AS blocked_user,
  blocking.pid AS blocking_pid,
  blocking.usename AS blocking_user,
  left(blocked.query, 150) AS blocked_query,
  left(blocking.query, 150) AS blocking_query,
  NOW() - blocked.query_start AS blocked_duration,
  blocked.wait_event_type,
  blocked.wait_event,
  blocked.state AS blocked_state
FROM pg_stat_activity blocked
JOIN pg_locks bl ON bl.pid = blocked.pid AND NOT bl.granted
JOIN pg_locks bk ON bk.locktype = bl.locktype
  AND bk.database IS NOT DISTINCT FROM bl.database
  AND bk.relation IS NOT DISTINCT FROM bl.relation
  AND bk.page IS NOT DISTINCT FROM bl.page
  AND bk.tuple IS NOT DISTINCT FROM bl.tuple
  AND bk.virtualxid IS NOT DISTINCT FROM bl.virtualxid
  AND bk.transactionid IS NOT DISTINCT FROM bl.transactionid
  AND bk.classid IS NOT DISTINCT FROM bl.classid
  AND bk.objid IS NOT DISTINCT FROM bl.objid
  AND bk.objsubid IS NOT DISTINCT FROM bl.objsubid
  AND bk.pid != bl.pid
  AND bk.granted
JOIN pg_stat_activity blocking ON bk.pid = blocking.pid
ORDER BY blocked_duration DESC;

-- ════════════════════════════════════════════════════════
-- 4. INDEX HEALTH & USAGE
-- ════════════════════════════════════════════════════════

DROP VIEW IF EXISTS system.v_index_health CASCADE;
CREATE VIEW system.v_index_health AS
SELECT
  schemaname,
  relname AS table_name,
  indexrelname AS index_name,
  idx_scan AS times_used,
  idx_tup_read AS rows_read,
  idx_tup_fetch AS rows_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
  pg_relation_size(indexrelid) AS index_size_bytes,
  CASE
    WHEN idx_scan = 0 AND indexrelname NOT LIKE '%_pkey'
      AND indexrelname NOT LIKE '%unique%' THEN 'UNUSED'
    WHEN idx_scan < 10 THEN 'RARELY_USED'
    ELSE 'ACTIVE'
  END AS usage_status
FROM pg_stat_user_indexes
ORDER BY
  CASE WHEN idx_scan = 0 THEN 0 ELSE 1 END,
  pg_relation_size(indexrelid) DESC;

-- Specifically highlight unused indexes (wasting space)
DROP VIEW IF EXISTS system.v_unused_indexes CASCADE;
CREATE VIEW system.v_unused_indexes AS
SELECT
  schemaname,
  relname AS table_name,
  indexrelname AS index_name,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
  pg_relation_size(indexrelid) AS size_bytes
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE '%_pkey'
  AND indexrelname NOT LIKE '%unique%'
  AND indexrelname NOT LIKE 'uq_%'
ORDER BY pg_relation_size(indexrelid) DESC;

-- ════════════════════════════════════════════════════════
-- 5. SYSTEM DASHBOARD VIEW
--    Single query for overall system health
-- ════════════════════════════════════════════════════════

DROP VIEW IF EXISTS system.v_dashboard CASCADE;
CREATE VIEW system.v_dashboard AS
SELECT
  -- Database
  pg_size_pretty(pg_database_size(current_database())) AS db_size,
  
  -- Connections
  (SELECT count(*) FROM pg_stat_activity
   WHERE datname = current_database()) AS total_connections,
  (SELECT count(*) FROM pg_stat_activity
   WHERE datname = current_database() AND state = 'active') AS active_queries,
  (SELECT count(*) FROM pg_stat_activity
   WHERE datname = current_database() AND state = 'idle in transaction') AS idle_in_txn,
  
  -- Performance
  (SELECT ROUND(
    sum(blks_hit)::NUMERIC /
    NULLIF(sum(blks_hit) + sum(blks_read), 0) * 100, 2
  ) FROM pg_stat_database
  WHERE datname = current_database()) AS cache_hit_ratio,
  
  -- Jobs
  (SELECT count(*) FROM system.job_queue
   WHERE status = 'pending') AS pending_jobs,
  (SELECT count(*) FROM system.job_queue
   WHERE status = 'dead') AS dead_jobs,
  (SELECT count(*) FROM system.job_queue
   WHERE status = 'processing'
   AND locked_at < NOW() - INTERVAL '10 minutes') AS stuck_jobs,
  
  -- Outbox
  (SELECT count(*) FROM system.event_outbox
   WHERE published_at IS NULL) AS outbox_pending,
  
  -- Notifications
  (SELECT count(*) FROM system.notification_queue
   WHERE status = 'pending') AS notifications_pending,
  
  -- Tables
  (SELECT count(*) FROM pg_stat_user_tables) AS total_tables,
  (SELECT count(*) FROM pg_stat_user_tables
   WHERE n_dead_tup > n_live_tup * 0.2
   AND n_live_tup > 100) AS tables_need_vacuum,
  
  -- Indexes
  (SELECT count(*) FROM pg_stat_user_indexes
   WHERE idx_scan = 0
   AND indexrelname NOT LIKE '%_pkey') AS unused_indexes,
  
  -- Timestamp
  NOW() AS checked_at;

-- ════════════════════════════════════════════════════════
-- 6. REPLICATION LAG VIEW (for Neon read replicas)
-- ════════════════════════════════════════════════════════

DROP VIEW IF EXISTS system.v_replication_status CASCADE;
CREATE VIEW system.v_replication_status AS
SELECT
  pid,
  client_addr,
  state,
  sent_lsn,
  write_lsn,
  flush_lsn,
  replay_lsn,
  pg_wal_lsn_diff(sent_lsn, replay_lsn) AS replay_lag_bytes,
  pg_size_pretty(pg_wal_lsn_diff(sent_lsn, replay_lsn)) AS replay_lag_pretty
FROM pg_stat_replication;

COMMIT;


-- ─── Source: 0057_archival_pipeline.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0057: DATA ARCHIVAL PIPELINE
-- P2 Medium: Execute retention policies, archive old data,
-- cleanup expired resources
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. ARCHIVE TABLES
--    Cold storage for data past retention period
-- ════════════════════════════════════════════════════════

-- Archive schema
CREATE SCHEMA IF NOT EXISTS archive;

-- Generic archive table (stores any archived data as JSONB)
CREATE TABLE IF NOT EXISTS archive.archived_records (
  id              UUID DEFAULT uuidv7() NOT NULL,
  tenant_id       UUID NOT NULL,
  source_table    VARCHAR(200) NOT NULL,
  source_id       UUID NOT NULL,
  record_data     JSONB NOT NULL,
  archived_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_by     VARCHAR(100) DEFAULT 'system',
  retention_policy_id UUID,
  original_created_at TIMESTAMPTZ,
  PRIMARY KEY (archived_at, tenant_id, id)
) PARTITION BY RANGE (archived_at);

-- Quarterly archive partitions
DO $$
DECLARE
  q INT; y INT;
  v_start DATE; v_end DATE;
BEGIN
  FOR y IN 2026..2027 LOOP
    FOR q IN 1..4 LOOP
      v_start := make_date(y, (q-1)*3 + 1, 1);
      v_end := CASE WHEN q = 4 THEN make_date(y+1, 1, 1)
               ELSE make_date(y, q*3 + 1, 1) END;
      EXECUTE format(
        'CREATE TABLE IF NOT EXISTS archive.archived_%s_q%s
         PARTITION OF archive.archived_records
         FOR VALUES FROM (%L) TO (%L)',
        y, q, v_start, v_end);
    END LOOP;
  END LOOP;
END $$;

CREATE TABLE IF NOT EXISTS archive.archived_default
  PARTITION OF archive.archived_records DEFAULT;

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_archive_source
  ON archive.archived_records(source_table, source_id);

CREATE INDEX IF NOT EXISTS idx_archive_tenant
  ON archive.archived_records(tenant_id, archived_at DESC);

-- ════════════════════════════════════════════════════════
-- 2. RETENTION EXECUTION FUNCTION
--    Processes all active retention policies
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION system.execute_retention_policies(
  p_dry_run BOOLEAN DEFAULT true,
  p_batch_size INT DEFAULT 1000
)
RETURNS TABLE (
  policy_table TEXT,
  strategy TEXT,
  records_affected INT,
  action_taken TEXT
) AS $$
DECLARE
  policy RECORD;
  v_count INT;
  v_sql TEXT;
BEGIN
  FOR policy IN
    SELECT * FROM system.data_retention_policies
    WHERE is_active = true
    ORDER BY retention_days ASC  -- process shortest retention first
  LOOP
    v_count := 0;
    policy_table := policy.table_name;
    strategy := policy.archive_strategy;

    IF p_dry_run THEN
      -- DRY RUN: just count affected rows
      BEGIN
        v_sql := format('SELECT count(*) FROM %s WHERE %s',
          policy.table_name, policy.condition);
        EXECUTE v_sql INTO v_count;

        records_affected := v_count;
        action_taken := 'DRY_RUN: would process ' || v_count || ' rows';
        RETURN NEXT;
      EXCEPTION WHEN others THEN
        records_affected := 0;
        action_taken := 'ERROR: ' || SQLERRM;
        RETURN NEXT;
      END;
    ELSE
      -- EXECUTE: perform actual archival/deletion
      BEGIN
        CASE policy.archive_strategy
          WHEN 'hard_delete_allowed' THEN
            v_sql := format(
              'DELETE FROM %s WHERE %s LIMIT %s',
              policy.table_name, policy.condition, p_batch_size);
            -- PostgreSQL doesn't support DELETE...LIMIT, use CTE
            v_sql := format(
              'WITH to_delete AS (
                SELECT ctid FROM %s WHERE %s LIMIT %s
              )
              DELETE FROM %s WHERE ctid IN (SELECT ctid FROM to_delete)',
              policy.table_name, policy.condition, p_batch_size,
              policy.table_name);
            EXECUTE v_sql;
            GET DIAGNOSTICS v_count = ROW_COUNT;
            action_taken := 'hard_deleted';

          WHEN 'soft_delete' THEN
            v_sql := format(
              'WITH to_soft AS (
                SELECT ctid FROM %s WHERE %s AND is_deleted = false LIMIT %s
              )
              UPDATE %s SET is_deleted = true, deleted_at = NOW()
              WHERE ctid IN (SELECT ctid FROM to_soft)',
              policy.table_name, policy.condition, p_batch_size,
              policy.table_name);
            EXECUTE v_sql;
            GET DIAGNOSTICS v_count = ROW_COUNT;
            action_taken := 'soft_deleted';

          WHEN 'move_to_archive' THEN
            -- Step 1: Copy to archive
            v_sql := format(
              'WITH to_archive AS (
                SELECT ctid, * FROM %s WHERE %s LIMIT %s
              )
              INSERT INTO archive.archived_records
                (tenant_id, source_table, source_id, record_data,
                 original_created_at, retention_policy_id)
              SELECT
                tenant_id, %L, id, to_jsonb(ta.*) - ''ctid'',
                created_at, %L
              FROM to_archive ta',
              policy.table_name, policy.condition, p_batch_size,
              policy.table_name, policy.id);
            EXECUTE v_sql;
            GET DIAGNOSTICS v_count = ROW_COUNT;

            -- Step 2: Delete originals
            IF v_count > 0 THEN
              v_sql := format(
                'WITH to_remove AS (
                  SELECT ctid FROM %s WHERE %s LIMIT %s
                )
                DELETE FROM %s WHERE ctid IN (SELECT ctid FROM to_remove)',
                policy.table_name, policy.condition, p_batch_size,
                policy.table_name);
              EXECUTE v_sql;
            END IF;
            action_taken := 'archived_and_deleted';

          ELSE
            v_count := 0;
            action_taken := 'unknown_strategy';
        END CASE;

        -- Update policy metadata
        UPDATE system.data_retention_policies
        SET last_run_at = NOW(),
            last_archived = v_count,
            updated_at = NOW()
        WHERE id = policy.id;

      EXCEPTION WHEN others THEN
        v_count := 0;
        action_taken := 'ERROR: ' || SQLERRM;
      END;

      records_affected := v_count;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 3. REGISTER ARCHIVAL SCHEDULED TASK
-- ════════════════════════════════════════════════════════

INSERT INTO system.scheduled_tasks (name, cron_expression, job_type, description, payload)
VALUES (
  'execute_retention_policies',
  '0 2 * * *',           -- 2 AM daily
  'retention_executor',
  'Execute data retention policies (archive/delete old data)',
  '{"dry_run": false, "batch_size": 5000}'
)
ON CONFLICT (name) DO UPDATE SET
  cron_expression = EXCLUDED.cron_expression,
  description = EXCLUDED.description,
  payload = EXCLUDED.payload,
  updated_at = NOW();

-- ════════════════════════════════════════════════════════
-- 4. ARCHIVE STATS VIEW
-- ════════════════════════════════════════════════════════

DROP VIEW IF EXISTS system.v_archive_stats CASCADE;
CREATE VIEW system.v_archive_stats AS
SELECT
  source_table,
  count(*) AS archived_count,
  min(archived_at) AS earliest_archived,
  max(archived_at) AS latest_archived,
  pg_size_pretty(
    sum(pg_column_size(record_data))
  ) AS data_size
FROM archive.archived_records
GROUP BY source_table
ORDER BY count(*) DESC;

-- ════════════════════════════════════════════════════════
-- 5. RETENTION POLICY STATUS VIEW
-- ════════════════════════════════════════════════════════

DROP VIEW IF EXISTS system.v_retention_status CASCADE;
CREATE VIEW system.v_retention_status AS
SELECT
  rp.table_name,
  rp.retention_days,
  rp.archive_strategy,
  rp.is_active,
  rp.last_run_at,
  rp.last_archived,
  CASE
    WHEN rp.last_run_at IS NULL THEN 'NEVER_RUN'
    WHEN rp.last_run_at < NOW() - INTERVAL '2 days' THEN 'OVERDUE'
    ELSE 'OK'
  END AS run_status,
  NOW() - rp.last_run_at AS time_since_last_run
FROM system.data_retention_policies rp
ORDER BY rp.last_run_at ASC NULLS FIRST;

COMMIT;


-- ─── Source: 0058_pg17_testing_docs.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0058: PG17 FEATURES + TESTING + DOCS
-- P3 Low: Modern SQL patterns, test data generation,
-- auto-documentation, schema validation
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. MERGE STATEMENTS (PG17+)
--    Cleaner upsert pattern for rankings, stats, standings
-- ════════════════════════════════════════════════════════

-- Function: Upsert tournament team standings using MERGE
CREATE OR REPLACE FUNCTION system.merge_team_standings(
  p_tournament_id UUID,
  p_team_id TEXT,
  p_team_name TEXT,
  p_province TEXT,
  p_gold INT,
  p_silver INT,
  p_bronze INT,
  p_points INT
)
RETURNS VOID AS $$
BEGIN
  -- Use INSERT...ON CONFLICT (PG15+ compatible, PG17 MERGE alternative)
  INSERT INTO tournament_team_standings
    (id, tournament_id, team_id, team_name, province,
     gold, silver, bronze, total_medals, points, updated_at)
  VALUES (
    gen_random_uuid(), p_tournament_id, p_team_id, p_team_name, p_province,
    p_gold, p_silver, p_bronze, p_gold + p_silver + p_bronze, p_points, NOW()
  )
  ON CONFLICT (tournament_id, team_id) DO UPDATE SET
    team_name = EXCLUDED.team_name,
    province = EXCLUDED.province,
    gold = EXCLUDED.gold,
    silver = EXCLUDED.silver,
    bronze = EXCLUDED.bronze,
    total_medals = EXCLUDED.total_medals,
    points = EXCLUDED.points,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function: Upsert athlete rankings
CREATE OR REPLACE FUNCTION system.merge_athlete_ranking(
  p_tenant_id UUID,
  p_athlete_id UUID,
  p_category TEXT,
  p_weight_class TEXT,
  p_national_rank INT,
  p_points NUMERIC
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO rankings
    (id, tenant_id, athlete_id, category, weight_class,
     national_rank, points, last_updated)
  VALUES (
    gen_random_uuid(), p_tenant_id, p_athlete_id, p_category,
    p_weight_class, p_national_rank, p_points, NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    national_rank = EXCLUDED.national_rank,
    points = EXCLUDED.points,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 2. TEST DATA GENERATION
--    Seed realistic test data for development environments
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION system.seed_test_data(
  p_tenant_id UUID DEFAULT '00000000-0000-7000-8000-000000000001',
  p_tournament_count INT DEFAULT 3,
  p_athletes_per_tournament INT DEFAULT 30,
  p_teams_per_tournament INT DEFAULT 6
)
RETURNS TABLE (
  entity_type TEXT,
  count INT
) AS $$
DECLARE
  v_tournament_id UUID;
  v_team_id UUID;
  v_athlete_id UUID;
  i INT;
  j INT;
  k INT;
  v_names TEXT[] := ARRAY[
    'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hoàng Cường',
    'Phạm Minh Đức', 'Hoàng Thị Em', 'Vũ Quốc Phong',
    'Đặng Hải Giang', 'Bùi Thu Hà', 'Ngô Đình Khoa',
    'Dương Thị Lan', 'Lý Văn Minh', 'Trịnh Xuân Nam',
    'Cao Bảo Ngọc', 'Đinh Thanh Phúc', 'Mai Anh Quân',
    'Phan Thị Rin', 'Tạ Đức Sơn', 'Hồ Thanh Tùng',
    'Lương Thị Uyên', 'Đỗ Xuân Vinh', 'Nguyễn Thu Yến',
    'Trần Đức Anh', 'Lê Thị Bảo', 'Phạm Quốc Cảnh',
    'Hoàng Văn Đạt', 'Vũ Thị Giao', 'Đặng Minh Hiếu',
    'Bùi Quang Khải', 'Ngô Thị Linh', 'Trịnh Văn Mạnh'
  ];
  v_provinces TEXT[] := ARRAY[
    'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Bình Dương',
    'Đồng Nai', 'Thừa Thiên Huế', 'Khánh Hòa', 'Cần Thơ',
    'Hải Phòng', 'Quảng Ninh', 'Nghệ An', 'Thanh Hóa'
  ];
  v_statuses TEXT[] := ARRAY['nhap', 'dang_ky', 'khoa_dk', 'thi_dau', 'ket_thuc'];
  v_genders TEXT[] := ARRAY['nam', 'nu'];
  v_total_tournaments INT := 0;
  v_total_teams INT := 0;
  v_total_athletes INT := 0;
  v_total_matches INT := 0;
BEGIN
  -- Generate tournaments
  FOR i IN 1..p_tournament_count LOOP
    v_tournament_id := gen_random_uuid();

    INSERT INTO tournaments (
      id, tenant_id, code, name, start_date, end_date,
      location, status, metadata, created_at
    ) VALUES (
      v_tournament_id,
      p_tenant_id,
      'TEST-' || lpad(i::TEXT, 3, '0'),
      'Giải Võ Cổ Truyền Test ' || i || ' - ' || extract(YEAR FROM NOW()),
      NOW() + ((i * 30) || ' days')::INTERVAL,
      NOW() + ((i * 30 + 3) || ' days')::INTERVAL,
      v_provinces[1 + (i % array_length(v_provinces, 1))],
      v_statuses[1 + (i % array_length(v_statuses, 1))],
      jsonb_build_object('is_test', true, 'generated_at', NOW()),
      NOW()
    ) ON CONFLICT DO NOTHING;

    v_total_tournaments := v_total_tournaments + 1;

    -- Generate teams per tournament
    FOR j IN 1..p_teams_per_tournament LOOP
      v_team_id := gen_random_uuid();

      INSERT INTO teams (
        id, tenant_id, tournament_id, ten,
        tinh_thanh, created_at
      ) VALUES (
        v_team_id, p_tenant_id, v_tournament_id,
        'Đoàn ' || v_provinces[1 + (j % array_length(v_provinces, 1))],
        v_provinces[1 + (j % array_length(v_provinces, 1))],
        NOW()
      ) ON CONFLICT DO NOTHING;

      v_total_teams := v_total_teams + 1;

      -- Generate athletes per team
      FOR k IN 1..LEAST(p_athletes_per_tournament / p_teams_per_tournament, 10) LOOP
        v_athlete_id := gen_random_uuid();

        INSERT INTO athletes (
          id, tenant_id, tournament_id, team_id,
          ho_ten, ngay_sinh, gioi_tinh, can_nang,
          trang_thai, metadata, created_at
        ) VALUES (
          v_athlete_id, p_tenant_id, v_tournament_id, v_team_id,
          v_names[1 + ((j * 10 + k) % array_length(v_names, 1))],
          NOW() - ((18 + (k * 2)) || ' years')::INTERVAL,
          v_genders[1 + (k % 2)],
          50.0 + (k * 5.5),
          'da_xac_nhan',
          jsonb_build_object('is_test', true),
          NOW()
        ) ON CONFLICT DO NOTHING;

        v_total_athletes := v_total_athletes + 1;
      END LOOP;
    END LOOP;
  END LOOP;

  -- Return summary
  entity_type := 'tournaments'; count := v_total_tournaments; RETURN NEXT;
  entity_type := 'teams'; count := v_total_teams; RETURN NEXT;
  entity_type := 'athletes'; count := v_total_athletes; RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 3. CLEANUP TEST DATA
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION system.cleanup_test_data(
  p_tenant_id UUID DEFAULT '00000000-0000-7000-8000-000000000001'
)
RETURNS TABLE (entity_type TEXT, deleted_count INT) AS $$
DECLARE
  v_count INT;
BEGIN
  -- Athletes
  DELETE FROM athletes WHERE metadata @> '{"is_test": true}'::JSONB AND tenant_id = p_tenant_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  entity_type := 'athletes'; deleted_count := v_count; RETURN NEXT;

  -- Teams
  DELETE FROM teams WHERE tenant_id = p_tenant_id
    AND tournament_id IN (
      SELECT id FROM tournaments WHERE metadata @> '{"is_test": true}'::JSONB
    );
  GET DIAGNOSTICS v_count = ROW_COUNT;
  entity_type := 'teams'; deleted_count := v_count; RETURN NEXT;

  -- Tournaments
  DELETE FROM tournaments WHERE metadata @> '{"is_test": true}'::JSONB AND tenant_id = p_tenant_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  entity_type := 'tournaments'; deleted_count := v_count; RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 4. SCHEMA DOCUMENTATION AUTO-GENERATION
--    View providing complete schema docs
-- ════════════════════════════════════════════════════════

DROP VIEW IF EXISTS system.v_schema_docs CASCADE;
CREATE VIEW system.v_schema_docs AS
SELECT
  t.table_schema,
  t.table_name,
  obj_description((t.table_schema || '.' || t.table_name)::regclass) AS table_comment,
  c.column_name,
  c.ordinal_position,
  c.data_type,
  c.is_nullable,
  c.column_default,
  c.character_maximum_length,
  col_description(
    (t.table_schema || '.' || t.table_name)::regclass,
    c.ordinal_position
  ) AS column_comment,
  -- Check if column is indexed
  EXISTS (
    SELECT 1 FROM pg_index pi
    JOIN pg_attribute pa ON pa.attrelid = pi.indrelid AND pa.attnum = ANY(pi.indkey)
    WHERE pi.indrelid = (t.table_schema || '.' || t.table_name)::regclass
    AND pa.attname = c.column_name
  ) AS is_indexed,
  -- Check if column is part of PK
  EXISTS (
    SELECT 1 FROM pg_constraint pc
    JOIN pg_attribute pa ON pa.attrelid = pc.conrelid AND pa.attnum = ANY(pc.conkey)
    WHERE pc.conrelid = (t.table_schema || '.' || t.table_name)::regclass
    AND pc.contype = 'p'
    AND pa.attname = c.column_name
  ) AS is_primary_key,
  -- Check if column has FK
  (
    SELECT tc2.table_schema || '.' || tc2.table_name || '(' || kcu2.column_name || ')'
    FROM information_schema.key_column_usage kcu
    JOIN information_schema.referential_constraints rc
      ON kcu.constraint_name = rc.constraint_name
    JOIN information_schema.key_column_usage kcu2
      ON rc.unique_constraint_name = kcu2.constraint_name
    JOIN information_schema.table_constraints tc2
      ON kcu2.constraint_name = tc2.constraint_name
    WHERE kcu.table_schema = t.table_schema
      AND kcu.table_name = t.table_name
      AND kcu.column_name = c.column_name
    LIMIT 1
  ) AS references_to
FROM information_schema.tables t
JOIN information_schema.columns c
  ON c.table_schema = t.table_schema AND c.table_name = t.table_name
WHERE t.table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_schema, t.table_name, c.ordinal_position;

-- ════════════════════════════════════════════════════════
-- 5. SCHEMA VALIDATION FUNCTION
--    Check database health and convention compliance
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION system.validate_schema()
RETURNS TABLE (
  check_name TEXT,
  severity TEXT,
  table_name TEXT,
  details TEXT
) AS $$
BEGIN
  -- Check: Tables without tenant_id (should have it)
  RETURN QUERY
  SELECT
    'missing_tenant_id'::TEXT,
    'WARNING'::TEXT,
    n.nspname || '.' || c.relname,
    'Table lacks tenant_id column for multi-tenancy'::TEXT
  FROM pg_class c
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE c.relkind = 'r'
    AND n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'archive')
    AND c.reltuples > 0
    AND NOT EXISTS (
      SELECT 1 FROM pg_attribute a
      WHERE a.attrelid = c.oid AND a.attname = 'tenant_id' AND NOT a.attisdropped
    );

  -- Check: Tables without RLS enabled
  RETURN QUERY
  SELECT
    'rls_not_enabled'::TEXT,
    'CRITICAL'::TEXT,
    n.nspname || '.' || c.relname,
    'Table has tenant_id but RLS is not enabled'::TEXT
  FROM pg_class c
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE c.relkind = 'r'
    AND n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'archive')
    AND NOT c.relrowsecurity
    AND EXISTS (
      SELECT 1 FROM pg_attribute a
      WHERE a.attrelid = c.oid AND a.attname = 'tenant_id' AND NOT a.attisdropped
    );

  -- Check: Tables without updated_at trigger
  RETURN QUERY
  SELECT
    'missing_updated_at_trigger'::TEXT,
    'INFO'::TEXT,
    n.nspname || '.' || c.relname,
    'Table has updated_at column but no auto-update trigger'::TEXT
  FROM pg_class c
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE c.relkind = 'r'
    AND n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'archive')
    AND EXISTS (
      SELECT 1 FROM pg_attribute a
      WHERE a.attrelid = c.oid AND a.attname = 'updated_at' AND NOT a.attisdropped
    )
    AND NOT EXISTS (
      SELECT 1 FROM pg_trigger t
      WHERE t.tgrelid = c.oid AND t.tgname = 'set_updated_at'
    );

  -- Check: Tables without audit trigger
  RETURN QUERY
  SELECT
    'missing_audit_trigger'::TEXT,
    'WARNING'::TEXT,
    n.nspname || '.' || c.relname,
    'Table with tenant_id lacks audit trigger'::TEXT
  FROM pg_class c
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE c.relkind = 'r'
    AND n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'archive', 'system')
    AND EXISTS (
      SELECT 1 FROM pg_attribute a
      WHERE a.attrelid = c.oid AND a.attname = 'tenant_id' AND NOT a.attisdropped
    )
    AND NOT EXISTS (
      SELECT 1 FROM pg_trigger t
      WHERE t.tgrelid = c.oid AND t.tgname LIKE 'audit_log%'
    );

  -- Check: Large tables without BRIN index on created_at
  RETURN QUERY
  SELECT
    'missing_brin_index'::TEXT,
    'INFO'::TEXT,
    n.nspname || '.' || c.relname,
    'Large table (>' || c.reltuples::INT || ' rows) without BRIN on created_at'
  FROM pg_class c
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE c.relkind = 'r'
    AND c.reltuples > 10000
    AND EXISTS (
      SELECT 1 FROM pg_attribute a
      WHERE a.attrelid = c.oid AND a.attname = 'created_at' AND NOT a.attisdropped
    )
    AND NOT EXISTS (
      SELECT 1 FROM pg_index pi
      JOIN pg_class ic ON pi.indexrelid = ic.oid
      JOIN pg_am am ON ic.relam = am.oid
      WHERE pi.indrelid = c.oid AND am.amname = 'brin'
    );
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 6. SCHEMA VERSION TRACKING
-- ════════════════════════════════════════════════════════

INSERT INTO system.schema_versions (version, description, applied_by)
VALUES (
  '2.0.0',
  'Major upgrade: tenant isolation, FK constraints, schema consolidation, '
  || 'auto-partitioning, indexes, matview refresh, audit v2, observability, '
  || 'archival pipeline, test infra, schema validation',
  'migration_0049_to_0058'
);

COMMIT;


-- ─── Source: 0059_fuzzy_search_trgm.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0059: FUZZY SEARCH (pg_trgm)
-- P0 Critical: Trigram-based fuzzy matching for Vietnamese names
-- Finds "Ngyen" → "Nguyễn", "tran" → "Trần"
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. ENABLE pg_trgm EXTENSION
-- ════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Set default similarity threshold
SET pg_trgm.similarity_threshold = 0.3;

-- ════════════════════════════════════════════════════════
-- 2. TRIGRAM GIN INDEXES FOR NAME SEARCH
--    GIN + trgm = fast LIKE '%pattern%' + fuzzy matching
-- ════════════════════════════════════════════════════════

DO $$
DECLARE
  v_indexes TEXT[] := ARRAY[
    'CREATE INDEX IF NOT EXISTS idx_athletes_name_trgm ON athletes USING GIN (ho_ten gin_trgm_ops)',
    'CREATE INDEX IF NOT EXISTS idx_clubs_name_trgm ON clubs USING GIN (ten gin_trgm_ops)',
    'CREATE INDEX IF NOT EXISTS idx_schools_name_trgm ON platform.martial_schools USING GIN (name gin_trgm_ops)',
    'CREATE INDEX IF NOT EXISTS idx_tournaments_name_trgm ON tournaments USING GIN (name gin_trgm_ops)',
    'CREATE INDEX IF NOT EXISTS idx_heritage_tech_trgm ON platform.heritage_techniques USING GIN (name gin_trgm_ops)',
    'CREATE INDEX IF NOT EXISTS idx_glossary_term_trgm ON platform.heritage_glossary USING GIN (term_vi gin_trgm_ops)',
    'CREATE INDEX IF NOT EXISTS idx_teams_name_trgm ON teams USING GIN (ten gin_trgm_ops)',
    'CREATE INDEX IF NOT EXISTS idx_posts_title_trgm ON platform.posts USING GIN (title gin_trgm_ops)'
  ];
  v_sql TEXT;
BEGIN
  FOREACH v_sql IN ARRAY v_indexes LOOP
    BEGIN
      EXECUTE v_sql;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipped: % — %', v_sql, SQLERRM;
    END;
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════
-- 3. UNIFIED FUZZY SEARCH FUNCTION
--    Searches across multiple entity types with ranking
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION system.search_fuzzy(
  p_query TEXT,
  p_entity_types TEXT[] DEFAULT ARRAY['athlete', 'club', 'tournament', 'school'],
  p_limit INT DEFAULT 20,
  p_min_similarity REAL DEFAULT 0.3
)
RETURNS TABLE (
  entity_type TEXT,
  entity_id UUID,
  entity_name TEXT,
  similarity_score REAL,
  extra_info JSONB
) AS $$
DECLARE
  v_query TEXT;
  v_tenant UUID;
BEGIN
  v_query := lower(trim(p_query));
  v_tenant := COALESCE(
    NULLIF(current_setting('app.current_tenant', true), '')::UUID,
    '00000000-0000-7000-8000-000000000001'::UUID
  );

  -- Athletes
  IF 'athlete' = ANY(p_entity_types) THEN
    RETURN QUERY
    SELECT
      'athlete'::TEXT,
      a.id,
      a.ho_ten::TEXT,
      similarity(lower(a.ho_ten), v_query),
      jsonb_build_object(
        'tournament_id', a.tournament_id,
        'gioi_tinh', a.gioi_tinh,
        'can_nang', a.can_nang
      )
    FROM athletes a
    WHERE a.is_deleted = false
      AND a.tenant_id = v_tenant
      AND (
        a.ho_ten % v_query                    -- trigram similarity
        OR lower(a.ho_ten) LIKE '%' || v_query || '%'  -- substring
      )
      AND similarity(lower(a.ho_ten), v_query) >= p_min_similarity
    ORDER BY similarity(lower(a.ho_ten), v_query) DESC
    LIMIT p_limit;
  END IF;

  -- Clubs
  IF 'club' = ANY(p_entity_types) THEN
    RETURN QUERY
    SELECT
      'club'::TEXT,
      c.id,
      c.ten::TEXT,
      similarity(lower(c.ten), v_query),
      jsonb_build_object(
        'tinh_thanh', c.tinh_thanh,
        'member_count', c.member_count
      )
    FROM clubs c
    WHERE c.is_deleted = false
      AND c.tenant_id = v_tenant
      AND (c.ten % v_query OR lower(c.ten) LIKE '%' || v_query || '%')
      AND similarity(lower(c.ten), v_query) >= p_min_similarity
    ORDER BY similarity(lower(c.ten), v_query) DESC
    LIMIT p_limit;
  END IF;

  -- Tournaments
  IF 'tournament' = ANY(p_entity_types) THEN
    RETURN QUERY
    SELECT
      'tournament'::TEXT,
      t.id,
      t.name::TEXT,
      similarity(lower(t.name), v_query),
      jsonb_build_object(
        'status', t.status,
        'start_date', t.start_date,
        'location', t.location
      )
    FROM tournaments t
    WHERE t.is_deleted = false
      AND t.tenant_id = v_tenant
      AND (t.name % v_query OR lower(t.name) LIKE '%' || v_query || '%')
      AND similarity(lower(t.name), v_query) >= p_min_similarity
    ORDER BY similarity(lower(t.name), v_query) DESC
    LIMIT p_limit;
  END IF;

  -- Martial schools
  IF 'school' = ANY(p_entity_types) THEN
    RETURN QUERY
    SELECT
      'school'::TEXT,
      s.id,
      s.name::TEXT,
      similarity(lower(s.name), v_query),
      jsonb_build_object(
        'founded_year', s.founded_year,
        'region', s.region
      )
    FROM platform.martial_schools s
    WHERE s.is_deleted = false
      AND s.tenant_id = v_tenant
      AND (s.name % v_query OR lower(s.name) LIKE '%' || v_query || '%')
      AND similarity(lower(s.name), v_query) >= p_min_similarity
    ORDER BY similarity(lower(s.name), v_query) DESC
    LIMIT p_limit;
  END IF;

  -- Teams
  IF 'team' = ANY(p_entity_types) THEN
    RETURN QUERY
    SELECT
      'team'::TEXT,
      tm.id,
      tm.ten::TEXT,
      similarity(lower(tm.ten), v_query),
      jsonb_build_object(
        'tournament_id', tm.tournament_id,
        'tinh_thanh', tm.tinh_thanh
      )
    FROM teams tm
    WHERE tm.is_deleted = false
      AND tm.tenant_id = v_tenant
      AND (tm.ten % v_query OR lower(tm.ten) LIKE '%' || v_query || '%')
      AND similarity(lower(tm.ten), v_query) >= p_min_similarity
    ORDER BY similarity(lower(tm.ten), v_query) DESC
    LIMIT p_limit;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- ════════════════════════════════════════════════════════
-- 4. SEARCH SUGGESTIONS (Autocomplete)
--    Returns top matches as user types
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION system.search_suggest(
  p_query TEXT,
  p_limit INT DEFAULT 5
)
RETURNS TABLE (
  suggestion TEXT,
  entity_type TEXT,
  entity_id UUID
) AS $$
BEGIN
  IF length(trim(p_query)) < 2 THEN
    RETURN;  -- Too short for meaningful results
  END IF;

  RETURN QUERY
  SELECT
    r.entity_name,
    r.entity_type,
    r.entity_id
  FROM system.search_fuzzy(
    p_query,
    ARRAY['athlete', 'club', 'tournament'],
    p_limit,
    0.2  -- Lower threshold for autocomplete
  ) r
  ORDER BY r.similarity_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ════════════════════════════════════════════════════════
-- 5. SEARCH ANALYTICS TABLE
--    Track what users search for → improve search quality
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.search_log (
  id              UUID DEFAULT gen_random_uuid() NOT NULL,
  tenant_id       UUID,
  user_id         UUID,
  query           TEXT NOT NULL,
  entity_types    TEXT[],
  result_count    INT DEFAULT 0,
  top_result_id   UUID,
  top_score       REAL,
  searched_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (searched_at, id)
) PARTITION BY RANGE (searched_at);

-- Monthly partitions
DO $$
DECLARE m INT; y INT; v_start DATE; v_end DATE;
BEGIN
  FOR y IN 2026..2027 LOOP
    FOR m IN 1..12 LOOP
      v_start := make_date(y, m, 1);
      v_end := CASE WHEN m = 12 THEN make_date(y+1, 1, 1)
               ELSE make_date(y, m+1, 1) END;
      BEGIN
        EXECUTE format(
          'CREATE TABLE IF NOT EXISTS system.search_log_%s_%s
           PARTITION OF system.search_log
           FOR VALUES FROM (%L) TO (%L)',
          y, lpad(m::TEXT, 2, '0'), v_start, v_end);
      EXCEPTION WHEN duplicate_table THEN NULL;
      END;
    END LOOP;
  END LOOP;
END $$;

CREATE TABLE IF NOT EXISTS system.search_log_default
  PARTITION OF system.search_log DEFAULT;

-- Popular searches view
DROP VIEW IF EXISTS system.v_popular_searches CASCADE;
CREATE VIEW system.v_popular_searches AS
SELECT
  query,
  count(*) AS search_count,
  avg(result_count) AS avg_results,
  count(*) FILTER (WHERE result_count = 0) AS zero_result_count,
  max(searched_at) AS last_searched
FROM system.search_log
WHERE searched_at > NOW() - INTERVAL '7 days'
GROUP BY query
ORDER BY search_count DESC
LIMIT 100;

COMMIT;


-- ─── Source: 0060_elo_rating_system.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0060: ELO/GLICKO RATING SYSTEM
-- P0 Critical: Automated athlete ratings, history, leaderboards
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. ATHLETE RATINGS TABLE
--    Stores current ELO rating per athlete per weight class
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tournament.athlete_ratings (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  tenant_id       UUID NOT NULL,
  athlete_id      UUID NOT NULL,
  -- Rating dimensions
  category        VARCHAR(50) NOT NULL DEFAULT 'doi_khang',
    -- 'doi_khang' (combat), 'quyen' (forms)
  weight_class    VARCHAR(50),
  -- ELO values
  rating          NUMERIC(8,2) NOT NULL DEFAULT 1500.00,  -- Starting ELO
  rating_deviation NUMERIC(8,2) DEFAULT 350.00,           -- Glicko RD
  volatility      NUMERIC(8,6) DEFAULT 0.060000,          -- Glicko-2 σ
  -- Stats
  wins            INT DEFAULT 0,
  losses          INT DEFAULT 0,
  draws           INT DEFAULT 0,
  total_matches   INT DEFAULT 0,
  win_streak      INT DEFAULT 0,
  best_rating     NUMERIC(8,2) DEFAULT 1500.00,
  -- Decay tracking
  last_match_at   TIMESTAMPTZ,
  is_active       BOOLEAN DEFAULT true,
  -- Metadata
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version         INT NOT NULL DEFAULT 1,
  UNIQUE (tenant_id, athlete_id, category, weight_class)
);

CREATE INDEX IF NOT EXISTS idx_ratings_tenant_cat
  ON tournament.athlete_ratings(tenant_id, category, weight_class, rating DESC);

CREATE INDEX IF NOT EXISTS idx_ratings_athlete
  ON tournament.athlete_ratings(athlete_id);

ALTER TABLE tournament.athlete_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tournament.athlete_ratings
  USING (tenant_id = COALESCE(
    current_setting('app.current_tenant', true)::UUID,
    '00000000-0000-7000-8000-000000000001'::UUID));

CREATE TRIGGER set_updated_at BEFORE UPDATE ON tournament.athlete_ratings
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ════════════════════════════════════════════════════════
-- 2. RATING HISTORY (Bitemporal)
--    Track every rating change after each match
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tournament.rating_history (
  id              UUID DEFAULT uuidv7() NOT NULL,
  tenant_id       UUID NOT NULL,
  athlete_id      UUID NOT NULL,
  category        VARCHAR(50) NOT NULL,
  weight_class    VARCHAR(50),
  -- Change details
  match_id        UUID,
  opponent_id     UUID,
  result          VARCHAR(10) NOT NULL CHECK (result IN ('win', 'loss', 'draw')),
  -- Rating before/after
  rating_before   NUMERIC(8,2) NOT NULL,
  rating_after    NUMERIC(8,2) NOT NULL,
  rating_change   NUMERIC(8,2) GENERATED ALWAYS AS (rating_after - rating_before) STORED,
  rd_before       NUMERIC(8,2),
  rd_after        NUMERIC(8,2),
  -- Context
  tournament_id   UUID,
  tournament_name TEXT,
  opponent_rating NUMERIC(8,2),
  k_factor        NUMERIC(6,2),
  -- Timestamp
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (recorded_at, tenant_id, id)
) PARTITION BY RANGE (recorded_at);

-- Yearly partitions
CREATE TABLE IF NOT EXISTS tournament.rating_history_2026
  PARTITION OF tournament.rating_history
  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
CREATE TABLE IF NOT EXISTS tournament.rating_history_2027
  PARTITION OF tournament.rating_history
  FOR VALUES FROM ('2027-01-01') TO ('2028-01-01');
CREATE TABLE IF NOT EXISTS tournament.rating_history_default
  PARTITION OF tournament.rating_history DEFAULT;

CREATE INDEX IF NOT EXISTS idx_rating_hist_athlete
  ON tournament.rating_history(tenant_id, athlete_id, recorded_at DESC);

ALTER TABLE tournament.rating_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tournament.rating_history
  USING (tenant_id = COALESCE(
    current_setting('app.current_tenant', true)::UUID,
    '00000000-0000-7000-8000-000000000001'::UUID));

-- ════════════════════════════════════════════════════════
-- 3. ELO CALCULATION FUNCTION
--    Standard ELO with dynamic K-factor
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION tournament.calculate_elo(
  p_tenant_id UUID,
  p_match_id UUID,
  p_winner_id UUID,
  p_loser_id UUID,
  p_is_draw BOOLEAN DEFAULT false,
  p_category VARCHAR DEFAULT 'doi_khang',
  p_weight_class VARCHAR DEFAULT NULL,
  p_tournament_id UUID DEFAULT NULL,
  p_tournament_name TEXT DEFAULT NULL
)
RETURNS TABLE (
  athlete_id UUID,
  old_rating NUMERIC,
  new_rating NUMERIC,
  change NUMERIC
) AS $$
DECLARE
  v_winner tournament.athlete_ratings;
  v_loser tournament.athlete_ratings;
  v_k_winner NUMERIC;
  v_k_loser NUMERIC;
  v_expected_winner NUMERIC;
  v_expected_loser NUMERIC;
  v_score_winner NUMERIC;
  v_score_loser NUMERIC;
  v_new_winner NUMERIC;
  v_new_loser NUMERIC;
BEGIN
  -- Upsert winner rating
  INSERT INTO tournament.athlete_ratings (tenant_id, athlete_id, category, weight_class)
  VALUES (p_tenant_id, p_winner_id, p_category, p_weight_class)
  ON CONFLICT (tenant_id, athlete_id, category, weight_class) DO NOTHING;

  -- Upsert loser rating
  INSERT INTO tournament.athlete_ratings (tenant_id, athlete_id, category, weight_class)
  VALUES (p_tenant_id, p_loser_id, p_category, p_weight_class)
  ON CONFLICT (tenant_id, athlete_id, category, weight_class) DO NOTHING;

  -- Get current ratings
  SELECT * INTO v_winner FROM tournament.athlete_ratings
  WHERE tenant_id = p_tenant_id AND athlete_id = p_winner_id
    AND category = p_category
    AND weight_class IS NOT DISTINCT FROM p_weight_class;

  SELECT * INTO v_loser FROM tournament.athlete_ratings
  WHERE tenant_id = p_tenant_id AND athlete_id = p_loser_id
    AND category = p_category
    AND weight_class IS NOT DISTINCT FROM p_weight_class;

  -- Dynamic K-factor (higher for new players, lower for established)
  v_k_winner := CASE
    WHEN v_winner.total_matches < 10 THEN 40   -- Newbie
    WHEN v_winner.rating > 2400 THEN 10         -- Master
    ELSE 20                                      -- Standard
  END;
  v_k_loser := CASE
    WHEN v_loser.total_matches < 10 THEN 40
    WHEN v_loser.rating > 2400 THEN 10
    ELSE 20
  END;

  -- Expected scores
  v_expected_winner := 1.0 / (1.0 + power(10, (v_loser.rating - v_winner.rating) / 400.0));
  v_expected_loser := 1.0 - v_expected_winner;

  -- Actual scores
  IF p_is_draw THEN
    v_score_winner := 0.5;
    v_score_loser := 0.5;
  ELSE
    v_score_winner := 1.0;
    v_score_loser := 0.0;
  END IF;

  -- New ratings
  v_new_winner := v_winner.rating + v_k_winner * (v_score_winner - v_expected_winner);
  v_new_loser := GREATEST(v_loser.rating + v_k_loser * (v_score_loser - v_expected_loser), 100);

  -- Update winner
  UPDATE tournament.athlete_ratings SET
    rating = v_new_winner,
    wins = wins + CASE WHEN NOT p_is_draw THEN 1 ELSE 0 END,
    draws = draws + CASE WHEN p_is_draw THEN 1 ELSE 0 END,
    total_matches = total_matches + 1,
    win_streak = CASE WHEN NOT p_is_draw THEN win_streak + 1 ELSE 0 END,
    best_rating = GREATEST(best_rating, v_new_winner),
    last_match_at = NOW(),
    is_active = true
  WHERE id = v_winner.id;

  -- Update loser
  UPDATE tournament.athlete_ratings SET
    rating = v_new_loser,
    losses = losses + CASE WHEN NOT p_is_draw THEN 1 ELSE 0 END,
    draws = draws + CASE WHEN p_is_draw THEN 1 ELSE 0 END,
    total_matches = total_matches + 1,
    win_streak = CASE WHEN p_is_draw THEN 0 ELSE 0 END,
    last_match_at = NOW(),
    is_active = true
  WHERE id = v_loser.id;

  -- Record history
  INSERT INTO tournament.rating_history
    (tenant_id, athlete_id, category, weight_class, match_id,
     opponent_id, result, rating_before, rating_after,
     rd_before, rd_after, tournament_id, tournament_name,
     opponent_rating, k_factor)
  VALUES
    (p_tenant_id, p_winner_id, p_category, p_weight_class, p_match_id,
     p_loser_id, CASE WHEN p_is_draw THEN 'draw' ELSE 'win' END,
     v_winner.rating, v_new_winner,
     v_winner.rating_deviation, v_winner.rating_deviation,
     p_tournament_id, p_tournament_name,
     v_loser.rating, v_k_winner),
    (p_tenant_id, p_loser_id, p_category, p_weight_class, p_match_id,
     p_winner_id, CASE WHEN p_is_draw THEN 'draw' ELSE 'loss' END,
     v_loser.rating, v_new_loser,
     v_loser.rating_deviation, v_loser.rating_deviation,
     p_tournament_id, p_tournament_name,
     v_winner.rating, v_k_loser);

  -- Return results
  athlete_id := p_winner_id; old_rating := v_winner.rating;
  new_rating := v_new_winner; change := v_new_winner - v_winner.rating;
  RETURN NEXT;

  athlete_id := p_loser_id; old_rating := v_loser.rating;
  new_rating := v_new_loser; change := v_new_loser - v_loser.rating;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 4. RATING DECAY FUNCTION
--    Reduce RD for athletes inactive > 6 months
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION tournament.apply_rating_decay()
RETURNS TABLE (athlete_id UUID, old_rd NUMERIC, new_rd NUMERIC) AS $$
BEGIN
  RETURN QUERY
  UPDATE tournament.athlete_ratings SET
    rating_deviation = LEAST(rating_deviation + 15, 350),
    is_active = CASE WHEN last_match_at < NOW() - INTERVAL '12 months' THEN false ELSE true END,
    updated_at = NOW()
  WHERE last_match_at < NOW() - INTERVAL '6 months'
    AND rating_deviation < 350
  RETURNING
    tournament.athlete_ratings.athlete_id,
    rating_deviation - 15 AS old_rd,
    rating_deviation AS new_rd;
END;
$$ LANGUAGE plpgsql;

-- Register decay as scheduled task
INSERT INTO system.scheduled_tasks (name, cron_expression, job_type, description)
VALUES ('rating_decay', '0 0 1 * *', 'rating_manager',
        'Apply RD increase for inactive athletes monthly')
ON CONFLICT (name) DO NOTHING;

-- ════════════════════════════════════════════════════════
-- 5. LEADERBOARD MATERIALIZED VIEW
-- ════════════════════════════════════════════════════════

CREATE MATERIALIZED VIEW IF NOT EXISTS api_v1.leaderboard AS
SELECT
  ar.tenant_id,
  ar.athlete_id,
  a.ho_ten AS athlete_name,
  ar.category,
  ar.weight_class,
  ar.rating,
  ar.rating_deviation,
  ar.wins,
  ar.losses,
  ar.draws,
  ar.total_matches,
  ar.win_streak,
  ar.best_rating,
  ar.last_match_at,
  ar.is_active,
  RANK() OVER (
    PARTITION BY ar.tenant_id, ar.category, ar.weight_class
    ORDER BY ar.rating DESC
  ) AS rank_position
FROM tournament.athlete_ratings ar
JOIN athletes a ON a.id = ar.athlete_id
WHERE ar.is_active = true
  AND ar.total_matches >= 3
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_unique
  ON api_v1.leaderboard(tenant_id, athlete_id, category, weight_class);

CREATE INDEX IF NOT EXISTS idx_leaderboard_rank
  ON api_v1.leaderboard(tenant_id, category, weight_class, rank_position);

-- Leaderboard refresh scheduled task
INSERT INTO system.scheduled_tasks (name, cron_expression, job_type, description)
VALUES ('refresh_leaderboard', '*/15 * * * *', 'matview_refresh',
        'Refresh leaderboard every 15 minutes')
ON CONFLICT (name) DO NOTHING;

COMMIT;


-- ─── Source: 0061_query_cache_layer.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0061: QUERY CACHE LAYER
-- P0 Critical: Database-level query result caching
-- with automatic invalidation and TTL management
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. QUERY CACHE TABLE
--    Stores pre-computed query results as JSONB
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.query_cache (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  cache_key       VARCHAR(500) NOT NULL UNIQUE,   -- normalized query hash
  cache_group     VARCHAR(100) NOT NULL,           -- 'ref_data', 'tournament_list', etc.
  result_data     JSONB NOT NULL,
  result_count    INT DEFAULT 0,
  -- TTL
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ NOT NULL,
  last_accessed   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  access_count    INT DEFAULT 1,
  -- Source tracking
  source_tables   TEXT[] DEFAULT '{}',             -- tables this cache depends on
  tenant_id       UUID
);

CREATE INDEX IF NOT EXISTS idx_cache_key ON system.query_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_group ON system.query_cache(cache_group);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON system.query_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_cache_source ON system.query_cache USING GIN (source_tables);

-- ════════════════════════════════════════════════════════
-- 2. CACHE TTL CONFIGURATION
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.cache_config (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  cache_group     VARCHAR(100) NOT NULL UNIQUE,
  ttl_seconds     INT NOT NULL DEFAULT 300,       -- 5 minutes default
  max_entries     INT DEFAULT 1000,
  is_active       BOOLEAN DEFAULT true,
  description     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default cache configs
INSERT INTO system.cache_config (cache_group, ttl_seconds, max_entries, description) VALUES
  ('ref_belt_ranks',     86400,  100,  'Danh sách đai — ít thay đổi'),
  ('ref_weight_classes', 86400,  100,  'Hạng cân — ít thay đổi'),
  ('ref_sport_types',    86400,  50,   'Loại hình thi đấu'),
  ('ref_comp_formats',   86400,  50,   'Thể thức thi đấu'),
  ('tournament_list',    300,    50,   'Danh sách giải — 5 phút'),
  ('tournament_detail',  120,    200,  'Chi tiết giải — 2 phút'),
  ('athlete_profile',    120,    500,  'Hồ sơ VĐV — 2 phút'),
  ('leaderboard',        900,    20,   'Bảng xếp hạng — 15 phút'),
  ('club_list',          600,    100,  'Danh sách CLB — 10 phút'),
  ('feature_flags',      60,     10,   'Feature flags — 1 phút'),
  ('search_results',     30,     200,  'Kết quả tìm kiếm — 30 giây'),
  ('live_scoring',       0,      0,    'Chấm điểm trực tiếp — KHÔNG CACHE')
ON CONFLICT (cache_group) DO NOTHING;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON system.cache_config
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ════════════════════════════════════════════════════════
-- 3. CACHE GET/SET FUNCTIONS
-- ════════════════════════════════════════════════════════

-- GET: Returns cached data if fresh, NULL if expired/missing
CREATE OR REPLACE FUNCTION system.cache_get(
  p_cache_key TEXT
)
RETURNS JSONB AS $$
DECLARE v_result JSONB;
BEGIN
  UPDATE system.query_cache SET
    last_accessed = NOW(),
    access_count = access_count + 1
  WHERE cache_key = p_cache_key
    AND expires_at > NOW()
  RETURNING result_data INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- SET: Store result with TTL from cache_config
CREATE OR REPLACE FUNCTION system.cache_set(
  p_cache_key TEXT,
  p_cache_group TEXT,
  p_data JSONB,
  p_source_tables TEXT[] DEFAULT '{}',
  p_tenant_id UUID DEFAULT NULL,
  p_count INT DEFAULT 0
)
RETURNS VOID AS $$
DECLARE v_ttl INT;
BEGIN
  -- Get TTL from config
  SELECT ttl_seconds INTO v_ttl
  FROM system.cache_config
  WHERE cache_group = p_cache_group AND is_active = true;

  IF v_ttl IS NULL OR v_ttl = 0 THEN
    RETURN;  -- Cache disabled for this group
  END IF;

  INSERT INTO system.query_cache
    (cache_key, cache_group, result_data, result_count,
     expires_at, source_tables, tenant_id)
  VALUES (
    p_cache_key, p_cache_group, p_data, p_count,
    NOW() + (v_ttl || ' seconds')::INTERVAL,
    p_source_tables, p_tenant_id)
  ON CONFLICT (cache_key) DO UPDATE SET
    result_data = EXCLUDED.result_data,
    result_count = EXCLUDED.result_count,
    expires_at = NOW() + (v_ttl || ' seconds')::INTERVAL,
    last_accessed = NOW(),
    access_count = system.query_cache.access_count + 1;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 4. CACHE INVALIDATION
-- ════════════════════════════════════════════════════════

-- Invalidate by key
CREATE OR REPLACE FUNCTION system.cache_invalidate_key(p_key TEXT)
RETURNS INT AS $$
DECLARE v_count INT;
BEGIN
  DELETE FROM system.query_cache WHERE cache_key = p_key;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Invalidate by group
CREATE OR REPLACE FUNCTION system.cache_invalidate_group(p_group TEXT)
RETURNS INT AS $$
DECLARE v_count INT;
BEGIN
  DELETE FROM system.query_cache WHERE cache_group = p_group;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Invalidate by source table (when data changes)
CREATE OR REPLACE FUNCTION system.cache_invalidate_table(p_table TEXT)
RETURNS INT AS $$
DECLARE v_count INT;
BEGIN
  DELETE FROM system.query_cache WHERE p_table = ANY(source_tables);
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Auto-invalidation trigger (attach to tables)
CREATE OR REPLACE FUNCTION trigger_cache_invalidate()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM system.cache_invalidate_table(TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME);
  RETURN NULL;  -- AFTER trigger, return value ignored
END;
$$ LANGUAGE plpgsql;

-- Attach to reference data tables (changes are rare)
DO $$
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'ref_belt_ranks', 'ref_weight_classes', 'ref_sport_types',
    'content_categories', 'ref_competition_formats'
  ]) LOOP
    BEGIN
      EXECUTE format(
        'CREATE TRIGGER cache_invalidate AFTER INSERT OR UPDATE OR DELETE
         ON %I FOR EACH STATEMENT EXECUTE FUNCTION trigger_cache_invalidate()',
        tbl);
    EXCEPTION
      WHEN undefined_table THEN NULL;
      WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════
-- 5. CACHE CLEANUP + STATS
-- ════════════════════════════════════════════════════════

-- Clean expired entries
CREATE OR REPLACE FUNCTION system.cache_cleanup()
RETURNS INT AS $$
DECLARE v_count INT;
BEGIN
  DELETE FROM system.query_cache WHERE expires_at < NOW();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Register cleanup scheduled task
INSERT INTO system.scheduled_tasks (name, cron_expression, job_type, description)
VALUES ('cache_cleanup', '*/10 * * * *', 'cache_manager',
        'Clean expired cache entries every 10 minutes')
ON CONFLICT (name) DO NOTHING;

-- Cache stats view
DROP VIEW IF EXISTS system.v_cache_stats CASCADE;
CREATE VIEW system.v_cache_stats AS
SELECT
  qc.cache_group,
  count(*) AS entries,
  sum(access_count) AS total_hits,
  avg(access_count) AS avg_hits_per_entry,
  min(qc.created_at) AS oldest_entry,
  max(last_accessed) AS last_access,
  count(*) FILTER (WHERE expires_at < NOW()) AS expired_entries,
  pg_size_pretty(sum(pg_column_size(result_data))) AS data_size,
  cc.ttl_seconds,
  cc.max_entries
FROM system.query_cache qc
LEFT JOIN system.cache_config cc ON cc.cache_group = qc.cache_group
GROUP BY qc.cache_group, cc.ttl_seconds, cc.max_entries
ORDER BY total_hits DESC;

COMMIT;


-- ─── Source: 0062_cdc_outbox.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0062: CHANGE DATA CAPTURE (CDC)
-- P1 High: Logical decoding publications + CDC outbox
-- for streaming database changes to external systems
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. CDC OUTBOX TABLE
--    Captures changes for downstream consumers
--    (MeiliSearch, analytics, notification dispatch)
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.cdc_outbox (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id        UUID DEFAULT uuidv7() NOT NULL UNIQUE,
  aggregate_type  VARCHAR(100) NOT NULL,   -- 'athlete', 'tournament', 'match'
  aggregate_id    UUID NOT NULL,
  event_type      VARCHAR(50) NOT NULL,    -- 'created', 'updated', 'deleted'
  tenant_id       UUID,
  -- Payload
  payload         JSONB NOT NULL,          -- new state
  old_payload     JSONB,                   -- previous state (for updates)
  -- Processing
  status          VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'skipped')),
  attempts        INT DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  error_message   TEXT,
  -- Routing
  target_systems  TEXT[] DEFAULT '{}',     -- ['meilisearch', 'analytics', 'webhook']
  -- Timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_cdc_outbox_pending
  ON system.cdc_outbox(status, created_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_cdc_outbox_aggregate
  ON system.cdc_outbox(aggregate_type, aggregate_id);

-- ════════════════════════════════════════════════════════
-- 2. CDC SUBSCRIPTIONS TABLE
--    Define which consumers listen to which events
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.cdc_subscriptions (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  name            VARCHAR(200) NOT NULL UNIQUE,
  consumer_type   VARCHAR(50) NOT NULL,    -- 'meilisearch', 'analytics', 'webhook', 'notification'
  -- Filter
  aggregate_types TEXT[] NOT NULL,          -- ['athlete', 'tournament']
  event_types     TEXT[] DEFAULT ARRAY['created', 'updated', 'deleted'],
  -- Connection
  endpoint_url    TEXT,                     -- for webhook consumers
  config          JSONB DEFAULT '{}',      -- consumer-specific config
  -- Status
  is_active       BOOLEAN DEFAULT true,
  last_offset     BIGINT DEFAULT 0,        -- last processed outbox id
  last_sync_at    TIMESTAMPTZ,
  error_count     INT DEFAULT 0,
  -- Metadata
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON system.cdc_subscriptions
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ════════════════════════════════════════════════════════
-- 3. CDC TRIGGER FUNCTION
--    Automatically captures INSERT/UPDATE/DELETE into outbox
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION trigger_cdc_capture()
RETURNS TRIGGER AS $$
DECLARE
  v_event_type TEXT;
  v_payload JSONB;
  v_old_payload JSONB;
  v_aggregate_type TEXT;
  v_aggregate_id UUID;
  v_tenant_id UUID;
  v_target_systems TEXT[];
BEGIN
  -- Determine event type
  v_event_type := CASE TG_OP
    WHEN 'INSERT' THEN 'created'
    WHEN 'UPDATE' THEN 'updated'
    WHEN 'DELETE' THEN 'deleted'
  END;

  -- Map table to aggregate type
  v_aggregate_type := CASE TG_TABLE_NAME
    WHEN 'athletes' THEN 'athlete'
    WHEN 'tournaments' THEN 'tournament'
    WHEN 'combat_matches' THEN 'match'
    WHEN 'teams' THEN 'team'
    WHEN 'clubs' THEN 'club'
    ELSE TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME
  END;

  -- Get appropriate target systems from subscriptions
  SELECT ARRAY_AGG(DISTINCT s.consumer_type) INTO v_target_systems
  FROM system.cdc_subscriptions s
  WHERE s.is_active = true
    AND v_aggregate_type = ANY(s.aggregate_types)
    AND v_event_type = ANY(s.event_types);

  -- Skip if no subscribers
  IF v_target_systems IS NULL OR array_length(v_target_systems, 1) = 0 THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Build payload
  IF TG_OP = 'DELETE' THEN
    v_payload := to_jsonb(OLD);
    v_aggregate_id := OLD.id;
    v_tenant_id := OLD.tenant_id;
  ELSIF TG_OP = 'UPDATE' THEN
    v_payload := to_jsonb(NEW);
    v_old_payload := to_jsonb(OLD);
    v_aggregate_id := NEW.id;
    v_tenant_id := NEW.tenant_id;
  ELSE
    v_payload := to_jsonb(NEW);
    v_aggregate_id := NEW.id;
    v_tenant_id := NEW.tenant_id;
  END IF;

  -- Insert into outbox
  INSERT INTO system.cdc_outbox
    (aggregate_type, aggregate_id, event_type, tenant_id,
     payload, old_payload, target_systems)
  VALUES
    (v_aggregate_type, v_aggregate_id, v_event_type, v_tenant_id,
     v_payload, v_old_payload, v_target_systems);

  -- Notify workers
  PERFORM pg_notify('cdc_events', json_build_object(
    'aggregate_type', v_aggregate_type,
    'aggregate_id', v_aggregate_id,
    'event_type', v_event_type,
    'tenant_id', v_tenant_id
  )::TEXT);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 4. ATTACH CDC TRIGGERS TO KEY TABLES
-- ════════════════════════════════════════════════════════

DO $$
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'athletes', 'tournaments', 'combat_matches', 'teams', 'clubs'
  ]) LOOP
    BEGIN
      EXECUTE format(
        'CREATE TRIGGER cdc_capture
         AFTER INSERT OR UPDATE OR DELETE ON %I
         FOR EACH ROW EXECUTE FUNCTION trigger_cdc_capture()',
        tbl);
    EXCEPTION
      WHEN duplicate_object THEN NULL;
      WHEN undefined_table THEN NULL;
    END;
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════
-- 5. CDC OUTBOX PROCESSOR FUNCTION
--    Pull pending events + mark as processing
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION system.cdc_pull_events(
  p_consumer TEXT,
  p_batch_size INT DEFAULT 100
)
RETURNS TABLE (
  event_id UUID,
  aggregate_type TEXT,
  aggregate_id UUID,
  event_type TEXT,
  payload JSONB,
  old_payload JSONB,
  tenant_id UUID
) AS $$
BEGIN
  RETURN QUERY
  UPDATE system.cdc_outbox SET
    status = 'processing',
    last_attempt_at = NOW(),
    attempts = attempts + 1
  WHERE id IN (
    SELECT o.id FROM system.cdc_outbox o
    WHERE o.status = 'pending'
      AND p_consumer = ANY(o.target_systems)
    ORDER BY o.id
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  )
  RETURNING
    system.cdc_outbox.event_id,
    system.cdc_outbox.aggregate_type::TEXT,
    system.cdc_outbox.aggregate_id,
    system.cdc_outbox.event_type::TEXT,
    system.cdc_outbox.payload,
    system.cdc_outbox.old_payload,
    system.cdc_outbox.tenant_id;
END;
$$ LANGUAGE plpgsql;

-- Acknowledge events as processed
CREATE OR REPLACE FUNCTION system.cdc_ack_events(p_event_ids UUID[])
RETURNS INT AS $$
DECLARE v_count INT;
BEGIN
  UPDATE system.cdc_outbox SET
    status = 'sent',
    processed_at = NOW()
  WHERE event_id = ANY(p_event_ids);
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Fail events with error message
CREATE OR REPLACE FUNCTION system.cdc_fail_events(p_event_ids UUID[], p_error TEXT)
RETURNS INT AS $$
DECLARE v_count INT;
BEGIN
  UPDATE system.cdc_outbox SET
    status = CASE WHEN attempts >= 3 THEN 'failed' ELSE 'pending' END,
    error_message = p_error
  WHERE event_id = ANY(p_event_ids);
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 6. SEED DEFAULT SUBSCRIBERS
-- ════════════════════════════════════════════════════════

INSERT INTO system.cdc_subscriptions (name, consumer_type, aggregate_types, event_types, config)
VALUES
  ('search_indexer', 'meilisearch',
   ARRAY['athlete', 'tournament', 'club', 'team'],
   ARRAY['created', 'updated', 'deleted'],
   '{"index_prefix": "vct_"}'::JSONB),
  ('analytics_pipeline', 'analytics',
   ARRAY['athlete', 'tournament', 'match'],
   ARRAY['created', 'updated'],
   '{"batch_size": 500}'::JSONB),
  ('notification_dispatcher', 'notification',
   ARRAY['tournament', 'match'],
   ARRAY['created', 'updated'],
   '{"channels": ["push", "email"]}'::JSONB)
ON CONFLICT (name) DO NOTHING;

-- ════════════════════════════════════════════════════════
-- 7. CDC MONITORING VIEW
-- ════════════════════════════════════════════════════════

DROP VIEW IF EXISTS system.v_cdc_stats CASCADE;
CREATE VIEW system.v_cdc_stats AS
SELECT
  aggregate_type,
  status,
  count(*) AS event_count,
  min(created_at) AS oldest_event,
  max(created_at) AS newest_event,
  avg(attempts) AS avg_attempts
FROM system.cdc_outbox
GROUP BY aggregate_type, status
ORDER BY aggregate_type, status;

-- CDC lag view (events awaiting processing)
DROP VIEW IF EXISTS system.v_cdc_lag CASCADE;
CREATE VIEW system.v_cdc_lag AS
SELECT
  s.name AS subscription,
  s.consumer_type,
  s.last_offset,
  COALESCE(max(o.id), 0) AS current_offset,
  COALESCE(max(o.id), 0) - s.last_offset AS lag_events,
  s.last_sync_at,
  EXTRACT(EPOCH FROM NOW() - s.last_sync_at)::INT AS lag_seconds
FROM system.cdc_subscriptions s
LEFT JOIN system.cdc_outbox o ON TRUE
WHERE s.is_active = true
GROUP BY s.name, s.consumer_type, s.last_offset, s.last_sync_at;

-- Cleanup old processed events
INSERT INTO system.scheduled_tasks (name, cron_expression, job_type, description, payload)
VALUES ('cdc_cleanup', '0 2 * * *', 'cdc_manager',
        'Remove processed CDC events older than 7 days',
        '{"retention_days": 7}'::JSONB)
ON CONFLICT (name) DO NOTHING;

COMMIT;


-- ─── Source: 0063_ltree_hierarchy.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0063: ltree HIERARCHICAL DATA
-- P1 High: Native tree operators for federations, schools, orgs
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. ENABLE ltree EXTENSION
-- ════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS ltree;

-- ════════════════════════════════════════════════════════
-- 2. ADD ltree PATH COLUMNS
--    Encode hierarchical position as dot-separated path
--    e.g., 'vn.mienbac.hanoi.caulacbo_thanglong'
-- ════════════════════════════════════════════════════════

-- Tenants (org hierarchy)
ALTER TABLE core.tenants
  ADD COLUMN IF NOT EXISTS tree_path ltree;

-- Martial schools (lineage)
ALTER TABLE platform.martial_schools
  ADD COLUMN IF NOT EXISTS tree_path ltree;

-- Community groups (nested groups)
ALTER TABLE platform.community_groups
  ADD COLUMN IF NOT EXISTS tree_path ltree;

-- Clubs (regional hierarchy)
ALTER TABLE clubs
  ADD COLUMN IF NOT EXISTS tree_path ltree;

-- ════════════════════════════════════════════════════════
-- 3. GIST INDEXES FOR ltree QUERIES
-- ════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_tenants_tree
  ON core.tenants USING GIST (tree_path);

CREATE INDEX IF NOT EXISTS idx_schools_tree
  ON platform.martial_schools USING GIST (tree_path);

CREATE INDEX IF NOT EXISTS idx_groups_tree
  ON platform.community_groups USING GIST (tree_path);

CREATE INDEX IF NOT EXISTS idx_clubs_tree
  ON clubs USING GIST (tree_path);

-- Also add B-tree indexes for sorting/equality
CREATE INDEX IF NOT EXISTS idx_tenants_tree_btree
  ON core.tenants USING BTREE (tree_path);

CREATE INDEX IF NOT EXISTS idx_schools_tree_btree
  ON platform.martial_schools USING BTREE (tree_path);

-- ════════════════════════════════════════════════════════
-- 4. PATH GENERATION HELPER
--    Converts name to ltree-safe label
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION system.to_ltree_label(p_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(
    regexp_replace(
      unaccent(trim(p_name)),
      '[^a-zA-Z0-9]+', '_', 'g'  -- Replace non-alnum with underscore
    ),
    '^_+|_+$', '', 'g'           -- Trim leading/trailing underscores
  ));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ════════════════════════════════════════════════════════
-- 5. PATH MAINTENANCE TRIGGERS
--    Auto-update tree_path when parent changes
-- ════════════════════════════════════════════════════════

-- Tenant path: builds from parent_id chain
CREATE OR REPLACE FUNCTION trigger_update_tenant_path()
RETURNS TRIGGER AS $$
DECLARE
  v_parent_path ltree;
  v_label TEXT;
BEGIN
  v_label := system.to_ltree_label(COALESCE(NEW.code, NEW.name, NEW.id::TEXT));

  IF NEW.parent_id IS NULL THEN
    NEW.tree_path := v_label::ltree;
  ELSE
    SELECT tree_path INTO v_parent_path
    FROM core.tenants WHERE id = NEW.parent_id;
    NEW.tree_path := COALESCE(v_parent_path, ''::ltree) || v_label::ltree;
  END IF;

  -- Cascade to children
  IF TG_OP = 'UPDATE' AND OLD.tree_path IS DISTINCT FROM NEW.tree_path THEN
    UPDATE core.tenants SET
      tree_path = NEW.tree_path || subpath(tree_path, nlevel(OLD.tree_path))
    WHERE tree_path <@ OLD.tree_path
      AND id != NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER maintain_tenant_path
    BEFORE INSERT OR UPDATE ON core.tenants
    FOR EACH ROW EXECUTE FUNCTION trigger_update_tenant_path();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- School path: builds from lineage
CREATE OR REPLACE FUNCTION trigger_update_school_path()
RETURNS TRIGGER AS $$
DECLARE
  v_parent_path ltree;
  v_label TEXT;
  v_parent_id UUID;
BEGIN
  v_label := system.to_ltree_label(COALESCE(NEW.name, NEW.id::TEXT));

  -- Find parent from school_lineage
  SELECT parent_school_id INTO v_parent_id
  FROM platform.school_lineage
  WHERE child_school_id = NEW.id
  LIMIT 1;

  IF v_parent_id IS NULL THEN
    NEW.tree_path := v_label::ltree;
  ELSE
    SELECT tree_path INTO v_parent_path
    FROM platform.martial_schools WHERE id = v_parent_id;
    NEW.tree_path := COALESCE(v_parent_path, ''::ltree) || v_label::ltree;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER maintain_school_path
    BEFORE INSERT OR UPDATE ON platform.martial_schools
    FOR EACH ROW EXECUTE FUNCTION trigger_update_school_path();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ════════════════════════════════════════════════════════
-- 6. TREE QUERY FUNCTIONS
-- ════════════════════════════════════════════════════════

-- Get all descendants (children, grandchildren, etc.)
CREATE OR REPLACE FUNCTION system.get_subtree(
  p_table TEXT,      -- 'core.tenants', 'platform.martial_schools'
  p_node_id UUID,
  p_max_depth INT DEFAULT 10
)
RETURNS TABLE (
  node_id UUID,
  node_path ltree,
  depth INT
) AS $$
DECLARE
  v_path ltree;
BEGIN
  -- Get the node's path
  EXECUTE format('SELECT tree_path FROM %s WHERE id = $1', p_table)
  INTO v_path USING p_node_id;

  IF v_path IS NULL THEN RETURN; END IF;

  RETURN QUERY EXECUTE format(
    'SELECT id, tree_path, nlevel(tree_path) - nlevel($1) AS depth
     FROM %s
     WHERE tree_path <@ $1
       AND nlevel(tree_path) - nlevel($1) BETWEEN 1 AND $2
     ORDER BY tree_path',
    p_table
  ) USING v_path, p_max_depth;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get all ancestors (parent, grandparent, etc.)
CREATE OR REPLACE FUNCTION system.get_ancestors(
  p_table TEXT,
  p_node_id UUID
)
RETURNS TABLE (
  node_id UUID,
  node_path ltree,
  depth INT
) AS $$
DECLARE
  v_path ltree;
BEGIN
  EXECUTE format('SELECT tree_path FROM %s WHERE id = $1', p_table)
  INTO v_path USING p_node_id;

  IF v_path IS NULL THEN RETURN; END IF;

  RETURN QUERY EXECUTE format(
    'SELECT id, tree_path, nlevel($1) - nlevel(tree_path) AS depth
     FROM %s
     WHERE $1 <@ tree_path
       AND id != $2
     ORDER BY tree_path',
    p_table
  ) USING v_path, p_node_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get tree statistics
CREATE OR REPLACE FUNCTION system.tree_stats(p_table TEXT)
RETURNS TABLE (
  max_depth INT,
  total_nodes BIGINT,
  root_nodes BIGINT,
  leaf_nodes BIGINT,
  avg_children NUMERIC
) AS $$
BEGIN
  RETURN QUERY EXECUTE format(
    'WITH tree AS (
       SELECT tree_path, nlevel(tree_path) AS depth FROM %s WHERE tree_path IS NOT NULL
     )
     SELECT
       max(depth)::INT AS max_depth,
       count(*)::BIGINT AS total_nodes,
       count(*) FILTER (WHERE depth = 1)::BIGINT AS root_nodes,
       count(*) FILTER (WHERE NOT EXISTS (
         SELECT 1 FROM %s c WHERE c.tree_path <@ t.tree_path AND c.tree_path != t.tree_path
       ))::BIGINT AS leaf_nodes,
       CASE WHEN count(*) FILTER (WHERE depth > 0) > 0
         THEN round(count(*)::NUMERIC / NULLIF(count(DISTINCT subpath(tree_path, 0, depth - 1)), 0), 2)
         ELSE 0
       END AS avg_children
     FROM tree t',
    p_table, p_table
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ════════════════════════════════════════════════════════
-- 7. BACKFILL EXISTING DATA
--    Set tree_path for tenants with parent_id
-- ════════════════════════════════════════════════════════

-- Backfill tenants (triggers will fire but we need recursive update)
DO $$
DECLARE
  r RECORD;
  v_path ltree;
  v_label TEXT;
BEGIN
  -- First: set root tenants
  FOR r IN SELECT id, name, code FROM core.tenants WHERE parent_id IS NULL AND tree_path IS NULL LOOP
    v_label := system.to_ltree_label(COALESCE(r.code, r.name, r.id::TEXT));
    UPDATE core.tenants SET tree_path = v_label::ltree WHERE id = r.id;
  END LOOP;

  -- Then: cascade down (up to 10 levels)
  FOR i IN 1..10 LOOP
    FOR r IN
      SELECT c.id, c.name, c.code, p.tree_path AS parent_path
      FROM core.tenants c
      JOIN core.tenants p ON p.id = c.parent_id
      WHERE c.tree_path IS NULL AND p.tree_path IS NOT NULL
    LOOP
      v_label := system.to_ltree_label(COALESCE(r.code, r.name, r.id::TEXT));
      UPDATE core.tenants SET tree_path = r.parent_path || v_label::ltree WHERE id = r.id;
    END LOOP;
  END LOOP;
END $$;

COMMIT;


-- ─── Source: 0064_temporal_tables.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0064: TEMPORAL TABLES
-- P1 High: System-versioned history tables for compliance
-- and "time travel" queries (point-in-time reconstruction)
-- ===============================================================

-- Create temporal schema (must be outside transaction if needed)
CREATE SCHEMA IF NOT EXISTS temporal;

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. HISTORY TABLE PATTERN: athletes_history
--    Stores every version of athlete rows
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS temporal.athletes_history (
  -- Mirror all athletes columns
  id              UUID NOT NULL,
  tenant_id       UUID NOT NULL,
  ho_ten          VARCHAR(200),
  ngay_sinh       DATE,
  gioi_tinh       VARCHAR(10),
  can_nang        NUMERIC(5,2),
  ma_vdv          VARCHAR(50),
  tournament_id   UUID,
  current_club_id UUID,
  trang_thai      VARCHAR(30),
  metadata        JSONB,
  -- Temporal columns
  valid_from      TIMESTAMPTZ NOT NULL,   -- when this version started
  valid_to        TIMESTAMPTZ NOT NULL,   -- when this version ended
  changed_by      UUID,
  change_type     VARCHAR(10) NOT NULL CHECK (change_type IN ('INSERT', 'UPDATE', 'DELETE')),
  change_reason   TEXT,
  -- Primary key includes time range
  PRIMARY KEY (id, valid_from)
);

CREATE INDEX IF NOT EXISTS idx_athletes_hist_range
  ON temporal.athletes_history(id, valid_from, valid_to);

CREATE INDEX IF NOT EXISTS idx_athletes_hist_tenant
  ON temporal.athletes_history(tenant_id, valid_from DESC);

-- ════════════════════════════════════════════════════════
-- 2. HISTORY TABLE: tournaments_history
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS temporal.tournaments_history (
  id              UUID NOT NULL,
  tenant_id       UUID NOT NULL,
  name            VARCHAR(500),
  code            VARCHAR(50),
  status          VARCHAR(30),
  start_date      DATE,
  end_date        DATE,
  location        TEXT,
  config          JSONB,
  -- Temporal
  valid_from      TIMESTAMPTZ NOT NULL,
  valid_to        TIMESTAMPTZ NOT NULL,
  changed_by      UUID,
  change_type     VARCHAR(10) NOT NULL CHECK (change_type IN ('INSERT', 'UPDATE', 'DELETE')),
  PRIMARY KEY (id, valid_from)
);

CREATE INDEX IF NOT EXISTS idx_tournaments_hist_range
  ON temporal.tournaments_history(id, valid_from, valid_to);

-- ════════════════════════════════════════════════════════
-- 3. HISTORY TABLE: combat_matches_history
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS temporal.combat_matches_history (
  id              UUID NOT NULL,
  tenant_id       UUID NOT NULL,
  tournament_id   UUID,
  arena_id        UUID,
  vdv_do_id       UUID,
  vdv_xanh_id     UUID,
  trang_thai      VARCHAR(30),
  ket_qua         VARCHAR(30),
  diem_do         INT,
  diem_xanh       INT,
  thu_tu          INT,
  metadata        JSONB,
  -- Temporal
  valid_from      TIMESTAMPTZ NOT NULL,
  valid_to        TIMESTAMPTZ NOT NULL,
  changed_by      UUID,
  change_type     VARCHAR(10) NOT NULL CHECK (change_type IN ('INSERT', 'UPDATE', 'DELETE')),
  PRIMARY KEY (id, valid_from)
);

CREATE INDEX IF NOT EXISTS idx_matches_hist_range
  ON temporal.combat_matches_history(id, valid_from, valid_to);

-- ════════════════════════════════════════════════════════
-- 4. VERSIONING TRIGGER FUNCTION
--    Generic: captures old row into _history on UPDATE/DELETE
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION trigger_temporal_versioning()
RETURNS TRIGGER AS $$
DECLARE
  v_history_table TEXT;
  v_user_id UUID;
  v_now TIMESTAMPTZ := NOW();
  v_old_json JSONB;
  v_cols TEXT[];
  v_col TEXT;
  v_insert_cols TEXT;
  v_insert_vals TEXT;
BEGIN
  v_history_table := 'temporal.' || TG_TABLE_NAME || '_history';
  v_user_id := NULLIF(current_setting('app.current_user', true), '')::UUID;

  IF TG_OP = 'INSERT' THEN
    -- Record the initial insert
    BEGIN
      EXECUTE format(
        'INSERT INTO %s SELECT ($1).*, $2, $3, $4, $5',
        v_history_table
      ) USING NEW, v_now, 'infinity'::TIMESTAMPTZ, v_user_id, 'INSERT';
    EXCEPTION WHEN OTHERS THEN
      -- Column mismatch possible, skip gracefully
      NULL;
    END;
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Close the previous version
    BEGIN
      EXECUTE format(
        'UPDATE %s SET valid_to = $1
         WHERE id = $2 AND valid_to = ''infinity''::TIMESTAMPTZ',
        v_history_table
      ) USING v_now, OLD.id;

      -- Insert new version
      EXECUTE format(
        'INSERT INTO %s SELECT ($1).*, $2, $3, $4, $5',
        v_history_table
      ) USING NEW, v_now, 'infinity'::TIMESTAMPTZ, v_user_id, 'UPDATE';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    -- Close the final version
    BEGIN
      EXECUTE format(
        'UPDATE %s SET valid_to = $1, change_type = $2
         WHERE id = $3 AND valid_to = ''infinity''::TIMESTAMPTZ',
        v_history_table
      ) USING v_now, 'DELETE', OLD.id;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 5. ATTACH TEMPORAL TRIGGERS
-- ════════════════════════════════════════════════════════

DO $$ BEGIN
  CREATE TRIGGER temporal_version
    AFTER INSERT OR UPDATE OR DELETE ON athletes
    FOR EACH ROW EXECUTE FUNCTION trigger_temporal_versioning();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER temporal_version
    AFTER INSERT OR UPDATE OR DELETE ON tournaments
    FOR EACH ROW EXECUTE FUNCTION trigger_temporal_versioning();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER temporal_version
    AFTER INSERT OR UPDATE OR DELETE ON combat_matches
    FOR EACH ROW EXECUTE FUNCTION trigger_temporal_versioning();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ════════════════════════════════════════════════════════
-- 6. TIME-TRAVEL QUERY FUNCTION
--    "AS OF" — get entity state at a specific time
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION temporal.as_of(
  p_table TEXT,       -- 'athletes', 'tournaments', 'combat_matches'
  p_entity_id UUID,
  p_timestamp TIMESTAMPTZ
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  EXECUTE format(
    'SELECT to_jsonb(h.*) FROM temporal.%I_history h
     WHERE h.id = $1
       AND h.valid_from <= $2
       AND h.valid_to > $2
     LIMIT 1',
    p_table
  ) INTO v_result USING p_entity_id, p_timestamp;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get full version history for an entity
CREATE OR REPLACE FUNCTION temporal.version_history(
  p_table TEXT,
  p_entity_id UUID,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  version_number BIGINT,
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  change_type TEXT,
  changed_by UUID,
  state JSONB
) AS $$
BEGIN
  RETURN QUERY EXECUTE format(
    'SELECT
       ROW_NUMBER() OVER (ORDER BY valid_from) AS version_number,
       valid_from,
       valid_to,
       change_type::TEXT,
       changed_by,
       to_jsonb(h.*) - ''valid_from'' - ''valid_to'' - ''changed_by'' - ''change_type'' - ''change_reason'' AS state
     FROM temporal.%I_history h
     WHERE h.id = $1
     ORDER BY valid_from DESC
     LIMIT $2',
    p_table
  ) USING p_entity_id, p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Compare two versions (diff)
CREATE OR REPLACE FUNCTION temporal.version_diff(
  p_table TEXT,
  p_entity_id UUID,
  p_time_a TIMESTAMPTZ,
  p_time_b TIMESTAMPTZ
)
RETURNS TABLE (
  field_name TEXT,
  value_at_a TEXT,
  value_at_b TEXT
) AS $$
DECLARE
  v_state_a JSONB;
  v_state_b JSONB;
  v_key TEXT;
BEGIN
  v_state_a := temporal.as_of(p_table, p_entity_id, p_time_a);
  v_state_b := temporal.as_of(p_table, p_entity_id, p_time_b);

  IF v_state_a IS NULL OR v_state_b IS NULL THEN
    RETURN;
  END IF;

  FOR v_key IN SELECT jsonb_object_keys(v_state_a) UNION SELECT jsonb_object_keys(v_state_b) LOOP
    IF v_key NOT IN ('valid_from', 'valid_to', 'changed_by', 'change_type', 'change_reason') THEN
      IF (v_state_a ->> v_key) IS DISTINCT FROM (v_state_b ->> v_key) THEN
        field_name := v_key;
        value_at_a := v_state_a ->> v_key;
        value_at_b := v_state_b ->> v_key;
        RETURN NEXT;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql STABLE;

-- ════════════════════════════════════════════════════════
-- 7. HISTORY CLEANUP (older than 2 years)
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION temporal.cleanup_old_history(
  p_retention_months INT DEFAULT 24,
  p_dry_run BOOLEAN DEFAULT true
)
RETURNS TABLE (
  history_table TEXT,
  rows_affected INT
) AS $$
DECLARE
  v_table TEXT;
  v_count INT;
  v_cutoff TIMESTAMPTZ;
BEGIN
  v_cutoff := NOW() - (p_retention_months || ' months')::INTERVAL;

  FOR v_table IN SELECT unnest(ARRAY[
    'temporal.athletes_history',
    'temporal.tournaments_history',
    'temporal.combat_matches_history'
  ]) LOOP
    IF p_dry_run THEN
      EXECUTE format(
        'SELECT count(*) FROM %s WHERE valid_to < $1 AND valid_to != ''infinity''::TIMESTAMPTZ',
        v_table
      ) INTO v_count USING v_cutoff;
    ELSE
      EXECUTE format(
        'DELETE FROM %s WHERE valid_to < $1 AND valid_to != ''infinity''::TIMESTAMPTZ',
        v_table
      ) USING v_cutoff;
      GET DIAGNOSTICS v_count = ROW_COUNT;
    END IF;

    history_table := v_table;
    rows_affected := v_count;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMIT;


-- ─── Source: 0065_brin_indexes.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0065: BRIN INDEXES
-- P1 High: Block Range Indexes for large sequential tables
-- 100x smaller than B-tree for time-series columns
-- NOTE: CREATE INDEX cannot run inside a transaction
-- ===============================================================

-- ════════════════════════════════════════════════════════
-- 1. BRIN INDEXES ON created_at COLUMNS
--    Best for naturally ordered data (insert-only / append-like)
--    pages_per_range tuned per table size
-- ════════════════════════════════════════════════════════

DO $$
DECLARE
  v_indexes TEXT[] := ARRAY[
    'CREATE INDEX IF NOT EXISTS idx_users_created_brin ON core.users USING BRIN (created_at) WITH (pages_per_range = 32)',
    'CREATE INDEX IF NOT EXISTS idx_sessions_created_brin ON core.sessions USING BRIN (created_at) WITH (pages_per_range = 16)',
    'CREATE INDEX IF NOT EXISTS idx_athletes_created_brin ON athletes USING BRIN (created_at) WITH (pages_per_range = 32)',
    'CREATE INDEX IF NOT EXISTS idx_combat_matches_created_brin ON combat_matches USING BRIN (created_at) WITH (pages_per_range = 32)',
    'CREATE INDEX IF NOT EXISTS idx_registrations_created_brin ON registrations USING BRIN (created_at) WITH (pages_per_range = 32)',
    'CREATE INDEX IF NOT EXISTS idx_payments_created_brin ON platform.payments USING BRIN (created_at) WITH (pages_per_range = 16)',
    'CREATE INDEX IF NOT EXISTS idx_invoices_created_brin ON platform.invoices USING BRIN (created_at) WITH (pages_per_range = 32)',
    'CREATE INDEX IF NOT EXISTS idx_posts_created_brin ON platform.posts USING BRIN (created_at) WITH (pages_per_range = 16)',
    'CREATE INDEX IF NOT EXISTS idx_comments_created_brin ON platform.comments USING BRIN (created_at) WITH (pages_per_range = 16)',
    'CREATE INDEX IF NOT EXISTS idx_reactions_created_brin ON platform.reactions USING BRIN (created_at) WITH (pages_per_range = 8)',
    'CREATE INDEX IF NOT EXISTS idx_training_sessions_created_brin ON training.training_sessions USING BRIN (session_date) WITH (pages_per_range = 32)',
    'CREATE INDEX IF NOT EXISTS idx_enrollments_created_brin ON training.course_enrollments USING BRIN (created_at) WITH (pages_per_range = 32)',
    'CREATE INDEX IF NOT EXISTS idx_notification_queue_brin ON system.notification_queue USING BRIN (created_at) WITH (pages_per_range = 8)',
    'CREATE INDEX IF NOT EXISTS idx_import_jobs_brin ON system.import_jobs USING BRIN (created_at) WITH (pages_per_range = 32)',
    'CREATE INDEX IF NOT EXISTS idx_export_jobs_brin ON system.export_jobs USING BRIN (created_at) WITH (pages_per_range = 32)',
    'CREATE INDEX IF NOT EXISTS idx_cdc_outbox_brin ON system.cdc_outbox USING BRIN (created_at) WITH (pages_per_range = 8)',
    'CREATE INDEX IF NOT EXISTS idx_query_cache_brin ON system.query_cache USING BRIN (created_at) WITH (pages_per_range = 16)',
    'CREATE INDEX IF NOT EXISTS idx_techniques_created_brin ON platform.heritage_techniques USING BRIN (created_at) WITH (pages_per_range = 64)',
    'CREATE INDEX IF NOT EXISTS idx_rating_hist_brin ON tournament.rating_history USING BRIN (recorded_at) WITH (pages_per_range = 16)',
    'CREATE INDEX IF NOT EXISTS idx_athletes_updated_brin ON athletes USING BRIN (updated_at) WITH (pages_per_range = 32)',
    'CREATE INDEX IF NOT EXISTS idx_tournaments_updated_brin ON tournaments USING BRIN (updated_at) WITH (pages_per_range = 32)',
    'CREATE INDEX IF NOT EXISTS idx_matches_updated_brin ON combat_matches USING BRIN (updated_at) WITH (pages_per_range = 32)'
  ];
  v_sql TEXT;
  v_ok INT := 0;
  v_skip INT := 0;
BEGIN
  FOREACH v_sql IN ARRAY v_indexes LOOP
    BEGIN
      EXECUTE v_sql;
      v_ok := v_ok + 1;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipped BRIN index: %', SQLERRM;
      v_skip := v_skip + 1;
    END;
  END LOOP;
  RAISE NOTICE 'BRIN indexes: % created, % skipped', v_ok, v_skip;
END $$;

-- ════════════════════════════════════════════════════════
-- 3. MONITORING VIEWS (in separate transaction)
-- ════════════════════════════════════════════════════════

BEGIN;

DROP VIEW IF EXISTS system.v_brin_indexes CASCADE;
CREATE VIEW system.v_brin_indexes AS
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexname::regclass)) AS index_size,
  pg_size_pretty(pg_relation_size((schemaname || '.' || tablename)::regclass)) AS table_size,
  ROUND(
    pg_relation_size(indexname::regclass)::NUMERIC /
    NULLIF(pg_relation_size((schemaname || '.' || tablename)::regclass), 0) * 100, 2
  ) AS index_to_table_pct
FROM pg_indexes
WHERE indexdef LIKE '%USING brin%'
ORDER BY pg_relation_size(indexname::regclass) DESC;

DROP VIEW IF EXISTS system.v_index_size_comparison CASCADE;
CREATE VIEW system.v_index_size_comparison AS
WITH idx AS (
  SELECT
    schemaname || '.' || tablename AS table_name,
    indexname,
    CASE
      WHEN indexdef LIKE '%USING brin%' THEN 'brin'
      WHEN indexdef LIKE '%USING btree%' THEN 'btree'
      WHEN indexdef LIKE '%USING gin%' THEN 'gin'
      WHEN indexdef LIKE '%USING gist%' THEN 'gist'
      WHEN indexdef LIKE '%USING hash%' THEN 'hash'
      ELSE 'unknown'
    END AS index_type,
    pg_relation_size(indexname::regclass) AS size_bytes
  FROM pg_indexes
  WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
)
SELECT
  table_name,
  index_type,
  count(*) AS index_count,
  pg_size_pretty(sum(size_bytes)) AS total_size,
  pg_size_pretty(avg(size_bytes)::BIGINT) AS avg_size
FROM idx
GROUP BY table_name, index_type
ORDER BY table_name, index_type;

DROP VIEW IF EXISTS system.v_brin_candidates CASCADE;
CREATE VIEW system.v_brin_candidates AS
SELECT
  c.relnamespace::regnamespace || '.' || c.relname AS table_name,
  c.reltuples::BIGINT AS est_rows,
  pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size,
  EXISTS (
    SELECT 1 FROM pg_index idx
    JOIN pg_class ic ON ic.oid = idx.indexrelid
    WHERE idx.indrelid = c.oid
      AND pg_get_indexdef(ic.oid) LIKE '%USING brin%'
  ) AS has_brin,
  EXISTS (
    SELECT 1 FROM pg_attribute att
    WHERE att.attrelid = c.oid AND att.attname = 'created_at'
  ) AS has_created_at
FROM pg_class c
WHERE c.relkind = 'r'
  AND c.relnamespace::regnamespace::TEXT NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  AND c.reltuples > 1000
ORDER BY c.reltuples DESC;

COMMIT;


-- ─── Source: 0066_backup_vacuum.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0066: BACKUP/RECOVERY + SMART VACUUM
-- P2 Medium: Pre-migration checkpoints, recovery tracking,
-- per-table vacuum tuning, bloat alerts
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. BACKUP CHECKPOINT TABLE
--    Record state before critical operations
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.backup_checkpoints (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  checkpoint_name VARCHAR(200) NOT NULL,
  checkpoint_type VARCHAR(50) NOT NULL
    CHECK (checkpoint_type IN ('pre_migration', 'pre_bulk_update', 'manual', 'scheduled', 'neon_branch')),
  -- State snapshot
  table_counts    JSONB DEFAULT '{}',       -- {table_name: row_count}
  schema_hash     TEXT,                     -- hash of schema DDL
  -- Neon-specific
  neon_branch_id  TEXT,                     -- Neon branch ID if used
  neon_branch_name TEXT,
  -- Context
  migration_ref   VARCHAR(100),             -- e.g. '0060_elo_rating_system'
  description     TEXT,
  created_by      UUID,
  recovery_notes  TEXT,                     -- instructions for rollback
  -- Status
  status          VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('active', 'used', 'expired', 'deleted')),
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checkpoints_type
  ON system.backup_checkpoints(checkpoint_type, created_at DESC);

-- ════════════════════════════════════════════════════════
-- 2. CHECKPOINT CREATION FUNCTION
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION system.create_checkpoint(
  p_name TEXT,
  p_type TEXT DEFAULT 'manual',
  p_migration_ref TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
  v_counts JSONB := '{}';
  v_hash TEXT;
  r RECORD;
BEGIN
  -- Capture row counts for critical tables
  FOR r IN SELECT unnest(ARRAY[
    'core.users', 'core.tenants', 'athletes', 'tournaments',
    'combat_matches', 'teams', 'clubs', 'registrations',
    'platform.payments', 'platform.invoices'
  ]) AS tbl LOOP
    BEGIN
      EXECUTE format('SELECT count(*) FROM %s', r.tbl) INTO v_hash;
      v_counts := v_counts || jsonb_build_object(r.tbl, v_hash::INT);
    EXCEPTION WHEN undefined_table THEN NULL;
    END;
  END LOOP;

  -- Schema hash (simplified: hash of table count)
  SELECT md5(string_agg(
    n.nspname || '.' || c.relname || ':' || c.relnatts::TEXT, ','
    ORDER BY n.nspname, c.relname
  )) INTO v_hash
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind = 'r'
    AND n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast');

  INSERT INTO system.backup_checkpoints
    (checkpoint_name, checkpoint_type, table_counts, schema_hash,
     migration_ref, description, created_by, expires_at)
  VALUES (
    p_name, p_type, v_counts, v_hash,
    p_migration_ref, p_description,
    NULLIF(current_setting('app.current_user', true), '')::UUID,
    NOW() + INTERVAL '30 days'
  ) RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 3. RECOVERY POINTS VIEW
-- ════════════════════════════════════════════════════════

DROP VIEW IF EXISTS system.v_recovery_points CASCADE;
CREATE VIEW system.v_recovery_points AS
SELECT
  id,
  checkpoint_name,
  checkpoint_type,
  migration_ref,
  status,
  CASE
    WHEN neon_branch_id IS NOT NULL THEN 'Neon Branch: ' || neon_branch_name
    ELSE 'Table counts snapshot'
  END AS recovery_method,
  table_counts,
  created_at,
  expires_at,
  CASE WHEN expires_at < NOW() THEN true ELSE false END AS is_expired
FROM system.backup_checkpoints
WHERE status = 'active'
ORDER BY created_at DESC;

-- ════════════════════════════════════════════════════════
-- 4. SMART VACUUM CONFIGURATION
--    Per-table AUTO_VACUUM settings for different workloads
-- ════════════════════════════════════════════════════════

-- High-churn tables → aggressive vacuum (lower thresholds)
DO $$
DECLARE tbl TEXT;
BEGIN
  -- Tables with frequent INSERT/UPDATE/DELETE
  FOR tbl IN SELECT unnest(ARRAY[
    'system.notification_queue',
    'system.cdc_outbox',
    'system.query_cache',
    'system.job_queue'
  ]) LOOP
    BEGIN
      EXECUTE format(
        'ALTER TABLE %s SET (
          autovacuum_vacuum_scale_factor = 0.05,
          autovacuum_analyze_scale_factor = 0.02,
          autovacuum_vacuum_threshold = 50,
          autovacuum_vacuum_cost_delay = 10
        )', tbl);
    EXCEPTION WHEN undefined_table THEN NULL;
    END;
  END LOOP;

  -- Medium-churn tables (default-ish but tuned)
  FOR tbl IN SELECT unnest(ARRAY[
    'athletes', 'combat_matches', 'registrations',
    'platform.payments', 'platform.posts'
  ]) LOOP
    BEGIN
      EXECUTE format(
        'ALTER TABLE %s SET (
          autovacuum_vacuum_scale_factor = 0.1,
          autovacuum_analyze_scale_factor = 0.05,
          autovacuum_vacuum_threshold = 100
        )', tbl);
    EXCEPTION WHEN undefined_table THEN NULL;
    END;
  END LOOP;

  -- Low-churn tables (reference data) → less frequent vacuum
  FOR tbl IN SELECT unnest(ARRAY[
    'core.tenants', 'core.roles', 'ref_belt_ranks',
    'ref_weight_classes', 'ref_sport_types'
  ]) LOOP
    BEGIN
      EXECUTE format(
        'ALTER TABLE %s SET (
          autovacuum_vacuum_scale_factor = 0.2,
          autovacuum_analyze_scale_factor = 0.1,
          autovacuum_vacuum_threshold = 500
        )', tbl);
    EXCEPTION WHEN undefined_table THEN NULL;
    END;
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════
-- 5. VACUUM MONITORING VIEWS
-- ════════════════════════════════════════════════════════

DROP VIEW IF EXISTS system.v_vacuum_stats CASCADE;
CREATE VIEW system.v_vacuum_stats AS
SELECT
  schemaname || '.' || relname AS table_name,
  n_live_tup AS live_rows,
  n_dead_tup AS dead_rows,
  CASE WHEN n_live_tup > 0
    THEN ROUND(n_dead_tup::NUMERIC / n_live_tup * 100, 2)
    ELSE 0
  END AS dead_row_pct,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze,
  vacuum_count + autovacuum_count AS total_vacuums,
  analyze_count + autoanalyze_count AS total_analyzes,
  n_mod_since_analyze AS mods_since_analyze
FROM pg_stat_user_tables
WHERE n_live_tup > 100
ORDER BY dead_row_pct DESC, n_dead_tup DESC;

-- Bloat alert view (tables exceeding threshold)
DROP VIEW IF EXISTS system.v_bloat_alerts CASCADE;
CREATE VIEW system.v_bloat_alerts AS
SELECT
  table_name,
  dead_rows,
  dead_row_pct,
  last_autovacuum,
  CASE
    WHEN dead_row_pct > 30 THEN 'CRITICAL'
    WHEN dead_row_pct > 15 THEN 'WARNING'
    WHEN dead_row_pct > 5 THEN 'INFO'
    ELSE 'OK'
  END AS severity,
  CASE
    WHEN last_autovacuum IS NULL THEN 'Never vacuumed'
    WHEN last_autovacuum < NOW() - INTERVAL '7 days' THEN 'Vacuum overdue'
    ELSE 'Recent vacuum'
  END AS vacuum_status
FROM system.v_vacuum_stats
WHERE dead_row_pct > 5
ORDER BY dead_row_pct DESC;

COMMIT;


-- ─── Source: 0067_searchpath_webhooks.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0067: SEARCH PATH + DB WEBHOOKS
-- P2 Medium: Dynamic search_path + event-driven webhooks from DB
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. SCHEMA ACCESS MATRIX
--    Defines which roles can access which schemas
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.schema_access_matrix (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  role_name       VARCHAR(100) NOT NULL,
  schema_name     VARCHAR(100) NOT NULL,
  access_level    VARCHAR(20) NOT NULL DEFAULT 'read'
    CHECK (access_level IN ('none', 'read', 'write', 'admin')),
  search_priority INT DEFAULT 100,        -- lower = higher priority in search_path
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (role_name, schema_name)
);

-- Seed default access matrix
INSERT INTO system.schema_access_matrix (role_name, schema_name, access_level, search_priority) VALUES
  -- Admin sees everything
  ('admin', 'public', 'admin', 10),
  ('admin', 'core', 'admin', 20),
  ('admin', 'tournament', 'admin', 30),
  ('admin', 'platform', 'admin', 40),
  ('admin', 'people', 'admin', 50),
  ('admin', 'training', 'admin', 60),
  ('admin', 'system', 'admin', 70),
  ('admin', 'api_v1', 'admin', 5),
  ('admin', 'temporal', 'read', 80),
  ('admin', 'archive', 'read', 90),
  -- API role
  ('api', 'api_v1', 'read', 5),
  ('api', 'public', 'write', 10),
  ('api', 'core', 'write', 20),
  ('api', 'tournament', 'write', 30),
  ('api', 'platform', 'write', 40),
  ('api', 'people', 'write', 50),
  ('api', 'training', 'write', 60),
  -- Read-only
  ('readonly', 'api_v1', 'read', 5),
  ('readonly', 'public', 'read', 10),
  -- Scoring
  ('scoring', 'api_v1', 'read', 5),
  ('scoring', 'tournament', 'write', 10),
  ('scoring', 'public', 'read', 20)
ON CONFLICT (role_name, schema_name) DO NOTHING;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON system.schema_access_matrix
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ════════════════════════════════════════════════════════
-- 2. DYNAMIC SEARCH PATH FUNCTION
--    Set search_path based on current user's role
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION system.set_search_path_for_role(p_role TEXT)
RETURNS TEXT AS $$
DECLARE
  v_path TEXT;
BEGIN
  SELECT string_agg(schema_name, ', ' ORDER BY search_priority)
  INTO v_path
  FROM system.schema_access_matrix
  WHERE role_name = p_role
    AND is_active = true
    AND access_level != 'none';

  IF v_path IS NOT NULL THEN
    EXECUTE format('SET search_path TO %s', v_path);
  END IF;

  RETURN COALESCE(v_path, 'public');
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 3. TENANT-SPECIFIC SCHEMA CONFIG
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.tenant_schema_config (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES core.tenants(id),
  default_schema  VARCHAR(100) DEFAULT 'public',
  extra_schemas   TEXT[] DEFAULT '{}',     -- additional schemas for this tenant
  custom_search_path TEXT,                 -- override search_path
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id)
);

ALTER TABLE system.tenant_schema_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON system.tenant_schema_config
  USING (tenant_id = COALESCE(
    current_setting('app.current_tenant', true)::UUID,
    '00000000-0000-7000-8000-000000000001'::UUID));

CREATE TRIGGER set_updated_at BEFORE UPDATE ON system.tenant_schema_config
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ════════════════════════════════════════════════════════
-- 4. DATABASE EVENT WEBHOOKS
--    Fire HTTP-like events from database changes
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.db_webhooks (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  name            VARCHAR(200) NOT NULL UNIQUE,
  -- Trigger conditions
  source_table    VARCHAR(200) NOT NULL,   -- 'athletes', 'tournaments'
  event_types     TEXT[] NOT NULL DEFAULT ARRAY['INSERT', 'UPDATE', 'DELETE'],
  condition_sql   TEXT,                     -- optional WHERE clause
  -- Target
  endpoint_url    TEXT NOT NULL,
  http_method     VARCHAR(10) DEFAULT 'POST',
  headers         JSONB DEFAULT '{"Content-Type": "application/json"}',
  -- Config
  is_active       BOOLEAN DEFAULT true,
  retry_count     INT DEFAULT 3,
  retry_delay_seconds INT DEFAULT 30,
  timeout_seconds INT DEFAULT 10,
  tenant_id       UUID,                    -- NULL = all tenants
  -- Stats
  total_sent      BIGINT DEFAULT 0,
  total_failed    BIGINT DEFAULT 0,
  last_sent_at    TIMESTAMPTZ,
  last_error      TEXT,
  -- Metadata
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON system.db_webhooks
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ════════════════════════════════════════════════════════
-- 5. WEBHOOK EVENT QUEUE
--    Outbox pattern for webhook delivery
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.webhook_events (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  webhook_id      UUID NOT NULL REFERENCES system.db_webhooks(id) ON DELETE CASCADE,
  event_type      VARCHAR(10) NOT NULL,
  payload         JSONB NOT NULL,
  -- Delivery status
  status          VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'sending', 'delivered', 'failed', 'expired')),
  attempts        INT DEFAULT 0,
  next_retry_at   TIMESTAMPTZ,
  last_response   INT,                     -- HTTP status code
  last_error      TEXT,
  -- Timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_pending
  ON system.webhook_events(status, next_retry_at)
  WHERE status IN ('pending', 'sending');

-- ════════════════════════════════════════════════════════
-- 6. WEBHOOK TRIGGER FUNCTION
--    Captures table changes and queues webhook events
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION trigger_queue_webhook()
RETURNS TRIGGER AS $$
DECLARE
  v_webhook RECORD;
  v_payload JSONB;
  v_tenant_id UUID;
BEGIN
  -- Build payload
  v_payload := jsonb_build_object(
    'event', TG_OP,
    'table', TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
    'timestamp', NOW()
  );

  IF TG_OP = 'DELETE' THEN
    v_payload := v_payload || jsonb_build_object('data', to_jsonb(OLD));
    v_tenant_id := OLD.tenant_id;
  ELSE
    v_payload := v_payload || jsonb_build_object('data', to_jsonb(NEW));
    v_tenant_id := NEW.tenant_id;
    IF TG_OP = 'UPDATE' THEN
      v_payload := v_payload || jsonb_build_object('old_data', to_jsonb(OLD));
    END IF;
  END IF;

  -- Find matching webhooks
  FOR v_webhook IN
    SELECT id FROM system.db_webhooks
    WHERE source_table = TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME
      AND TG_OP = ANY(event_types)
      AND is_active = true
      AND (tenant_id IS NULL OR tenant_id = v_tenant_id)
  LOOP
    INSERT INTO system.webhook_events (webhook_id, event_type, payload)
    VALUES (v_webhook.id, TG_OP, v_payload);
  END LOOP;

  -- Notify webhook processor
  IF FOUND THEN
    PERFORM pg_notify('webhook_events', json_build_object(
      'table', TG_TABLE_NAME, 'event', TG_OP
    )::TEXT);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 7. WEBHOOK PROCESSING FUNCTION (pull + deliver)
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION system.process_webhook_queue(
  p_batch_size INT DEFAULT 50
)
RETURNS TABLE (
  event_id BIGINT,
  webhook_name TEXT,
  status TEXT
) AS $$
DECLARE
  v_event RECORD;
BEGIN
  FOR v_event IN
    SELECT we.id, we.webhook_id, we.payload, we.attempts,
           dw.name, dw.endpoint_url, dw.retry_count
    FROM system.webhook_events we
    JOIN system.db_webhooks dw ON dw.id = we.webhook_id
    WHERE we.status = 'pending'
      AND (we.next_retry_at IS NULL OR we.next_retry_at <= NOW())
    ORDER BY we.id
    LIMIT p_batch_size
    FOR UPDATE OF we SKIP LOCKED
  LOOP
    -- Mark as sending
    UPDATE system.webhook_events SET
      status = 'sending', attempts = attempts + 1
    WHERE id = v_event.id;

    -- Actual HTTP call must be done by Go backend
    -- Here we just prepare the event for pickup
    event_id := v_event.id;
    webhook_name := v_event.name;
    status := 'ready_for_delivery';
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 8. WEBHOOK STATS VIEW
-- ════════════════════════════════════════════════════════

DROP VIEW IF EXISTS system.v_webhook_stats CASCADE;
CREATE VIEW system.v_webhook_stats AS
SELECT
  dw.name AS webhook_name,
  dw.source_table,
  dw.endpoint_url,
  dw.is_active,
  dw.total_sent,
  dw.total_failed,
  dw.last_sent_at,
  count(we.id) FILTER (WHERE we.status = 'pending') AS pending_events,
  count(we.id) FILTER (WHERE we.status = 'failed') AS failed_events,
  count(we.id) FILTER (WHERE we.status = 'delivered') AS delivered_events
FROM system.db_webhooks dw
LEFT JOIN system.webhook_events we ON we.webhook_id = dw.id
GROUP BY dw.id;

COMMIT;


-- ─── Source: 0068_matviews_abtesting.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0068: READ-THROUGH MATVIEWS + A/B TEST
-- P3 Long-term: Lazy matviews + experiment infrastructure
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. MATVIEW REGISTRY (Lazy Refresh)
--    Track usage patterns → only refresh hot views
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.matview_registry (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  view_name       VARCHAR(200) NOT NULL UNIQUE,
  -- Refresh config
  refresh_interval_seconds INT DEFAULT 300,   -- minimum refresh interval
  refresh_strategy VARCHAR(20) DEFAULT 'on_demand'
    CHECK (refresh_strategy IN ('on_demand', 'periodic', 'on_write', 'lazy')),
  source_tables   TEXT[] DEFAULT '{}',         -- tables this view depends on
  -- Usage stats
  last_refreshed  TIMESTAMPTZ,
  last_read_at    TIMESTAMPTZ,
  total_reads     BIGINT DEFAULT 0,
  total_refreshes BIGINT DEFAULT 0,
  avg_refresh_ms  NUMERIC(10,2) DEFAULT 0,
  -- Lifecycle
  is_active       BOOLEAN DEFAULT true,
  auto_drop_days  INT DEFAULT 30,              -- drop if unused for N days
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON system.matview_registry
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Register existing matviews
INSERT INTO system.matview_registry (view_name, refresh_strategy, refresh_interval_seconds, source_tables) VALUES
  ('api_v1.tournament_dashboard', 'periodic', 600, ARRAY['tournaments', 'athletes', 'combat_matches']),
  ('api_v1.rankings_leaderboard', 'periodic', 900, ARRAY['rankings', 'athletes']),
  ('api_v1.leaderboard', 'periodic', 900, ARRAY['tournament.athlete_ratings', 'athletes'])
ON CONFLICT (view_name) DO NOTHING;

-- ════════════════════════════════════════════════════════
-- 2. LAZY REFRESH FUNCTION
--    Only refresh if: (a) stale, (b) being read
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION system.lazy_matview_read(p_view_name TEXT)
RETURNS VOID AS $$
DECLARE
  v_reg system.matview_registry%ROWTYPE;
  v_start TIMESTAMPTZ;
  v_elapsed NUMERIC;
BEGIN
  SELECT * INTO v_reg FROM system.matview_registry WHERE view_name = p_view_name;

  IF NOT FOUND OR NOT v_reg.is_active THEN RETURN; END IF;

  -- Track the read
  UPDATE system.matview_registry SET
    last_read_at = NOW(),
    total_reads = total_reads + 1
  WHERE id = v_reg.id;

  -- Check if refresh needed
  IF v_reg.refresh_strategy = 'lazy'
    AND (v_reg.last_refreshed IS NULL
         OR v_reg.last_refreshed < NOW() - (v_reg.refresh_interval_seconds || ' seconds')::INTERVAL)
  THEN
    v_start := clock_timestamp();
    BEGIN
      EXECUTE format('REFRESH MATERIALIZED VIEW %s', p_view_name);
      v_elapsed := EXTRACT(MILLISECONDS FROM clock_timestamp() - v_start);

      UPDATE system.matview_registry SET
        last_refreshed = NOW(),
        total_refreshes = total_refreshes + 1,
        avg_refresh_ms = CASE
          WHEN total_refreshes = 0 THEN v_elapsed
          ELSE (avg_refresh_ms * total_refreshes + v_elapsed) / (total_refreshes + 1)
        END
      WHERE id = v_reg.id;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Failed lazy refresh of %: %', p_view_name, SQLERRM;
    END;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 3. AUTO-DROP UNUSED MATVIEWS
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION system.cleanup_unused_matviews(p_dry_run BOOLEAN DEFAULT true)
RETURNS TABLE (view_name TEXT, last_read TIMESTAMPTZ, action TEXT) AS $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT * FROM system.matview_registry
    WHERE is_active = true
      AND last_read_at IS NOT NULL
      AND last_read_at < NOW() - (auto_drop_days || ' days')::INTERVAL
  LOOP
    view_name := r.view_name;
    last_read := r.last_read_at;

    IF p_dry_run THEN
      action := 'WOULD_DROP';
    ELSE
      BEGIN
        EXECUTE format('DROP MATERIALIZED VIEW IF EXISTS %s', r.view_name);
        UPDATE system.matview_registry SET is_active = false WHERE id = r.id;
        action := 'DROPPED';
      EXCEPTION WHEN OTHERS THEN
        action := 'ERROR: ' || SQLERRM;
      END;
    END IF;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 4. A/B TESTING — EXPERIMENTS TABLE
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.experiments (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  name            VARCHAR(200) NOT NULL UNIQUE,
  description     TEXT,
  hypothesis      TEXT,
  -- Configuration
  status          VARCHAR(20) DEFAULT 'draft'
    CHECK (status IN ('draft', 'running', 'paused', 'completed', 'cancelled')),
  traffic_pct     INT DEFAULT 50 CHECK (traffic_pct BETWEEN 0 AND 100),
  -- Variants
  variants        JSONB NOT NULL DEFAULT '[
    {"name": "control", "weight": 50},
    {"name": "treatment", "weight": 50}
  ]',
  -- Targeting
  target_tenants  UUID[],                  -- NULL = all tenants
  target_roles    TEXT[],                  -- filter by user role
  -- Metrics
  primary_metric  VARCHAR(200),            -- e.g., 'registration_rate'
  secondary_metrics TEXT[],
  -- Timeline
  started_at      TIMESTAMPTZ,
  ended_at        TIMESTAMPTZ,
  auto_end_days   INT DEFAULT 30,
  -- Owner
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON system.experiments
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ════════════════════════════════════════════════════════
-- 5. EXPERIMENT ASSIGNMENTS
--    Which user gets which variant
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.experiment_assignments (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  experiment_id   UUID NOT NULL REFERENCES system.experiments(id) ON DELETE CASCADE,
  user_id         UUID,
  tenant_id       UUID,
  session_id      TEXT,
  variant         VARCHAR(100) NOT NULL,
  assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (experiment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_exp_assign_lookup
  ON system.experiment_assignments(experiment_id, user_id);

-- ════════════════════════════════════════════════════════
-- 6. EXPERIMENT EVENTS (Results Tracking)
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.experiment_events (
  id              BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  experiment_id   UUID NOT NULL REFERENCES system.experiments(id) ON DELETE CASCADE,
  user_id         UUID,
  variant         VARCHAR(100) NOT NULL,
  event_type      VARCHAR(100) NOT NULL,   -- 'page_view', 'registration', 'purchase'
  event_value     NUMERIC,                 -- optional: amount, duration, etc.
  metadata        JSONB DEFAULT '{}',
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (recorded_at, id)
) PARTITION BY RANGE (recorded_at);

CREATE TABLE IF NOT EXISTS system.experiment_events_2026
  PARTITION OF system.experiment_events
  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
CREATE TABLE IF NOT EXISTS system.experiment_events_default
  PARTITION OF system.experiment_events DEFAULT;

-- ════════════════════════════════════════════════════════
-- 7. ASSIGN VARIANT FUNCTION
--    Deterministic assignment based on user_id hash
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION system.get_experiment_variant(
  p_experiment_name TEXT,
  p_user_id UUID DEFAULT NULL,
  p_tenant_id UUID DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  v_exp system.experiments%ROWTYPE;
  v_variant TEXT;
  v_hash INT;
  v_variants JSONB;
  v_weight INT;
  v_cumulative INT := 0;
  v_target INT;
  v RECORD;
BEGIN
  SELECT * INTO v_exp FROM system.experiments
  WHERE name = p_experiment_name AND status = 'running';

  IF NOT FOUND THEN RETURN NULL; END IF;

  -- Check if already assigned
  SELECT variant INTO v_variant
  FROM system.experiment_assignments
  WHERE experiment_id = v_exp.id AND user_id = p_user_id;

  IF v_variant IS NOT NULL THEN RETURN v_variant; END IF;

  -- Check traffic allocation
  v_hash := abs(hashtext(COALESCE(p_user_id::TEXT, '') || v_exp.id::TEXT)) % 100;
  IF v_hash >= v_exp.traffic_pct THEN
    RETURN 'control';  -- Not in experiment
  END IF;

  -- Assign based on variant weights
  v_target := abs(hashtext(p_user_id::TEXT || v_exp.name)) % 100;
  FOR v IN SELECT * FROM jsonb_array_elements(v_exp.variants) LOOP
    v_weight := (v.value ->> 'weight')::INT;
    v_cumulative := v_cumulative + v_weight;
    IF v_target < v_cumulative THEN
      v_variant := v.value ->> 'name';
      EXIT;
    END IF;
  END LOOP;

  v_variant := COALESCE(v_variant, 'control');

  -- Record assignment
  INSERT INTO system.experiment_assignments (experiment_id, user_id, tenant_id, variant)
  VALUES (v_exp.id, p_user_id, p_tenant_id, v_variant)
  ON CONFLICT (experiment_id, user_id) DO UPDATE SET variant = EXCLUDED.variant;

  RETURN v_variant;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 8. EXPERIMENT RESULTS VIEW
-- ════════════════════════════════════════════════════════

DROP VIEW IF EXISTS system.v_experiment_results CASCADE;
CREATE VIEW system.v_experiment_results AS
SELECT
  e.name AS experiment_name,
  e.status,
  e.traffic_pct,
  ea.variant,
  count(DISTINCT ea.user_id) AS users_in_variant,
  count(ee.id) AS total_events,
  count(DISTINCT ee.user_id) AS users_with_events,
  CASE WHEN count(DISTINCT ea.user_id) > 0
    THEN ROUND(count(DISTINCT ee.user_id)::NUMERIC / count(DISTINCT ea.user_id) * 100, 2)
    ELSE 0
  END AS conversion_rate_pct,
  avg(ee.event_value) AS avg_event_value,
  sum(ee.event_value) AS total_event_value
FROM system.experiments e
LEFT JOIN system.experiment_assignments ea ON ea.experiment_id = e.id
LEFT JOIN system.experiment_events ee ON ee.experiment_id = e.id AND ee.variant = ea.variant
GROUP BY e.name, e.status, e.traffic_pct, ea.variant
ORDER BY e.name, ea.variant;

COMMIT;


-- ─── Source: 0069_graphql_functions.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0069: GRAPHQL-READY JSON FUNCTIONS
-- P3: Nested JSON builders, Relay pagination, batch loading
-- ===============================================================

BEGIN;

-- 1. TOURNAMENT FULL JSON
CREATE OR REPLACE FUNCTION api_v1.tournament_json(p_id UUID)
RETURNS JSONB AS $$
DECLARE v JSONB; v_t UUID;
BEGIN
  v_t := COALESCE(current_setting('app.current_tenant',true)::UUID,
    '00000000-0000-7000-8000-000000000001'::UUID);
  SELECT jsonb_build_object(
    'id',t.id,'name',t.name,'status',t.status,
    'startDate',t.start_date,'endDate',t.end_date,'location',t.location,
    'athletes',(SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'id',a.id,'hoTen',a.ho_ten,'canNang',a.can_nang,'trangThai',a.trang_thai
    )),'[]') FROM athletes a WHERE a.tournament_id=t.id AND a.is_deleted=false AND a.tenant_id=v_t),
    'teams',(SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'id',tm.id,'ten',tm.ten,'tinhThanh',tm.tinh_thanh
    )),'[]') FROM teams tm WHERE tm.tournament_id=t.id AND tm.is_deleted=false AND tm.tenant_id=v_t),
    'matches',(SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'id',m.id,'trangThai',m.trang_thai,'vdvDoId',m.vdv_do_id,'vdvXanhId',m.vdv_xanh_id
    )),'[]') FROM (SELECT * FROM combat_matches WHERE tournament_id=t.id AND is_deleted=false LIMIT 50) m)
  ) INTO v FROM tournaments t WHERE t.id=p_id AND t.is_deleted=false AND t.tenant_id=v_t;
  RETURN v;
END; $$ LANGUAGE plpgsql STABLE;

-- 2. ATHLETE PROFILE JSON
CREATE OR REPLACE FUNCTION api_v1.athlete_json(p_id UUID)
RETURNS JSONB AS $$
DECLARE v JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id',a.id,'hoTen',a.ho_ten,'maVdv',a.ma_vdv,'ngaySinh',a.ngay_sinh,
    'gioiTinh',a.gioi_tinh,'canNang',a.can_nang,'trangThai',a.trang_thai,
    'ratings',(SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'category',r.category,'rating',r.rating,'wins',r.wins,'losses',r.losses
    )),'[]') FROM tournament.athlete_ratings r WHERE r.athlete_id=a.id AND r.is_active=true),
    'recentMatches',(SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'result',rh.result,'ratingChange',rh.rating_change,'recordedAt',rh.recorded_at
    )),'[]') FROM (SELECT * FROM tournament.rating_history WHERE athlete_id=a.id ORDER BY recorded_at DESC LIMIT 10) rh)
  ) INTO v FROM athletes a WHERE a.id=p_id AND a.is_deleted=false;
  RETURN v;
END; $$ LANGUAGE plpgsql STABLE;

-- 3. RELAY CONNECTION PAGINATION
CREATE OR REPLACE FUNCTION api_v1.to_connection(
  p_table TEXT, p_where TEXT DEFAULT 'true',
  p_order TEXT DEFAULT 'created_at DESC',
  p_first INT DEFAULT 20, p_after TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE v_edges JSONB; v_total BIGINT; v_has_next BOOLEAN;
BEGIN
  EXECUTE format('SELECT count(*) FROM %s WHERE %s',p_table,p_where) INTO v_total;
  EXECUTE format(
    'SELECT COALESCE(jsonb_agg(jsonb_build_object(
       ''node'',to_jsonb(t),''cursor'',encode(t.id::TEXT::BYTEA,''base64'')
     )),''[]'') FROM (SELECT * FROM %s t WHERE %s %s ORDER BY %s LIMIT %s) t',
    p_table, p_where,
    CASE WHEN p_after IS NOT NULL THEN format(' AND t.id>%L::UUID',
      convert_from(decode(p_after,'base64'),'UTF8')) ELSE '' END,
    p_order, p_first+1
  ) INTO v_edges;
  v_has_next := jsonb_array_length(v_edges)>p_first;
  IF v_has_next THEN v_edges:=v_edges-(jsonb_array_length(v_edges)-1); END IF;
  RETURN jsonb_build_object('edges',v_edges,'pageInfo',jsonb_build_object(
    'hasNextPage',v_has_next,'hasPreviousPage',p_after IS NOT NULL,'totalCount',v_total
  ));
END; $$ LANGUAGE plpgsql STABLE;

-- 4. BATCH LOADER (DataLoader pattern)
CREATE OR REPLACE FUNCTION api_v1.batch_load(p_table TEXT, p_ids UUID[])
RETURNS JSONB AS $$
DECLARE v JSONB;
BEGIN
  EXECUTE format(
    'SELECT COALESCE(jsonb_object_agg(t.id::TEXT,to_jsonb(t)),''{}''::JSONB)
     FROM %s t WHERE t.id=ANY($1) AND (t.is_deleted IS NULL OR t.is_deleted=false)',
    p_table) INTO v USING p_ids;
  RETURN v;
END; $$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION api_v1.batch_athletes(p_ids UUID[])
RETURNS JSONB AS $$ SELECT api_v1.batch_load('athletes',p_ids); $$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION api_v1.batch_tournaments(p_ids UUID[])
RETURNS JSONB AS $$ SELECT api_v1.batch_load('tournaments',p_ids); $$ LANGUAGE sql STABLE;

COMMIT;


-- ─── Source: 0070_aiml_pipeline.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0070: AI/ML DATA PIPELINE
-- P3: Training datasets, predictions, model registry, feature store
-- ===============================================================

BEGIN;

-- Create ML schema
CREATE SCHEMA IF NOT EXISTS ml;

-- ════════════════════════════════════════════════════════
-- 1. MODEL REGISTRY
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ml.model_registry (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  name            VARCHAR(200) NOT NULL,
  version         VARCHAR(50) NOT NULL,
  model_type      VARCHAR(50) NOT NULL
    CHECK (model_type IN ('bracket_prediction','match_outcome','ranking','anomaly_detection','recommendation')),
  status          VARCHAR(20) DEFAULT 'draft'
    CHECK (status IN ('draft','training','validating','active','deprecated','archived')),
  -- Metrics
  accuracy        NUMERIC(5,4),
  precision_val   NUMERIC(5,4),
  recall          NUMERIC(5,4),
  f1_score        NUMERIC(5,4),
  custom_metrics  JSONB DEFAULT '{}',
  -- Config
  hyperparams     JSONB DEFAULT '{}',
  input_features  TEXT[],
  output_schema   JSONB DEFAULT '{}',
  -- Storage
  artifact_path   TEXT,
  file_size       BIGINT,
  -- Lifecycle
  trained_at      TIMESTAMPTZ,
  deployed_at     TIMESTAMPTZ,
  deprecated_at   TIMESTAMPTZ,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (name, version)
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON ml.model_registry
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ════════════════════════════════════════════════════════
-- 2. TRAINING DATASETS
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ml.training_datasets (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  name            VARCHAR(200) NOT NULL,
  dataset_type    VARCHAR(50) NOT NULL
    CHECK (dataset_type IN ('match_history','athlete_stats','tournament_outcomes','scoring_patterns')),
  -- Query that generates the dataset
  source_query    TEXT NOT NULL,
  -- Stats
  row_count       BIGINT DEFAULT 0,
  column_count    INT DEFAULT 0,
  schema_info     JSONB DEFAULT '{}',
  -- Versioning
  version         VARCHAR(50),
  data_hash       TEXT,
  -- Status
  status          VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending','generating','ready','expired','error')),
  generated_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════
-- 3. PREDICTIONS TABLE
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ml.predictions (
  id              UUID DEFAULT uuidv7() NOT NULL,
  tenant_id       UUID,
  model_id        UUID REFERENCES ml.model_registry(id),
  prediction_type VARCHAR(50) NOT NULL,
  -- Input/Output
  input_data      JSONB NOT NULL,
  prediction      JSONB NOT NULL,
  confidence      NUMERIC(5,4),
  -- Validation
  actual_outcome  JSONB,
  was_correct     BOOLEAN,
  -- Context
  entity_type     VARCHAR(50),
  entity_id       UUID,
  -- Timestamp
  predicted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  validated_at    TIMESTAMPTZ,
  PRIMARY KEY (predicted_at, id)
) PARTITION BY RANGE (predicted_at);

CREATE TABLE IF NOT EXISTS ml.predictions_2026
  PARTITION OF ml.predictions FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
CREATE TABLE IF NOT EXISTS ml.predictions_default
  PARTITION OF ml.predictions DEFAULT;

CREATE INDEX IF NOT EXISTS idx_predictions_entity
  ON ml.predictions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_predictions_model
  ON ml.predictions(model_id, predicted_at DESC);

-- ════════════════════════════════════════════════════════
-- 4. FEATURE STORE
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ml.feature_store (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  entity_type     VARCHAR(50) NOT NULL,
  entity_id       UUID NOT NULL,
  feature_set     VARCHAR(100) NOT NULL,
  features        JSONB NOT NULL,
  computed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ,
  version         INT DEFAULT 1,
  UNIQUE (entity_type, entity_id, feature_set)
);

CREATE INDEX IF NOT EXISTS idx_feature_store_lookup
  ON ml.feature_store(entity_type, entity_id, feature_set);

-- ════════════════════════════════════════════════════════
-- 5. ATHLETE FEATURE COMPUTATION
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION ml.compute_athlete_features(p_athlete_id UUID)
RETURNS JSONB AS $$
DECLARE v JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_matches', COALESCE(ar.total_matches, 0),
    'win_rate', CASE WHEN ar.total_matches > 0
      THEN round(ar.wins::NUMERIC / ar.total_matches, 4) ELSE 0 END,
    'current_rating', COALESCE(ar.rating, 1500),
    'rating_trend', COALESCE((
      SELECT avg(rating_change)
      FROM (SELECT rating_change FROM tournament.rating_history WHERE athlete_id = p_athlete_id ORDER BY recorded_at DESC LIMIT 5) r
    ), 0),
    'days_since_last_match', COALESCE(
      EXTRACT(DAY FROM NOW() - ar.last_match_at)::INT, 999),
    'weight_kg', a.can_nang,
    'age_years', EXTRACT(YEAR FROM age(a.ngay_sinh))::INT,
    'win_streak', COALESCE(ar.win_streak, 0)
  ) INTO v
  FROM athletes a
  LEFT JOIN tournament.athlete_ratings ar ON ar.athlete_id = a.id AND ar.is_active = true
  WHERE a.id = p_athlete_id
  LIMIT 1;

  -- Upsert into feature store
  INSERT INTO ml.feature_store (entity_type, entity_id, feature_set, features, expires_at)
  VALUES ('athlete', p_athlete_id, 'match_prediction', COALESCE(v, '{}'::JSONB), NOW() + INTERVAL '1 day')
  ON CONFLICT (entity_type, entity_id, feature_set) DO UPDATE SET
    features = EXCLUDED.features, computed_at = NOW(), expires_at = EXCLUDED.expires_at, version = ml.feature_store.version + 1;

  RETURN v;
END; $$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 6. MATCH OUTCOME PREDICTION (rule-based baseline)
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION ml.predict_match_outcome(
  p_red_id UUID, p_blue_id UUID
)
RETURNS JSONB AS $$
DECLARE v_red JSONB; v_blue JSONB; v_pred TEXT; v_conf NUMERIC;
BEGIN
  v_red := ml.compute_athlete_features(p_red_id);
  v_blue := ml.compute_athlete_features(p_blue_id);

  IF (v_red->>'current_rating')::NUMERIC > (v_blue->>'current_rating')::NUMERIC THEN
    v_pred := 'red_wins';
    v_conf := LEAST(0.5 + ((v_red->>'current_rating')::NUMERIC - (v_blue->>'current_rating')::NUMERIC) / 800.0, 0.95);
  ELSE
    v_pred := 'blue_wins';
    v_conf := LEAST(0.5 + ((v_blue->>'current_rating')::NUMERIC - (v_red->>'current_rating')::NUMERIC) / 800.0, 0.95);
  END IF;

  RETURN jsonb_build_object(
    'prediction', v_pred, 'confidence', round(v_conf, 4),
    'red_rating', v_red->>'current_rating', 'blue_rating', v_blue->>'current_rating',
    'red_win_rate', v_red->>'win_rate', 'blue_win_rate', v_blue->>'win_rate'
  );
END; $$ LANGUAGE plpgsql STABLE;

-- ════════════════════════════════════════════════════════
-- 7. ML MONITORING VIEW
-- ════════════════════════════════════════════════════════

DROP VIEW IF EXISTS ml.v_model_performance CASCADE;
CREATE VIEW ml.v_model_performance AS
SELECT
  mr.name, mr.version, mr.model_type, mr.status,
  count(p.id) AS total_predictions,
  count(p.id) FILTER (WHERE p.was_correct = true) AS correct,
  count(p.id) FILTER (WHERE p.was_correct = false) AS incorrect,
  CASE WHEN count(p.id) FILTER (WHERE p.was_correct IS NOT NULL) > 0
    THEN round(count(p.id) FILTER (WHERE p.was_correct)::NUMERIC /
      count(p.id) FILTER (WHERE p.was_correct IS NOT NULL) * 100, 2)
    ELSE NULL END AS accuracy_pct,
  avg(p.confidence) AS avg_confidence
FROM ml.model_registry mr
LEFT JOIN ml.predictions p ON p.model_id = mr.id
GROUP BY mr.id;

COMMIT;


-- ─── Source: 0071_enum_types.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0071: DATABASE ENUM TYPES
-- Replace CHECK IN (...) constraints with native PostgreSQL ENUMs
-- Benefits: type safety, auto-validation, cleaner schema docs
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. CREATE ENUM TYPES
-- ════════════════════════════════════════════════════════

-- Tournament/Match status
DO $$ BEGIN CREATE TYPE core.tournament_status AS ENUM (
  'nhap', 'cho_duyet', 'da_duyet', 'dang_dang_ky', 'dong_dang_ky',
  'boc_tham', 'thi_dau', 'hoan', 'ket_thuc', 'huy'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE core.match_status AS ENUM (
  'cho_dau', 'dang_dau', 'tam_dung', 'ket_thuc', 'huy', 'khong_dau'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE core.match_result AS ENUM (
  'thang_do', 'thang_xanh', 'hoa', 'khong_xac_dinh', 'huy'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Athlete status
DO $$ BEGIN CREATE TYPE core.athlete_status AS ENUM (
  'cho_duyet', 'da_duyet', 'tu_choi', 'huy', 'rut_lui'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Registration status
DO $$ BEGIN CREATE TYPE core.registration_status AS ENUM (
  'cho_xu_ly', 'da_duyet', 'tu_choi', 'da_huy'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Payment status
DO $$ BEGIN CREATE TYPE core.payment_status AS ENUM (
  'pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Invoice status
DO $$ BEGIN CREATE TYPE core.invoice_status AS ENUM (
  'draft', 'sent', 'paid', 'overdue', 'cancelled', 'void'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Gender
DO $$ BEGIN CREATE TYPE core.gender_type AS ENUM (
  'nam', 'nu', 'khac'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Notification channel
DO $$ BEGIN CREATE TYPE core.notification_channel AS ENUM (
  'email', 'push', 'sms', 'in_app', 'webhook'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Notification status
DO $$ BEGIN CREATE TYPE core.notification_status AS ENUM (
  'pending', 'sending', 'sent', 'delivered', 'failed', 'cancelled'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Job status
DO $$ BEGIN CREATE TYPE core.job_status AS ENUM (
  'pending', 'processing', 'completed', 'failed', 'cancelled', 'retrying'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Import/Export status
DO $$ BEGIN CREATE TYPE core.import_status AS ENUM (
  'pending', 'validating', 'validated', 'importing',
  'completed', 'failed', 'cancelled', 'partial'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Circuit breaker status
DO $$ BEGIN CREATE TYPE core.circuit_status AS ENUM (
  'closed', 'open', 'half_open'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Experiment status
DO $$ BEGIN CREATE TYPE core.experiment_status AS ENUM (
  'draft', 'running', 'paused', 'completed', 'cancelled'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Approval status
DO $$ BEGIN CREATE TYPE core.approval_status AS ENUM (
  'pending', 'approved', 'rejected', 'cancelled', 'expired'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Severity levels
DO $$ BEGIN CREATE TYPE core.severity_level AS ENUM (
  'info', 'warning', 'critical', 'maintenance'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ════════════════════════════════════════════════════════
-- 2. ENUM DOCUMENTATION VIEW
--    Lists all custom enums with their values
-- ════════════════════════════════════════════════════════

DROP VIEW IF EXISTS system.v_enum_types CASCADE;
CREATE VIEW system.v_enum_types AS
SELECT
  n.nspname AS schema_name,
  t.typname AS enum_name,
  ARRAY_AGG(e.enumlabel ORDER BY e.enumsortorder) AS enum_values,
  count(e.enumlabel) AS value_count
FROM pg_type t
JOIN pg_namespace n ON n.oid = t.typnamespace
JOIN pg_enum e ON e.enumtypid = t.oid
WHERE n.nspname = 'core'
GROUP BY n.nspname, t.typname
ORDER BY t.typname;

-- ════════════════════════════════════════════════════════
-- 3. SAFE ENUM ADD VALUE FUNCTION
--    Add values to existing enums without downtime
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION system.add_enum_value(
  p_enum_name TEXT,
  p_new_value TEXT,
  p_after_value TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE v_exists BOOLEAN;
BEGIN
  -- Check if value already exists
  SELECT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname || '.' || t.typname = p_enum_name
      AND e.enumlabel = p_new_value
  ) INTO v_exists;

  IF v_exists THEN RETURN false; END IF;

  IF p_after_value IS NOT NULL THEN
    EXECUTE format('ALTER TYPE %s ADD VALUE IF NOT EXISTS %L AFTER %L',
      p_enum_name, p_new_value, p_after_value);
  ELSE
    EXECUTE format('ALTER TYPE %s ADD VALUE IF NOT EXISTS %L',
      p_enum_name, p_new_value);
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 4. ENUM USAGE TRACKING VIEW
--    Shows which tables/columns reference each enum
-- ════════════════════════════════════════════════════════

DROP VIEW IF EXISTS system.v_enum_usage CASCADE;
CREATE VIEW system.v_enum_usage AS
SELECT
  n2.nspname || '.' || t.typname AS enum_type,
  n.nspname || '.' || c.relname AS table_name,
  a.attname AS column_name,
  ARRAY_AGG(e.enumlabel ORDER BY e.enumsortorder) AS allowed_values
FROM pg_attribute a
JOIN pg_class c ON c.oid = a.attrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_type t ON t.oid = a.atttypid
JOIN pg_namespace n2 ON n2.oid = t.typnamespace
JOIN pg_enum e ON e.enumtypid = t.oid
WHERE c.relkind = 'r'
  AND n.nspname NOT IN ('pg_catalog', 'information_schema')
GROUP BY n2.nspname, t.typname, n.nspname, c.relname, a.attname
ORDER BY enum_type, table_name;

COMMIT;


-- ─── Source: 0072_read_replica_routing.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0072: READ REPLICA ROUTING
-- Automatic query routing: SELECT → replica, writes → primary
-- Connection health monitoring and failover support
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. REPLICA REGISTRY
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.replica_registry (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  name            VARCHAR(100) NOT NULL UNIQUE,
  host            TEXT NOT NULL,
  port            INT DEFAULT 5432,
  role            VARCHAR(20) NOT NULL DEFAULT 'replica'
    CHECK (role IN ('primary', 'replica', 'analytics')),
  region          VARCHAR(50),
  -- Health
  status          VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('active', 'degraded', 'offline', 'maintenance')),
  max_lag_seconds INT DEFAULT 30,
  current_lag_ms  INT DEFAULT 0,
  last_health_check TIMESTAMPTZ,
  consecutive_failures INT DEFAULT 0,
  -- Config
  max_connections INT DEFAULT 50,
  weight          INT DEFAULT 100,         -- for weighted routing
  accepts_reads   BOOLEAN DEFAULT true,
  accepts_writes  BOOLEAN DEFAULT false,
  -- Metadata
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON system.replica_registry
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Seed primary
INSERT INTO system.replica_registry (name, host, port, role, accepts_writes, accepts_reads)
VALUES ('primary', 'localhost', 5432, 'primary', true, true)
ON CONFLICT (name) DO NOTHING;

-- ════════════════════════════════════════════════════════
-- 2. QUERY ROUTING FUNCTION
--    Returns best connection for query type
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION system.route_query(
  p_query_type TEXT DEFAULT 'read',  -- 'read', 'write', 'analytics'
  p_max_lag_ms INT DEFAULT 5000
)
RETURNS TABLE (
  replica_name TEXT,
  host TEXT,
  port INT,
  lag_ms INT
) AS $$
BEGIN
  IF p_query_type = 'write' THEN
    -- Writes always go to primary
    RETURN QUERY
    SELECT r.name::TEXT, r.host::TEXT, r.port, r.current_lag_ms
    FROM system.replica_registry r
    WHERE r.role = 'primary' AND r.status = 'active'
    LIMIT 1;

  ELSIF p_query_type = 'analytics' THEN
    -- Analytics prefer dedicated analytics replicas
    RETURN QUERY
    SELECT r.name::TEXT, r.host::TEXT, r.port, r.current_lag_ms
    FROM system.replica_registry r
    WHERE r.role IN ('analytics', 'replica')
      AND r.status = 'active'
      AND r.accepts_reads = true
      AND r.current_lag_ms <= p_max_lag_ms
    ORDER BY
      CASE r.role WHEN 'analytics' THEN 0 ELSE 1 END,
      r.current_lag_ms
    LIMIT 1;

  ELSE
    -- Reads: pick best replica by lag + weight
    RETURN QUERY
    SELECT r.name::TEXT, r.host::TEXT, r.port, r.current_lag_ms
    FROM system.replica_registry r
    WHERE r.status = 'active'
      AND r.accepts_reads = true
      AND r.current_lag_ms <= p_max_lag_ms
    ORDER BY
      CASE r.role WHEN 'replica' THEN 0 ELSE 1 END,
      r.current_lag_ms,
      r.weight DESC
    LIMIT 1;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- ════════════════════════════════════════════════════════
-- 3. HEALTH CHECK FUNCTION
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION system.check_replica_health()
RETURNS TABLE (
  replica_name TEXT,
  status TEXT,
  lag_ms INT,
  action_taken TEXT
) AS $$
DECLARE r RECORD; v_lag INT;
BEGIN
  FOR r IN SELECT * FROM system.replica_registry WHERE status != 'maintenance' LOOP
    replica_name := r.name;

    -- For primary, lag is always 0
    IF r.role = 'primary' THEN
      lag_ms := 0;
      status := 'active';
      action_taken := 'none';
    ELSE
      -- Check replication lag from pg_stat_replication (if on primary)
      BEGIN
        SELECT EXTRACT(MILLISECONDS FROM replay_lag)::INT INTO v_lag
        FROM pg_stat_replication
        WHERE client_addr = r.host::INET
        LIMIT 1;
        lag_ms := COALESCE(v_lag, r.current_lag_ms);
      EXCEPTION WHEN OTHERS THEN
        lag_ms := r.current_lag_ms;
      END;

      -- Determine status based on lag
      IF lag_ms > r.max_lag_seconds * 1000 THEN
        status := 'degraded';
        action_taken := 'marked_degraded';
        UPDATE system.replica_registry SET
          status = 'degraded', current_lag_ms = lag_ms,
          consecutive_failures = consecutive_failures + 1,
          last_health_check = NOW()
        WHERE id = r.id;
      ELSE
        status := 'active';
        action_taken := 'healthy';
        UPDATE system.replica_registry SET
          status = 'active', current_lag_ms = lag_ms,
          consecutive_failures = 0,
          last_health_check = NOW()
        WHERE id = r.id;
      END IF;
    END IF;

    -- Auto-offline if too many failures
    IF r.consecutive_failures >= 5 THEN
      UPDATE system.replica_registry SET status = 'offline' WHERE id = r.id;
      status := 'offline';
      action_taken := 'auto_offline_after_5_failures';

      PERFORM pg_notify('replica_health', json_build_object(
        'replica', r.name, 'status', 'offline',
        'failures', r.consecutive_failures
      )::TEXT);
    END IF;

    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule health check every minute
INSERT INTO system.scheduled_tasks (name, cron_expression, job_type, description)
VALUES ('check_replica_health', '* * * * *', 'replica_monitor',
        'Check replica lag and update status every minute')
ON CONFLICT (name) DO NOTHING;

-- ════════════════════════════════════════════════════════
-- 4. CONNECTION POOL STATS VIEW
-- ════════════════════════════════════════════════════════

DROP VIEW IF EXISTS system.v_replica_dashboard CASCADE;
CREATE VIEW system.v_replica_dashboard AS
SELECT
  r.name,
  r.role,
  r.status,
  r.host || ':' || r.port AS endpoint,
  r.region,
  r.current_lag_ms,
  r.max_lag_seconds * 1000 AS max_lag_ms,
  CASE WHEN r.max_lag_seconds * 1000 > 0
    THEN round(r.current_lag_ms::NUMERIC / (r.max_lag_seconds * 1000) * 100, 1)
    ELSE 0
  END AS lag_pct,
  r.weight,
  r.max_connections,
  r.consecutive_failures,
  r.last_health_check,
  r.accepts_reads,
  r.accepts_writes
FROM system.replica_registry r
ORDER BY
  CASE r.role WHEN 'primary' THEN 0 WHEN 'replica' THEN 1 ELSE 2 END,
  r.name;

-- ════════════════════════════════════════════════════════
-- 5. READ-WRITE SPLITTING ADVISORY VIEW
--    Helps Go backend decide connection routing
-- ════════════════════════════════════════════════════════

DROP VIEW IF EXISTS system.v_routing_advice CASCADE;
CREATE VIEW system.v_routing_advice AS
SELECT
  'read' AS query_type,
  (SELECT name FROM system.replica_registry
   WHERE status = 'active' AND accepts_reads = true
   ORDER BY CASE role WHEN 'replica' THEN 0 ELSE 1 END, current_lag_ms
   LIMIT 1) AS recommended_replica,
  (SELECT count(*) FROM system.replica_registry
   WHERE status = 'active' AND accepts_reads = true) AS available_replicas
UNION ALL
SELECT
  'write' AS query_type,
  (SELECT name FROM system.replica_registry
   WHERE role = 'primary' AND status = 'active') AS recommended_replica,
  (SELECT count(*) FROM system.replica_registry
   WHERE role = 'primary' AND status = 'active') AS available_replicas
UNION ALL
SELECT
  'analytics' AS query_type,
  (SELECT name FROM system.replica_registry
   WHERE role IN ('analytics', 'replica') AND status = 'active'
   ORDER BY CASE role WHEN 'analytics' THEN 0 ELSE 1 END
   LIMIT 1) AS recommended_replica,
  (SELECT count(*) FROM system.replica_registry
   WHERE role IN ('analytics', 'replica') AND status = 'active') AS available_replicas;

COMMIT;


-- ─── Source: 0073_dev_anonymization.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0073: DEV DATA ANONYMIZATION
-- Anonymize PII when cloning production DB to dev/staging
-- Preserves referential integrity while masking sensitive data
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. ANONYMIZATION RULES TABLE
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.anonymization_rules (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  table_name      VARCHAR(200) NOT NULL,
  column_name     VARCHAR(200) NOT NULL,
  strategy        VARCHAR(30) NOT NULL
    CHECK (strategy IN (
      'fake_name', 'fake_email', 'fake_phone', 'hash',
      'mask', 'null_out', 'randomize', 'preserve', 'fake_address'
    )),
  config          JSONB DEFAULT '{}',     -- strategy-specific config
  is_active       BOOLEAN DEFAULT true,
  priority        INT DEFAULT 100,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (table_name, column_name)
);

-- Seed rules for known PII columns
INSERT INTO system.anonymization_rules (table_name, column_name, strategy, priority) VALUES
  -- Users
  ('core.users', 'full_name', 'fake_name', 10),
  ('core.users', 'email', 'fake_email', 10),
  ('core.users', 'phone', 'fake_phone', 10),
  ('core.users', 'password_hash', 'hash', 10),
  ('core.users', 'avatar_url', 'null_out', 50),
  -- Athletes
  ('athletes', 'ho_ten', 'fake_name', 10),
  ('athletes', 'so_cccd', 'mask', 10),
  ('athletes', 'dia_chi', 'fake_address', 20),
  ('athletes', 'so_dien_thoai', 'fake_phone', 10),
  ('athletes', 'email', 'fake_email', 10),
  -- Coaches
  ('people.coaches', 'phone', 'fake_phone', 10),
  ('people.coaches', 'email', 'fake_email', 10),
  -- Parents
  ('people.parents', 'phone', 'fake_phone', 10),
  ('people.parents', 'email', 'fake_email', 10),
  ('people.parents', 'full_name', 'fake_name', 10),
  -- Payments
  ('platform.payments', 'payer_name', 'fake_name', 20),
  ('platform.payments', 'payer_email', 'fake_email', 20),
  ('platform.payments', 'gateway_response', 'null_out', 50),
  -- Sessions
  ('core.sessions', 'ip_address', 'mask', 30),
  ('core.sessions', 'user_agent', 'null_out', 30),
  -- Audit log
  ('system.audit_log', 'client_ip', 'mask', 40),
  ('system.audit_log', 'user_agent', 'null_out', 40)
ON CONFLICT (table_name, column_name) DO NOTHING;

-- ════════════════════════════════════════════════════════
-- 2. ANONYMIZATION HELPER FUNCTIONS
-- ════════════════════════════════════════════════════════

-- Vietnamese fake name generator
CREATE OR REPLACE FUNCTION system.fake_vn_name(p_seed INT DEFAULT 0)
RETURNS TEXT AS $$
DECLARE
  v_ho TEXT[] := ARRAY['Nguyễn','Trần','Lê','Phạm','Hoàng','Huỳnh','Phan','Vũ','Võ','Đặng',
    'Bùi','Đỗ','Hồ','Ngô','Dương','Lý','Đào','Đinh','Tạ','Lương'];
  v_dem TEXT[] := ARRAY['Văn','Thị','Đức','Minh','Thanh','Ngọc','Quốc','Hữu','Thúy','Xuân',
    'Anh','Hồng','Bảo','Quang','Phúc','Thành','Đình','Trọng','Kim','Tuấn'];
  v_ten TEXT[] := ARRAY['An','Bình','Cường','Dũng','Em','Phong','Giang','Hải','Khánh','Linh',
    'Mai','Nam','Oanh','Phú','Quyên','Sơn','Tâm','Uyên','Vinh','Yến'];
  v_idx INT;
BEGIN
  v_idx := abs(p_seed) % 20 + 1;
  RETURN v_ho[v_idx] || ' ' ||
    v_dem[(abs(p_seed * 7) % 20) + 1] || ' ' ||
    v_ten[(abs(p_seed * 13) % 20) + 1];
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fake email
CREATE OR REPLACE FUNCTION system.fake_email(p_seed INT DEFAULT 0)
RETURNS TEXT AS $$
BEGIN
  RETURN 'user' || abs(p_seed) || '@dev.vctplatform.test';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fake phone
CREATE OR REPLACE FUNCTION system.fake_phone(p_seed INT DEFAULT 0)
RETURNS TEXT AS $$
BEGIN
  RETURN '+84' || lpad((abs(p_seed) % 999999999)::TEXT, 9, '0');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Mask string (show first/last N chars)
CREATE OR REPLACE FUNCTION system.mask_string(
  p_value TEXT, p_show_first INT DEFAULT 2, p_show_last INT DEFAULT 2
)
RETURNS TEXT AS $$
BEGIN
  IF p_value IS NULL OR length(p_value) <= p_show_first + p_show_last THEN
    RETURN repeat('*', COALESCE(length(p_value), 4));
  END IF;
  RETURN left(p_value, p_show_first) ||
    repeat('*', length(p_value) - p_show_first - p_show_last) ||
    right(p_value, p_show_last);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fake address
CREATE OR REPLACE FUNCTION system.fake_address(p_seed INT DEFAULT 0)
RETURNS TEXT AS $$
DECLARE
  v_streets TEXT[] := ARRAY['Nguyễn Huệ','Lê Lợi','Trần Hưng Đạo','Hai Bà Trưng',
    'Lý Thường Kiệt','Điện Biên Phủ','Võ Văn Tần','Nam Kỳ Khởi Nghĩa'];
  v_cities TEXT[] := ARRAY['TP.HCM','Hà Nội','Đà Nẵng','Huế','Cần Thơ','Hải Phòng'];
BEGIN
  RETURN (abs(p_seed) % 200 + 1)::TEXT || ' ' ||
    v_streets[(abs(p_seed) % 8) + 1] || ', ' ||
    v_cities[(abs(p_seed * 3) % 6) + 1];
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ════════════════════════════════════════════════════════
-- 3. MAIN ANONYMIZATION FUNCTION
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION system.anonymize_database(
  p_dry_run BOOLEAN DEFAULT true
)
RETURNS TABLE (
  table_name TEXT,
  column_name TEXT,
  strategy TEXT,
  rows_affected INT,
  was_dry_run BOOLEAN
) AS $$
DECLARE
  r RECORD;
  v_count INT;
  v_sql TEXT;
  v_seed_expr TEXT;
BEGIN
  -- Safety check: never run on production
  IF current_setting('app.environment', true) = 'production' THEN
    RAISE EXCEPTION 'CANNOT anonymize production database! Set app.environment to dev/staging first.';
  END IF;

  FOR r IN
    SELECT * FROM system.anonymization_rules
    WHERE is_active = true
    ORDER BY priority, table_name
  LOOP
    table_name := r.table_name;
    column_name := r.column_name;
    strategy := r.strategy;
    was_dry_run := p_dry_run;

    -- Build seed expression (deterministic per row)
    v_seed_expr := format('abs(hashtext(id::TEXT || %L))', r.column_name);

    -- Build UPDATE SQL based on strategy
    v_sql := CASE r.strategy
      WHEN 'fake_name' THEN format(
        'UPDATE %s SET %I = system.fake_vn_name(%s) WHERE %I IS NOT NULL',
        r.table_name, r.column_name, v_seed_expr, r.column_name)
      WHEN 'fake_email' THEN format(
        'UPDATE %s SET %I = system.fake_email(%s) WHERE %I IS NOT NULL',
        r.table_name, r.column_name, v_seed_expr, r.column_name)
      WHEN 'fake_phone' THEN format(
        'UPDATE %s SET %I = system.fake_phone(%s) WHERE %I IS NOT NULL',
        r.table_name, r.column_name, v_seed_expr, r.column_name)
      WHEN 'fake_address' THEN format(
        'UPDATE %s SET %I = system.fake_address(%s) WHERE %I IS NOT NULL',
        r.table_name, r.column_name, v_seed_expr, r.column_name)
      WHEN 'hash' THEN format(
        'UPDATE %s SET %I = md5(%I || %L) WHERE %I IS NOT NULL',
        r.table_name, r.column_name, r.column_name, 'anonymized', r.column_name)
      WHEN 'mask' THEN format(
        'UPDATE %s SET %I = system.mask_string(%I) WHERE %I IS NOT NULL',
        r.table_name, r.column_name, r.column_name, r.column_name)
      WHEN 'null_out' THEN format(
        'UPDATE %s SET %I = NULL WHERE %I IS NOT NULL',
        r.table_name, r.column_name, r.column_name)
      WHEN 'randomize' THEN format(
        'UPDATE %s SET %I = gen_random_uuid()::TEXT WHERE %I IS NOT NULL',
        r.table_name, r.column_name, r.column_name)
      ELSE NULL
    END;

    IF v_sql IS NULL THEN
      rows_affected := 0;
      RETURN NEXT;
      CONTINUE;
    END IF;

    IF p_dry_run THEN
      -- Count affected rows
      BEGIN
        EXECUTE format('SELECT count(*) FROM %s WHERE %I IS NOT NULL',
          r.table_name, r.column_name) INTO v_count;
      EXCEPTION WHEN undefined_table THEN v_count := 0;
                WHEN undefined_column THEN v_count := 0;
      END;
    ELSE
      BEGIN
        EXECUTE v_sql;
        GET DIAGNOSTICS v_count = ROW_COUNT;
      EXCEPTION WHEN undefined_table THEN v_count := 0;
                WHEN undefined_column THEN v_count := 0;
      END;
    END IF;

    rows_affected := v_count;
    RETURN NEXT;
  END LOOP;

  -- Log anonymization event
  IF NOT p_dry_run THEN
    INSERT INTO system.backup_checkpoints
      (checkpoint_name, checkpoint_type, description)
    VALUES ('post_anonymization_' || NOW()::DATE, 'manual',
            'Database anonymized at ' || NOW());
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 4. ANONYMIZATION COVERAGE VIEW
-- ════════════════════════════════════════════════════════

DROP VIEW IF EXISTS system.v_anonymization_coverage CASCADE;
CREATE VIEW system.v_anonymization_coverage AS
SELECT
  ar.table_name,
  ar.column_name,
  ar.strategy,
  ar.is_active,
  CASE WHEN ar.id IS NOT NULL THEN 'covered' ELSE 'NOT COVERED' END AS coverage
FROM system.anonymization_rules ar
UNION ALL
-- Show PII-likely columns that are NOT covered
SELECT
  n.nspname || '.' || c.relname AS table_name,
  a.attname AS column_name,
  'NEEDS REVIEW' AS strategy,
  false AS is_active,
  'NOT COVERED' AS coverage
FROM pg_attribute a
JOIN pg_class c ON c.oid = a.attrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND a.attnum > 0
  AND NOT a.attisdropped
  AND n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  AND a.attname IN ('email', 'phone', 'address', 'password', 'so_cccd',
    'dia_chi', 'so_dien_thoai', 'ip_address', 'full_name')
  AND NOT EXISTS (
    SELECT 1 FROM system.anonymization_rules r
    WHERE r.table_name = n.nspname || '.' || c.relname
      AND r.column_name = a.attname
  )
ORDER BY coverage DESC, table_name;

COMMIT;


-- ─── Source: 0074_fix_dual_tables.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0074: FIX DUAL TABLE ARCHITECTURE
-- P0 Critical: Resolve public vs core schema conflict
-- Drop public auth tables, create backward-compat views
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. SAFETY: Check core tables exist before dropping public
-- ════════════════════════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = 'users') THEN
    RAISE EXCEPTION 'core.users does not exist — aborting dual table fix';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = 'sessions') THEN
    RAISE EXCEPTION 'core.sessions does not exist — aborting dual table fix';
  END IF;
END $$;

-- ════════════════════════════════════════════════════════
-- 2. MIGRATE DATA: Copy any rows in public tables to core
--    (Skip duplicates on PK conflict)
-- ════════════════════════════════════════════════════════

-- Migrate public.users → core.users (if any orphan rows exist)
INSERT INTO core.users (
  id, tenant_id, username, email, phone, password_hash,
  full_name, avatar_url, is_active, created_at, updated_at
)
SELECT
  u.id,
  '00000000-0000-7000-8000-000000000001'::UUID,
  u.username, u.email, u.phone, u.password_hash,
  u.full_name, u.avatar_url, u.is_active,
  COALESCE(u.created_at, NOW()), COALESCE(u.updated_at, NOW())
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM core.users cu WHERE cu.id = u.id
)
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════
-- 3. DROP dependent objects on public auth tables
-- ════════════════════════════════════════════════════════

-- Drop triggers
DROP TRIGGER IF EXISTS set_updated_at ON public.users;
DROP TRIGGER IF EXISTS prevent_hard_delete ON public.users;

-- Drop public auth tables (CASCADE removes FKs pointing to them)
-- Using CASCADE carefully — only public schema duplicates
DROP TABLE IF EXISTS public.auth_audit_log CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ════════════════════════════════════════════════════════
-- 4. CREATE BACKWARD-COMPATIBLE VIEWS
--    Go backend code referencing "users" (no schema)
--    will now transparently hit core.users
-- ════════════════════════════════════════════════════════

DROP VIEW IF EXISTS public.users CASCADE;
CREATE VIEW public.users AS
SELECT
  id, username, email, phone, password_hash,
  full_name, avatar_url, is_active,
  created_at, updated_at,
  tenant_id,
  CASE WHEN is_deleted THEN 'inactive' ELSE 'active' END AS status
FROM core.users
WHERE is_deleted = false;

-- Make the view updatable via INSTEAD OF triggers
CREATE OR REPLACE FUNCTION trigger_users_view_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO core.users (
    id, tenant_id, username, email, phone, password_hash,
    full_name, avatar_url, is_active, created_at, updated_at
  ) VALUES (
    COALESCE(NEW.id, uuidv7()),
    COALESCE(NEW.tenant_id, current_setting('app.current_tenant', true)::UUID,
             '00000000-0000-7000-8000-000000000001'::UUID),
    NEW.username, NEW.email, NEW.phone, NEW.password_hash,
    NEW.full_name, NEW.avatar_url,
    COALESCE(NEW.is_active, true),
    COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW())
  )
  RETURNING * INTO NEW;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_view_insert
  INSTEAD OF INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION trigger_users_view_insert();

CREATE OR REPLACE FUNCTION trigger_users_view_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE core.users SET
    username = COALESCE(NEW.username, OLD.username),
    email = NEW.email,
    phone = NEW.phone,
    password_hash = COALESCE(NEW.password_hash, OLD.password_hash),
    full_name = COALESCE(NEW.full_name, OLD.full_name),
    avatar_url = NEW.avatar_url,
    is_active = COALESCE(NEW.is_active, OLD.is_active),
    updated_at = NOW()
  WHERE id = OLD.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_view_update
  INSTEAD OF UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION trigger_users_view_update();

DROP VIEW IF EXISTS public.sessions CASCADE;
CREATE VIEW public.sessions AS
SELECT
  id, user_id, token_hash, device_info,
  ip_address, expires_at, created_at, last_active,
  tenant_id
FROM core.sessions;

DROP VIEW IF EXISTS public.auth_audit_log CASCADE;
CREATE VIEW public.auth_audit_log AS
SELECT
  id, user_id, action, ip_address, user_agent,
  details, created_at, tenant_id
FROM core.auth_audit_log;

-- ════════════════════════════════════════════════════════
-- 5. FIX: Ensure orphan entities reference core.users
-- ════════════════════════════════════════════════════════

COMMENT ON VIEW public.users IS
  'Backward-compatible view → core.users. All new code should use core.users directly.';

COMMIT;


-- ─── Source: 0075_fix_rls_strict.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0075: FIX RLS STRICT MODE
-- P1 High: Remove silent fallback to system tenant
-- Force explicit tenant context — no more silent bypass
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. DROP old lenient RLS policies and replace with strict
-- ════════════════════════════════════════════════════════

-- Helper: Create strict RLS policy for a table
-- Requires app.current_tenant to be set, no silent fallback
CREATE OR REPLACE FUNCTION system.create_strict_rls_policy(
  p_table_name TEXT,
  p_schema_name TEXT DEFAULT 'public'
)
RETURNS VOID AS $$
DECLARE
  v_full_table TEXT := p_schema_name || '.' || p_table_name;
  v_policy_name TEXT := 'strict_tenant_isolation_' || p_table_name;
  v_old_policy TEXT := 'tenant_isolation_' || p_table_name;
BEGIN
  -- Drop old lenient policy
  EXECUTE format('DROP POLICY IF EXISTS %I ON %s', v_old_policy, v_full_table);

  -- Create strict policy: FAIL if tenant not set
  EXECUTE format(
    'CREATE POLICY %I ON %s
      USING (
        tenant_id = (
          CASE
            WHEN current_setting(''app.current_tenant'', true) IS NULL
              OR current_setting(''app.current_tenant'', true) = ''''
            THEN
              (SELECT system.raise_tenant_required())::UUID  -- will raise exception
            ELSE
              current_setting(''app.current_tenant'', true)::UUID
          END
        )
      )',
    v_policy_name, v_full_table
  );
END;
$$ LANGUAGE plpgsql;

-- Exception helper function
CREATE OR REPLACE FUNCTION system.raise_tenant_required()
RETURNS TEXT AS $$
BEGIN
  RAISE EXCEPTION 'SECURITY: app.current_tenant must be set. '
    'Direct database access without tenant context is forbidden. '
    'Use SET app.current_tenant = ''<uuid>'' before queries.'
    USING ERRCODE = 'insufficient_privilege';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 2. APPLY strict RLS to all tenant-scoped tables
-- ════════════════════════════════════════════════════════

DO $$
DECLARE
  tbl RECORD;
BEGIN
  -- Tables in public schema
  FOR tbl IN SELECT unnest(ARRAY[
    'tournaments', 'teams', 'athletes', 'registrations', 'referees',
    'arenas', 'combat_matches', 'form_performances', 'appeals',
    'match_events', 'rankings', 'clubs'
  ]) AS name LOOP
    BEGIN
      PERFORM system.create_strict_rls_policy(tbl.name, 'public');
    EXCEPTION WHEN undefined_table THEN
      RAISE NOTICE 'Table public.% does not exist, skipping', tbl.name;
    END;
  END LOOP;
END $$;

-- core.users — special: keep system admin bypass, make tenant strict
DROP POLICY IF EXISTS tenant_isolation_users ON core.users;
CREATE POLICY strict_tenant_isolation_users ON core.users
  USING (
    current_setting('app.is_system_admin', true) = 'true'
    OR
    tenant_id = (
      CASE
        WHEN current_setting('app.current_tenant', true) IS NULL
          OR current_setting('app.current_tenant', true) = ''
        THEN (SELECT system.raise_tenant_required())::UUID
        ELSE current_setting('app.current_tenant', true)::UUID
      END
    )
  );

-- ════════════════════════════════════════════════════════
-- 3. SERVICE ACCOUNT BYPASS POLICY
--    Backend services that legitimately need cross-tenant access
-- ════════════════════════════════════════════════════════

-- System admin policy already exists on core.users.
-- Add similar for key tables:
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'tournaments', 'teams', 'athletes', 'combat_matches'
  ]) AS name LOOP
    BEGIN
      EXECUTE format(
        'CREATE POLICY system_admin_%I ON %I
          FOR ALL
          USING (current_setting(''app.is_system_admin'', true) = ''true'')',
        tbl.name, tbl.name
      );
    EXCEPTION
      WHEN duplicate_object THEN NULL;
      WHEN undefined_table THEN NULL;
    END;
  END LOOP;
END $$;

COMMIT;


-- ─── Source: 0076_migration_tracking.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0076: MIGRATION TRACKING TABLE
-- P1 High: Track which migrations have been applied
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. MIGRATION TRACKING TABLE
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.schema_migrations (
  id              SERIAL PRIMARY KEY,
  version         VARCHAR(10) NOT NULL UNIQUE,   -- '0001', '0002', etc.
  name            VARCHAR(200) NOT NULL,          -- 'entity_records', etc.
  applied_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  applied_by      VARCHAR(100) DEFAULT current_user,
  execution_time  INTERVAL,
  checksum        VARCHAR(64),                    -- SHA-256 of migration file
  status          VARCHAR(20) NOT NULL DEFAULT 'applied'
                  CHECK (status IN ('applied', 'rolled_back', 'failed', 'skipped')),
  rollback_at     TIMESTAMPTZ,
  notes           TEXT
);

CREATE INDEX IF NOT EXISTS idx_migrations_version
  ON system.schema_migrations(version);

CREATE INDEX IF NOT EXISTS idx_migrations_status
  ON system.schema_migrations(status) WHERE status = 'applied';

-- ════════════════════════════════════════════════════════
-- 2. BACKFILL: Register all existing migrations
-- ════════════════════════════════════════════════════════

INSERT INTO system.schema_migrations (version, name, notes) VALUES
  ('0001', 'entity_records', 'Legacy EAV store'),
  ('0002', 'relational_schema', 'Full relational schema'),
  ('0003', 'scoring_events_refs', 'Scoring, events, reference data'),
  ('0004', 'enterprise_foundation', 'Schemas, UUIDv7, tenants, roles'),
  ('0005', 'existing_tables_upgrade', 'Tenant/audit backfill'),
  ('0006', 'training_module', 'Training courses, sessions'),
  ('0007', 'org_people', 'Org structure, people'),
  ('0008', 'finance', 'Payments, invoices'),
  ('0009', 'heritage', 'Cultural heritage, techniques'),
  ('0010', 'community', 'Posts, comments, social'),
  ('0011', 'system_partitions_views', 'Partitions, system views'),
  ('0012', 'advanced_enterprise', 'Advanced enterprise patterns'),
  ('0013', 'materialized_counters', 'Counters, stats'),
  ('0014', 'infrastructure', 'System infrastructure'),
  ('0015', 'structural_hardening', 'Schema hardening'),
  ('0016', 'fk_exclusion', 'FK + exclusion constraints'),
  ('0017', 'pii_advisory', 'PII advisory locks'),
  ('0018', 'permissions_workflows', 'Permissions, workflows'),
  ('0019', 'geo_analytics', 'Geo, analytics'),
  ('0020', 'bulk_config_i18n', 'Bulk import, config, i18n'),
  ('0021', 'event_sourcing', 'Event sourcing, CQRS'),
  ('0022', 'gdpr_masking', 'GDPR, data masking'),
  ('0023', 'flags_circuit_breaker', 'Feature flags, circuit breaker'),
  ('0024', 'cross_cutting_fixes', 'Cross-cutting fixes'),
  ('0025', 'maintenance_patterns', 'Maintenance patterns'),
  ('0026', 'production_readiness', 'Production readiness'),
  ('0027', 'v7_layer_a', 'UUIDv7 layer A'),
  ('0028', 'v7_layer_b', 'UUIDv7 layer B'),
  ('0029', 'v7_layer_c', 'UUIDv7 layer C'),
  ('0030', 'v7_layer_d', 'UUIDv7 layer D'),
  ('0031', 'uuid_v7_upgrade', 'UUIDv7 default upgrade'),
  ('0032', 'v7_seeds_functions', 'Seeds + functions'),
  ('0033', 'v7_aggregate_schemas', 'Aggregate schemas'),
  ('0034', 'v7_api_views', 'API views'),
  ('0035', 'associations', 'Associations'),
  ('0036', 'audit_logs', 'Audit logs'),
  ('0037', 'federation_core', 'Federation core'),
  ('0038', 'federation_master_data', 'Federation master data'),
  ('0039', 'federation_approvals', 'Federation approvals'),
  ('0040', 'federation_seed_data', 'Federation seed data'),
  ('0041', 'federation_pr', 'Federation PR'),
  ('0042', 'federation_international', 'Federation international'),
  ('0043', 'federation_workflows', 'Federation workflows'),
  ('0044', 'scoring_tables', 'Scoring tables'),
  ('0045', 'tournament_management', 'Tournament management'),
  ('0046', 'club_voduong', 'Club/Vo Duong'),
  ('0047', 'athlete_profiles', 'Athlete profiles'),
  ('0048', 'btc_parent_training', 'BTC + parent + training'),
  ('0049', 'tenant_isolation', 'Tenant isolation'),
  ('0050', 'fk_constraints', 'FK constraints integrity'),
  ('0051', 'schema_consolidation', 'Schema consolidation'),
  ('0052', 'auto_partition', 'Auto partition + connection'),
  ('0053', 'query_optimization', 'Query optimization'),
  ('0054', 'matview_refresh', 'Matview refresh strategy'),
  ('0055', 'data_lifecycle', 'Data lifecycle'),
  ('0056', 'health_monitoring', 'Health monitoring'),
  ('0057', 'archival_pipeline', 'Archival pipeline'),
  ('0058', 'pg17_testing', 'PG17 testing + docs'),
  ('0059', 'fuzzy_search_trgm', 'pg_trgm fuzzy search'),
  ('0060', 'elo_rating_system', 'ELO/Glicko ratings'),
  ('0061', 'query_cache_layer', 'Query result cache'),
  ('0062', 'cdc_outbox', 'CDC outbox pattern'),
  ('0063', 'ltree_hierarchy', 'ltree hierarchy'),
  ('0064', 'temporal_tables', 'Temporal versioning'),
  ('0065', 'brin_indexes', 'BRIN indexes'),
  ('0066', 'backup_vacuum', 'Backup + vacuum tuning'),
  ('0067', 'searchpath_webhooks', 'Search path + webhooks'),
  ('0068', 'matviews_abtesting', 'Matviews + A/B testing'),
  ('0069', 'graphql_functions', 'GraphQL functions'),
  ('0070', 'aiml_pipeline', 'AI/ML pipeline'),
  ('0071', 'enum_types', 'Native ENUM types'),
  ('0072', 'read_replica_routing', 'Read replica routing'),
  ('0073', 'dev_anonymization', 'Dev anonymization'),
  ('0074', 'fix_dual_tables', 'Fix dual table architecture'),
  ('0075', 'fix_rls_strict', 'Strict RLS mode'),
  ('0076', 'migration_tracking', 'This migration')
ON CONFLICT (version) DO NOTHING;

-- ════════════════════════════════════════════════════════
-- 3. HELPER FUNCTIONS
-- ════════════════════════════════════════════════════════

-- Check if a migration has been applied
CREATE OR REPLACE FUNCTION system.migration_applied(p_version TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM system.schema_migrations
    WHERE version = p_version AND status = 'applied'
  );
$$ LANGUAGE sql STABLE;

-- Get current schema version
CREATE OR REPLACE FUNCTION system.current_schema_version()
RETURNS TEXT AS $$
  SELECT version FROM system.schema_migrations
  WHERE status = 'applied'
  ORDER BY version DESC
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Schema drift detection view
DROP VIEW IF EXISTS system.v_migration_status CASCADE;
CREATE VIEW system.v_migration_status AS
SELECT
  version,
  name,
  status,
  applied_at,
  applied_by,
  execution_time,
  CASE
    WHEN status = 'applied' THEN '✅'
    WHEN status = 'rolled_back' THEN '⏪'
    WHEN status = 'failed' THEN '❌'
    ELSE '⏭️'
  END AS status_icon
FROM system.schema_migrations
ORDER BY version;

COMMIT;


-- ─── Source: 0077_harmonize_status_values.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0077: HARMONIZE CHECK/ENUM STATUS
-- P2 Medium: Align CHECK constraint values with ENUM definitions
-- Ensure no data violation when ENUMs are applied to columns
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. FIX: Expand tournament CHECK to match ENUM values
--    ENUM (0071): nhap, cho_duyet, da_duyet, dang_dang_ky,
--                 dong_dang_ky, boc_tham, thi_dau, hoan, ket_thuc, huy
--    CHECK (0005): nhap, dang_ky, khoa_dk, thi_dau, ket_thuc, huy
-- ════════════════════════════════════════════════════════

-- Drop old CHECK
ALTER TABLE tournaments DROP CONSTRAINT IF EXISTS chk_tournaments_status;

-- Create unified CHECK matching ENUM
ALTER TABLE tournaments ADD CONSTRAINT chk_tournaments_status
  CHECK (status IN (
    'nhap', 'cho_duyet', 'da_duyet',
    'dang_dang_ky', 'dang_ky',           -- both old and new values
    'dong_dang_ky', 'khoa_dk',           -- aliases
    'boc_tham', 'thi_dau', 'hoan', 'ket_thuc', 'huy'
  )) NOT VALID;
ALTER TABLE tournaments VALIDATE CONSTRAINT chk_tournaments_status;

-- ════════════════════════════════════════════════════════
-- 2. FIX: Expand athlete CHECK to match ENUM
--    ENUM: nhap, cho_duyet, da_duyet, tu_choi, dinh_chi,
--          nghi_thi_dau, rut, giai_nghe
--    CHECK: nhap, cho_duyet, da_duyet, tu_choi, rut
-- ════════════════════════════════════════════════════════

ALTER TABLE athletes DROP CONSTRAINT IF EXISTS chk_athletes_status;
ALTER TABLE athletes ADD CONSTRAINT chk_athletes_status
  CHECK (trang_thai IN (
    'nhap', 'cho_duyet', 'da_duyet', 'tu_choi',
    'dinh_chi', 'nghi_thi_dau', 'rut', 'giai_nghe'
  )) NOT VALID;
ALTER TABLE athletes VALIDATE CONSTRAINT chk_athletes_status;

-- ════════════════════════════════════════════════════════
-- 3. FIX: Expand match CHECK to match ENUM
--    ENUM: chua_dau, dang_dau, tam_dung, ket_thuc, huy,
--          cho_ket_qua, bao_luu, bo_cuoc
--    CHECK: chua_dau, dang_dau, tam_dung, ket_thuc, huy
-- ════════════════════════════════════════════════════════

ALTER TABLE combat_matches DROP CONSTRAINT IF EXISTS chk_matches_status;
ALTER TABLE combat_matches ADD CONSTRAINT chk_matches_status
  CHECK (trang_thai IN (
    'chua_dau', 'dang_dau', 'tam_dung', 'ket_thuc', 'huy',
    'cho_ket_qua', 'bao_luu', 'bo_cuoc'
  )) NOT VALID;
ALTER TABLE combat_matches VALIDATE CONSTRAINT chk_matches_status;

-- ════════════════════════════════════════════════════════
-- 4. FIX: Expand registration CHECK
-- ════════════════════════════════════════════════════════

ALTER TABLE registrations DROP CONSTRAINT IF EXISTS chk_registrations_status;
ALTER TABLE registrations ADD CONSTRAINT chk_registrations_status
  CHECK (trang_thai IN (
    'cho_duyet', 'da_duyet', 'tu_choi', 'rut',
    'yeu_cau_bo_sung', 'het_han'
  )) NOT VALID;
ALTER TABLE registrations VALIDATE CONSTRAINT chk_registrations_status;

-- ════════════════════════════════════════════════════════
-- 5. FIX: Expand teams CHECK
-- ════════════════════════════════════════════════════════

ALTER TABLE teams DROP CONSTRAINT IF EXISTS chk_teams_status;
ALTER TABLE teams ADD CONSTRAINT chk_teams_status
  CHECK (trang_thai IN (
    'nhap', 'cho_duyet', 'da_duyet', 'tu_choi', 'rut',
    'dinh_chi'
  )) NOT VALID;
ALTER TABLE teams VALIDATE CONSTRAINT chk_teams_status;

-- ════════════════════════════════════════════════════════
-- 6. DOCUMENTATION: Status value mapping view
-- ════════════════════════════════════════════════════════

DROP VIEW IF EXISTS system.v_status_mapping CASCADE;
CREATE VIEW system.v_status_mapping AS
SELECT * FROM (VALUES
  ('tournaments', 'status',     'nhap → cho_duyet → da_duyet → dang_dang_ky → dong_dang_ky → boc_tham → thi_dau → ket_thuc | hoan | huy'),
  ('athletes',    'trang_thai', 'nhap → cho_duyet → da_duyet | tu_choi | dinh_chi | nghi_thi_dau | rut | giai_nghe'),
  ('matches',     'trang_thai', 'chua_dau → dang_dau → tam_dung | ket_thuc | huy | cho_ket_qua | bao_luu | bo_cuoc'),
  ('teams',       'trang_thai', 'nhap → cho_duyet → da_duyet | tu_choi | rut | dinh_chi'),
  ('registrations','trang_thai','cho_duyet → da_duyet | tu_choi | rut | yeu_cau_bo_sung | het_han')
) AS t (table_name, column_name, lifecycle);

COMMIT;


-- ─── Source: 0078_cleanup_performance.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0078: CLEANUP + PERFORMANCE GUARDS
-- P2 Medium: Drop orphan tables, add live scoring trigger control
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. DROP ORPHAN: entity_records (legacy EAV from 0001)
--    Replaced entirely by relational schema in 0002+
-- ════════════════════════════════════════════════════════

-- Backup any remaining data (if any) before drop
CREATE TABLE IF NOT EXISTS system._entity_records_archive AS
  SELECT * FROM entity_records WHERE false;  -- empty clone

INSERT INTO system._entity_records_archive
  SELECT * FROM entity_records
  ON CONFLICT DO NOTHING;

DROP TABLE IF EXISTS entity_records CASCADE;

-- ════════════════════════════════════════════════════════
-- 2. ADD unaccent EXTENSION (missing from 0063)
-- ════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS unaccent;

-- ════════════════════════════════════════════════════════
-- 3. PERFORMANCE GUARDS: Live Scoring Mode
--    Disable non-critical triggers during real-time matches
--    to reduce per-row overhead for combat_matches table
-- ════════════════════════════════════════════════════════

-- Enable live scoring mode (disables CDC + temporal triggers)
CREATE OR REPLACE FUNCTION system.enable_live_scoring()
RETURNS VOID AS $$
BEGIN
  -- Disable heavy triggers on combat_matches
  EXECUTE 'ALTER TABLE combat_matches DISABLE TRIGGER cdc_capture';
  EXECUTE 'ALTER TABLE combat_matches DISABLE TRIGGER temporal_version';

  -- Keep updated_at trigger active (lightweight)
  SET LOCAL app.live_scoring_mode = 'true';

  RAISE NOTICE 'Live scoring mode ENABLED: CDC + temporal triggers disabled for combat_matches';
END;
$$ LANGUAGE plpgsql;

-- Disable live scoring mode (re-enable all triggers)
CREATE OR REPLACE FUNCTION system.disable_live_scoring()
RETURNS VOID AS $$
BEGIN
  EXECUTE 'ALTER TABLE combat_matches ENABLE TRIGGER cdc_capture';
  EXECUTE 'ALTER TABLE combat_matches ENABLE TRIGGER temporal_version';

  SET LOCAL app.live_scoring_mode = 'false';

  RAISE NOTICE 'Live scoring mode DISABLED: All triggers re-enabled for combat_matches';
END;
$$ LANGUAGE plpgsql;

-- Batch sync: After live scoring, sync all changes to CDC + temporal
CREATE OR REPLACE FUNCTION system.sync_after_live_scoring(
  p_match_ids UUID[] DEFAULT NULL
)
RETURNS TABLE (
  action TEXT,
  affected_rows INT
) AS $$
DECLARE
  v_count INT;
BEGIN
  -- Re-capture all modified matches to CDC outbox
  IF p_match_ids IS NOT NULL THEN
    INSERT INTO system.cdc_outbox (
      table_name, record_id, operation, payload, created_at
    )
    SELECT
      'combat_matches', cm.id, 'UPDATE',
      to_jsonb(cm), NOW()
    FROM combat_matches cm
    WHERE cm.id = ANY(p_match_ids);
  ELSE
    -- All matches updated in last hour
    INSERT INTO system.cdc_outbox (
      table_name, record_id, operation, payload, created_at
    )
    SELECT
      'combat_matches', cm.id, 'UPDATE',
      to_jsonb(cm), NOW()
    FROM combat_matches cm
    WHERE cm.updated_at > NOW() - INTERVAL '1 hour';
  END IF;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  action := 'cdc_sync';
  affected_rows := v_count;
  RETURN NEXT;

  -- Sync temporal history
  -- (Manual snapshot since triggers were disabled)
  IF p_match_ids IS NOT NULL THEN
    INSERT INTO temporal.combat_matches_history
    SELECT cm.*, NOW(), 'infinity'::TIMESTAMPTZ, NULL, 'UPDATE'
    FROM combat_matches cm
    WHERE cm.id = ANY(p_match_ids)
    ON CONFLICT DO NOTHING;
  END IF;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  action := 'temporal_sync';
  affected_rows := v_count;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 4. MONITORING: Live scoring status
-- ════════════════════════════════════════════════════════

DROP VIEW IF EXISTS system.v_trigger_status CASCADE;
CREATE VIEW system.v_trigger_status AS
SELECT
  tgname AS trigger_name,
  tgrelid::regclass AS table_name,
  CASE WHEN tgenabled = 'O' THEN 'enabled'
       WHEN tgenabled = 'D' THEN 'disabled'
       WHEN tgenabled = 'R' THEN 'replica_only'
       WHEN tgenabled = 'A' THEN 'always'
  END AS status,
  tgtype
FROM pg_trigger
WHERE tgrelid::regclass::TEXT IN (
  'combat_matches', 'athletes', 'tournaments'
)
AND NOT tgisinternal
ORDER BY tgrelid::regclass, tgname;

COMMIT;


-- ─── Source: 0079_fix_temporal_trigger.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0079: FIX TEMPORAL TRIGGER
-- P0 Critical: Rewrite trigger_temporal_versioning() to use
-- dynamic column mapping instead of ($1).* expansion
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. COLUMN MAPPING CONFIG TABLE
--    Maps main table columns → history table columns
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS temporal.column_mappings (
  id            SERIAL PRIMARY KEY,
  source_table  TEXT NOT NULL,           -- 'athletes'
  history_table TEXT NOT NULL,           -- 'temporal.athletes_history'
  source_cols   TEXT[] NOT NULL,         -- columns to copy from main
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (source_table)
);

-- Seed mappings for existing temporal tables
INSERT INTO temporal.column_mappings (source_table, history_table, source_cols) VALUES
  ('athletes', 'temporal.athletes_history',
   ARRAY['id','tenant_id','ho_ten','ngay_sinh','gioi_tinh','can_nang',
         'ma_vdv','tournament_id','current_club_id','trang_thai','metadata']),
  ('tournaments', 'temporal.tournaments_history',
   ARRAY['id','tenant_id','name','code','status','start_date','end_date',
         'location','config']),
  ('combat_matches', 'temporal.combat_matches_history',
   ARRAY['id','tenant_id','tournament_id','arena_id','vdv_do_id','vdv_xanh_id',
         'trang_thai','ket_qua','diem_do','diem_xanh','thu_tu','metadata'])
ON CONFLICT (source_table) DO UPDATE SET
  source_cols = EXCLUDED.source_cols;

-- ════════════════════════════════════════════════════════
-- 2. REWRITE: trigger_temporal_versioning()
--    Uses dynamic column list from mapping table
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION trigger_temporal_versioning()
RETURNS TRIGGER AS $$
DECLARE
  v_history_table TEXT;
  v_user_id       UUID;
  v_now           TIMESTAMPTZ := NOW();
  v_source_cols   TEXT[];
  v_col_list      TEXT;
  v_val_refs      TEXT;
  v_col           TEXT;
  v_idx           INT;
BEGIN
  -- Lookup history table and column mapping
  SELECT cm.history_table, cm.source_cols
    INTO v_history_table, v_source_cols
    FROM temporal.column_mappings cm
   WHERE cm.source_table = TG_TABLE_NAME;

  -- Fallback: if no mapping configured, skip silently
  IF v_history_table IS NULL THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
  END IF;

  v_user_id := NULLIF(current_setting('app.current_user', true), '')::UUID;

  -- Build column list: "id, tenant_id, ho_ten, ..."
  v_col_list := array_to_string(v_source_cols, ', ');

  -- Build value references using json extraction
  -- For each column: ($1::jsonb)->>'{col}' cast to appropriate type
  -- Since types vary, use a simpler approach: build dynamic SELECT

  IF TG_OP = 'INSERT' THEN
    BEGIN
      EXECUTE format(
        'INSERT INTO %s (%s, valid_from, valid_to, changed_by, change_type)
         SELECT %s, $1, $2, $3, $4
         FROM (SELECT ($5::%I).*) sub',
        v_history_table,
        v_col_list,
        v_col_list,
        TG_TABLE_NAME
      ) USING v_now, 'infinity'::TIMESTAMPTZ, v_user_id, 'INSERT', NEW;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Temporal INSERT failed for %.%: %', TG_TABLE_SCHEMA, TG_TABLE_NAME, SQLERRM;
    END;
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    BEGIN
      -- Close previous version
      EXECUTE format(
        'UPDATE %s SET valid_to = $1
         WHERE id = $2 AND valid_to = ''infinity''::TIMESTAMPTZ',
        v_history_table
      ) USING v_now, OLD.id;

      -- Insert new version with mapped columns only
      EXECUTE format(
        'INSERT INTO %s (%s, valid_from, valid_to, changed_by, change_type)
         SELECT %s, $1, $2, $3, $4
         FROM (SELECT ($5::%I).*) sub',
        v_history_table,
        v_col_list,
        v_col_list,
        TG_TABLE_NAME
      ) USING v_now, 'infinity'::TIMESTAMPTZ, v_user_id, 'UPDATE', NEW;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Temporal UPDATE failed for %.%: %', TG_TABLE_SCHEMA, TG_TABLE_NAME, SQLERRM;
    END;
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    BEGIN
      EXECUTE format(
        'UPDATE %s SET valid_to = $1, change_type = $2
         WHERE id = $3 AND valid_to = ''infinity''::TIMESTAMPTZ',
        v_history_table
      ) USING v_now, 'DELETE', OLD.id;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Temporal DELETE failed for %.%: %', TG_TABLE_SCHEMA, TG_TABLE_NAME, SQLERRM;
    END;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql
SET search_path = temporal, public, pg_catalog;

-- ════════════════════════════════════════════════════════
-- 3. ADD change_reason TO HISTORY TABLES (missing column)
-- ════════════════════════════════════════════════════════

ALTER TABLE temporal.tournaments_history
  ADD COLUMN IF NOT EXISTS change_reason TEXT;

ALTER TABLE temporal.combat_matches_history
  ADD COLUMN IF NOT EXISTS change_reason TEXT;

-- ════════════════════════════════════════════════════════
-- 4. HELPER: Add new table to temporal tracking
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION temporal.register_temporal_table(
  p_source_table TEXT,
  p_columns TEXT[],
  p_history_schema TEXT DEFAULT 'temporal'
)
RETURNS VOID AS $$
DECLARE
  v_history_table TEXT;
  v_col TEXT;
  v_create_sql TEXT;
BEGIN
  v_history_table := p_history_schema || '.' || p_source_table || '_history';

  -- Build CREATE TABLE with mapped columns
  v_create_sql := format('CREATE TABLE IF NOT EXISTS %s (', v_history_table);
  FOREACH v_col IN ARRAY p_columns LOOP
    -- Get column type from source table
    v_create_sql := v_create_sql || format(
      '%I %s, ',
      v_col,
      (SELECT format_type(atttypid, atttypmod)
       FROM pg_attribute
       WHERE attrelid = p_source_table::regclass
         AND attname = v_col
         AND NOT attisdropped)
    );
  END LOOP;

  v_create_sql := v_create_sql ||
    'valid_from TIMESTAMPTZ NOT NULL, ' ||
    'valid_to TIMESTAMPTZ NOT NULL, ' ||
    'changed_by UUID, ' ||
    'change_type VARCHAR(10) NOT NULL CHECK (change_type IN (''INSERT'',''UPDATE'',''DELETE'')), ' ||
    'change_reason TEXT, ' ||
    'PRIMARY KEY (id, valid_from))';

  EXECUTE v_create_sql;

  -- Register in mapping table
  INSERT INTO temporal.column_mappings (source_table, history_table, source_cols)
  VALUES (p_source_table, v_history_table, p_columns)
  ON CONFLICT (source_table) DO UPDATE SET source_cols = EXCLUDED.source_cols;

  -- Create trigger
  EXECUTE format(
    'CREATE TRIGGER temporal_version
       AFTER INSERT OR UPDATE OR DELETE ON %I
       FOR EACH ROW EXECUTE FUNCTION trigger_temporal_versioning()',
    p_source_table
  );
END;
$$ LANGUAGE plpgsql
SET search_path = temporal, public, pg_catalog;

COMMIT;


-- ─── Source: 0080_enum_check_sync.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0080: ENUM-CHECK HARMONIZATION V2
-- P0 Critical: Sync ENUM definitions ↔ CHECK constraints
-- Then migrate columns to use ENUM types directly
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. SYNC ENUMS: Add missing values to match CHECK constraints
--    ALTER TYPE ADD VALUE cannot run inside a transaction,
--    so we DROP + RECREATE (safe: no columns use these types yet)
-- ════════════════════════════════════════════════════════

-- athlete_status — merge all known values
DROP TYPE IF EXISTS core.athlete_status CASCADE;
CREATE TYPE core.athlete_status AS ENUM (
  'nhap', 'cho_duyet', 'da_duyet', 'tu_choi',
  'dinh_chi', 'nghi_thi_dau', 'rut', 'rut_lui', 'giai_nghe', 'huy'
);

-- match_status — merge CHECK + ENUM values
DROP TYPE IF EXISTS core.match_status CASCADE;
CREATE TYPE core.match_status AS ENUM (
  'chua_dau', 'cho_dau', 'dang_dau', 'tam_dung',
  'ket_thuc', 'huy', 'khong_dau',
  'cho_ket_qua', 'bao_luu', 'bo_cuoc'
);

-- registration_status — merge
DROP TYPE IF EXISTS core.registration_status CASCADE;
CREATE TYPE core.registration_status AS ENUM (
  'cho_xu_ly', 'cho_duyet', 'da_duyet', 'tu_choi',
  'da_huy', 'rut', 'yeu_cau_bo_sung', 'het_han'
);

-- tournament_status — already comprehensive, add 'dang_ky' + 'khoa_dk' aliases
DROP TYPE IF EXISTS core.tournament_status CASCADE;
CREATE TYPE core.tournament_status AS ENUM (
  'nhap', 'cho_duyet', 'da_duyet',
  'dang_dang_ky', 'dang_ky',
  'dong_dang_ky', 'khoa_dk',
  'boc_tham', 'thi_dau', 'hoan', 'ket_thuc', 'huy'
);

-- match_result — keep as-is (no conflicts)
-- payment_status, invoice_status, gender_type — keep as-is

-- ════════════════════════════════════════════════════════
-- 2. UPDATE CHECK CONSTRAINTS TO MATCH NEW ENUMS
--    (Ensures CHECK ↔ ENUM are identical single source)
-- ════════════════════════════════════════════════════════

-- Athletes: update CHECK if exists
ALTER TABLE athletes DROP CONSTRAINT IF EXISTS chk_athletes_status;
ALTER TABLE athletes ADD CONSTRAINT chk_athletes_status
  CHECK (trang_thai::TEXT = ANY(enum_range(NULL::core.athlete_status)::TEXT[]))
  NOT VALID;
ALTER TABLE athletes VALIDATE CONSTRAINT chk_athletes_status;

-- Matches
ALTER TABLE combat_matches DROP CONSTRAINT IF EXISTS chk_matches_status;
ALTER TABLE combat_matches ADD CONSTRAINT chk_matches_status
  CHECK (trang_thai::TEXT = ANY(enum_range(NULL::core.match_status)::TEXT[]))
  NOT VALID;
ALTER TABLE combat_matches VALIDATE CONSTRAINT chk_matches_status;

-- Registrations
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS chk_registrations_status;
ALTER TABLE registrations ADD CONSTRAINT chk_registrations_status
  CHECK (trang_thai::TEXT = ANY(enum_range(NULL::core.registration_status)::TEXT[]))
  NOT VALID;
ALTER TABLE registrations VALIDATE CONSTRAINT chk_registrations_status;

-- Tournaments
ALTER TABLE tournaments DROP CONSTRAINT IF EXISTS chk_tournaments_status;
ALTER TABLE tournaments ADD CONSTRAINT chk_tournaments_status
  CHECK (status::TEXT = ANY(enum_range(NULL::core.tournament_status)::TEXT[]))
  NOT VALID;
ALTER TABLE tournaments VALIDATE CONSTRAINT chk_tournaments_status;

-- Teams (keep simple CHECK — no ENUM needed)
ALTER TABLE teams DROP CONSTRAINT IF EXISTS chk_teams_status;
ALTER TABLE teams ADD CONSTRAINT chk_teams_status
  CHECK (trang_thai IN (
    'nhap', 'cho_duyet', 'da_duyet', 'tu_choi', 'rut', 'dinh_chi'
  )) NOT VALID;
ALTER TABLE teams VALIDATE CONSTRAINT chk_teams_status;

-- ════════════════════════════════════════════════════════
-- 3. DOCUMENTATION: Enum ↔ CHECK mapping view
-- ════════════════════════════════════════════════════════

DROP VIEW IF EXISTS system.v_status_mapping CASCADE;
CREATE VIEW system.v_status_mapping AS
SELECT * FROM (VALUES
  ('tournaments',    'status',     array_to_string(enum_range(NULL::core.tournament_status)::TEXT[], ', ')),
  ('athletes',       'trang_thai', array_to_string(enum_range(NULL::core.athlete_status)::TEXT[], ', ')),
  ('combat_matches', 'trang_thai', array_to_string(enum_range(NULL::core.match_status)::TEXT[], ', ')),
  ('registrations',  'trang_thai', array_to_string(enum_range(NULL::core.registration_status)::TEXT[], ', ')),
  ('teams',          'trang_thai', 'nhap, cho_duyet, da_duyet, tu_choi, rut, dinh_chi')
) AS t (table_name, column_name, allowed_values);

COMMIT;


-- ─── Source: 0081_fk_redirect_on_delete.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0081: FK REDIRECT + ON DELETE POLICIES
-- P1 High: Redirect REFERENCES users(id) → core.users(id)
-- Add missing ON DELETE clauses
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. RE-POINT FKs: public.users → core.users
--    After 0074, public.users is a VIEW, FKs don't enforce
-- ════════════════════════════════════════════════════════

-- sessions (0002) → already handled by 0074 drop
-- auth_audit_log (0002) → already handled by 0074 drop

-- referees.user_id
DO $$ BEGIN
  ALTER TABLE referees DROP CONSTRAINT IF EXISTS referees_user_id_fkey;
  ALTER TABLE referees
    ADD CONSTRAINT referees_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES core.users(id) ON DELETE SET NULL;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;

-- delegates.delegate_user_id
DO $$ BEGIN
  ALTER TABLE delegates DROP CONSTRAINT IF EXISTS delegates_delegate_user_id_fkey;
  ALTER TABLE delegates
    ADD CONSTRAINT delegates_delegate_user_id_fkey
    FOREIGN KEY (delegate_user_id) REFERENCES core.users(id) ON DELETE SET NULL;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;

-- medical_records.user_id
DO $$ BEGIN
  ALTER TABLE medical_records DROP CONSTRAINT IF EXISTS medical_records_user_id_fkey;
  ALTER TABLE medical_records
    ADD CONSTRAINT medical_records_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES core.users(id) ON DELETE SET NULL;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;

-- appeals.user_id
DO $$ BEGIN
  ALTER TABLE appeals DROP CONSTRAINT IF EXISTS appeals_user_id_fkey;
  ALTER TABLE appeals
    ADD CONSTRAINT appeals_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES core.users(id) ON DELETE SET NULL;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;

-- match_events.recorded_by
DO $$ BEGIN
  ALTER TABLE match_events DROP CONSTRAINT IF EXISTS match_events_recorded_by_fkey;
  ALTER TABLE match_events
    ADD CONSTRAINT match_events_recorded_by_fkey
    FOREIGN KEY (recorded_by) REFERENCES core.users(id) ON DELETE SET NULL;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;

-- notifications.user_id
DO $$ BEGIN
  ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
  ALTER TABLE notifications
    ADD CONSTRAINT notifications_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES core.users(id) ON DELETE CASCADE;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;

-- incidents.reported_by
DO $$ BEGIN
  ALTER TABLE incidents DROP CONSTRAINT IF EXISTS incidents_reported_by_fkey;
  ALTER TABLE incidents
    ADD CONSTRAINT incidents_reported_by_fkey
    FOREIGN KEY (reported_by) REFERENCES core.users(id) ON DELETE SET NULL;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;

-- media.uploaded_by
DO $$ BEGIN
  ALTER TABLE media DROP CONSTRAINT IF EXISTS media_uploaded_by_fkey;
  ALTER TABLE media
    ADD CONSTRAINT media_uploaded_by_fkey
    FOREIGN KEY (uploaded_by) REFERENCES core.users(id) ON DELETE SET NULL;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;

-- audit_log.changed_by
DO $$ BEGIN
  ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_changed_by_fkey;
  ALTER TABLE audit_log
    ADD CONSTRAINT audit_log_changed_by_fkey
    FOREIGN KEY (changed_by) REFERENCES core.users(id) ON DELETE SET NULL;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;

-- ════════════════════════════════════════════════════════
-- 2. ADD ON DELETE POLICIES FOR TOURNAMENT FKs
-- ════════════════════════════════════════════════════════

-- combat_matches → tournaments
DO $$ BEGIN
  ALTER TABLE combat_matches DROP CONSTRAINT IF EXISTS combat_matches_tournament_id_fkey;
  ALTER TABLE combat_matches
    ADD CONSTRAINT combat_matches_tournament_id_fkey
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

-- registrations → tournaments
DO $$ BEGIN
  ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_tournament_id_fkey;
  ALTER TABLE registrations
    ADD CONSTRAINT registrations_tournament_id_fkey
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

-- judge_scores → referees (ON DELETE SET NULL — keep scores even if referee removed)
DO $$ BEGIN
  ALTER TABLE judge_scores DROP CONSTRAINT IF EXISTS judge_scores_referee_id_fkey;
  ALTER TABLE judge_scores
    ADD CONSTRAINT judge_scores_referee_id_fkey
    FOREIGN KEY (referee_id) REFERENCES referees(id) ON DELETE SET NULL;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

-- results → athletes (SET NULL — keep result even if athlete removed)
DO $$ BEGIN
  ALTER TABLE results DROP CONSTRAINT IF EXISTS results_athlete_id_fkey;
  ALTER TABLE results
    ADD CONSTRAINT results_athlete_id_fkey
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE SET NULL;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

COMMIT;


-- ─── Source: 0082_complete_rls_coverage.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0082: COMPLETE RLS COVERAGE
-- P1 High: Apply strict RLS to all missing tenant-scoped tables
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. BTC MODULE TABLES (9 tables)
-- ════════════════════════════════════════════════════════

DO $$
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'btc_members', 'btc_weigh_ins', 'btc_draws',
    'btc_assignments', 'btc_team_results', 'btc_content_results',
    'btc_finance', 'btc_meetings', 'btc_protests'
  ]) LOOP
    BEGIN
      -- Drop old lenient policy
      EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', tbl);
      EXECUTE format('DROP POLICY IF EXISTS tenant_write_%s ON %I', replace(tbl,'.','_'), tbl);
      EXECUTE format('DROP POLICY IF EXISTS tenant_update_%s ON %I', replace(tbl,'.','_'), tbl);

      -- Create strict policy
      EXECUTE format(
        'CREATE POLICY strict_tenant_%s ON %I
          USING (
            current_setting(''app.is_system_admin'', true) = ''true''
            OR tenant_id = (
              CASE
                WHEN current_setting(''app.current_tenant'', true) IS NULL
                  OR current_setting(''app.current_tenant'', true) = ''''
                THEN (SELECT system.raise_tenant_required())::UUID
                ELSE current_setting(''app.current_tenant'', true)::UUID
              END
            )
          )',
        replace(tbl,'.','_'), tbl
      );
      RAISE NOTICE 'Strict RLS applied to %', tbl;
    EXCEPTION
      WHEN undefined_table THEN RAISE NOTICE 'Table % not found, skipping', tbl;
      WHEN duplicate_object THEN RAISE NOTICE 'Policy exists for %, skipping', tbl;
    END;
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════
-- 2. TOURNAMENT MANAGEMENT TABLES (7 tables)
-- ════════════════════════════════════════════════════════

DO $$
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'tournament_categories', 'tournament_registrations',
    'tournament_registration_athletes', 'tournament_schedule_slots',
    'tournament_arena_assignments', 'tournament_results',
    'tournament_team_standings'
  ]) LOOP
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', tbl);
      EXECUTE format('DROP POLICY IF EXISTS tenant_write_%s ON %I', replace(tbl,'.','_'), tbl);
      EXECUTE format('DROP POLICY IF EXISTS tenant_update_%s ON %I', replace(tbl,'.','_'), tbl);

      EXECUTE format(
        'CREATE POLICY strict_tenant_%s ON %I
          USING (
            current_setting(''app.is_system_admin'', true) = ''true''
            OR tenant_id = (
              CASE
                WHEN current_setting(''app.current_tenant'', true) IS NULL
                  OR current_setting(''app.current_tenant'', true) = ''''
                THEN (SELECT system.raise_tenant_required())::UUID
                ELSE current_setting(''app.current_tenant'', true)::UUID
              END
            )
          )',
        replace(tbl,'.','_'), tbl
      );
    EXCEPTION
      WHEN undefined_table THEN NULL;
      WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════
-- 3. PARENT MODULE TABLES (4 tables)
-- ════════════════════════════════════════════════════════

DO $$
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'parent_links', 'parent_consents',
    'parent_attendance', 'parent_results'
  ]) LOOP
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', tbl);
      EXECUTE format('DROP POLICY IF EXISTS tenant_write_%s ON %I', replace(tbl,'.','_'), tbl);
      EXECUTE format('DROP POLICY IF EXISTS tenant_update_%s ON %I', replace(tbl,'.','_'), tbl);

      EXECUTE format(
        'CREATE POLICY strict_tenant_%s ON %I
          USING (
            current_setting(''app.is_system_admin'', true) = ''true''
            OR tenant_id = (
              CASE
                WHEN current_setting(''app.current_tenant'', true) IS NULL
                  OR current_setting(''app.current_tenant'', true) = ''''
                THEN (SELECT system.raise_tenant_required())::UUID
                ELSE current_setting(''app.current_tenant'', true)::UUID
              END
            )
          )',
        replace(tbl,'.','_'), tbl
      );
    EXCEPTION
      WHEN undefined_table THEN NULL;
      WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════
-- 4. TRAINING + SCORING TABLES
-- ════════════════════════════════════════════════════════

DO $$
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'training_sessions', 'judge_scores',
    'match_events', 'results', 'medals_summary'
  ]) LOOP
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', tbl);

      -- Only add RLS if tenant_id column exists
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = tbl AND column_name = 'tenant_id'
      ) THEN
        EXECUTE format(
          'CREATE POLICY strict_tenant_%s ON %I
            USING (
              current_setting(''app.is_system_admin'', true) = ''true''
              OR tenant_id = (
                CASE
                  WHEN current_setting(''app.current_tenant'', true) IS NULL
                    OR current_setting(''app.current_tenant'', true) = ''''
                  THEN (SELECT system.raise_tenant_required())::UUID
                  ELSE current_setting(''app.current_tenant'', true)::UUID
                END
              )
            )',
          replace(tbl,'.','_'), tbl
        );
      ELSE
        RAISE NOTICE 'Table % has no tenant_id, skipping RLS', tbl;
      END IF;
    EXCEPTION
      WHEN undefined_table THEN NULL;
      WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════
-- 5. MONITORING: View all tables with/without RLS
-- ════════════════════════════════════════════════════════

DROP VIEW IF EXISTS system.v_rls_coverage CASCADE;
CREATE VIEW system.v_rls_coverage AS
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced,
  EXISTS (
    SELECT 1 FROM pg_policy p WHERE p.polrelid = c.oid
      AND p.polname LIKE 'strict_tenant_%'
  ) AS has_strict_policy,
  (SELECT count(*) FROM pg_policy p WHERE p.polrelid = c.oid) AS policy_count,
  EXISTS (
    SELECT 1 FROM information_schema.columns col
    WHERE col.table_schema = n.nspname
      AND col.table_name = c.relname
      AND col.column_name = 'tenant_id'
  ) AS has_tenant_id
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND n.nspname NOT IN ('pg_catalog','information_schema','pg_toast','temporal')
ORDER BY
  CASE WHEN c.relrowsecurity THEN 0 ELSE 1 END,
  n.nspname, c.relname;

COMMIT;


-- ─── Source: 0083_security_hardening.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0083: SECURITY HARDENING + POLISH
-- P2 Medium: search_path pinning, view trigger fix,
-- table comments, uuid defaults, idempotent guards
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. FIX: View trigger RETURNING * INTO NEW bug (0074)
--    INSTEAD OF triggers cannot use RETURNING INTO NEW
-- ════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION trigger_users_view_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_new_id UUID;
BEGIN
  v_new_id := COALESCE(NEW.id, uuidv7());
  INSERT INTO core.users (
    id, tenant_id, username, email, phone, password_hash,
    full_name, avatar_url, is_active, created_at, updated_at
  ) VALUES (
    v_new_id,
    COALESCE(
      NEW.tenant_id,
      NULLIF(current_setting('app.current_tenant', true), '')::UUID,
      '00000000-0000-7000-8000-000000000001'::UUID
    ),
    NEW.username, NEW.email, NEW.phone, NEW.password_hash,
    NEW.full_name, NEW.avatar_url,
    COALESCE(NEW.is_active, true),
    COALESCE(NEW.created_at, NOW()),
    COALESCE(NEW.updated_at, NOW())
  );
  -- Return NEW directly (no RETURNING INTO)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = core, public, pg_catalog;

-- ════════════════════════════════════════════════════════
-- 2. PIN search_path ON ALL SECURITY FUNCTIONS
-- ════════════════════════════════════════════════════════

-- raise_tenant_required
CREATE OR REPLACE FUNCTION system.raise_tenant_required()
RETURNS TEXT AS $$
BEGIN
  RAISE EXCEPTION 'SECURITY: app.current_tenant must be set. '
    'Direct database access without tenant context is forbidden. '
    'Use SET app.current_tenant = ''<uuid>'' before queries.'
    USING ERRCODE = 'insufficient_privilege';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql
SET search_path = system, pg_catalog;

-- create_strict_rls_policy
CREATE OR REPLACE FUNCTION system.create_strict_rls_policy(
  p_table_name TEXT,
  p_schema_name TEXT DEFAULT 'public'
)
RETURNS VOID AS $$
DECLARE
  v_full_table TEXT := p_schema_name || '.' || p_table_name;
  v_policy_name TEXT := 'strict_tenant_isolation_' || p_table_name;
  v_old_policy TEXT := 'tenant_isolation_' || p_table_name;
BEGIN
  EXECUTE format('DROP POLICY IF EXISTS %I ON %s', v_old_policy, v_full_table);
  EXECUTE format(
    'CREATE POLICY %I ON %s
      USING (
        tenant_id = (
          CASE
            WHEN current_setting(''app.current_tenant'', true) IS NULL
              OR current_setting(''app.current_tenant'', true) = ''''
            THEN (SELECT system.raise_tenant_required())::UUID
            ELSE current_setting(''app.current_tenant'', true)::UUID
          END
        )
      )',
    v_policy_name, v_full_table
  );
END;
$$ LANGUAGE plpgsql
SET search_path = system, pg_catalog;

-- ════════════════════════════════════════════════════════
-- 3. CHANGE gen_random_uuid() DEFAULTS → uuidv7()
--    Only changes DEFAULT, does NOT touch existing data
-- ════════════════════════════════════════════════════════

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT
      n.nspname AS schema_name,
      c.relname AS table_name,
      a.attname AS column_name
    FROM pg_attrdef d
    JOIN pg_attribute a ON a.attrelid = d.adrelid AND a.attnum = d.adnum
    JOIN pg_class c ON c.oid = d.adrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pg_get_expr(d.adbin, d.adrelid) LIKE '%gen_random_uuid()%'
      AND c.relkind = 'r'
      AND n.nspname NOT IN ('pg_catalog','information_schema')
  LOOP
    BEGIN
      EXECUTE format(
        'ALTER TABLE %I.%I ALTER COLUMN %I SET DEFAULT uuidv7()',
        r.schema_name, r.table_name, r.column_name
      );
      RAISE NOTICE 'Changed default: %.%.% → uuidv7()',
        r.schema_name, r.table_name, r.column_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to change default for %.%.%: %',
        r.schema_name, r.table_name, r.column_name, SQLERRM;
    END;
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════
-- 4. TABLE + COLUMN COMMENTS (Top 20 Tables)
-- ════════════════════════════════════════════════════════

-- Core auth
COMMENT ON TABLE core.users IS 'VCT Platform users — all roles (admin, referee, athlete, delegate, etc.). Primary auth table.';
COMMENT ON TABLE core.sessions IS 'Active user sessions with JWT tokens. Managed by auth middleware.';
COMMENT ON TABLE core.auth_audit_log IS 'Audit trail for auth events (login, logout, password change, etc.).';
COMMENT ON TABLE core.tenants IS 'Multi-tenant organizations (federations, clubs). All data is tenant-scoped.';
COMMENT ON TABLE core.roles IS 'RBAC roles with permission grants. Assigned to users via core.user_roles.';

-- Tournament
DO $$ BEGIN
  COMMENT ON TABLE tournaments IS 'Giải đấu Võ Cổ Truyền. Lifecycle: nhap → cho_duyet → da_duyet → dang_dang_ky → thi_dau → ket_thuc.';
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  COMMENT ON TABLE athletes IS 'Vận động viên đăng ký thi đấu. Linked to clubs + tournaments.';
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  COMMENT ON TABLE teams IS 'Đội thi đấu (đại diện tỉnh/thành, CLB). Contains multiple athletes.';
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  COMMENT ON TABLE combat_matches IS 'Trận đối kháng. Scoring: diem_do (red) vs diem_xanh (blue).';
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  COMMENT ON TABLE registrations IS '[DEPRECATED] Legacy registration. Use tournament_registrations instead.';
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  COMMENT ON TABLE referees IS 'Trọng tài giải đấu. Linked to user accounts via user_id.';
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  COMMENT ON TABLE arenas IS 'Sàn đấu — physical arena for combat matches.';
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- Reference tables
DO $$ BEGIN
  COMMENT ON TABLE ref_belt_ranks IS 'Hệ thống đai rank: trắng → vàng → xanh_la → xanh_duong → đỏ → đen.';
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  COMMENT ON TABLE ref_age_categories IS 'Hạng tuổi thi đấu: thiếu nhi, thiếu niên, thanh niên, tuyển, cao tuổi.';
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  COMMENT ON TABLE ref_scoring_criteria IS 'Tiêu chí chấm điểm: kỹ thuật, lực, tốc độ, phong thái (quyền) + tấn công, phòng thủ (đối kháng).';
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- System
COMMENT ON TABLE system.schema_migrations IS 'Migration version tracking. All applied migrations are recorded here.';
DO $$ BEGIN
  COMMENT ON TABLE system.notification_queue IS 'Async notification dispatch queue (email, push, SMS, webhook).';
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- Key columns
DO $$ BEGIN
  COMMENT ON COLUMN tournaments.status IS 'Trạng thái giải: nhap|cho_duyet|da_duyet|dang_dang_ky|dong_dang_ky|boc_tham|thi_dau|hoan|ket_thuc|huy';
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  COMMENT ON COLUMN athletes.trang_thai IS 'Trạng thái VĐV: nhap|cho_duyet|da_duyet|tu_choi|dinh_chi|nghi_thi_dau|rut|giai_nghe';
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  COMMENT ON COLUMN combat_matches.trang_thai IS 'Trạng thái trận: chua_dau|dang_dau|tam_dung|ket_thuc|huy|cho_ket_qua|bao_luu|bo_cuoc';
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- ════════════════════════════════════════════════════════
-- 5. MONITORING: gen_random_uuid check (should be empty)
-- ════════════════════════════════════════════════════════

DROP VIEW IF EXISTS system.v_uuid_defaults CASCADE;
CREATE VIEW system.v_uuid_defaults AS
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  a.attname AS column_name,
  pg_get_expr(d.adbin, d.adrelid) AS default_expr,
  CASE
    WHEN pg_get_expr(d.adbin, d.adrelid) LIKE '%uuidv7%' THEN '✅ uuidv7'
    WHEN pg_get_expr(d.adbin, d.adrelid) LIKE '%gen_random_uuid%' THEN '⚠️ v4'
    ELSE '❓ other'
  END AS uuid_version
FROM pg_attrdef d
JOIN pg_attribute a ON a.attrelid = d.adrelid AND a.attnum = d.adnum
JOIN pg_class c ON c.oid = d.adrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE (pg_get_expr(d.adbin, d.adrelid) LIKE '%uuid%')
  AND c.relkind = 'r'
  AND n.nspname NOT IN ('pg_catalog','information_schema')
ORDER BY uuid_version DESC, schema_name, table_name;

-- ════════════════════════════════════════════════════════
-- 6. REGISTER THIS MIGRATION IN TRACKING TABLE
-- ════════════════════════════════════════════════════════

INSERT INTO system.schema_migrations (version, name, notes) VALUES
  ('0079', 'fix_temporal_trigger', 'Dynamic column mapping for temporal versioning'),
  ('0080', 'enum_check_sync', 'Unified ENUM ↔ CHECK single source of truth'),
  ('0081', 'fk_redirect_on_delete', 'Redirect FKs to core.users + ON DELETE policies'),
  ('0082', 'complete_rls_coverage', 'Strict RLS for all 25+ tenant tables'),
  ('0083', 'security_hardening', 'search_path pin, view trigger fix, comments, uuid defaults')
ON CONFLICT (version) DO NOTHING;

COMMIT;


-- ─── Source: 0084_system_admin.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0084: SYSTEM ADMINISTRATION MODULE
-- API key management, login history, background jobs, notification
-- log, system metrics, admin actions + dashboard views
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. API KEY MANAGEMENT
--    External integration keys with scopes, rate limits,
--    expiry, and usage tracking
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.api_keys (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES core.tenants(id),
  name            VARCHAR(200) NOT NULL,
  description     TEXT,
  key_hash        VARCHAR(128) NOT NULL,          -- SHA-256 of the full key
  key_prefix      VARCHAR(12) NOT NULL,           -- "vct_ak_xxxx" for display
  scopes          JSONB NOT NULL DEFAULT '["read"]',
  rate_limit      INT DEFAULT 100,                -- requests per minute
  is_active       BOOLEAN DEFAULT true,
  expires_at      TIMESTAMPTZ,
  last_used_at    TIMESTAMPTZ,
  last_used_ip    INET,
  usage_count     BIGINT DEFAULT 0,
  created_by      UUID NOT NULL REFERENCES core.users(id),
  revoked_at      TIMESTAMPTZ,
  revoked_by      UUID REFERENCES core.users(id),
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version         INT NOT NULL DEFAULT 1
);

-- RLS
ALTER TABLE system.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON system.api_keys
  USING (tenant_id = COALESCE(
    current_setting('app.current_tenant', true)::UUID,
    '00000000-0000-7000-8000-000000000001'::UUID
  ));

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_api_keys_hash
  ON system.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix
  ON system.api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_tenant_active
  ON system.api_keys(tenant_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_api_keys_expires
  ON system.api_keys(expires_at) WHERE is_active = true AND expires_at IS NOT NULL;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON system.api_keys
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ════════════════════════════════════════════════════════
-- 2. LOGIN HISTORY
--    Detailed per-login tracking (supplements auth_audit_log)
--    Includes device fingerprint, geo, method
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.login_history (
  id              UUID DEFAULT uuidv7() NOT NULL,
  tenant_id       UUID NOT NULL REFERENCES core.tenants(id),
  user_id         UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  login_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  logout_at       TIMESTAMPTZ,
  session_duration INTERVAL GENERATED ALWAYS AS (logout_at - login_at) STORED,
  ip_address      INET,
  user_agent      TEXT,
  device_type     VARCHAR(20) DEFAULT 'unknown'
    CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'api', 'unknown')),
  browser         VARCHAR(100),
  os              VARCHAR(100),
  geo_location    JSONB DEFAULT '{}',             -- {"country": "VN", "city": "HCM"}
  login_method    VARCHAR(30) NOT NULL DEFAULT 'password'
    CHECK (login_method IN ('password', 'otp', 'oauth', 'api_key', 'sso', 'refresh')),
  status          VARCHAR(20) NOT NULL DEFAULT 'success'
    CHECK (status IN ('success', 'failed', 'blocked', 'locked_out', 'expired_password')),
  failure_reason  TEXT,
  session_id      UUID,                           -- FK to core.sessions if active
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (login_at, id)                      -- partition-ready
) PARTITION BY RANGE (login_at);

-- Default partition
CREATE TABLE IF NOT EXISTS system.login_history_default
  PARTITION OF system.login_history DEFAULT;

-- Current quarter partition (auto-create more via cron or app code)
DO $$
DECLARE
  q_start DATE := date_trunc('quarter', NOW())::DATE;
  q_end   DATE := (date_trunc('quarter', NOW()) + INTERVAL '3 months')::DATE;
  part_name TEXT := 'system.login_history_' || to_char(q_start, 'YYYY') || '_q' ||
                    EXTRACT(QUARTER FROM q_start)::TEXT;
BEGIN
  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS %s PARTITION OF system.login_history
       FOR VALUES FROM (%L) TO (%L)',
    part_name, q_start, q_end
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- RLS
ALTER TABLE system.login_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON system.login_history
  USING (tenant_id = COALESCE(
    current_setting('app.current_tenant', true)::UUID,
    '00000000-0000-7000-8000-000000000001'::UUID
  ));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_login_history_user
  ON system.login_history(tenant_id, user_id, login_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_history_status
  ON system.login_history(tenant_id, status, login_at DESC)
  WHERE status != 'success';
CREATE INDEX IF NOT EXISTS idx_login_history_ip
  ON system.login_history(ip_address, login_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_history_method
  ON system.login_history(login_method, login_at DESC);

-- ════════════════════════════════════════════════════════
-- 3. BACKGROUND JOBS
--    Track async work: email, reports, imports, matview
--    refresh, data cleanup, etc.
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.background_jobs (
  id              UUID DEFAULT uuidv7() PRIMARY KEY,
  tenant_id       UUID REFERENCES core.tenants(id),  -- NULL = system-wide job
  job_type        VARCHAR(100) NOT NULL,           -- 'email', 'report', 'import', 'matview_refresh', 'cleanup'
  job_name        VARCHAR(300) NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled', 'retrying', 'timeout')),
  priority        INT NOT NULL DEFAULT 5           -- 1=highest, 10=lowest
    CHECK (priority BETWEEN 1 AND 10),
  payload         JSONB DEFAULT '{}',
  result          JSONB,
  error           TEXT,
  progress        INT DEFAULT 0                    -- 0-100 percentage
    CHECK (progress BETWEEN 0 AND 100),
  max_retries     INT DEFAULT 3,
  attempt_count   INT DEFAULT 0,
  scheduled_at    TIMESTAMPTZ DEFAULT NOW(),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  timeout_seconds INT DEFAULT 300,                 -- 5 min default
  locked_by       VARCHAR(200),                    -- worker ID
  locked_until    TIMESTAMPTZ,
  created_by      UUID REFERENCES core.users(id),
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version         INT NOT NULL DEFAULT 1
);

-- RLS — allow system jobs (tenant_id IS NULL) for system admins
ALTER TABLE system.background_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_or_system ON system.background_jobs
  USING (
    tenant_id IS NULL AND current_setting('app.is_system_admin', true) = 'true'
    OR tenant_id = COALESCE(
      current_setting('app.current_tenant', true)::UUID,
      '00000000-0000-7000-8000-000000000001'::UUID
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bg_jobs_status
  ON system.background_jobs(status, priority, scheduled_at)
  WHERE status IN ('queued', 'retrying');
CREATE INDEX IF NOT EXISTS idx_bg_jobs_tenant_type
  ON system.background_jobs(tenant_id, job_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bg_jobs_locked
  ON system.background_jobs(locked_until)
  WHERE status = 'running' AND locked_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bg_jobs_scheduled
  ON system.background_jobs(scheduled_at)
  WHERE status = 'queued';

CREATE TRIGGER set_updated_at BEFORE UPDATE ON system.background_jobs
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Job acquisition function (atomic claim by worker)
CREATE OR REPLACE FUNCTION system.claim_next_job(
  p_worker_id TEXT,
  p_job_type TEXT DEFAULT NULL,
  p_lock_seconds INT DEFAULT 300
)
RETURNS system.background_jobs AS $$
DECLARE
  v_job system.background_jobs;
BEGIN
  SELECT * INTO v_job
  FROM system.background_jobs
  WHERE status IN ('queued', 'retrying')
    AND (scheduled_at IS NULL OR scheduled_at <= NOW())
    AND (p_job_type IS NULL OR job_type = p_job_type)
  ORDER BY priority ASC, scheduled_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_job.id IS NULL THEN RETURN NULL; END IF;

  UPDATE system.background_jobs SET
    status = 'running',
    started_at = COALESCE(started_at, NOW()),
    locked_by = p_worker_id,
    locked_until = NOW() + (p_lock_seconds || ' seconds')::INTERVAL,
    attempt_count = attempt_count + 1,
    updated_at = NOW()
  WHERE id = v_job.id
  RETURNING * INTO v_job;

  RETURN v_job;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════
-- 4. NOTIFICATION LOG
--    Tracks every notification sent across all channels
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.notification_log (
  id              UUID DEFAULT uuidv7() NOT NULL,
  tenant_id       UUID NOT NULL REFERENCES core.tenants(id),
  template_id     UUID REFERENCES system.notification_templates(id),
  channel         VARCHAR(20) NOT NULL
    CHECK (channel IN ('email', 'sms', 'push', 'in_app', 'webhook')),
  recipient_id    UUID REFERENCES core.users(id),
  recipient_addr  VARCHAR(500),                    -- email/phone/device token
  subject         VARCHAR(500),
  body_preview    VARCHAR(1000),
  status          VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sending', 'sent', 'delivered', 'failed', 'bounced', 'unsubscribed')),
  external_id     VARCHAR(200),                    -- provider message ID
  provider        VARCHAR(50),                     -- 'resend', 'firebase_fcm', 'twilio'
  error           TEXT,
  retry_count     INT DEFAULT 0,
  sent_at         TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (created_at, id)
) PARTITION BY RANGE (created_at);

-- Default partition
CREATE TABLE IF NOT EXISTS system.notification_log_default
  PARTITION OF system.notification_log DEFAULT;

-- Current quarter
DO $$
DECLARE
  q_start DATE := date_trunc('quarter', NOW())::DATE;
  q_end   DATE := (date_trunc('quarter', NOW()) + INTERVAL '3 months')::DATE;
  part_name TEXT := 'system.notification_log_' || to_char(q_start, 'YYYY') || '_q' ||
                    EXTRACT(QUARTER FROM q_start)::TEXT;
BEGIN
  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS %s PARTITION OF system.notification_log
       FOR VALUES FROM (%L) TO (%L)',
    part_name, q_start, q_end
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- RLS
ALTER TABLE system.notification_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON system.notification_log
  USING (tenant_id = COALESCE(
    current_setting('app.current_tenant', true)::UUID,
    '00000000-0000-7000-8000-000000000001'::UUID
  ));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notif_log_recipient
  ON system.notification_log(tenant_id, recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_log_status
  ON system.notification_log(status, created_at)
  WHERE status IN ('pending', 'sending', 'failed');
CREATE INDEX IF NOT EXISTS idx_notif_log_channel
  ON system.notification_log(tenant_id, channel, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_log_template
  ON system.notification_log(template_id, created_at DESC);

-- ════════════════════════════════════════════════════════
-- 5. SYSTEM METRICS (KPI Snapshots)
--    Periodic snapshots for admin dashboard charts
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.system_metrics (
  id              UUID DEFAULT uuidv7() NOT NULL,
  tenant_id       UUID REFERENCES core.tenants(id),  -- NULL = platform-wide
  metric_name     VARCHAR(200) NOT NULL,           -- 'active_users', 'new_registrations', 'matches_played'
  metric_value    NUMERIC NOT NULL,
  unit            VARCHAR(30) DEFAULT 'count',     -- 'count', 'percent', 'ms', 'bytes'
  dimensions      JSONB DEFAULT '{}',              -- {"role": "athlete", "province": "HCM"}
  period_type     VARCHAR(20) NOT NULL DEFAULT 'daily'
    CHECK (period_type IN ('hourly', 'daily', 'weekly', 'monthly')),
  period_start    TIMESTAMPTZ NOT NULL,
  period_end      TIMESTAMPTZ NOT NULL,
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (recorded_at, id)
) PARTITION BY RANGE (recorded_at);

CREATE TABLE IF NOT EXISTS system.system_metrics_default
  PARTITION OF system.system_metrics DEFAULT;

-- Prevent duplicate snapshots
CREATE UNIQUE INDEX IF NOT EXISTS idx_metrics_unique_snapshot
  ON system.system_metrics(tenant_id, metric_name, period_type, period_start)
  WHERE tenant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_metrics_lookup
  ON system.system_metrics(metric_name, period_type, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_tenant
  ON system.system_metrics(tenant_id, metric_name, recorded_at DESC)
  WHERE tenant_id IS NOT NULL;

-- ════════════════════════════════════════════════════════
-- 6. ADMIN ACTIONS LOG
--    Dedicated admin operation log, easy to query
--    (vs generic audit_log which tracks ALL changes)
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS system.admin_actions (
  id              UUID DEFAULT uuidv7() NOT NULL,
  tenant_id       UUID NOT NULL REFERENCES core.tenants(id),
  admin_id        UUID NOT NULL REFERENCES core.users(id),
  action_type     VARCHAR(100) NOT NULL,           -- 'user.create', 'user.deactivate', 'role.assign', 'config.update'
  target_type     VARCHAR(100),                    -- 'user', 'role', 'tenant', 'config', 'feature_flag'
  target_id       UUID,
  target_name     VARCHAR(300),                    -- human-readable for quick display
  description     TEXT,
  severity        VARCHAR(20) DEFAULT 'info'
    CHECK (severity IN ('info', 'warning', 'critical')),
  changes         JSONB DEFAULT '{}',              -- {"before": {...}, "after": {...}}
  ip_address      INET,
  user_agent      TEXT,
  request_id      VARCHAR(64),                     -- correlate with HTTP request
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (created_at, id)
) PARTITION BY RANGE (created_at);

CREATE TABLE IF NOT EXISTS system.admin_actions_default
  PARTITION OF system.admin_actions DEFAULT;

-- RLS
ALTER TABLE system.admin_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON system.admin_actions
  USING (tenant_id = COALESCE(
    current_setting('app.current_tenant', true)::UUID,
    '00000000-0000-7000-8000-000000000001'::UUID
  ));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin
  ON system.admin_actions(tenant_id, admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target
  ON system.admin_actions(target_type, target_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_type
  ON system.admin_actions(action_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_severity
  ON system.admin_actions(severity, created_at DESC)
  WHERE severity IN ('warning', 'critical');

-- ════════════════════════════════════════════════════════
-- 7. ADMIN DASHBOARD VIEWS
-- ════════════════════════════════════════════════════════

-- 7a. KPI Overview — counts, trends, active state
DROP VIEW IF EXISTS system.v_admin_dashboard CASCADE;
CREATE VIEW system.v_admin_dashboard AS
SELECT
  t.id AS tenant_id,
  t.name AS tenant_name,
  -- User stats
  (SELECT count(*) FROM core.users u
     WHERE u.tenant_id = t.id AND u.is_active = true AND u.is_deleted = false
  ) AS active_users,
  (SELECT count(*) FROM core.users u
     WHERE u.tenant_id = t.id AND u.is_deleted = false
       AND u.created_at > NOW() - INTERVAL '7 days'
  ) AS new_users_7d,
  -- Session stats
  (SELECT count(*) FROM core.sessions s
     WHERE s.tenant_id = t.id AND s.expires_at > NOW()
  ) AS active_sessions,
  -- Pending approvals
  (SELECT count(*) FROM core.approval_requests ar
     WHERE ar.tenant_id = t.id AND ar.status IN ('pending', 'in_review')
  ) AS pending_approvals,
  -- Recent admin actions
  (SELECT count(*) FROM system.admin_actions aa
     WHERE aa.tenant_id = t.id AND aa.created_at > NOW() - INTERVAL '24 hours'
  ) AS admin_actions_24h,
  -- Failed logins
  (SELECT count(*) FROM system.login_history lh
     WHERE lh.tenant_id = t.id AND lh.status != 'success'
       AND lh.login_at > NOW() - INTERVAL '24 hours'
  ) AS failed_logins_24h,
  -- Background jobs
  (SELECT count(*) FROM system.background_jobs bj
     WHERE (bj.tenant_id = t.id OR bj.tenant_id IS NULL)
       AND bj.status IN ('queued', 'running')
  ) AS active_jobs,
  -- Notification stats
  (SELECT count(*) FROM system.notification_log nl
     WHERE nl.tenant_id = t.id AND nl.status = 'failed'
       AND nl.created_at > NOW() - INTERVAL '24 hours'
  ) AS failed_notifications_24h,
  NOW() AS snapshot_at
FROM core.tenants t
WHERE t.is_active = true;

-- 7b. System Health — circuit breakers, stale jobs, login anomalies
DROP VIEW IF EXISTS system.v_system_health CASCADE;
CREATE VIEW system.v_system_health AS
SELECT
  -- Circuit breaker status
  (SELECT jsonb_agg(jsonb_build_object(
      'service', service_name,
      'status', status,
      'failures', failure_count,
      'last_failure', last_failure_at
    ))
    FROM system.circuit_breakers
    WHERE status != 'closed'
  ) AS open_circuit_breakers,
  -- Stuck jobs (running > 2x timeout)
  (SELECT count(*)
    FROM system.background_jobs
    WHERE status = 'running'
      AND started_at < NOW() - (timeout_seconds * 2 || ' seconds')::INTERVAL
  ) AS stuck_jobs,
  -- Job queue depth
  (SELECT count(*)
    FROM system.background_jobs
    WHERE status IN ('queued', 'retrying')
  ) AS queued_jobs,
  -- Failed jobs last 24h
  (SELECT count(*)
    FROM system.background_jobs
    WHERE status = 'failed'
      AND completed_at > NOW() - INTERVAL '24 hours'
  ) AS failed_jobs_24h,
  -- Expired API keys still active
  (SELECT count(*)
    FROM system.api_keys
    WHERE is_active = true
      AND expires_at IS NOT NULL
      AND expires_at < NOW()
  ) AS expired_api_keys,
  -- Login failure spike (>10 from same IP in 1 hour)
  (SELECT jsonb_agg(jsonb_build_object(
      'ip', ip_address::TEXT,
      'attempts', cnt
    ))
    FROM (
      SELECT ip_address, count(*) AS cnt
      FROM system.login_history
      WHERE status != 'success'
        AND login_at > NOW() - INTERVAL '1 hour'
      GROUP BY ip_address
      HAVING count(*) > 10
    ) suspicious
  ) AS suspicious_ips,
  -- Feature flags count
  (SELECT count(*) FROM system.feature_flags WHERE is_active = true) AS active_feature_flags,
  -- DB migration version
  (SELECT version FROM system.schema_migrations
     WHERE status = 'applied' ORDER BY version DESC LIMIT 1
  ) AS current_db_version,
  NOW() AS checked_at;

-- ════════════════════════════════════════════════════════
-- 8. HELPER FUNCTIONS
-- ════════════════════════════════════════════════════════

-- Record an admin action (called from Go handlers)
CREATE OR REPLACE FUNCTION system.log_admin_action(
  p_tenant_id UUID,
  p_admin_id UUID,
  p_action_type TEXT,
  p_target_type TEXT DEFAULT NULL,
  p_target_id UUID DEFAULT NULL,
  p_target_name TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_severity TEXT DEFAULT 'info',
  p_changes JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO system.admin_actions
    (tenant_id, admin_id, action_type, target_type, target_id,
     target_name, description, severity, changes,
     ip_address, request_id)
  VALUES (
    p_tenant_id, p_admin_id, p_action_type, p_target_type, p_target_id,
    p_target_name, p_description, p_severity, p_changes,
    NULLIF(current_setting('app.client_ip', true), '')::INET,
    NULLIF(current_setting('app.request_id', true), '')
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql
SET search_path = system, core, pg_catalog;

-- Expire stale API keys (called by cron/worker)
CREATE OR REPLACE FUNCTION system.expire_api_keys()
RETURNS INT AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE system.api_keys SET
    is_active = false,
    revoked_at = NOW(),
    updated_at = NOW()
  WHERE is_active = true
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql
SET search_path = system, pg_catalog;

-- Release stale job locks (called by cron/worker)
CREATE OR REPLACE FUNCTION system.release_stale_locks()
RETURNS INT AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE system.background_jobs SET
    status = CASE
      WHEN attempt_count >= max_retries THEN 'failed'
      ELSE 'retrying'
    END,
    locked_by = NULL,
    locked_until = NULL,
    error = COALESCE(error, '') || ' [auto-released: lock expired]',
    updated_at = NOW()
  WHERE status = 'running'
    AND locked_until IS NOT NULL
    AND locked_until < NOW();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql
SET search_path = system, pg_catalog;

-- ════════════════════════════════════════════════════════
-- 9. SEED DEFAULT SYSTEM PERMISSIONS FOR ADMIN MODULE
-- ════════════════════════════════════════════════════════

INSERT INTO core.permissions (resource, action, description, is_system) VALUES
  ('system', 'manage_api_keys', 'Quản lý API keys', true),
  ('system', 'view_login_history', 'Xem lịch sử đăng nhập', true),
  ('system', 'manage_jobs', 'Quản lý background jobs', true),
  ('system', 'view_notifications', 'Xem log thông báo', true),
  ('system', 'view_metrics', 'Xem metrics hệ thống', true),
  ('system', 'view_admin_actions', 'Xem log thao tác admin', true),
  ('system', 'view_dashboard', 'Xem admin dashboard', true),
  ('system', 'view_system_health', 'Xem system health', true),
  ('system', 'manage_announcements', 'Quản lý thông báo hệ thống', true),
  ('system', 'manage_feature_flags', 'Quản lý feature flags', true)
ON CONFLICT (resource, action) DO NOTHING;

-- ════════════════════════════════════════════════════════
-- 10. TABLE COMMENTS
-- ════════════════════════════════════════════════════════

COMMENT ON TABLE system.api_keys IS 'API keys for external integrations. Admin-managed with scopes, rate limits, and usage tracking.';
COMMENT ON TABLE system.login_history IS 'Detailed login/logout history. Partitioned by login_at for efficient retention.';
COMMENT ON TABLE system.background_jobs IS 'Async job queue: emails, reports, imports, matview refresh. Workers claim via system.claim_next_job().';
COMMENT ON TABLE system.notification_log IS 'Log of all notifications sent (email, push, SMS, in-app). Partitioned by created_at.';
COMMENT ON TABLE system.system_metrics IS 'Periodic KPI snapshots for admin dashboard charts. Partitioned by recorded_at.';
COMMENT ON TABLE system.admin_actions IS 'Dedicated log for admin operations. Easier to query than generic audit_log.';

COMMENT ON VIEW system.v_admin_dashboard IS 'Admin dashboard KPIs per tenant: users, sessions, approvals, jobs, notifications.';
COMMENT ON VIEW system.v_system_health IS 'System health overview: circuit breakers, stuck jobs, suspicious IPs, expired keys.';

COMMENT ON FUNCTION system.claim_next_job IS 'Atomically claims the next available background job for a worker. Uses SKIP LOCKED for concurrency.';
COMMENT ON FUNCTION system.log_admin_action IS 'Helper to record admin actions from Go handlers. Auto-captures IP and request ID.';
COMMENT ON FUNCTION system.expire_api_keys IS 'Deactivates API keys past their expiry date. Call from cron/worker.';
COMMENT ON FUNCTION system.release_stale_locks IS 'Releases stale job locks and retries or fails jobs. Call from cron/worker.';

-- ════════════════════════════════════════════════════════
-- 11. REGISTER MIGRATION
-- ════════════════════════════════════════════════════════

INSERT INTO system.schema_migrations (version, name, notes) VALUES
  ('0084', 'system_admin', 'System admin module: API keys, login history, background jobs, notification log, metrics, admin actions, dashboard views')
ON CONFLICT (version) DO NOTHING;

COMMIT;


-- ─── Source: 0085_subscriptions.sql ──────────────────────────
-- ===============================================================
-- VCT Platform — Migration 0085: SUBSCRIPTION & BILLING
-- Schema: platform.* | Plans, subscriptions, billing cycles, renewal logs
-- ===============================================================

BEGIN;

-- ── Subscription Plans (Gói dịch vụ) ────────────────────────
CREATE TABLE IF NOT EXISTS platform.subscription_plans (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  code              VARCHAR(50) NOT NULL,
  name              VARCHAR(200) NOT NULL,
  description       TEXT,
  entity_type       VARCHAR(50) NOT NULL
    CHECK (entity_type IN ('federation', 'organization', 'tournament')),
  features          JSONB DEFAULT '{}',
  price_monthly     DECIMAL(15,2) NOT NULL DEFAULT 0 CHECK (price_monthly >= 0),
  price_yearly      DECIMAL(15,2) NOT NULL DEFAULT 0 CHECK (price_yearly >= 0),
  currency          VARCHAR(10) DEFAULT 'VND',
  max_members       INT DEFAULT 0,
  max_tournaments   INT DEFAULT 0,
  max_athletes      INT DEFAULT 0,
  is_active         BOOLEAN DEFAULT true,
  sort_order        INT DEFAULT 0,
  is_deleted        BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID,
  updated_by        UUID,
  version           INT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, id),
  UNIQUE (tenant_id, code, entity_type)
);

-- ── Subscriptions (Đăng ký gói) ─────────────────────────────
CREATE TABLE IF NOT EXISTS platform.subscriptions (
  id                    UUID DEFAULT uuidv7() NOT NULL,
  tenant_id             UUID NOT NULL REFERENCES core.tenants(id),
  plan_id               UUID NOT NULL,
  plan_code             VARCHAR(50),
  plan_name             VARCHAR(200),
  entity_type           VARCHAR(50) NOT NULL
    CHECK (entity_type IN ('federation', 'organization', 'tournament')),
  entity_id             UUID NOT NULL,
  entity_name           VARCHAR(200),
  status                VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('trial', 'active', 'past_due', 'suspended', 'cancelled', 'expired')),
  billing_cycle_type    VARCHAR(20) NOT NULL DEFAULT 'yearly'
    CHECK (billing_cycle_type IN ('monthly', 'yearly')),
  current_period_start  DATE NOT NULL,
  current_period_end    DATE NOT NULL,
  trial_end_date        DATE,
  cancelled_at          TIMESTAMPTZ,
  cancel_reason         TEXT,
  auto_renew            BOOLEAN DEFAULT true,
  payment_method_id     UUID,
  is_deleted            BOOLEAN DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by            UUID,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by            UUID,
  version               INT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, id)
);

-- ── Billing Cycles (Kỳ thanh toán) ──────────────────────────
CREATE TABLE IF NOT EXISTS platform.billing_cycles (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  subscription_id   UUID NOT NULL,
  period_start      DATE NOT NULL,
  period_end        DATE NOT NULL,
  amount            DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
  currency          VARCHAR(10) DEFAULT 'VND',
  invoice_id        UUID,
  status            VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'invoiced', 'paid', 'overdue', 'void')),
  due_date          DATE NOT NULL,
  paid_at           TIMESTAMPTZ,
  is_deleted        BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version           INT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, id)
);

-- ── Renewal Logs (Nhật ký gia hạn) ──────────────────────────
CREATE TABLE IF NOT EXISTS platform.renewal_logs (
  id                UUID DEFAULT uuidv7() NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES core.tenants(id),
  subscription_id   UUID NOT NULL,
  action            VARCHAR(30) NOT NULL
    CHECK (action IN ('auto_renew', 'manual_renew', 'upgrade', 'downgrade', 'cancel', 'suspend', 'reactivate')),
  old_plan_id       UUID,
  new_plan_id       UUID,
  old_status        VARCHAR(20),
  new_status        VARCHAR(20),
  amount            DECIMAL(15,2) DEFAULT 0,
  notes             TEXT,
  performed_by      UUID,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id)
);

-- ── Row-Level Security ──────────────────────────────────────
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'platform.subscription_plans', 'platform.subscriptions',
    'platform.billing_cycles', 'platform.renewal_logs'
  ]) LOOP
    EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %s
        USING (tenant_id = COALESCE(
          current_setting(''app.current_tenant'', true)::UUID,
          ''00000000-0000-7000-8000-000000000001''::UUID
        ))',
      tbl
    );
  END LOOP;
END $$;

-- ── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sub_plans_tenant_type
  ON platform.subscription_plans(tenant_id, entity_type)
  WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_entity
  ON platform.subscriptions(tenant_id, entity_type, entity_id)
  WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_status
  ON platform.subscriptions(tenant_id, status)
  WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_subscriptions_expiring
  ON platform.subscriptions(tenant_id, current_period_end)
  WHERE status = 'active' AND is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_billing_cycles_subscription
  ON platform.billing_cycles(tenant_id, subscription_id)
  WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_billing_cycles_status
  ON platform.billing_cycles(tenant_id, status, due_date)
  WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_renewal_logs_subscription
  ON platform.renewal_logs(tenant_id, subscription_id, created_at DESC);

-- ── Triggers ────────────────────────────────────────────────
DO $$
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'platform.subscription_plans', 'platform.subscriptions',
    'platform.billing_cycles'
  ]) LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %s
        FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()',
      tbl
    );
  END LOOP;
END $$;

COMMIT;


