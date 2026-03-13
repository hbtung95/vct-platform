# VCT Platform — Hướng dẫn Deploy từng bước

> [!NOTE]
> Tất cả config files đã được tạo sẵn trong repo. Guide này hướng dẫn bạn chạy từng bước trên browser + terminal.

## Files đã tạo

| File | Vai trò |
|------|---------|
| [vercel.json](file:///d:/VCT%20PLATFORM/vct-platform/apps/next/vercel.json) | Vercel monorepo config |
| [fly.toml](file:///d:/VCT%20PLATFORM/vct-platform/backend/fly.toml) | Fly.io production (256MB optimized) |
| [render.yaml](file:///d:/VCT%20PLATFORM/vct-platform/render.yaml) | Render staging + cron workers |
| [Dockerfile](file:///d:/VCT%20PLATFORM/vct-platform/backend/Dockerfile) | Optimized Docker build (stripped binary) |
| [Dockerfile.render](file:///d:/VCT%20PLATFORM/vct-platform/backend/Dockerfile.render) | Render-specific Dockerfile |
| [.dockerignore](file:///d:/VCT%20PLATFORM/vct-platform/backend/.dockerignore) | Small build context |
| [deploy.yml](file:///d:/VCT%20PLATFORM/vct-platform/.github/workflows/deploy.yml) | GitHub Actions CI/CD pipeline |

---

## STEP 1: Deploy Frontend → Vercel

### 1.1 — Vào Vercel Dashboard
1. Truy cập **[vercel.com](https://vercel.com)** → Sign in bằng GitHub
2. Click **"Add New Project"**
3. Import repo **`hbtu/vct-platform`**

### 1.2 — Cấu hình Monorepo
Vercel sẽ hỏi cấu hình → chọn:
- **Framework Preset**: Next.js
- **Root Directory**: `apps/next`
- **Build Command**: `cd ../.. && npm run build` (đã config trong `vercel.json`)
- **Output Directory**: `.next`

### 1.3 — Set Environment Variables
Trong Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL = https://vct-platform-api.fly.dev
```

> [!TIP]
> **Tối ưu free tier**: Vercel auto-deploys preview cho mỗi PR. Frontend static + ISR pages chạy miễn phí rất thoải mái (100GB bandwidth/tháng).

### 1.4 — Deploy
Click **"Deploy"** → Vercel tự build và deploy!

> URL production: `https://vct-platform.vercel.app` (hoặc custom domain)

---

## STEP 2: Deploy Backend → Fly.io (Production)

### 2.1 — Cài Fly CLI
```powershell
# Windows (PowerShell)
pwsh -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Hoặc dùng npm
npm install -g flyctl
```

### 2.2 — Đăng nhập
```bash
flyctl auth login
```

### 2.3 — Launch App
```bash
cd backend
flyctl launch --name vct-platform-api --region sin --no-deploy
```
> Khi được hỏi, chọn **Singapore (sin)** region

### 2.4 — Set Secrets (quan trọng!)
```bash
flyctl secrets set \
  VCT_POSTGRES_URL="postgresql://neondb_owner:npg_LODHN6pcg7hM@ep-cold-sun-a1bn4s5e-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" \
  VCT_JWT_SECRET="your-secure-jwt-secret-change-this" \
  VCT_CORS_ORIGINS="https://vct-platform.vercel.app" \
  VCT_ALLOW_DEMO_USERS="false"
```

### 2.5 — Deploy
```bash
flyctl deploy
```

### 2.6 — Verify
```bash
flyctl status
curl https://vct-platform-api.fly.dev/healthz
```

> [!IMPORTANT]
> **Khắc phục 256MB RAM** — Đã config sẵn trong `fly.toml`:
> - `GOGC=50` → Go GC chạy gấp đôi tần suất → RAM thấp hơn
> - `GOMEMLIMIT=200MiB` → Hard limit tránh OOM kill
> - DB pool chỉ 10 connections (Neon free = 100 conns)
> - Cache chỉ 500 entries (thay vì 2000)
> - `auto_stop_machines = "stop"` → VM tắt khi idle, tiết kiệm quota
> - `min_machines_running = 1` → Luôn giữ 1 VM sống → **KHÔNG cold start**

---

## STEP 3: Deploy Staging → Render

### 3.1 — Vào Render Dashboard
1. Truy cập **[render.com](https://render.com)** → Sign in bằng GitHub
2. Click **"New" → "Blueprint"**
3. Chọn repo `hbtu/vct-platform`
4. Render tự đọc `render.yaml` → tạo services

### 3.2 — Set Environment Variables
Trong Render Dashboard, set các biến `sync: false`:
```
VCT_POSTGRES_URL = (same as Fly.io)
VCT_JWT_SECRET = (same as Fly.io)
```

### 3.3 — Deploy
Render tự deploy → URL staging: `https://vct-api-staging.onrender.com`

> [!IMPORTANT]
> **Khắc phục Cold Start** — 3 chiến lược đã config:
> 1. **Anti-ping cron** (`vct-keep-alive`): gửi request mỗi 14 phút → app không bao giờ sleep
> 2. **Production trên Fly.io**: `min_machines_running = 1` → không cold start
> 3. **Staging cold start**: OK vì chỉ dev/QA dùng

### 3.4 — Tận dụng PR Preview
- Mỗi Pull Request → Render tự tạo preview environment
- QA test trực tiếp trên preview URL
- Merge PR → preview tự xóa

---

## STEP 4: Setup Upstash Redis (thay thế self-hosted Redis)

### 4.1 — Tạo Instance
1. Truy cập **[upstash.com](https://upstash.com)** → Sign up
2. Create Redis Database → Region: **Singapore**
3. Copy connection URL

### 4.2 — Config
```bash
# Fly.io
flyctl secrets set UPSTASH_REDIS_URL="rediss://default:xxx@apn1-xyz.upstash.io:6379"

# Render (Dashboard → Environment Variables)
UPSTASH_REDIS_URL = rediss://default:xxx@apn1-xyz.upstash.io:6379
```

> [!TIP]
> **Tối ưu 10K commands/ngày**: Dùng in-memory LRU cache làm L1, Upstash làm L2. Chỉ call Redis cho cache miss → giảm 80% calls.

---

## STEP 5: GitHub Actions CI/CD

### 5.1 — Set GitHub Secrets
Vào GitHub repo → Settings → Secrets and variables → Actions:

| Secret | Value |
|--------|-------|
| `FLY_API_TOKEN` | Từ `flyctl tokens create deploy` |
| `NEON_DATABASE_URL` | Connection string Neon |

### 5.2 — Pipeline tự chạy
Khi push code lên `main`:
```
┌─────────────┐   ┌─────────────────┐   ┌──────────────┐
│ Test Go+Node│ → │ Deploy Fly.io   │ → │ Run Migrate  │
│ (parallel)  │   │ (production)    │   │ (Neon DB)    │
└─────────────┘   └─────────────────┘   └──────────────┘
                  ┌─────────────────┐
                  │ Vercel (auto)   │   ← GitHub integration
                  └─────────────────┘
                  ┌─────────────────┐
                  │ Render (auto)   │   ← render.yaml blueprint
                  └─────────────────┘
```

---

## Tổng kết — Kiến trúc $0/tháng

```
Users (VN) ──→ Vercel CDN Edge ──→ Next.js Frontend
                                       │
                                       ▼
                                  Fly.io Singapore
                                  (Go API · 256MB)
                                       │
                              ┌────────┼────────┐
                              ▼        ▼        ▼
                         Neon PG18  Upstash   Cloudflare
                         (Database) (Redis)   R2 (Files)
```

| Platform | Chi phí | Vai trò |
|----------|---------|---------|
| Vercel | $0 | Frontend + CDN + Preview |
| Fly.io | $0 | Production API (Singapore) |
| Render | $0 | Staging + Cron + PR Preview |
| Neon | $0 | PostgreSQL 18 (đã deploy) |
| Upstash | $0 | Redis cache |
| GitHub Actions | $0 | CI/CD (2000 min/tháng free) |
| **Tổng** | **$0** | **Full-stack production** |
