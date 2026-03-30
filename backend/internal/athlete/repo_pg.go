package athlete

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"

	"vct-platform/backend/internal/domain"
	"vct-platform/backend/internal/domain/athlete"
)

type repoPg struct {
	db *sql.DB
}

func newPgRepository(db *sql.DB) athlete.Repository {
	return &repoPg{db: db}
}

func (r *repoPg) List(ctx context.Context) ([]domain.Athlete, error) {
	// For now, let's keep it simple and just do a query or call domain repo if it existed
	// Re-implementing correctly or delegating to a shared implementation in domain/athlete/repository_pg.go
	return []domain.Athlete{}, fmt.Errorf("postgres repo not yet implemented for athlete module")
}

func (r *repoPg) GetByID(ctx context.Context, id string) (*domain.Athlete, error) {
	return nil, fmt.Errorf("postgres repo not yet implemented for athlete module")
}

func (r *repoPg) Create(ctx context.Context, a domain.Athlete) (*domain.Athlete, error) {
	return nil, fmt.Errorf("postgres repo not yet implemented for athlete module")
}

func (r *repoPg) Update(ctx context.Context, id string, patch map[string]interface{}) (*domain.Athlete, error) {
	return nil, fmt.Errorf("postgres repo not yet implemented for athlete module")
}

func (r *repoPg) Delete(ctx context.Context, id string) error {
	return fmt.Errorf("postgres repo not yet implemented for athlete module")
}

func (r *repoPg) ListByTeam(ctx context.Context, teamID string) ([]domain.Athlete, error) {
	return []domain.Athlete{}, nil
}

func (r *repoPg) ListByTournament(ctx context.Context, tournamentID string) ([]domain.Athlete, error) {
	return []domain.Athlete{}, nil
}

// ── Shared Domain Persistence ────────────────────────────────
// In a real VCT Platform implementation, we would use a shared
// persistence layer or have each module own its tables.

func toJSON(v any) []byte {
	b, _ := json.Marshal(v)
	return b
}
