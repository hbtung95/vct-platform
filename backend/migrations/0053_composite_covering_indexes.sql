-- ===============================================================
-- VCT Platform — Migration 0053: COMPOSITE & COVERING INDEXES
-- P1 High: Optimize query performance for common access patterns
-- ===============================================================

BEGIN;

-- ════════════════════════════════════════════════════════
-- 1. ATHLETES — HIGH-FREQUENCY QUERIES
-- ════════════════════════════════════════════════════════

-- List athletes by tournament + status (admin dashboard)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_athletes_tournament_status
  ON athletes(tournament_id, trang_thai)
  WHERE is_deleted = false;

-- List athletes by club (club management)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_athletes_club
  ON athletes(current_club_id, trang_thai)
  WHERE is_deleted = false AND current_club_id IS NOT NULL;

-- Belt rank filter (common search dimension)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_athletes_belt_rank
  ON athletes(belt_rank_id)
  WHERE is_deleted = false AND belt_rank_id IS NOT NULL;

-- ════════════════════════════════════════════════════════
-- 2. COMBAT MATCHES — LIVE SCORING PATH
-- ════════════════════════════════════════════════════════

-- Matches by tournament + round + status (bracket view)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_tournament_round
  ON combat_matches(tournament_id, vong, trang_thai)
  WHERE is_deleted = false;

-- Active matches in arena (scoring panel)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_arena_active
  ON combat_matches(arena_id, trang_thai)
  WHERE is_deleted = false AND trang_thai IN ('chua_dau', 'dang_dau', 'tam_dung');

-- Match by content category (results display)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_category
  ON combat_matches(content_category_id, tournament_id)
  WHERE is_deleted = false;

-- ════════════════════════════════════════════════════════
-- 3. TOURNAMENTS — COVERING INDEX (avoid heap lookup)
-- ════════════════════════════════════════════════════════

-- Covering index for tournament listing API
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tournaments_covering
  ON tournaments(tenant_id, status, start_date DESC)
  INCLUDE (name, end_date, location)
  WHERE is_deleted = false;

-- Upcoming tournaments
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tournaments_upcoming
  ON tournaments(start_date)
  WHERE is_deleted = false AND status IN ('nhap', 'dang_ky', 'khoa_dk');

-- ════════════════════════════════════════════════════════
-- 4. PAYMENTS — FINANCIAL REPORTING
-- ════════════════════════════════════════════════════════

-- Revenue report: confirmed payments by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_confirmed_date
  ON platform.payments(tenant_id, created_at DESC)
  WHERE status = 'confirmed';

-- Outstanding payments
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_pending
  ON platform.payments(tenant_id, fee_schedule_id)
  WHERE status = 'pending';

-- Invoice lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_status_date
  ON platform.invoices(tenant_id, status, due_date)
  WHERE is_deleted = false;

-- ════════════════════════════════════════════════════════
-- 5. REGISTRATIONS (NEW) — ADMIN WORKFLOW
-- ════════════════════════════════════════════════════════

-- Pending approvals
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_new_reg_pending
  ON tournament_registrations(tournament_id, status)
  WHERE status IN ('nhap', 'cho_duyet');

-- By province for statistics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_new_reg_province
  ON tournament_registrations(province)
  WHERE status = 'da_duyet';

-- ════════════════════════════════════════════════════════
-- 6. COMMUNITY — FEED QUERIES
-- ════════════════════════════════════════════════════════

-- Post feed: latest by tenant
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_feed
  ON platform.posts(tenant_id, created_at DESC)
  WHERE is_deleted = false AND visibility = 'public';

-- Posts by author (profile page)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_author
  ON platform.posts(author_id, created_at DESC)
  WHERE is_deleted = false;

-- Comments on post
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_post
  ON platform.comments(post_id, created_at)
  WHERE is_deleted = false;

-- ════════════════════════════════════════════════════════
-- 7. TRAINING — SCHEDULE QUERIES
-- ════════════════════════════════════════════════════════

-- Training sessions by athlete (calendar view)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_training_sess_athlete_date
  ON training_sessions(athlete_id, date);

-- Belt exams by tenant + date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_belt_exams_tenant_date
  ON training.belt_examinations(tenant_id, exam_date DESC)
  WHERE is_deleted = false;

-- ════════════════════════════════════════════════════════
-- 8. PEOPLE — COACH/MEMBER LOOKUPS
-- ════════════════════════════════════════════════════════

-- Coaches by club
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_coaches_club_status
  ON people.coaches(club_id, status)
  WHERE is_deleted = false;

-- Club memberships active
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_memberships_active
  ON people.club_memberships(club_id, status)
  WHERE status = 'active' AND is_deleted = false;

-- ════════════════════════════════════════════════════════
-- 9. BTC MODULE — TOURNAMENT OPERATIONS
-- ════════════════════════════════════════════════════════

-- Weigh-in by result (quick filter for BTC)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_btc_weigh_result
  ON btc_weigh_ins(giai_id, ket_qua);

-- Protests pending (BTC dashboard)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_btc_protests_pending
  ON btc_protests(giai_id, trang_thai)
  WHERE trang_thai IN ('moi', 'dang_xu_ly');

-- Schedule slots active
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_schedule_active
  ON tournament_schedule_slots(tournament_id, date, session)
  WHERE status != 'hoan';

-- ════════════════════════════════════════════════════════
-- 10. HERITAGE — SEARCH & BROWSE
-- ════════════════════════════════════════════════════════

-- Techniques by school + category
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_heritage_tech_school
  ON platform.heritage_techniques(school_id, category)
  WHERE is_deleted = false;

-- Glossary alphabetical
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_glossary_alpha
  ON platform.heritage_glossary(term_vi)
  WHERE is_deleted = false;

COMMIT;
