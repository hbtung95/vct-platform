# Deployment Infrastructure — Walkthrough

## Changes Made (7 files)

### Step 3: Render Staging

| File | Changes |
|------|---------|
| [render.yaml](file:///d:/VCT%20PLATFORM/vct-platform/render.yaml) | Port `18080`→`10000` (Render default), enabled `VCT_DB_AUTO_MIGRATE`, added `UPSTASH_REDIS_URL`, removed broken `vct-db-maintenance` cron |
| [Dockerfile.render](file:///d:/VCT%20PLATFORM/vct-platform/backend/Dockerfile.render) | Switched to `alpine:3.21` runtime with `curl`, added `HEALTHCHECK`, removed non-existent `vct-migrate` binary, port→`10000` |

### Step 4: Upstash Redis

| File | Changes |
|------|---------|
| [render.yaml](file:///d:/VCT%20PLATFORM/vct-platform/render.yaml) | Added `UPSTASH_REDIS_URL` (sync: false) |
| [fly.toml](file:///d:/VCT%20PLATFORM/vct-platform/backend/fly.toml) | Documented `UPSTASH_REDIS_URL` as secret |
| [.env.example (root)](file:///d:/VCT%20PLATFORM/vct-platform/.env.example) | Added `UPSTASH_REDIS_URL` placeholder |
| [.env.example (backend)](file:///d:/VCT%20PLATFORM/vct-platform/backend/.env.example) | Added `UPSTASH_REDIS_URL` placeholder |

### Step 5: CI/CD Pipeline

| File | Changes |
|------|---------|
| [deploy.yml](file:///d:/VCT%20PLATFORM/vct-platform/.github/workflows/deploy.yml) | `GO_VERSION: 1.24`→`1.26` |
| [cd-production.yml](file:///d:/VCT%20PLATFORM/vct-platform/.github/workflows/cd-production.yml) | `GO_VERSION: 1.24`→`1.26` |
| [cd-staging.yml](file:///d:/VCT%20PLATFORM/vct-platform/.github/workflows/cd-staging.yml) | `GO_VERSION: 1.24`→`1.26` |

---

## ⚠️ Remaining Manual Steps

### 1. Connect GitHub on Render Dashboard
1. Go to [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint Instance**
2. Select your `hbtu/vct-platform` repo
3. Render auto-detects `render.yaml` → Click **Apply**
4. Set these secrets in Render dashboard:
   - `VCT_POSTGRES_URL` = your Neon connection string
   - `VCT_JWT_SECRET` = a secure random string
   - `UPSTASH_REDIS_URL` = (after Step 2 below)

### 2. Create Upstash Redis Instance
1. Go to [console.upstash.com](https://console.upstash.com) → **Create Database**
2. Region: **Singapore** (ap-southeast-1)
3. Copy the **REST URL** (format: `https://xxx.upstash.io`)
4. Set on Fly.io: `flyctl secrets set UPSTASH_REDIS_URL=<your-url> -a vct-platform-api`
5. Set on Render dashboard: `UPSTASH_REDIS_URL` = same URL

### 3. Set GitHub Secrets
1. Go to repo **Settings** → **Secrets and variables** → **Actions**
2. Add these repository secrets:
   - `FLY_API_TOKEN` — from `flyctl tokens create deploy -x 999999h`
   - `NEON_DATABASE_URL` — your Neon connection string
   - `UPSTASH_REDIS_URL` — your Upstash REST URL
