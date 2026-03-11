package athlete

import (
	"context"
	"fmt"
	"sync"
	"time"

	"vct-platform/backend/internal/auth"
)

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — ATHLETE PROFILE IN-MEMORY STORES
// In-memory implementations of athlete profile repositories
// with seed data linking to existing User accounts.
// ═══════════════════════════════════════════════════════════════

// ── AthleteProfile Store ─────────────────────────────────────

type InMemProfileStore struct {
	mu    sync.RWMutex
	items map[string]AthleteProfile
}

func NewInMemProfileStore() *InMemProfileStore {
	s := &InMemProfileStore{items: make(map[string]AthleteProfile)}
	s.seed()
	return s
}

func (s *InMemProfileStore) seed() {
	now := time.Now().UTC()
	for _, p := range []AthleteProfile{
		{
			ID: "AP-001", UserID: auth.DemoAthleteUserID,
			FullName: "Nguyễn Hoàng Nam", Gender: "nam", DateOfBirth: "2003-05-12",
			Weight: 60, Height: 170, BeltRank: BeltBlack2, BeltLabel: "Nhị đẳng",
			CoachName: "Võ Minh Đức", Phone: "0901234001", Email: "nam.nguyen@email.com",
			HoSo:   HoSoChecklist{KhamSK: true, BaoHiem: true, Anh: true, CMND: true},
			Status: ProfileStatusActive, TotalClubs: 1, TotalTournaments: 5, TotalMedals: 3, EloRating: 1520,
			CreatedAt: now, UpdatedAt: now,
		},
		{
			ID: "AP-002", UserID: "user-athlete-002",
			FullName: "Trần Minh Tú", Gender: "nu", DateOfBirth: "2005-07-22",
			Weight: 52, Height: 162, BeltRank: BeltBlack1, BeltLabel: "Nhất đẳng",
			CoachName: "Võ Minh Đức", Phone: "0901234002", Email: "tu.tran@email.com",
			HoSo:   HoSoChecklist{KhamSK: true, BaoHiem: true, Anh: true, CMND: true},
			Status: ProfileStatusActive, TotalClubs: 1, TotalTournaments: 3, TotalMedals: 2, EloRating: 1450,
			CreatedAt: now, UpdatedAt: now,
		},
		{
			ID: "AP-003", UserID: "user-athlete-003",
			FullName: "Lê Văn Hùng", Gender: "nam", DateOfBirth: "2004-11-08",
			Weight: 68, Height: 175, BeltRank: BeltBlack3, BeltLabel: "Tam đẳng",
			CoachName: "Bùi Thị Hoa", Phone: "0901234003",
			HoSo:   HoSoChecklist{KhamSK: true, BaoHiem: true, Anh: true, CMND: true},
			Status: ProfileStatusActive, TotalClubs: 1, TotalTournaments: 8, TotalMedals: 5, EloRating: 1680,
			CreatedAt: now, UpdatedAt: now,
		},
		{
			ID: "AP-004", UserID: "user-athlete-004",
			FullName: "Phạm Thị Lan", Gender: "nu", DateOfBirth: "2007-01-30",
			Weight: 48, Height: 158, BeltRank: BeltBlack0, BeltLabel: "Sơ đẳng",
			Phone:  "0901234004",
			HoSo:   HoSoChecklist{KhamSK: true, BaoHiem: false, Anh: true, CMND: false},
			Status: ProfileStatusDraft, TotalClubs: 1, TotalTournaments: 0, TotalMedals: 0, EloRating: 1200,
			CreatedAt: now, UpdatedAt: now,
		},
		{
			ID: "AP-005", UserID: "user-athlete-005",
			FullName: "Đặng Quốc Việt", Gender: "nam", DateOfBirth: "2003-05-12",
			Weight: 72, Height: 178, BeltRank: BeltBlack3, BeltLabel: "Tam đẳng",
			CoachName: "Ngô Thanh Tùng", Phone: "0901234005", Email: "viet.dang@email.com",
			HoSo:   HoSoChecklist{KhamSK: true, BaoHiem: true, Anh: true, CMND: true},
			Status: ProfileStatusActive, TotalClubs: 2, TotalTournaments: 12, TotalMedals: 7, EloRating: 1750,
			CreatedAt: now, UpdatedAt: now,
		},
		{
			ID: "AP-006", UserID: "user-athlete-006",
			FullName: "Hoàng Thị Mai", Gender: "nu", DateOfBirth: "2005-09-18",
			Weight: 55, Height: 165, BeltRank: BeltBlack2, BeltLabel: "Nhị đẳng",
			CoachName: "Đinh Thị Ngọc", Phone: "0901234006",
			HoSo:   HoSoChecklist{KhamSK: true, BaoHiem: true, Anh: true, CMND: true},
			Status: ProfileStatusActive, TotalClubs: 1, TotalTournaments: 6, TotalMedals: 4, EloRating: 1580,
			CreatedAt: now, UpdatedAt: now,
		},
		{
			ID: "AP-007", UserID: "user-athlete-007",
			FullName: "Bùi Thanh Phong", Gender: "nam", DateOfBirth: "2006-02-14",
			Weight: 56, Height: 168, BeltRank: BeltRed, BeltLabel: "Đai đỏ",
			Phone:  "0901234007",
			HoSo:   HoSoChecklist{KhamSK: true, BaoHiem: true, Anh: false, CMND: true},
			Status: ProfileStatusActive, TotalClubs: 1, TotalTournaments: 2, TotalMedals: 1, EloRating: 1350,
			CreatedAt: now, UpdatedAt: now,
		},
		{
			ID: "AP-008", UserID: "user-athlete-008",
			FullName: "Vũ Ngọc Hà", Gender: "nu", DateOfBirth: "2008-12-05",
			Weight: 45, Height: 155, BeltRank: BeltGreen, BeltLabel: "Đai xanh",
			CoachName: "Ngô Thanh Tùng", Phone: "0901234008",
			HoSo:   HoSoChecklist{KhamSK: false, BaoHiem: false, Anh: false, CMND: false},
			Status: ProfileStatusDraft, TotalClubs: 1, TotalTournaments: 0, TotalMedals: 0, EloRating: 1100,
			CreatedAt: now, UpdatedAt: now,
		},
	} {
		s.items[p.ID] = p
	}
}

