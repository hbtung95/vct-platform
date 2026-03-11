package federation

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"time"
)

var (
	ErrNotFound      = errors.New("record not found")
	ErrAlreadyExists = errors.New("record already exists")
)

type MasterDataStore interface {
	// Master Belts
	ListMasterBelts(ctx context.Context) ([]MasterBelt, error)
	GetMasterBelt(ctx context.Context, level string) (*MasterBelt, error)
	CreateMasterBelt(ctx context.Context, belt MasterBelt) error
	UpdateMasterBelt(ctx context.Context, belt MasterBelt) error
	DeleteMasterBelt(ctx context.Context, level string) error

	// Master Weight Classes
	ListMasterWeights(ctx context.Context) ([]MasterWeightClass, error)
	GetMasterWeight(ctx context.Context, id string) (*MasterWeightClass, error)
	CreateMasterWeight(ctx context.Context, weight MasterWeightClass) error
	UpdateMasterWeight(ctx context.Context, weight MasterWeightClass) error
	DeleteMasterWeight(ctx context.Context, id string) error

	// Master Age Groups
	ListMasterAges(ctx context.Context) ([]MasterAgeGroup, error)
	GetMasterAge(ctx context.Context, id string) (*MasterAgeGroup, error)
	CreateMasterAge(ctx context.Context, age MasterAgeGroup) error
	UpdateMasterAge(ctx context.Context, age MasterAgeGroup) error
	DeleteMasterAge(ctx context.Context, id string) error

	// Approval Workflows
	ListApprovals(ctx context.Context, status string) ([]ApprovalRequest, error)
	GetApproval(ctx context.Context, id string) (ApprovalRequest, error)
	CreateApproval(ctx context.Context, req ApprovalRequest) error
	UpdateApproval(ctx context.Context, req ApprovalRequest) error
}

type MemoryMasterDataStore struct {
	mu        sync.RWMutex
	belts     []MasterBelt
	weights   []MasterWeightClass
	ages      []MasterAgeGroup
	approvals map[string]ApprovalRequest
}

func NewMemoryMasterDataStore() *MemoryMasterDataStore {
	store := &MemoryMasterDataStore{
		belts:     make([]MasterBelt, 0),
		weights:   make([]MasterWeightClass, 0),
		ages:      make([]MasterAgeGroup, 0),
		approvals: make(map[string]ApprovalRequest),
	}
	store.seedData()
	return store
}

