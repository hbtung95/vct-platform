---
name: vct-domain
description: "VCT Platform business domains — Võ Cổ Truyền rules, real-time scoring, payments, e-learning, medical/anti-doping, media/streaming, gamification, subscriptions, and external integrations."
---

# VCT Domain — Business Verticals

> Consolidated: domain-expert + algorithm-expert + realtime-scoring + payment + elearning + medical + media + gamification + subscription + integration

## 1. Võ Cổ Truyền Domain

### Competition Types
- **Đối kháng** (Sparring): Weight class, age category, elimination bracket
- **Quyền thuật** (Forms): Bài quyền performance, panel scoring
- **Biểu diễn** (Demo): Team performance, artistic scoring

### Belt/Ranking System
- Progression: White → Yellow → Green → Blue → Brown → Black (1st-5th Dan)
- Requirements: training hours, competition results, technique assessments
- ELO/Glicko-2 rating for competitive ranking

### Tournament Workflow
```
Tạo → Đăng ký → Cân đo → Bốc thăm → Thi đấu → Kết quả → Khen thưởng
```

## 2. Real-Time Scoring

### Đối kháng Scoring
```
Event → Validate → Score Update → WebSocket Broadcast → UI Update
```
- 6-step penalty system: Nhắc nhở → Chú ý → Trừ điểm → Trừ nặng → Loại → Cấm
- Offline PWA: score locally, sync when connected

### Quyền thuật Scoring
- Panel of judges (3-5), drop highest/lowest, average
- Criteria: technique accuracy, power, stance, spirit

## 3. Payments & Subscriptions

### Payment Gateways
| Gateway | Region | Use Case |
|---------|--------|----------|
| VNPay | Vietnam | Tournament fees, memberships |
| MoMo | Vietnam | Mobile payments |
| Stripe | Global | International payments |

### Subscription Plans
- **Free**: Basic profile, view tournaments
- **Club**: Club management, member tracking
- **Federation**: Full platform, analytics, multi-tournament
- Billing cycles: monthly/annual, auto-renewal, upgrade/downgrade

## 4. E-Learning & Certification

- **Courses**: Video lessons for bài quyền techniques
- **Progress**: Track completion, quiz scores, practice logs
- **Certification**: Belt exam online testing, digital certificates
- **Coach training**: Referee/coach certification programs

## 5. Medical & Safety

- Pre-competition medical clearance workflow
- Injury tracking and concussion protocols
- WADA anti-doping testing compliance
- Emergency action plans
- Weight management safety monitoring

## 6. Media & Streaming

- Match recording and replay
- Bài quyền technique video library
- Live streaming via YouTube/Twitch integration
- Photo galleries with CDN delivery
- Video transcoding: multiple quality levels

## 7. Gamification

- **XP System**: Earn points for training, competing, engaging
- **Badges**: Achievement-based (first tournament, 100 matches, etc.)
- **Leaderboards**: Per-federation, national, global
- **Streaks**: Training consistency tracking
- **Challenges**: Monthly/seasonal community challenges

## 8. External Integrations

| Integration | Protocol | Purpose |
|------------|----------|---------|
| WVVF | REST API | International federation data |
| Government athlete ID | API | Athlete verification |
| Google Calendar | OAuth + API | Tournament sync |
| Social login | OAuth 2.0 | Google, Facebook sign-in |
| Webhooks | HTTP POST | Third-party notifications |