func (s *InMemProfileStore) List(_ context.Context) ([]AthleteProfile, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]AthleteProfile, 0, len(s.items))
	for _, p := range s.items {
		result = append(result, p)
	}
	return result, nil
}

func (s *InMemProfileStore) GetByID(_ context.Context, id string) (*AthleteProfile, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	p, ok := s.items[id]
	if !ok {
		return nil, fmt.Errorf("athlete profile not found: %s", id)
	}
	return &p, nil
}

func (s *InMemProfileStore) GetByUserID(_ context.Context, userID string) (*AthleteProfile, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, p := range s.items {
		if p.UserID == userID {
			return &p, nil
		}
	}
	return nil, fmt.Errorf("athlete profile not found for user: %s", userID)
}

func (s *InMemProfileStore) ListByClub(_ context.Context, clubID string) ([]AthleteProfile, error) {
	// For in-memory, we'd need cross-reference with memberships.
	// Return all for now — handler will filter.
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]AthleteProfile, 0)
	for _, p := range s.items {
		result = append(result, p)
	}
	return result, nil
}

func (s *InMemProfileStore) Create(_ context.Context, p AthleteProfile) (*AthleteProfile, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.items[p.ID] = p
	return &p, nil
}

func (s *InMemProfileStore) Update(_ context.Context, id string, patch map[string]interface{}) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	p, ok := s.items[id]
	if !ok {
		return fmt.Errorf("athlete profile not found: %s", id)
	}
	if v, ok := patch["full_name"].(string); ok {
		p.FullName = v
	}
	if v, ok := patch["weight"].(float64); ok {
		p.Weight = v
	}
	if v, ok := patch["height"].(float64); ok {
		p.Height = v
	}
	if v, ok := patch["belt_rank"].(string); ok {
		p.BeltRank = BeltRank(v)
		p.BeltLabel = BeltLabelMap[p.BeltRank]
	}
	if v, ok := patch["phone"].(string); ok {
		p.Phone = v
	}
	if v, ok := patch["email"].(string); ok {
		p.Email = v
	}
	if v, ok := patch["photo_url"].(string); ok {
		p.PhotoURL = v
	}
	if v, ok := patch["status"].(string); ok {
		p.Status = ProfileStatus(v)
	}
	if v, ok := patch["updated_at"].(time.Time); ok {
		p.UpdatedAt = v
	}
	s.items[id] = p
	return nil
}

