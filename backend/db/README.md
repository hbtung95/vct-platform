# VCT Platform — Database

All database SQL source files live under `backend/db/`.

## Directory Layout

| Directory             | Purpose                                                                 |
|-----------------------|-------------------------------------------------------------------------|
| `schema/`             | Declarative domain schemas. Reference ONLY, NOT executed by tools.      |
| `migrations/`         | Schema migrations executed in numeric order (up + down).                |
| `migrations/archive/` | Compressed tarball containing legacy migrations (historical audit only).|
| `seeds/shared/`       | Safe-for-production reference data (`ON CONFLICT` upsert).              |
| `seeds/dev/`          | Demo data for development and staging environments.                     |

## Naming Conventions

- **Migrations**: `NNNN_description.sql` / `NNNN_description_down.sql`
  - `NNNN` = zero-padded sequence (e.g. `0087`) or timestamp.
- **Seeds**: `NNNN_seed_description.sql`
- **Schemas**: `NN_domain_name.sql`

## Running Migrations

```bash
# From backend/ directory
go run ./cmd/migrate up        # apply pending migrations
go run ./cmd/migrate status    # show migration status
go run ./cmd/migrate down      # rollback latest migration
```

## Seeding Data

```bash
# Runs shared and dev seeds (default env=development)
go run ./cmd/migrate seed

# Runs ONLY shared seeds
go run ./cmd/migrate seed --env production
```

Override default directories:
```bash
go run ./cmd/migrate --migrations db/migrations --seeds db/seeds up
```

## Embedded SQL Files (go:embed)

The `db` package (`embed.go`) bundles all active migrations and seeds directly into the Go binary. This is standard for production and Docker deployments where external SQL files might not be mounted.

```bash
# Run using bundled files instead of OS filesystem
go run ./cmd/migrate up --embed
go run ./cmd/migrate seed --env production --embed
```
