---
name: vct-database
description: "VCT Platform database — PostgreSQL administration, Neon/Supabase cloud, self-hosted setup, migrations, full-text search (Meilisearch), indexing, backup/restore, and query optimization."
---

# VCT Database — PostgreSQL & Search

> Consolidated: dba + cloud-database + selfhost-database + migration-safety + neon-postgres + search

## 1. Database Options

| Option | Use Case | Connection |
|--------|----------|------------|
| **Neon** (Primary) | Production — serverless, auto-scaling | Pooled connection string |
| **Supabase** | Alternative — built-in auth, realtime | Connection pooler (PgBouncer) |
| **Self-hosted** | Local dev — Docker PostgreSQL 16 | `localhost:5432` |

## 2. Connection Patterns

```go
// Production: connection pooling via pgxpool
pool, err := pgxpool.New(ctx, os.Getenv("DATABASE_URL"))
// Pool config: MaxConns=25, MinConns=5, MaxConnLifetime=30m
```

- Always use **pooled** connection strings in production
- SSL mode: `require` for cloud, `disable` for local
- Use `pgx/v5` — NO ORM (no GORM, no Ent)

## 3. Migration Safety

### Rules
- Always create pairs: `{version}_{name}_up.sql` + `_down.sql`
- `CREATE INDEX CONCURRENTLY` — never block writes
- Never `DROP COLUMN` directly — use 3-phase: stop writing → deploy → drop
- Backfill in batches of 1000 rows
- Test migrations on staging before production
- CI validates: all migrations have down counterpart

### Dangerous Operations
| ❌ Dangerous | ✅ Safe Alternative |
|-------------|-------------------|
| `ALTER TABLE ... ADD COLUMN DEFAULT` | Add column nullable → backfill → set default |
| `DROP COLUMN` | 3-phase migration |
| `CREATE INDEX` | `CREATE INDEX CONCURRENTLY` |
| `ALTER TYPE` | Create new column → migrate data → drop old |

## 4. Query Optimization

### Index Strategy
```sql
-- Composite index for common queries
CREATE INDEX CONCURRENTLY idx_athletes_federation_status
ON athletes (federation_id, status) WHERE deleted_at IS NULL;
```

- Use `EXPLAIN ANALYZE` before finalizing queries
- Partial indexes with `WHERE` for soft-delete tables
- GIN indexes for JSONB and full-text search
- Monitor: `pg_stat_user_tables`, `pg_stat_user_indexes`

## 5. Full-Text Search (Meilisearch)

```
PostgreSQL → CDC/Trigger → Meilisearch Index → Search API → Frontend
```

- **Index strategy**: One index per searchable entity (athletes, tournaments, clubs)
- **Vietnamese language**: Custom dictionary, diacritics handling
- **Autocomplete**: Prefix matching with typo tolerance
- **Faceted search**: Filter by federation, status, weight class

## 6. Backup & Recovery

| Environment | Strategy | Frequency |
|-------------|----------|-----------|
| Production (Neon) | Point-in-time recovery (built-in) | Continuous |
| Staging | pg_dump before migrations | Per deployment |
| Local | Docker volume, disposable | On demand |

## 7. Neon-Specific Features

- **Branching**: Create database branches for feature development
- **Auto-suspend**: Scales to zero when idle (cost savings)
- **Read replicas**: For analytics/reporting queries
- **@neondatabase/serverless**: HTTP-based queries for edge functions