func (s *InMemProfileStore) Delete(_ context.Context, id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.items, id)
	return nil
}

// ── ClubMembership Store ─────────────────────────────────────

type InMemMembershipStore struct {
	mu    sync.RWMutex
	items map[string]ClubMembership
}

func NewInMemMembershipStore() *InMemMembershipStore {
	s := &InMemMembershipStore{items: make(map[string]ClubMembership)}
	s.seed()
	return s
}

func (s *InMemMembershipStore) seed() {
	now := time.Now().UTC()
	for _, m := range []ClubMembership{
		{ID: "CM-001", AthleteID: "AP-001", ClubID: "CLB-HCM-001", ClubName: "CLB Võ cổ truyền Quận 1", Role: MembershipRoleMember, JoinDate: "2020-01-15", Status: MembershipStatusActive, CoachName: "Võ Minh Đức", ProvinceID: "PROV-HCM", CreatedAt: now, UpdatedAt: now},
		{ID: "CM-002", AthleteID: "AP-002", ClubID: "CLB-HCM-001", ClubName: "CLB Võ cổ truyền Quận 1", Role: MembershipRoleMember, JoinDate: "2021-03-10", Status: MembershipStatusActive, CoachName: "Võ Minh Đức", ProvinceID: "PROV-HCM", CreatedAt: now, UpdatedAt: now},
		{ID: "CM-003", AthleteID: "AP-003", ClubID: "CLB-HCM-002", ClubName: "CLB Võ cổ truyền Thủ Đức", Role: MembershipRoleCaptain, JoinDate: "2019-06-20", Status: MembershipStatusActive, CoachName: "Bùi Thị Hoa", ProvinceID: "PROV-HCM", CreatedAt: now, UpdatedAt: now},
		{ID: "CM-004", AthleteID: "AP-004", ClubID: "CLB-HCM-003", ClubName: "CLB Võ cổ truyền Bình Thạnh", Role: MembershipRoleMember, JoinDate: "2025-12-01", Status: MembershipStatusPending, ProvinceID: "PROV-HCM", CreatedAt: now, UpdatedAt: now},
		{ID: "CM-005", AthleteID: "AP-005", ClubID: "CLB-HN-001", ClubName: "CLB Võ cổ truyền Hoàn Kiếm", Role: MembershipRoleCaptain, JoinDate: "2018-02-10", Status: MembershipStatusActive, CoachName: "Ngô Thanh Tùng", ProvinceID: "PROV-HN", CreatedAt: now, UpdatedAt: now},
		{ID: "CM-006", AthleteID: "AP-005", ClubID: "CLB-HN-002", ClubName: "CLB Võ cổ truyền Cầu Giấy", Role: MembershipRoleMember, JoinDate: "2023-09-01", Status: MembershipStatusActive, ProvinceID: "PROV-HN", CreatedAt: now, UpdatedAt: now},
		{ID: "CM-007", AthleteID: "AP-006", ClubID: "CLB-HN-002", ClubName: "CLB Võ cổ truyền Cầu Giấy", Role: MembershipRoleMember, JoinDate: "2020-08-15", Status: MembershipStatusActive, CoachName: "Đinh Thị Ngọc", ProvinceID: "PROV-HN", CreatedAt: now, UpdatedAt: now},
		{ID: "CM-008", AthleteID: "AP-007", ClubID: "CLB-HCM-002", ClubName: "CLB Võ cổ truyền Thủ Đức", Role: MembershipRoleMember, JoinDate: "2022-04-01", Status: MembershipStatusActive, CoachName: "Bùi Thị Hoa", ProvinceID: "PROV-HCM", CreatedAt: now, UpdatedAt: now},
		{ID: "CM-009", AthleteID: "AP-008", ClubID: "CLB-HN-001", ClubName: "CLB Võ cổ truyền Hoàn Kiếm", Role: MembershipRoleMember, JoinDate: "2024-06-01", Status: MembershipStatusActive, CoachName: "Ngô Thanh Tùng", ProvinceID: "PROV-HN", CreatedAt: now, UpdatedAt: now},
	} {
		s.items[m.ID] = m
	}
}

func (s *InMemMembershipStore) List(_ context.Context) ([]ClubMembership, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]ClubMembership, 0, len(s.items))
	for _, m := range s.items {
		result = append(result, m)
	}
	return result, nil
}

