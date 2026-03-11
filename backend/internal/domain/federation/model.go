package federation

import "time"

// Role Type Constraints
type FederationRole string

const (
	RoleSystemAdmin         FederationRole = "system_admin"
	RoleFederationPresident FederationRole = "federation_president"
	RoleFederationSecretary FederationRole = "federation_secretary"
	RoleNationalReferee     FederationRole = "national_referee"
	RoleNationalCoach       FederationRole = "national_coach"
)

// -------------------------------------------------------------
// ORGANIZATION MODELS
// -------------------------------------------------------------

type OrganizationType string

const (
	OrgTypeNational   OrganizationType = "NATIONAL"   // Liên đoàn Quốc gia
	OrgTypeProvincial OrganizationType = "PROVINCIAL" // Hội Võ thuật tỉnh/TP
	OrgTypeSector     OrganizationType = "SECTOR"     // Hệ phái, Môn phái đặc thù
)

type OrganizationStatus string

const (
	OrgStatusActive    OrganizationStatus = "ACTIVE"
	OrgStatusSuspended OrganizationStatus = "SUSPENDED"
	OrgStatusInactive  OrganizationStatus = "INACTIVE"
)

// Organization represents a member entity within the national federation (e.g. Provincial Association)
type Organization struct {
	ID              string             `json:"id"`
	Type            OrganizationType   `json:"type"`          // NATIONAL, PROVINCIAL, SECTOR
	Name            string             `json:"name"`          // e.g. Hội Võ thuật TP Hồ Chí Minh
	Abbreviation    string             `json:"abbreviation"`  // e.g. VCT-HCM
	Region          string             `json:"region"`        // e.g. Miền Nam
	ProvinceID      *string            `json:"province_id"`   // Ref to Province logic (if applicable)
	ContactName     string             `json:"contact_name"`  // Tên người đại diện
	ContactPhone    string             `json:"contact_phone"` // SĐT liên hệ
	ContactEmail    string             `json:"contact_email"`
	Address         string             `json:"address"`
	Status          OrganizationStatus `json:"status"`
	EstablishedDate string             `json:"established_date"` // YYYY-MM-DD
	CreatedAt       time.Time          `json:"created_at"`
	UpdatedAt       time.Time          `json:"updated_at"`
}

// -------------------------------------------------------------
// MASTER DATA (DANH MỤC CHUẨN)
// Supports hierarchical scope: National → Provincial → School
// National = chuẩn phổ biến toàn quốc
// Provincial = kế thừa quốc gia hoặc tự thiết lập riêng
// School = kế thừa quốc gia/tỉnh hoặc quy định riêng môn phái
// -------------------------------------------------------------

type BeltSystemScope string

const (
	BeltScopeNational   BeltSystemScope = "NATIONAL"   // Liên đoàn Quốc gia
	BeltScopeProvincial BeltSystemScope = "PROVINCIAL" // Cấp tỉnh/thành phố
	BeltScopeSchool     BeltSystemScope = "SCHOOL"     // Môn phái / Võ đường
)

