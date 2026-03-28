---
name: vct-infra
description: "VCT Platform infrastructure — Docker/Kubernetes, CI/CD pipelines, monitoring/alerting, file storage (MinIO/S3), notification delivery, cost optimization, and incident response."
---

# VCT Infrastructure — DevOps & Platform Services

> Consolidated: devops + cloud-cost + incident-manager + file-storage + notification

## 1. Deployment Architecture

```
GitHub → GitHub Actions CI → Build → Test → Deploy
                                              ├── Backend: Docker → Cloud Run / K8s
                                              ├── Frontend: Vercel / Docker
                                              └── Mobile: EAS Build → App Stores
```

## 2. Docker Setup

```yaml
# docker-compose.yml (local dev)
services:
  postgres:   image: postgres:16
  redis:      image: redis:7-alpine
  minio:      image: minio/minio
  meilisearch: image: getmeili/meilisearch
  nats:       image: nats:latest
  backend:    build: ./backend
  frontend:   build: ./apps/next
```

## 3. CI/CD Pipeline

```
Push to main:
  → Lint (eslint + golangci-lint)
  → Type-check (tsc + go vet)
  → Unit Tests (jest + go test)
  → Build (next build + go build)
  → E2E Tests (Playwright)
  → Deploy (if all green)
```

### Environment Strategy
| Env | Branch | Auto-deploy | Approval |
|-----|--------|-------------|----------|
| Dev | `develop` | ✅ | No |
| Staging | `main` | ✅ | No |
| Production | `main` (tag) | ❌ | Required |

## 4. File Storage (MinIO/S3)

- **Upload**: Presigned URLs for direct client upload
- **Images**: Server-side resize (thumbnail, medium, original)
- **Bucket structure**: `{tenant}/{entity-type}/{id}/{filename}`
- **CDN**: CloudFront/Cloudflare in front of MinIO

## 5. Notification System

| Channel | Provider | Use Cases |
|---------|----------|-----------|
| Push | Expo Push API | Match alerts, tournament updates |
| Email | SendGrid / SES | Registration, invoices, reports |
| SMS | Twilio | OTP, urgent alerts |
| In-App | WebSocket | Real-time updates, chat |
| Telegram | Bot API | Admin alerts, monitoring |

- User preferences: per-channel opt-in/out
- Delivery tracking: sent/delivered/read status
- Templates: i18n-aware, variable substitution

## 6. Monitoring & Alerting

- **Metrics**: Prometheus + Grafana
- **Logs**: structured JSON → Loki / CloudWatch
- **Traces**: OpenTelemetry → Jaeger
- **Alerts**: PagerDuty / Telegram for SEV-1/2

## 7. Incident Response

| SEV | Response Time | Escalation |
|-----|--------------|------------|
| SEV-1 (outage) | 15 min | Immediate — all hands |
| SEV-2 (degraded) | 1 hour | On-call engineer |
| SEV-3 (minor) | Next business day | Ticket |

Post-mortem: Timeline → Root Cause → Impact → Action Items → Prevention

## 8. Cost Optimization

- Right-size compute: monitor CPU/memory utilization
- Auto-scaling: scale down outside business hours
- Database: Neon auto-suspend for dev/staging
- Storage: lifecycle policies for old uploads
- Review: monthly cost report with recommendations