func (s *InMemMembershipStore) ListByAthlete(_ context.Context, athleteID string) ([]ClubMembership, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var result []ClubMembership
	for _, m := range s.items {
		if m.AthleteID == athleteID {
			result = append(result, m)
		}
	}
	return result, nil
}

func (s *InMemMembershipStore) ListByClub(_ context.Context, clubID string) ([]ClubMembership, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var result []ClubMembership
	for _, m := range s.items {
		if m.ClubID == clubID {
			result = append(result, m)
		}
	}
	return result, nil
}

func (s *InMemMembershipStore) GetByID(_ context.Context, id string) (*ClubMembership, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	m, ok := s.items[id]
	if !ok {
		return nil, fmt.Errorf("club membership not found: %s", id)
	}
	return &m, nil
}

func (s *InMemMembershipStore) Create(_ context.Context, m ClubMembership) (*ClubMembership, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.items[m.ID] = m
	return &m, nil
}

func (s *InMemMembershipStore) Update(_ context.Context, id string, patch map[string]interface{}) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	m, ok := s.items[id]
	if !ok {
		return fmt.Errorf("club membership not found: %s", id)
	}
	if v, ok := patch["status"].(string); ok {
		m.Status = MembershipStatus(v)
	}
	if v, ok := patch["role"].(string); ok {
		m.Role = MembershipRole(v)
	}
	if v, ok := patch["updated_at"].(time.Time); ok {
		m.UpdatedAt = v
	}
	s.items[id] = m
	return nil
}

func (s *InMemMembershipStore) Delete(_ context.Context, id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.items, id)
	return nil
}

// ── TournamentEntry Store ────────────────────────────────────

type InMemEntryStore struct {
	mu    sync.RWMutex
	items map[string]TournamentEntry
}

func NewInMemEntryStore() *InMemEntryStore {
	s := &InMemEntryStore{items: make(map[string]TournamentEntry)}
	s.seed()
	return s
}

