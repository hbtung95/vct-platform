# Deployment Audit Fixes — Walkthrough

## Tổng quan

Đã triển khai fix **5 file** theo deployment audit report, giải quyết tất cả lỗi code-level.

---

## Các thay đổi

### 🔴 Critical Fix #1 — Dockerfile.render (build sẽ fail)

render_diffs(file:///d:/VCT%20PLATFORM/vct-platform/backend/Dockerfile.render)

**Vấn đề**: Base image `golang:1.26` (Debian) nhưng dùng `apk add` (Alpine) → build 100% fail.
**Fix**: Đổi sang `golang:1.26-alpine` + `apk add --no-cache`.

---

### 🔴 Critical Fix #2 — render.yaml (cron fail + CORS thiếu)

render_diffs(file:///d:/VCT%20PLATFORM/vct-platform/render.yaml)

**Vấn đề 1**: Cron job `vct-db-maintenance` gọi command `maintenance` không tồn tại.
**Fix**: Đổi sang `/app/vct-migrate up --migrations /app/migrations`.

**Vấn đề 2**: `VCT_CORS_ORIGINS` thiếu domain `vct-platform-next.vercel.app` (domain thực tế đang dùng).
**Fix**: Thêm domain vào danh sách CORS.

---

### ⚠️ Fix #3 — fly.toml (thiếu CORS config)

render_diffs(file:///d:/VCT%20PLATFORM/vct-platform/backend/fly.toml)

**Vấn đề**: `VCT_CORS_ORIGINS` không có trong `[env]` → backend trên Fly.io có thể reject requests từ frontend.
**Fix**: Thêm `VCT_CORS_ORIGINS` với cả 2 Vercel domains.

---

### ⚠️ Fix #4 — cd-production.yml (placeholder → real deploy)

render_diffs(file:///d:/VCT%20PLATFORM/vct-platform/.github/workflows/cd-production.yml)

**Vấn đề**: Chỉ có `echo "Production deploy steps to be configured"`.
**Fix**: Workflow hoàn chỉnh với 3 jobs:
1. `deploy-backend` — Deploy Fly.io bằng `flyctl deploy`
2. `migrate-database` — Chạy migrations với Neon DB
3. `verify-deployment` — Health check sau deploy

---

### ⚠️ Fix #5 — cd-staging.yml (placeholder → tests + verify)

render_diffs(file:///d:/VCT%20PLATFORM/vct-platform/.github/workflows/cd-staging.yml)

**Vấn đề**: Chỉ có placeholder echo.
**Fix**: Workflow hoàn chỉnh:
1. `test-before-deploy` — Go tests + typecheck + lint
2. `verify-staging` — Health check staging sau khi Render auto-deploy

---

## Đã OK từ trước (không cần fix)

| Issue | File | Trạng thái |
|-------|------|------------|
| Port mismatch Dockerfile | [Dockerfile](file:///d:/VCT%20PLATFORM/vct-platform/backend/Dockerfile) | ✅ Đã `EXPOSE 8080` |
| NEXT_PUBLIC_API_BASE_URL | [next.config.js](file:///d:/VCT%20PLATFORM/vct-platform/apps/next/next.config.js) | ✅ Đã dùng `process.env` |

---

## ⚡ Manual Steps cần làm trên Dashboard

> [!IMPORTANT]
> Các bước sau cần thực hiện thủ công trên dashboard của từng platform:

| Platform | Cần làm |
|----------|---------|
| **Vercel** | Set `BACKEND_URL` = `https://vct-platform-api.fly.dev` |
| **Fly.io** | Verify secrets: `VCT_JWT_SECRET`, `VCT_POSTGRES_URL` |
| **GitHub** | Verify secrets: `FLY_API_TOKEN`, `NEON_DATABASE_URL` |
| **Render** | Verify secrets: `VCT_POSTGRES_URL`, `VCT_JWT_SECRET` |
