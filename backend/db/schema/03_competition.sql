-- ═══════════════════════════════════════════════════════════════
-- VCT Platform — Schema Reference: Competition & Scoring
-- PURPOSE: Read-only reference. NOT executed by migration tool.
-- TABLES: combat_matches, form_performances, weigh_ins,
--         match_events, judge_scores, results, medals_summary,
--         referees, arenas, referee_assignments, schedule_entries
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE referees (
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

CREATE TABLE arenas (
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

CREATE TABLE referee_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES referees(id) ON DELETE CASCADE,
  arena_id UUID REFERENCES arenas(id) ON DELETE SET NULL,
  session_date DATE NOT NULL,
  session_shift VARCHAR(10) NOT NULL,
  role VARCHAR(20) DEFAULT 'chinh',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE combat_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  content_category_id UUID REFERENCES content_categories(id),
  weight_class_id UUID REFERENCES weight_classes(id),
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

CREATE TABLE form_performances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
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

CREATE TABLE weigh_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  weight_class_id UUID REFERENCES weight_classes(id),
  can_nang_thuc DECIMAL(5,1) NOT NULL,
  ket_qua VARCHAR(20) NOT NULL DEFAULT 'cho_xu_ly',
  thoi_gian TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  nguoi_can VARCHAR(100),
  ghi_chu TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE match_events (
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

CREATE TABLE judge_scores (
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

CREATE TABLE results (
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

CREATE TABLE medals_summary (
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

CREATE TABLE schedule_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
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

-- Indexes
CREATE INDEX idx_combat_matches_tournament ON combat_matches(tournament_id);
CREATE INDEX idx_combat_matches_status ON combat_matches(trang_thai);
CREATE INDEX idx_form_performances_tournament ON form_performances(tournament_id);
CREATE INDEX idx_schedule_tournament_date ON schedule_entries(tournament_id, ngay);
CREATE INDEX idx_referees_tournament ON referees(tournament_id);
CREATE INDEX idx_arenas_tournament ON arenas(tournament_id);
CREATE INDEX idx_weigh_ins_athlete ON weigh_ins(athlete_id);
CREATE INDEX idx_match_events_match ON match_events(match_id, sequence_number);
CREATE INDEX idx_match_events_type ON match_events(event_type);
CREATE INDEX idx_judge_scores_match ON judge_scores(match_id, round_number);
CREATE INDEX idx_results_tournament ON results(tournament_id);
CREATE INDEX idx_results_athlete ON results(athlete_id);
CREATE INDEX idx_medals_summary_tournament ON medals_summary(tournament_id);