func (s *InMemEntryStore) seed() {
	now := time.Now().UTC()
	for _, e := range []TournamentEntry{
		{
			ID: "TE-001", AthleteID: "AP-001", AthleteName: "Nguyễn Hoàng Nam",
			TournamentID: "T-VDQG-2026", TournamentName: "Giải VĐQG Võ cổ truyền 2026",
			DoanID: "DOAN-HCM", DoanName: "Đoàn TP.HCM",
			Categories: []string{"Đối kháng 60kg Nam", "Quyền thuật Nam"},
			HoSo:       HoSoChecklist{KhamSK: true, BaoHiem: true, Anh: true, CMND: true},
			Status:     EntryStatusDuDieuKien, StartDate: "2026-06-15",
			CreatedAt: now, UpdatedAt: now,
		},
		{
			ID: "TE-002", AthleteID: "AP-002", AthleteName: "Trần Minh Tú",
			TournamentID: "T-VDQG-2026", TournamentName: "Giải VĐQG Võ cổ truyền 2026",
			DoanID: "DOAN-HCM", DoanName: "Đoàn TP.HCM",
			Categories: []string{"Đối kháng 52kg Nữ"},
			HoSo:       HoSoChecklist{KhamSK: true, BaoHiem: true, Anh: true, CMND: true},
			Status:     EntryStatusDuDieuKien, StartDate: "2026-06-15",
			CreatedAt: now, UpdatedAt: now,
		},
		{
			ID: "TE-003", AthleteID: "AP-003", AthleteName: "Lê Văn Hùng",
			TournamentID: "T-VDQG-2026", TournamentName: "Giải VĐQG Võ cổ truyền 2026",
			DoanID: "DOAN-HCM", DoanName: "Đoàn TP.HCM",
			Categories: []string{"Đối kháng 68kg Nam", "Binh khí Nam"},
			HoSo:       HoSoChecklist{KhamSK: true, BaoHiem: true, Anh: true, CMND: true},
			Status:     EntryStatusChoXacNhan, StartDate: "2026-06-15",
			CreatedAt: now, UpdatedAt: now,
		},
		{
			ID: "TE-004", AthleteID: "AP-005", AthleteName: "Đặng Quốc Việt",
			TournamentID: "T-VDQG-2026", TournamentName: "Giải VĐQG Võ cổ truyền 2026",
			DoanID: "DOAN-HN", DoanName: "Đoàn Hà Nội",
			Categories: []string{"Đối kháng 72kg Nam", "Quyền thuật Nam", "Binh khí Nam"},
			HoSo:       HoSoChecklist{KhamSK: true, BaoHiem: true, Anh: true, CMND: true},
			Status:     EntryStatusDuDieuKien, StartDate: "2026-06-15",
			CreatedAt: now, UpdatedAt: now,
		},
		{
			ID: "TE-005", AthleteID: "AP-006", AthleteName: "Hoàng Thị Mai",
			TournamentID: "T-VDQG-2026", TournamentName: "Giải VĐQG Võ cổ truyền 2026",
			DoanID: "DOAN-HN", DoanName: "Đoàn Hà Nội",
			Categories: []string{"Đối kháng 55kg Nữ", "Quyền thuật Nữ"},
			HoSo:       HoSoChecklist{KhamSK: true, BaoHiem: true, Anh: false, CMND: true},
			Status:     EntryStatusThieuHoSo, StartDate: "2026-06-15",
			CreatedAt: now, UpdatedAt: now,
		},
		{
			ID: "TE-006", AthleteID: "AP-007", AthleteName: "Bùi Thanh Phong",
			TournamentID: "T-HCMOPEN-2026", TournamentName: "Giải Mở rộng TP.HCM 2026",
			DoanID: "DOAN-HCM", DoanName: "Đoàn TP.HCM",
			Categories: []string{"Đối kháng 56kg Nam"},
			HoSo:       HoSoChecklist{KhamSK: true, BaoHiem: true, Anh: false, CMND: true},
			Status:     EntryStatusThieuHoSo, StartDate: "2026-04-20",
			CreatedAt: now, UpdatedAt: now,
		},
		{
			ID: "TE-007", AthleteID: "AP-001", AthleteName: "Nguyễn Hoàng Nam",
			TournamentID: "T-HCMOPEN-2026", TournamentName: "Giải Mở rộng TP.HCM 2026",
			DoanID: "DOAN-HCM", DoanName: "Đoàn TP.HCM",
			Categories: []string{"Đối kháng 60kg Nam"},
			HoSo:       HoSoChecklist{KhamSK: true, BaoHiem: true, Anh: true, CMND: true},
			Status:     EntryStatusNhap, StartDate: "2026-04-20",
			CreatedAt: now, UpdatedAt: now,
		},
	} {
		s.items[e.ID] = e
	}
}

func (s *InMemEntryStore) List(_ context.Context) ([]TournamentEntry, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]TournamentEntry, 0, len(s.items))
	for _, e := range s.items {
		result = append(result, e)
	}
	return result, nil
}

func (s *InMemEntryStore) ListByAthlete(_ context.Context, athleteID string) ([]TournamentEntry, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var result []TournamentEntry
	for _, e := range s.items {
		if e.AthleteID == athleteID {
			result = append(result, e)
		}
	}
	return result, nil
}

func (s *InMemEntryStore) ListByTournament(_ context.Context, tournamentID string) ([]TournamentEntry, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var result []TournamentEntry
	for _, e := range s.items {
		if e.TournamentID == tournamentID {
			result = append(result, e)
		}
	}
	return result, nil
}

func (s *InMemEntryStore) GetByID(_ context.Context, id string) (*TournamentEntry, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	e, ok := s.items[id]
	if !ok {
		return nil, fmt.Errorf("tournament entry not found: %s", id)
	}
	return &e, nil
}

func (s *InMemEntryStore) Create(_ context.Context, e TournamentEntry) (*TournamentEntry, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.items[e.ID] = e
	return &e, nil
}

func (s *InMemEntryStore) Update(_ context.Context, id string, patch map[string]interface{}) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	e, ok := s.items[id]
	if !ok {
		return fmt.Errorf("tournament entry not found: %s", id)
	}
	if v, ok := patch["status"].(string); ok {
		e.Status = EntryStatus(v)
	}
	if v, ok := patch["weigh_in_result"].(string); ok {
		e.WeighInResult = v
	}
	if v, ok := patch["notes"].(string); ok {
		e.Notes = v
	}
	if v, ok := patch["updated_at"].(time.Time); ok {
		e.UpdatedAt = v
	}
	s.items[id] = e
	return nil
}

func (s *InMemEntryStore) Delete(_ context.Context, id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.items, id)
	return nil
}