func (s *MemoryMasterDataStore) seedData() {
	now := time.Now()
	scope := BeltScopeNational

	// Seed Belts — Chuẩn quốc gia
	s.belts = []MasterBelt{
		{Level: 1, Name: "Đai Trắng (Cấp 8)", ColorHex: "#ffffff", RequiredTimeMin: 3, IsDanLevel: false, Description: "Cấp khởi đầu — nhập môn", Scope: scope, CreatedAt: now, UpdatedAt: now},
		{Level: 2, Name: "Đai Vàng (Cấp 7)", ColorHex: "#fbbf24", RequiredTimeMin: 3, IsDanLevel: false, Description: "Cấp cơ bản — nắm vững tấn pháp", Scope: scope, CreatedAt: now, UpdatedAt: now},
		{Level: 3, Name: "Đai Xanh Lá (Cấp 6)", ColorHex: "#4ade80", RequiredTimeMin: 3, IsDanLevel: false, Description: "Cấp trung — quyền cước kết hợp", Scope: scope, CreatedAt: now, UpdatedAt: now},
		{Level: 4, Name: "Đai Xanh Dương (Cấp 5)", ColorHex: "#3b82f6", RequiredTimeMin: 3, IsDanLevel: false, Description: "Cấp khá — bài quyền hoàn chỉnh", Scope: scope, CreatedAt: now, UpdatedAt: now},
		{Level: 5, Name: "Đai Đỏ (Cấp 4)", ColorHex: "#ef4444", RequiredTimeMin: 3, IsDanLevel: false, Description: "Cấp giỏi — thực chiến cơ bản", Scope: scope, CreatedAt: now, UpdatedAt: now},
		{Level: 6, Name: "Đai Nâu (Cấp 1)", ColorHex: "#92400e", RequiredTimeMin: 6, IsDanLevel: false, Description: "Cấp xuất sắc — chuẩn bị đẳng cấp", Scope: scope, CreatedAt: now, UpdatedAt: now},
		{Level: 7, Name: "Đai Đen 1 Đẳng (1 Dan)", ColorHex: "#1e293b", RequiredTimeMin: 12, IsDanLevel: true, Description: "Đẳng 1 — Sơ đẳng", Scope: scope, CreatedAt: now, UpdatedAt: now},
		{Level: 8, Name: "Đai Đen 2 Đẳng (2 Dan)", ColorHex: "#0f172a", RequiredTimeMin: 12, IsDanLevel: true, Description: "Đẳng 2 — Trung đẳng", Scope: scope, CreatedAt: now, UpdatedAt: now},
	}

	// Seed Weights — Chuẩn quốc gia
	s.weights = []MasterWeightClass{
		{ID: "m-u45", Gender: "MALE", Category: "Kyorugi", MaxWeight: 45.0, Scope: scope, CreatedAt: now, UpdatedAt: now},
		{ID: "m-u48", Gender: "MALE", Category: "Kyorugi", MaxWeight: 48.0, Scope: scope, CreatedAt: now, UpdatedAt: now},
		{ID: "m-u51", Gender: "MALE", Category: "Kyorugi", MaxWeight: 51.0, Scope: scope, CreatedAt: now, UpdatedAt: now},
		{ID: "f-u42", Gender: "FEMALE", Category: "Kyorugi", MaxWeight: 42.0, Scope: scope, CreatedAt: now, UpdatedAt: now},
		{ID: "f-u44", Gender: "FEMALE", Category: "Kyorugi", MaxWeight: 44.0, Scope: scope, CreatedAt: now, UpdatedAt: now},
		{ID: "f-u46", Gender: "FEMALE", Category: "Kyorugi", MaxWeight: 46.0, Scope: scope, CreatedAt: now, UpdatedAt: now},
		{ID: "m-heavy", Gender: "MALE", Category: "Kyorugi", IsHeavy: true, Scope: scope, CreatedAt: now, UpdatedAt: now},
	}

	// Seed Ages — Chuẩn quốc gia
	s.ages = []MasterAgeGroup{
		{ID: "u12", Name: "Nhi đồng (U12)", MinAge: 6, MaxAge: 11, Scope: scope, CreatedAt: now, UpdatedAt: now},
		{ID: "u15", Name: "Thiếu niên (U15)", MinAge: 12, MaxAge: 14, Scope: scope, CreatedAt: now, UpdatedAt: now},
		{ID: "u18", Name: "Trẻ (U18)", MinAge: 15, MaxAge: 17, Scope: scope, CreatedAt: now, UpdatedAt: now},
		{ID: "u35", Name: "Vô địch (18-35)", MinAge: 18, MaxAge: 35, Scope: scope, CreatedAt: now, UpdatedAt: now},
	}

	// Seed Approvals
	req := ApprovalRequest{
		ID:            "RQ-001",
		WorkflowCode:  "club_registration",
		EntityType:    "club",
		EntityID:      "clb-abc",
		RequesterID:   "usr-1",
		RequesterName: "CLB Rồng Vàng",
		CurrentStep:   1,
		Status:        RequestPending,
		Notes:         "Xin phép thành lập CLB mới tại quận 1",
		SubmittedAt:   now,
		UpdatedAt:     now,
	}
	s.approvals[req.ID] = req
}

// Removed Organization methods

func (s *MemoryMasterDataStore) ListMasterBelts(ctx context.Context) ([]MasterBelt, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return append([]MasterBelt{}, s.belts...), nil
}

func (s *MemoryMasterDataStore) GetMasterBelt(ctx context.Context, level string) (*MasterBelt, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for i := range s.belts {
		if fmt.Sprintf("%d", s.belts[i].Level) == level {
			b := s.belts[i]
			return &b, nil
		}
	}
	return nil, ErrNotFound
}

func (s *MemoryMasterDataStore) CreateMasterBelt(ctx context.Context, belt MasterBelt) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	belt.CreatedAt = time.Now()
	s.belts = append(s.belts, belt)
	return nil
}

func (s *MemoryMasterDataStore) UpdateMasterBelt(ctx context.Context, belt MasterBelt) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.belts {
		if s.belts[i].Level == belt.Level {
			belt.CreatedAt = s.belts[i].CreatedAt
			s.belts[i] = belt
			return nil
		}
	}
	return ErrNotFound
}

