package athlete

import (
	"context"
	"fmt"
	"time"
)

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — ATHLETE PROFILE DOMAIN
// Models, repositories, and service for the user-linked athlete
// profile system. VĐV is a ROLE of a User, not a standalone
// entity. This service manages the long-lived athlete profile
// (hồ sơ thể thao), club memberships, and tournament entries.
// ═══════════════════════════════════════════════════════════════

// ── Constants & Enums ────────────────────────────────────────

type ProfileStatus string

const (
	ProfileStatusDraft    ProfileStatus = "draft"
	ProfileStatusActive   ProfileStatus = "active"
	ProfileStatusInactive ProfileStatus = "inactive"
)

type MembershipStatus string

const (
	MembershipStatusPending  MembershipStatus = "pending"
	MembershipStatusActive   MembershipStatus = "active"
	MembershipStatusInactive MembershipStatus = "inactive"
)

type MembershipRole string

const (
	MembershipRoleMember  MembershipRole = "member"
	MembershipRoleCaptain MembershipRole = "captain"
)

type EntryStatus string

const (
	EntryStatusNhap       EntryStatus = "nhap"
	EntryStatusThieuHoSo  EntryStatus = "thieu_ho_so"
	EntryStatusChoXacNhan EntryStatus = "cho_xac_nhan"
	EntryStatusDuDieuKien EntryStatus = "du_dieu_kien"
	EntryStatusBiTuChoi   EntryStatus = "bi_tu_choi"
)

type BeltRank string

const (
	BeltNone   BeltRank = "none"
	BeltYellow BeltRank = "yellow"
	BeltGreen  BeltRank = "green"
	BeltBlue   BeltRank = "blue"
	BeltRed    BeltRank = "red"
	BeltBlack0 BeltRank = "so_dang"
	BeltBlack1 BeltRank = "nhat_dang"
	BeltBlack2 BeltRank = "nhi_dang"
	BeltBlack3 BeltRank = "tam_dang"
	BeltBlack4 BeltRank = "tu_dang"
	BeltBlack5 BeltRank = "ngu_dang"
)

var BeltLabelMap = map[BeltRank]string{
	BeltNone:   "Không đai",
	BeltYellow: "Đai vàng",
	BeltGreen:  "Đai xanh",
	BeltBlue:   "Đai lam",
	BeltRed:    "Đai đỏ",
	BeltBlack0: "Sơ đẳng",
	BeltBlack1: "Nhất đẳng",
	BeltBlack2: "Nhị đẳng",
	BeltBlack3: "Tam đẳng",
	BeltBlack4: "Tứ đẳng",
	BeltBlack5: "Ngũ đẳng",
}

// ── Domain Models ────────────────────────────────────────────

// HoSoChecklist tracks the document checklist for an athlete.
type HoSoChecklist struct {
	KhamSK  bool `json:"kham_sk"`
	BaoHiem bool `json:"bao_hiem"`
	Anh     bool `json:"anh"`
	CMND    bool `json:"cmnd"`
}