// MasterBelt represents the standard belt ranking system.
// Scope determines which level defined this entry (national, provincial, school).
type MasterBelt struct {
	Level           int             `json:"level"`              // Sort order/rank (e.g., 1 for lowest)
	Name            string          `json:"name"`               // e.g. "Đai trắng", "Đai đen 1 đẳng"
	ColorHex        string          `json:"color_hex"`          // UI visual color
	RequiredTimeMin int             `json:"required_time_min"`  // Minimum months required training to reach this level
	IsDanLevel      bool            `json:"is_dan_level"`       // True if it's a black belt equivalent (đẳng cấp)
	Description     string          `json:"description"`        // Mô tả / ghi chú quy chế
	Scope           BeltSystemScope `json:"scope"`              // NATIONAL, PROVINCIAL, SCHOOL
	ScopeID         string          `json:"scope_id,omitempty"` // ID of province/school (empty for national)
	InheritsFrom    string          `json:"inherits_from,omitempty"` // Parent scope ID (empty = standalone)
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`
}

// MasterWeightClass represents the standardized weight classes for tournaments
type MasterWeightClass struct {
	ID           string          `json:"id"`
	Gender       string          `json:"gender"`                    // MALE, FEMALE
	Category     string          `json:"category"`                  // Kyorugi (Đối kháng), etc.
	MinWeight    float64         `json:"min_weight"`                // in kg (0 if no lower bound)
	MaxWeight    float64         `json:"max_weight"`                // in kg (e.g. 50.0 means Under 50kg)
	IsHeavy      bool            `json:"is_heavy"`                  // True if it's the 80+ kg open category
	Scope        BeltSystemScope `json:"scope"`                     // NATIONAL, PROVINCIAL, SCHOOL
	ScopeID      string          `json:"scope_id,omitempty"`        // ID of province/school
	InheritsFrom string          `json:"inherits_from,omitempty"`   // Parent scope ID
	CreatedAt    time.Time       `json:"created_at"`
	UpdatedAt    time.Time       `json:"updated_at"`
}

// MasterAgeGroup represents the standardized age brackets for competitors
type MasterAgeGroup struct {
	ID           string          `json:"id"`
	Name         string          `json:"name"`                      // e.g. "U15", "Youth", "Senior"
	MinAge       int             `json:"min_age"`
	MaxAge       int             `json:"max_age"`
	Scope        BeltSystemScope `json:"scope"`                     // NATIONAL, PROVINCIAL, SCHOOL
	ScopeID      string          `json:"scope_id,omitempty"`        // ID of province/school
	InheritsFrom string          `json:"inherits_from,omitempty"`   // Parent scope ID
	CreatedAt    time.Time       `json:"created_at"`
	UpdatedAt    time.Time       `json:"updated_at"`
}

// -------------------------------------------------------------
// COMPETITION CONTENT TYPES (NỘI DUNG THI ĐẤU)
// Theo Quy chế 2021-QC01, Chương III
// -------------------------------------------------------------

type CompetitionContentType string

const (
	ContentDoiKhang      CompetitionContentType = "doi_khang"            // Đối kháng (1 vs 1, có hạng cân)
	ContentQuyen         CompetitionContentType = "quyen"                // Quyền (bài quyền cá nhân)
	ContentQuyenDongDoi  CompetitionContentType = "quyen_dong_doi"       // Quyền đồng đội (3-5 người)
	ContentSongLuyen     CompetitionContentType = "song_luyen"           // Song luyện (2 người đấu mẫu)
	ContentNhieuLuyen    CompetitionContentType = "nhieu_luyen"          // Nhiều luyện (3+ người đấu mẫu)
	ContentBinhKhi       CompetitionContentType = "binh_khi"             // Binh khí (quyền binh khí)
	ContentVuKhiDoiLuyen CompetitionContentType = "vu_khi_doi_luyen"    // Vũ khí đối luyện
	ContentBieuDien      CompetitionContentType = "bieu_dien_chien_luoc" // Biểu diễn chiến lược
	ContentTuVe          CompetitionContentType = "tu_ve"                // Tự vệ
)

// MasterCompetitionContent represents a standardized competition event type.
type MasterCompetitionContent struct {
	ID             string                 `json:"id"`
	Code           CompetitionContentType `json:"code"`
	Name           string                 `json:"name"`
	Description    string                 `json:"description"`
	RequiresWeight bool                   `json:"requires_weight"`  // Đối kháng cần hạng cân
	IsTeamEvent    bool                   `json:"is_team_event"`    // Nội dung đồng đội
	MinAthletes    int                    `json:"min_athletes"`     // Số VĐV tối thiểu
	MaxAthletes    int                    `json:"max_athletes"`     // Số VĐV tối đa
	HasWeapon      bool                   `json:"has_weapon"`       // Có sử dụng binh khí
	Scope          BeltSystemScope        `json:"scope"`            // NATIONAL, PROVINCIAL, SCHOOL
	ScopeID        string                 `json:"scope_id,omitempty"`
	CreatedAt      time.Time              `json:"created_at"`
	UpdatedAt      time.Time              `json:"updated_at"`
}

// -------------------------------------------------------------
// APPROVAL WORKFLOWS
// -------------------------------------------------------------

type ApprovalRequestStatus string

const (
	RequestPending  ApprovalRequestStatus = "PENDING"
	RequestApproved ApprovalRequestStatus = "APPROVED"
	RequestRejected ApprovalRequestStatus = "REJECTED"
	RequestDraft    ApprovalRequestStatus = "DRAFT"
)

// ApprovalRequest represents a generic request submitted by a lower entity to the federation for review
type ApprovalRequest struct {
	ID            string                `json:"id"`
	WorkflowCode  string                `json:"workflow_code"`  // e.g. 'club_registration', 'belt_promotion'
	EntityType    string                `json:"entity_type"`    // e.g. 'club', 'belt_exam'
	EntityID      string                `json:"entity_id"`      // The ID of the thing being approved
	RequesterID   string                `json:"requester_id"`   // User ID
	RequesterName string                `json:"requester_name"` // e.g. Tên CLB nộp đơn
	CurrentStep   int                   `json:"current_step"`   // 1, 2, 3...
	Status        ApprovalRequestStatus `json:"status"`
	Notes         string                `json:"notes,omitempty"`
	SubmittedAt   time.Time             `json:"submitted_at"`
	UpdatedAt     time.Time             `json:"updated_at"`
}
