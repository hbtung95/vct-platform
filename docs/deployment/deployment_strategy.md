# VCT Platform — Chiến lược Deploy Miễn Phí Tối Ưu

## Kiến trúc tổng quan

```mermaid
graph TB
    subgraph "Vercel (FREE)"
        FE[Next.js Frontend]
        EDGE[Edge Functions]
    end

    subgraph "Fly.io (FREE) — Production"
        API_PROD[Go API Primary<br/>256MB · Singapore]
        API_PROD2[Go API Replica<br/>256MB · Singapore]
    end

    subgraph "Render (FREE) — Support"
        API_STAGE[Go API Staging<br/>Preview per PR]
        CRON[Cron Workers<br/>Partition · Cleanup · Refresh]
    end

    subgraph "Managed Services (FREE)"
        NEON[(Neon PG18<br/>Singapore)]
        UPSTASH[(Upstash Redis<br/>Serverless)]
        R2[(Cloudflare R2<br/>10GB Storage)]
    end

    FE -->|API calls| API_PROD
    EDGE -->|Cache check| UPSTASH
    API_PROD --> NEON
    API_PROD --> UPSTASH
    API_STAGE --> NEON
    CRON --> NEON
    API_PROD --> R2
```

---

## 1. Fly.io — Production API

### Free Tier
- **3 shared VMs** (256MB RAM mỗi cái)
- **3GB persistent volume**
- **160GB outbound transfer/tháng**

### Chiến lược tận dụng tối đa

#### A. Phân bổ 3 VMs
| VM | Vai trò | Region |
|---|---|---|
| VM 1 | Go API chính | `sin` (Singapore) |
| VM 2 | Go API replica (auto-failover) | `sin` |
| VM 3 | Dự phòng cho spike traffic | `sin` |

#### B. Cấu hình `fly.toml`
```toml
app = "vct-platform-api"
primary_region = "sin"

[build]
  dockerfile = "Dockerfile"

[env]
  VCT_ENV = "production"
  VCT_BACKEND_ADDR = ":18080"
  VCT_PG_POOL_MAX_CONNS = "10"    # Nhỏ vì Neon free = 100 connections
  VCT_PG_POOL_MIN_CONNS = "2"
  VCT_CACHE_TTL = "60s"            # Cache aggressive hơn
  VCT_CACHE_MAX_ENTRIES = "500"    # Giới hạn memory vì chỉ 256MB

[http_service]
  internal_port = 18080
  force_https = true
  auto_stop_machines = true        # ⭐ Tắt khi không có request → tiết kiệm
  auto_start_machines = true       # ⭐ Tự bật khi có request
  min_machines_running = 1         # Luôn giữ 1 VM sống
  processes = ["app"]

  [http_service.concurrency]
    type = "requests"
    hard_limit = 100
    soft_limit = 80

[[vm]]
  memory = "256mb"
  cpu_kind = "shared"
  cpus = 1
```

#### C. Khắc phục 256MB RAM
```go
// Trong cmd/server/main.go — thêm memory-aware config
func configForFlyio() {
    // 1. Giới hạn GOGC để GC sớm hơn → ít RAM hơn
    os.Setenv("GOGC", "50")          // Default 100, giảm xuống 50
    os.Setenv("GOMEMLIMIT", "200MiB") // Hard limit để tránh OOM

    // 2. Giới hạn DB pool
    // Neon free = 100 connections, chia cho 2 VM = 10 mỗi VM
    cfg.MaxConns = 10
    cfg.MinConns = 2

    // 3. Cache size nhỏ hơn
    cfg.CacheMaxEntries = 500  // Thay vì 2000
}
```

---

## 2. Render — Staging + Workers

### Free Tier
- **750 giờ/tháng** (đủ 1 service 24/7 = 720 giờ)
- **Auto-deploy từ GitHub**
- **Cron Jobs** (miễn phí)
- **Preview Environments** cho mỗi PR

### Chiến lược tận dụng tối đa

#### A. Staging API — Preview per PR

Tạo file `render.yaml` (Blueprint):

```yaml
# render.yaml — Render Blueprint
services:
  # ── Staging API (auto preview per PR) ──
  - type: web
    name: vct-api-staging
    runtime: docker
    dockerfilePath: ./backend/Dockerfile
    region: singapore
    plan: free
    branch: main
    envVars:
      - key: VCT_ENV
        value: staging
      - key: VCT_POSTGRES_URL
        fromDatabase:
          name: vct-staging-db
          property: connectionString
      - key: VCT_CORS_ORIGINS
        value: "https://vct-platform.vercel.app,https://*.onrender.com"

    # ⭐ Preview cho mỗi Pull Request
    previews:
      generation: automatic

  # ── Cron Workers (chạy maintenance tasks) ──
  - type: cron
    name: vct-partition-maintenance
    runtime: docker
    dockerfilePath: ./backend/Dockerfile
    schedule: "0 0 * * 0"     # Mỗi Chủ nhật
    envVars:
      - key: VCT_POSTGRES_URL
        sync: false
```