func (s *MemoryMasterDataStore) DeleteMasterBelt(ctx context.Context, level string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.belts {
		if fmt.Sprintf("%d", s.belts[i].Level) == level {
			s.belts = append(s.belts[:i], s.belts[i+1:]...)
			return nil
		}
	}
	return ErrNotFound
}

func (s *MemoryMasterDataStore) ListMasterWeights(ctx context.Context) ([]MasterWeightClass, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return append([]MasterWeightClass{}, s.weights...), nil
}

func (s *MemoryMasterDataStore) GetMasterWeight(ctx context.Context, id string) (*MasterWeightClass, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for i := range s.weights {
		if s.weights[i].ID == id {
			w := s.weights[i]
			return &w, nil
		}
	}
	return nil, ErrNotFound
}

func (s *MemoryMasterDataStore) CreateMasterWeight(ctx context.Context, weight MasterWeightClass) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if weight.ID == "" {
		weight.ID = fmt.Sprintf("wt-%d", time.Now().UnixNano())
	}
	weight.CreatedAt = time.Now()
	s.weights = append(s.weights, weight)
	return nil
}

func (s *MemoryMasterDataStore) UpdateMasterWeight(ctx context.Context, weight MasterWeightClass) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.weights {
		if s.weights[i].ID == weight.ID {
			weight.CreatedAt = s.weights[i].CreatedAt
			s.weights[i] = weight
			return nil
		}
	}
	return ErrNotFound
}

func (s *MemoryMasterDataStore) DeleteMasterWeight(ctx context.Context, id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.weights {
		if s.weights[i].ID == id {
			s.weights = append(s.weights[:i], s.weights[i+1:]...)
			return nil
		}
	}
	return ErrNotFound
}

func (s *MemoryMasterDataStore) ListMasterAges(ctx context.Context) ([]MasterAgeGroup, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return append([]MasterAgeGroup{}, s.ages...), nil
}

func (s *MemoryMasterDataStore) GetMasterAge(ctx context.Context, id string) (*MasterAgeGroup, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for i := range s.ages {
		if s.ages[i].ID == id {
			a := s.ages[i]
			return &a, nil
		}
	}
	return nil, ErrNotFound
}

func (s *MemoryMasterDataStore) CreateMasterAge(ctx context.Context, age MasterAgeGroup) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if age.ID == "" {
		age.ID = fmt.Sprintf("age-%d", time.Now().UnixNano())
	}
	age.CreatedAt = time.Now()
	s.ages = append(s.ages, age)
	return nil
}

func (s *MemoryMasterDataStore) UpdateMasterAge(ctx context.Context, age MasterAgeGroup) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.ages {
		if s.ages[i].ID == age.ID {
			age.CreatedAt = s.ages[i].CreatedAt
			s.ages[i] = age
			return nil
		}
	}
	return ErrNotFound
}

func (s *MemoryMasterDataStore) DeleteMasterAge(ctx context.Context, id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.ages {
		if s.ages[i].ID == id {
			s.ages = append(s.ages[:i], s.ages[i+1:]...)
			return nil
		}
	}
	return ErrNotFound
}

func (s *MemoryMasterDataStore) ListApprovals(ctx context.Context, status string) ([]ApprovalRequest, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var res []ApprovalRequest
	for _, req := range s.approvals {
		if status == "" || string(req.Status) == status {
			res = append(res, req)
		}
	}
	return res, nil
}

func (s *MemoryMasterDataStore) GetApproval(ctx context.Context, id string) (ApprovalRequest, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	req, ok := s.approvals[id]
	if !ok {
		return ApprovalRequest{}, ErrNotFound
	}
	return req, nil
}

func (s *MemoryMasterDataStore) CreateApproval(ctx context.Context, req ApprovalRequest) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if req.ID == "" {
		req.ID = fmt.Sprintf("rq-%d", time.Now().UnixNano())
	}
	req.SubmittedAt = time.Now()
	req.UpdatedAt = time.Now()
	s.approvals[req.ID] = req
	return nil
}

func (s *MemoryMasterDataStore) UpdateApproval(ctx context.Context, req ApprovalRequest) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	existing, ok := s.approvals[req.ID]
	if !ok {
		return ErrNotFound
	}
	req.SubmittedAt = existing.SubmittedAt
	req.UpdatedAt = time.Now()
	s.approvals[req.ID] = req
	return nil
}
