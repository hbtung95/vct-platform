# VCT Platform - Upgrade Walkthrough

## Phase 1: Security & RBAC Hardening
We comprehensively secured the backend and frontend role-based access.

1. **Backend Rate Limiting & Proxy Trust:**
   - Implemented strict rate limits (1 req/sec for Auth, 10/sec for general APIs).
   - Enforced `<2KB` body limits for Auth to prevent DoS.
   - Enforced secure proxy validation.

2. **Full Implementation of RBAC Guards:**
   - Evaluated >40 endpoint routes across `federation`, `provincial`, `btc`, and `club` domains.
   - Added specific authorization rules (`RequireEntityRole`, `RequireSubjectRole`) for every single route in `server.go`.

3. **Frontend Mock Data Cleansing & Role Sync:**
   - Removed Mock components from `Page_portal_hub.tsx` and dynamically linked real stats.
   - Injected missing multi-tenant system roles into `entity-authz.generated.ts`.

4. **Multi-Role Demo Environments:**
   - Configured bootstrap credentials simulating parent, provincial admin, referee, athlete, coach, and BTC members.

## Phase 2: Postgres Database Migration (Provincial Module)
To solve the critical P0 blocker where data was lost upon every server restart (In-Memory Maps), we migrated the entire Provincial module to PostgreSQL.

1. **Leveraging JSONB Entity Store (`store.DataStore`):**
   - We utilized the platform's existing EAV `entity_records` table design.
   - Instead of writing 19 boilerplate-heavy SQL tables and queries, we created a comprehensive generic wrapping layer.

2. **Interface Abstractions (`phase2_interfaces.go`):**
   - Discovered that advanced module stores (Tournaments, Finances, Disciplines, etc.) were tightly coupled to their concrete implementations.
   - Extracted clean interfaces (`TournamentStore`, `FinanceStore`, etc.) inside the `provincial` domain package.

3. **Writing Postgres Adapters (`provincial_pg_repos.go` & `provincial_pg_phase2_repos.go`):**
   - Authored 19 total generic Store Adapters.
   - Repositories perfectly round-trip the Domain structs into JSONB structures that `StoreAdapter[T]` handles.
   - Handled manual context-aware logic inside adapters (e.g., filtering `provinceID`).

4. **Wiring the Server (`server.go`):**
   - Updated the `Server` struct and domain instantiation pipeline.
   - Replaced all 19 `provincial.NewInMem...` calls with `adapter.NewPg...`.
   - The Go backend now natively compiles cleanly against these strict Postgres repositories.

---

### Verifying the Update
To see the new **Persistent Database** in action:
1. Reload/Restart the Go `server.exe` backend process.
2. Sign in as a Provincial Manager (e.g. `provincial@vct.vn`).
3. Add a new Club, Athlete, or Finance Entry.
4. Restart the backend again. Notice that **the data is still there!** This was not possible under the previous In-Memory architecture.