#### B. Khắc phục Cold Start (~30s)

> [!IMPORTANT]
> **Vấn đề lớn nhất của Render free**: Service tắt sau 15 phút idle, khởi động lại mất ~30s.

**Giải pháp 1: Self-Ping (miễn phí)**
```yaml
# Thêm cron job tự ping mỗi 14 phút
- type: cron
  name: vct-keep-alive
  runtime: docker
  schedule: "*/14 * * * *"
  dockerCommand: "wget -qO- https://vct-api-staging.onrender.com/healthz || true"
```

**Giải pháp 2: Cho Staging cold start là OK**
- Cold start chỉ ảnh hưởng request đầu tiên sau 15 phút idle
- **Production trên Fly.io** không bị vấn đề này (dùng `min_machines_running = 1`)
- Staging chỉ dev/QA dùng → chấp nhận được

**Giải pháp 3: Dùng Upstash Serverless (miễn phí)**
```
Tạo cron qua Upstash QStash (free tier: 500 messages/ngày)
→ Gửi request tới Render app mỗi 10 phút
→ App không bao giờ sleep
```

---

## 3. Bảng so sánh chi tiết

### Cách phân công vai trò

| Tính năng | Fly.io | Render | Lý do |
|-----------|--------|--------|-------|
| **Production API** | ✅ | | Không cold start, Singapore |
| **Staging API** | | ✅ | Preview per PR, dễ setup |
| **Cron Jobs** | | ✅ | Built-in cron, miễn phí |
| **Migration runner** | | ✅ | One-off job, không cần always-on |
| **Health monitoring** | ✅ | | Metrics dashboard built-in |
| **Auto-scaling** | ✅ | | `auto_stop/start_machines` |
| **Custom domains** | ✅ | ✅ | Cả 2 đều miễn phí |

### Giới hạn free tier và cách khắc phục

| Giới hạn | Platform | Workaround |
|----------|----------|------------|
| 256MB RAM | Fly.io | `GOMEMLIMIT=200MiB`, `GOGC=50`, cache size nhỏ |
| Cold start 30s | Render | Chỉ dùng staging, prod ở Fly.io |
| 100 DB connections | Neon | Pool max 10/VM, dùng connection pooler URL |
| 750 giờ/tháng | Render | Chỉ chạy 1 service + cron (đủ 720 giờ) |
| 10K Redis cmd/ngày | Upstash | Cache aggressive ở app (in-memory LRU) |
| 10GB storage | R2 | Compress images, lifecycle policy |

---

## 4. Cấu hình bảo mật & Secrets

### Fly.io Secrets
```bash
# Set production secrets
fly secrets set VCT_POSTGRES_URL="postgresql://neondb_owner:...@ep-cold-sun-a1bn4s5e-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
fly secrets set VCT_JWT_SECRET="your-jwt-secret"
fly secrets set VCT_CORS_ORIGINS="https://vct-platform.vercel.app"
fly secrets set UPSTASH_REDIS_URL="redis://default:...@apn1-xyz.upstash.io:6379"
```

### Render Environment Groups
```
# Tạo Environment Group "vct-shared" trên Render Dashboard
# → Share giữa staging API và cron workers
VCT_POSTGRES_URL = (from Neon)
VCT_JWT_SECRET = (same as Fly.io)
```

---

## 5. CI/CD Pipeline (GitHub Actions — miễn phí)

```yaml
# .github/workflows/deploy.yml
name: Deploy VCT Platform

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  # ── Test ──
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with: { go-version: '1.26' }
      - run: cd backend && go test ./...

  # ── Deploy Frontend → Vercel (auto via GitHub integration) ──
  # Vercel auto-deploys, no action needed!

  # ── Deploy Backend → Fly.io (production) ──
  deploy-flyio:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}

  # ── Render (staging) auto-deploys via render.yaml ──
  # Render auto-deploys + creates preview per PR!

  # ── Run Migrations ──
  migrate:
    needs: deploy-flyio
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with: { go-version: '1.26' }
      - run: cd backend && go run ./cmd/migrate up
        env:
          VCT_POSTGRES_URL: ${{ secrets.NEON_DATABASE_URL }}
```

---

## 6. Monitoring miễn phí

| Tool | Dùng cho | Free tier |
|------|----------|-----------|
| **Fly.io Metrics** | CPU, RAM, requests | Built-in |
| **Render Dashboard** | Logs, deploys | Built-in |
| **Better Uptime** | Uptime monitoring | 10 monitors miễn phí |
| **Neon Dashboard** | DB queries, connections | Built-in |
| **Sentry** | Error tracking | 5K events/tháng |

---

## Checklist Deploy

- [ ] Setup Vercel cho `apps/next` (frontend)
- [ ] Setup Fly.io cho `backend` (production API)
- [ ] Setup Render cho staging + cron workers
- [ ] Tạo Upstash Redis instance
- [ ] Tạo Cloudflare R2 bucket
- [ ] Config GitHub Actions CI/CD
- [ ] Test end-to-end: Frontend → API → Database