// AthleteProfile is the long-lived sports profile linked to a User.
type AthleteProfile struct {
	ID          string        `json:"id"`
	UserID      string        `json:"user_id"`
	FullName    string        `json:"full_name"`
	Gender      string        `json:"gender"`
	DateOfBirth string        `json:"date_of_birth"`
	Weight      float64       `json:"weight"`
	Height      float64       `json:"height"`
	BeltRank    BeltRank      `json:"belt_rank"`
	BeltLabel   string        `json:"belt_label"`
	CoachName   string        `json:"coach_name,omitempty"`
	Phone       string        `json:"phone,omitempty"`
	Email       string        `json:"email,omitempty"`
	PhotoURL    string        `json:"photo_url,omitempty"`
	HoSo        HoSoChecklist `json:"ho_so"`
	Status      ProfileStatus `json:"status"`

	// Stats (denormalized for display)
	TotalClubs       int `json:"total_clubs"`
	TotalTournaments int `json:"total_tournaments"`
	TotalMedals      int `json:"total_medals"`
	EloRating        int `json:"elo_rating"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ClubMembership tracks an athlete's membership in a club/võ đường.
type ClubMembership struct {
	ID         string           `json:"id"`
	AthleteID  string           `json:"athlete_id"`
	ClubID     string           `json:"club_id"`
	ClubName   string           `json:"club_name"`
	Role       MembershipRole   `json:"role"`
	JoinDate   string           `json:"join_date"`
	Status     MembershipStatus `json:"status"`
	CoachName  string           `json:"coach_name,omitempty"`
	ProvinceID string           `json:"province_id,omitempty"`
	CreatedAt  time.Time        `json:"created_at"`
	UpdatedAt  time.Time        `json:"updated_at"`
}

// TournamentEntry represents an athlete's registration for a specific tournament.
type TournamentEntry struct {
	ID             string        `json:"id"`
	AthleteID      string        `json:"athlete_id"`
	AthleteName    string        `json:"athlete_name"`
	TournamentID   string        `json:"tournament_id"`
	TournamentName string        `json:"tournament_name"`
	DoanID         string        `json:"doan_id"`
	DoanName       string        `json:"doan_name"`
	Categories     []string      `json:"categories"`
	HoSo           HoSoChecklist `json:"ho_so"`
	Status         EntryStatus   `json:"status"`
	WeighInResult  string        `json:"weigh_in_result,omitempty"`
	StartDate      string        `json:"start_date,omitempty"`
	Notes          string        `json:"notes,omitempty"`
	CreatedAt      time.Time     `json:"created_at"`
	UpdatedAt      time.Time     `json:"updated_at"`
}

// ── Repository Interfaces ────────────────────────────────────

type AthleteProfileRepository interface {
	List(ctx context.Context) ([]AthleteProfile, error)
	GetByID(ctx context.Context, id string) (*AthleteProfile, error)
	GetByUserID(ctx context.Context, userID string) (*AthleteProfile, error)
	ListByClub(ctx context.Context, clubID string) ([]AthleteProfile, error)
	Create(ctx context.Context, p AthleteProfile) (*AthleteProfile, error)
	Update(ctx context.Context, id string, patch map[string]interface{}) error
	Delete(ctx context.Context, id string) error
}

type ClubMembershipRepository interface {
	List(ctx context.Context) ([]ClubMembership, error)
	ListByAthlete(ctx context.Context, athleteID string) ([]ClubMembership, error)
	ListByClub(ctx context.Context, clubID string) ([]ClubMembership, error)
	GetByID(ctx context.Context, id string) (*ClubMembership, error)
	Create(ctx context.Context, m ClubMembership) (*ClubMembership, error)
	Update(ctx context.Context, id string, patch map[string]interface{}) error
	Delete(ctx context.Context, id string) error
}

type TournamentEntryRepository interface {
	List(ctx context.Context) ([]TournamentEntry, error)
	ListByAthlete(ctx context.Context, athleteID string) ([]TournamentEntry, error)
	ListByTournament(ctx context.Context, tournamentID string) ([]TournamentEntry, error)
	GetByID(ctx context.Context, id string) (*TournamentEntry, error)
	Create(ctx context.Context, e TournamentEntry) (*TournamentEntry, error)
	Update(ctx context.Context, id string, patch map[string]interface{}) error
	Delete(ctx context.Context, id string) error
}

// ── Profile Service ──────────────────────────────────────────

type ProfileService struct {
	profiles    AthleteProfileRepository
	memberships ClubMembershipRepository
	entries     TournamentEntryRepository
	newID       func() string
}

func NewProfileService(
	profiles AthleteProfileRepository,
	memberships ClubMembershipRepository,
	entries TournamentEntryRepository,
	newID func() string,
) *ProfileService {
	return &ProfileService{
		profiles:    profiles,
		memberships: memberships,
		entries:     entries,
		newID:       newID,
	}
}

// ── Profile Methods ──────────────────────────────────────────

func (s *ProfileService) CreateProfile(ctx context.Context, p AthleteProfile) (*AthleteProfile, error) {
	if p.FullName == "" {
		return nil, fmt.Errorf("full_name is required")
	}
	if p.UserID == "" {
		return nil, fmt.Errorf("user_id is required")
	}
	if p.ID == "" {
		p.ID = s.newID()
	}
	if p.Status == "" {
		p.Status = ProfileStatusDraft
	}
	p.BeltLabel = BeltLabelMap[p.BeltRank]
	now := time.Now().UTC()
	p.CreatedAt = now
	p.UpdatedAt = now
	return s.profiles.Create(ctx, p)
}

func (s *ProfileService) GetProfile(ctx context.Context, id string) (*AthleteProfile, error) {
	return s.profiles.GetByID(ctx, id)
}

func (s *ProfileService) GetByUserID(ctx context.Context, userID string) (*AthleteProfile, error) {
	return s.profiles.GetByUserID(ctx, userID)
}

func (s *ProfileService) ListProfiles(ctx context.Context) ([]AthleteProfile, error) {
	return s.profiles.List(ctx)
}

func (s *ProfileService) ListByClub(ctx context.Context, clubID string) ([]AthleteProfile, error) {
	return s.profiles.ListByClub(ctx, clubID)
}

func (s *ProfileService) UpdateProfile(ctx context.Context, id string, patch map[string]interface{}) error {
	patch["updated_at"] = time.Now().UTC()
	return s.profiles.Update(ctx, id, patch)
}

func (s *ProfileService) DeleteProfile(ctx context.Context, id string) error {
	return s.profiles.Delete(ctx, id)
}

// ── Club Membership Methods ──────────────────────────────────

func (s *ProfileService) JoinClub(ctx context.Context, m ClubMembership) (*ClubMembership, error) {
	if m.AthleteID == "" {
		return nil, fmt.Errorf("athlete_id is required")
	}
	if m.ClubID == "" {
		return nil, fmt.Errorf("club_id is required")
	}
	if m.ID == "" {
		m.ID = s.newID()
	}
	if m.Role == "" {
		m.Role = MembershipRoleMember
	}
	if m.Status == "" {
		m.Status = MembershipStatusPending
	}
	now := time.Now().UTC()
	m.CreatedAt = now
	m.UpdatedAt = now
	return s.memberships.Create(ctx, m)
}

func (s *ProfileService) ListMyClubs(ctx context.Context, athleteID string) ([]ClubMembership, error) {
	return s.memberships.ListByAthlete(ctx, athleteID)
}

func (s *ProfileService) ListClubMembers(ctx context.Context, clubID string) ([]ClubMembership, error) {
	return s.memberships.ListByClub(ctx, clubID)
}

func (s *ProfileService) LeaveClub(ctx context.Context, id string) error {
	return s.memberships.Delete(ctx, id)
}

func (s *ProfileService) UpdateMembership(ctx context.Context, id string, patch map[string]interface{}) error {
	patch["updated_at"] = time.Now().UTC()
	return s.memberships.Update(ctx, id, patch)
}

// ── Tournament Entry Methods ─────────────────────────────────

func (s *ProfileService) EnterTournament(ctx context.Context, e TournamentEntry) (*TournamentEntry, error) {
	if e.AthleteID == "" {
		return nil, fmt.Errorf("athlete_id is required")
	}
	if e.TournamentID == "" {
		return nil, fmt.Errorf("tournament_id is required")
	}
	if e.ID == "" {
		e.ID = s.newID()
	}
	if e.Status == "" {
		e.Status = EntryStatusNhap
	}
	now := time.Now().UTC()
	e.CreatedAt = now
	e.UpdatedAt = now
	return s.entries.Create(ctx, e)
}

func (s *ProfileService) GetEntry(ctx context.Context, id string) (*TournamentEntry, error) {
	return s.entries.GetByID(ctx, id)
}

func (s *ProfileService) ListMyTournaments(ctx context.Context, athleteID string) ([]TournamentEntry, error) {
	return s.entries.ListByAthlete(ctx, athleteID)
}

func (s *ProfileService) ListByTournament(ctx context.Context, tournamentID string) ([]TournamentEntry, error) {
	return s.entries.ListByTournament(ctx, tournamentID)
}

func (s *ProfileService) UpdateEntryStatus(ctx context.Context, id string, status EntryStatus) error {
	return s.entries.Update(ctx, id, map[string]interface{}{
		"status":     string(status),
		"updated_at": time.Now().UTC(),
	})
}

func (s *ProfileService) ApproveEntry(ctx context.Context, id string) error {
	return s.UpdateEntryStatus(ctx, id, EntryStatusDuDieuKien)
}

func (s *ProfileService) RejectEntry(ctx context.Context, id string) error {
	return s.UpdateEntryStatus(ctx, id, EntryStatusBiTuChoi)
}
