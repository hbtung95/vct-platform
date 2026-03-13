# Step 2 Complete: Backend API Live on Fly.io 🎉

## Result

**API URL**: [https://vct-platform-api.fly.dev](https://vct-platform-api.fly.dev)

Health check response:
```json
{
  "status": "ok",
  "service": "vct-backend",
  "go_version": "go1.26.1",
  "storage": { "driver": "postgres", "provider": "neon" },
  "cache": { "defaultTtl": "1m0s", "items": 0, "maxEntries": 500 },
  "realtime": { "clients": 0 }
}
```

![Health check verified in browser](file:///C:/Users/hbtun/.gemini/antigravity/brain/7f224d65-a108-4894-b8b6-49818fa56520/flyio_health_check_1773312895268.webp)

## What Was Done

| Action | Detail |
|--------|--------|
| Installed Fly CLI | PowerShell installer |
| Created app | `vct-platform-api` in Singapore |
| Set secrets | DB URL, JWT, CORS, demo users |
| Fixed crash | `VCT_ALLOW_DEMO_USERS=false` for production |
| Dockerfile | Switched to `alpine:3.21` runtime, port 8080 |
| Verified | HTTP 200, Neon DB connected ✅ |

## Bug Found & Fixed

The app crashed on startup because `config.Validate()` rejects `VCT_ALLOW_DEMO_USERS=true` when `VCT_ENV=production`. Fixed by setting the secret to `false`.

## Files Changed

| File | Change |
|------|--------|
| [Dockerfile](file:///d:/VCT%20PLATFORM/vct-platform/backend/Dockerfile) | Go 1.26, alpine runtime, stripped binary |
| [fly.toml](file:///d:/VCT%20PLATFORM/vct-platform/backend/fly.toml) | Production config, 256MB optimized |

## Next Steps

- **Step 1**: Deploy frontend to Vercel
- **Step 3**: Deploy staging to Render
- **Step 4**: Setup Upstash Redis
- **Step 5**: GitHub Actions CI/CD
