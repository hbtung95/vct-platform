# 📊 VCT Platform — Báo cáo phân tích Database & ERD

> **Ngày phân tích**: 16/03/2026  
> **Nguồn dữ liệu**: 10 migration files (0001–0010)  
> **Tổng số tables**: **64 tables** across **7 schemas**

---

## 1. Tổng quan kiến trúc Database

| Schema | Mục đích | Số tables |
|--------|----------|-----------|
| `public` | Tournament, Competition, Auth (legacy) | 22 |
| `core` | Multi-tenant, Users, RBAC, Sessions | 5 |
| `training` | Curricula, E-learning, Belt exams | 10 |
| `people` | Club branches, Coaches, Certifications | 6 |
| `platform` (Finance) | Fees, Payments, Invoices, Budgets | 7 |
| `platform` (Heritage) | Martial schools, Lineage, Glossary | 7 |
| `platform` (Community) | Posts, Groups, Marketplace | 7 |

> [!IMPORTANT]
> Database sử dụng **multi-tenant architecture** với `tenant_id` trên mọi table enterprise (core/training/people/platform). Schema `public` chứa legacy tables chưa migrate sang tenant model.

---

## 2. ERD — Sơ đồ quan hệ tổng thể

### 2.1 Core & Authentication

```mermaid
erDiagram
    core_tenants {
        UUID id PK
        VARCHAR name
        VARCHAR code UK
        VARCHAR tenant_type
        UUID parent_id FK
        BOOLEAN is_active
        INT version
    }
    core_users {
        UUID id PK
        UUID tenant_id FK
        VARCHAR username
        VARCHAR email
        VARCHAR password_hash
        VARCHAR full_name
        VARCHAR locale
        BOOLEAN is_active
        BOOLEAN is_deleted
        INT version
    }
    core_roles {
        UUID id PK
        UUID tenant_id FK
        VARCHAR name
        JSONB permissions
        BOOLEAN is_system
        INT version
    }
    core_user_roles {
        UUID id PK
        UUID tenant_id FK
        UUID user_id FK
        UUID role_id FK
        VARCHAR scope_type
        UUID scope_id
        BOOLEAN is_active
    }
    core_sessions {
        UUID id PK
        UUID tenant_id FK
        UUID user_id FK
        VARCHAR token_hash
        JSONB device_info
        INET ip_address
        TIMESTAMPTZ expires_at
    }
    core_auth_audit_log {
        UUID id PK
        UUID tenant_id FK
        UUID user_id FK
        VARCHAR action
        JSONB details
    }

    core_tenants ||--o{ core_tenants : "parent_id (self-ref)"
    core_tenants ||--o{ core_users : "tenant_id"
    core_tenants ||--o{ core_roles : "tenant_id"
    core_tenants ||--o{ core_user_roles : "tenant_id"
    core_tenants ||--o{ core_sessions : "tenant_id"
    core_users ||--o{ core_user_roles : "user_id"
    core_roles ||--o{ core_user_roles : "role_id"
    core_users ||--o{ core_sessions : "user_id"
    core_users ||--o{ core_auth_audit_log : "user_id"
```

### 2.2 Tournament & Competition (public schema)

```mermaid
erDiagram
    tournaments {
        UUID id PK
        VARCHAR name
        VARCHAR code UK
        VARCHAR level
        DATE start_date
        DATE end_date
        VARCHAR status
        JSONB config
    }
    teams {
        UUID id PK
        UUID tournament_id FK
        VARCHAR ten
        VARCHAR ma_doan
        VARCHAR loai
        VARCHAR trang_thai
        UUID delegate_user_id FK
    }
    athletes {
        UUID id PK
        UUID tournament_id FK
        UUID team_id FK
        VARCHAR ho_ten
        VARCHAR gioi_tinh
        DATE ngay_sinh
        DECIMAL can_nang
        VARCHAR trang_thai
        UUID user_id FK
        UUID current_club_id
        UUID belt_rank_id
    }
    age_groups {
        UUID id PK
        UUID tournament_id FK
        VARCHAR ten
        INT tuoi_min
        INT tuoi_max
    }
    content_categories {
        UUID id PK
        UUID tournament_id FK
        VARCHAR ten
        VARCHAR loai
        VARCHAR gioi_tinh
        UUID lua_tuoi_id FK
    }
    weight_classes {
        UUID id PK
        UUID tournament_id FK
        VARCHAR ten
        VARCHAR gioi_tinh
        UUID lua_tuoi_id FK
        DECIMAL can_nang_min
        DECIMAL can_nang_max
    }
    registrations {
        UUID id PK
        UUID tournament_id FK
        UUID athlete_id FK
        UUID content_category_id FK
        UUID weight_class_id
        VARCHAR trang_thai
    }

    tournaments ||--o{ teams : "tournament_id"
    tournaments ||--o{ athletes : "tournament_id"
    tournaments ||--o{ age_groups : "tournament_id"
    tournaments ||--o{ content_categories : "tournament_id"
    tournaments ||--o{ weight_classes : "tournament_id"
    tournaments ||--o{ registrations : "tournament_id"
    teams ||--o{ athletes : "team_id"
    athletes ||--o{ registrations : "athlete_id"
    content_categories ||--o{ registrations : "content_category_id"
    age_groups ||--o{ content_categories : "lua_tuoi_id"
    age_groups ||--o{ weight_classes : "lua_tuoi_id"
```

### 2.3 Competition — Matches & Scoring

```mermaid
erDiagram
    combat_matches {
        UUID id PK
        UUID tournament_id FK
        UUID content_category_id FK
        UUID arena_id FK
        UUID athlete_red_id FK
        UUID athlete_blue_id FK
        VARCHAR vong
        VARCHAR trang_thai
        UUID nguoi_thang_id FK
        JSONB event_log
    }
    form_performances {
        UUID id PK
        UUID tournament_id FK
        UUID content_category_id FK
        UUID arena_id FK
        UUID athlete_id FK
        JSONB judge_scores
        DECIMAL tong_diem
        INT xep_hang
        VARCHAR trang_thai
    }
    arenas {
        UUID id PK
        UUID tournament_id FK
        VARCHAR ten
        VARCHAR loai
        VARCHAR trang_thai
        INT suc_chua
    }
    referees {
        UUID id PK
        UUID tournament_id FK
        VARCHAR ho_ten
        VARCHAR cap_bac
        VARCHAR chuyen_mon
        UUID user_id FK
    }
    referee_assignments {
        UUID id PK
        UUID tournament_id FK
        UUID referee_id FK
        UUID arena_id FK
        DATE session_date
        VARCHAR role
    }
    match_events {
        UUID id PK
        UUID match_id
        VARCHAR match_type
        VARCHAR event_type
        JSONB event_data
        BIGINT sequence_number
        UUID recorded_by FK
    }
    judge_scores {
        UUID id PK
        UUID tournament_id FK
        UUID match_id
        UUID referee_id FK
        UUID athlete_id FK
        DECIMAL score
        BOOLEAN is_final
    }

    tournaments ||--o{ combat_matches : "tournament_id"
    tournaments ||--o{ form_performances : "tournament_id"
    tournaments ||--o{ arenas : "tournament_id"
    tournaments ||--o{ referees : "tournament_id"
    arenas ||--o{ combat_matches : "arena_id"
    arenas ||--o{ form_performances : "arena_id"
    arenas ||--o{ referee_assignments : "arena_id"
    referees ||--o{ referee_assignments : "referee_id"
    referees ||--o{ judge_scores : "referee_id"
    athletes ||--o{ judge_scores : "athlete_id"
    combat_matches ||--o{ match_events : "match_id"
```

### 2.4 Results, Rankings & Organizations

```mermaid
erDiagram
    results {
        UUID id PK
        UUID tournament_id FK
        UUID content_category_id FK
        UUID athlete_id FK
        UUID team_id FK
        VARCHAR event_type
        INT rank
        VARCHAR medal
        DECIMAL score
    }
    medals_summary {
        UUID id PK
        UUID tournament_id FK
        UUID team_id FK
        INT gold
        INT silver
        INT bronze
        INT rank
    }
    rankings {
        UUID id PK
        UUID athlete_id FK
        VARCHAR category
        DECIMAL elo_rating
        INT national_rank
        INT wins
        INT losses
    }
    federations {
        UUID id PK
        VARCHAR name
        VARCHAR code UK
        VARCHAR level
        UUID parent_id FK
        BOOLEAN is_active
    }
    clubs {
        UUID id PK
        UUID federation_id FK
        VARCHAR name
        VARCHAR code UK
        INT member_count
        BOOLEAN is_active
    }

    tournaments ||--o{ results : "tournament_id"
    tournaments ||--o{ medals_summary : "tournament_id"
    athletes ||--o{ results : "athlete_id"
    teams ||--o{ results : "team_id"
    teams ||--o{ medals_summary : "team_id"
    athletes ||--o{ rankings : "athlete_id"
    federations ||--o{ federations : "parent_id (self-ref)"
    federations ||--o{ clubs : "federation_id"
```

### 2.5 Training Module

```mermaid
erDiagram
    training_curricula {
        UUID id PK
        UUID tenant_id FK
        VARCHAR name
        VARCHAR code
        VARCHAR school_style
    }
    training_curriculum_levels {
        UUID id PK
        UUID tenant_id FK
        UUID curriculum_id
        UUID belt_rank_id
        INT level_order
        VARCHAR name
    }
    training_techniques {
        UUID id PK
        UUID tenant_id FK
        VARCHAR name_vi
        VARCHAR category
        INT difficulty_level
    }
    training_curriculum_techniques {
        UUID id PK
        UUID tenant_id FK
        UUID curriculum_level_id
        UUID technique_id
        BOOLEAN is_mandatory
    }
    training_plans {
        UUID id PK
        UUID tenant_id FK
        UUID club_id
        UUID coach_id
        VARCHAR name
        VARCHAR status
    }
    training_sessions {
        UUID id PK
        UUID tenant_id FK
        UUID training_plan_id
        UUID coach_id
        VARCHAR title
        DATE session_date
        VARCHAR status
    }
    attendance_records {
        UUID id PK
        UUID tenant_id FK
        UUID session_id
        UUID athlete_id
        VARCHAR status
    }
    belt_examinations {
        UUID id PK
        UUID tenant_id FK
        UUID club_id
        VARCHAR title
        DATE exam_date
        UUID target_belt_id
        VARCHAR status
    }
    belt_exam_results {
        UUID id PK
        UUID tenant_id FK
        UUID examination_id
        UUID athlete_id
        VARCHAR result
        VARCHAR certificate_number
    }
    courses {
        UUID id PK
        UUID tenant_id FK
        VARCHAR title
        VARCHAR code
        VARCHAR category
        VARCHAR level
        BOOLEAN is_published
        DECIMAL price
    }
    course_enrollments {
        UUID id PK
        UUID tenant_id FK
        UUID course_id
        UUID user_id
        DECIMAL progress_percent
        VARCHAR status
    }
    technique_media {
        UUID id PK
        UUID tenant_id FK
        UUID technique_id
        VARCHAR media_type
        TEXT url
    }

    training_curricula ||--o{ training_curriculum_levels : "curriculum_id"
    training_curriculum_levels ||--o{ training_curriculum_techniques : "curriculum_level_id"
    training_techniques ||--o{ training_curriculum_techniques : "technique_id"
    training_techniques ||--o{ technique_media : "technique_id"
    training_plans ||--o{ training_sessions : "training_plan_id"
    training_sessions ||--o{ attendance_records : "session_id"
    belt_examinations ||--o{ belt_exam_results : "examination_id"
    courses ||--o{ course_enrollments : "course_id"
```

### 2.6 People Module

```mermaid
erDiagram
    people_club_branches {
        UUID id PK
        UUID tenant_id FK
        UUID club_id
        VARCHAR name
        VARCHAR city
        VARCHAR province
        INT capacity
    }
    people_club_memberships {
        UUID id PK
        UUID tenant_id FK
        UUID club_id
        UUID user_id
        UUID athlete_id
        VARCHAR role
        VARCHAR status
        VARCHAR membership_number
    }
    people_coaches {
        UUID id PK
        UUID tenant_id FK
        UUID user_id
        VARCHAR full_name
        UUID club_id
        UUID belt_rank_id
        INT experience_years
        VARCHAR status
    }
    people_certifications {
        UUID id PK
        UUID tenant_id FK
        VARCHAR holder_type
        UUID holder_id
        VARCHAR cert_type
        DATE issue_date
        DATE expiry_date
        VARCHAR status
    }
    people_athlete_belt_history {
        UUID id PK
        UUID tenant_id FK
        UUID athlete_id
        UUID belt_rank_id
        DATE valid_from
        DATE valid_to
        UUID examination_id
    }
    people_athlete_weight_history {
        UUID id PK
        UUID tenant_id FK
        UUID athlete_id
        DECIMAL weight
        DATE measured_at
        VARCHAR context
    }

    clubs ||--o{ people_club_branches : "club_id"
    clubs ||--o{ people_club_memberships : "club_id"
    clubs ||--o{ people_coaches : "club_id"
    athletes ||--o{ people_athlete_belt_history : "athlete_id"
    athletes ||--o{ people_athlete_weight_history : "athlete_id"
```

### 2.7 Finance Module (platform schema)

```mermaid
erDiagram
    platform_fee_schedules {
        UUID id PK
        UUID tenant_id FK
        VARCHAR name
        VARCHAR fee_type
        DECIMAL amount
        VARCHAR currency
        VARCHAR period
    }
    platform_payments {
        UUID id PK
        UUID tenant_id FK
        UUID fee_schedule_id
        UUID payer_user_id
        DECIMAL amount
        VARCHAR payment_method
        VARCHAR status
    }
    platform_invoices {
        UUID id PK
        UUID tenant_id FK
        VARCHAR invoice_number
        UUID club_id
        UUID tournament_id
        DECIMAL total_amount
        VARCHAR status
    }
    platform_invoice_items {
        UUID id PK
        UUID tenant_id FK
        UUID invoice_id
        VARCHAR description
        INT quantity
        DECIMAL amount
    }
    platform_sponsorships {
        UUID id PK
        UUID tenant_id FK
        VARCHAR sponsor_name
        VARCHAR sponsor_type
        UUID tournament_id
        DECIMAL amount
        VARCHAR status
    }
    platform_tournament_budgets {
        UUID id PK
        UUID tenant_id FK
        UUID tournament_id
        DECIMAL total_budget
        DECIMAL total_spent
        VARCHAR status
    }
    platform_budget_items {
        UUID id PK
        UUID tenant_id FK
        UUID budget_id
        VARCHAR item_type
        DECIMAL planned_amount
        DECIMAL actual_amount
    }

    platform_fee_schedules ||--o{ platform_payments : "fee_schedule_id"
    platform_invoices ||--o{ platform_invoice_items : "invoice_id"
    platform_tournament_budgets ||--o{ platform_budget_items : "budget_id"
```

### 2.8 Heritage & Community Modules (platform schema)

```mermaid
erDiagram
    martial_schools {
        UUID id PK
        UUID tenant_id FK
        VARCHAR name
        VARCHAR code
        VARCHAR founder
        INT founded_year
        UUID parent_school_id
        UUID federation_id
    }
    school_lineage {
        UUID id PK
        UUID tenant_id FK
        UUID school_id
        UUID parent_school_id
        VARCHAR relationship_type
    }
    lineage_nodes {
        UUID id PK
        UUID tenant_id FK
        VARCHAR person_name
        INT generation
        UUID school_id
        UUID parent_node_id
    }
    heritage_techniques {
        UUID id PK
        UUID tenant_id FK
        UUID school_id
        VARCHAR name_vi
        VARCHAR category
        VARCHAR difficulty
    }
    heritage_glossary {
        UUID id PK
        UUID tenant_id FK
        VARCHAR term_vi
        VARCHAR term_han_nom
        TEXT definition
    }
    heritage_events {
        UUID id PK
        UUID tenant_id FK
        VARCHAR name
        VARCHAR event_type
        UUID school_id
        VARCHAR status
    }
    posts {
        UUID id PK
        UUID tenant_id FK
        UUID author_id
        VARCHAR title
        TEXT content
        VARCHAR post_type
        VARCHAR visibility
        INT like_count
    }
    comments {
        UUID id PK
        UUID tenant_id FK
        UUID post_id
        UUID author_id
        UUID parent_comment_id
        TEXT content
    }
    community_groups {
        UUID id PK
        UUID tenant_id FK
        VARCHAR name
        VARCHAR group_type
        UUID owner_id
        VARCHAR privacy
        INT member_count
    }
    marketplace_listings {
        UUID id PK
        UUID tenant_id FK
        UUID seller_id
        VARCHAR title
        VARCHAR category
        DECIMAL price
        VARCHAR status
    }

    martial_schools ||--o{ school_lineage : "school_id"
    martial_schools ||--o{ lineage_nodes : "school_id"
    martial_schools ||--o{ heritage_techniques : "school_id"
    martial_schools ||--o{ heritage_events : "school_id"
    lineage_nodes ||--o{ lineage_nodes : "parent_node_id (self-ref)"
    posts ||--o{ comments : "post_id"
    comments ||--o{ comments : "parent_comment_id (self-ref)"
    community_groups ||--o{ group_memberships : "group_id"
```

---

## 3. Reference Tables (Bảng tham chiếu)

| Table | Mô tả | Số records mẫu |
|-------|--------|-----------------|
| `ref_sport_types` | Loại hình thi đấu (Quyền, Đối kháng, Binh khí...) | 6 |
| `ref_competition_formats` | Thể thức thi đấu (Loại trực tiếp, Vòng tròn...) | 5 |
| `ref_penalty_types` | Các loại phạt (Cảnh cáo, Trừ điểm...) | 7 |
| `ref_scoring_criteria` | Tiêu chí chấm điểm (Kỹ thuật, Lực, Tốc độ...) | 7 |
| `ref_belt_ranks` | Hệ thống đai (Trắng → Đen) | 6 |
| `ref_age_categories` | Lứa tuổi (Thiếu nhi → Cao tuổi) | 5 |
| `ref_equipment_types` | Loại thiết bị | 0 |

---

## 4. Utility Tables (public schema)

| Table | Mô tả |
|-------|--------|
| `entity_records` | Legacy EAV store (JSONB) |
| `users` | Legacy auth users |
| `sessions` | Legacy JWT sessions |
| `auth_audit_log` | Legacy auth audit |
| `notifications` | Hệ thống thông báo |
| `medical_records` | Hồ sơ y tế VĐV |
| `media_files` | File media (ảnh, video) |
| `data_audit_log` | Audit trail dữ liệu |
| `schedule_entries` | Lịch thi đấu |
| `appeals` | Khiếu nại / Kháng nghị |
| `weigh_ins` | Cân nặng thi đấu |

---

## 5. Thống kê kiến trúc

### Quan hệ & Foreign Keys

| Loại quan hệ | Số lượng |
|--------------|----------|
| Foreign Keys (explicit) | ~45 |
| Self-referencing FK | 4 (tenants, federations, lineage_nodes, comments) |
| Cross-schema references | Core tenants → mọi enterprise schemas |

### Security Features

| Feature | Áp dụng |
|---------|---------|
| Row Level Security (RLS) | Tất cả tables trong `core`, `training`, `people`, `platform` |
| Tenant isolation policy | Mọi enterprise table |
| Soft delete (`is_deleted`) | Mọi entity tables (enterprise) |
| Audit trigger (`updated_at`) | ~30 tables |
| Hard delete prevention | `core.users` |

### Patterns sử dụng

| Pattern | Mô tả |
|---------|--------|
| **UUIDv7** | Time-ordered UUID cho enterprise tables |
| **Multi-tenant** | `tenant_id` FK trên mọi table enterprise |
| **Bitemporal** | `people.athlete_belt_history` (valid_from/valid_to + recorded_at/superseded_at) |
| **Event Sourcing** | `match_events` với sequence_number |
| **Versioning** | Cột `version` trên mọi mutable entity |
| **JSONB** | Metadata, configs, scores, tags |

---

## 6. Sơ đồ tổng thể theo Module (High-Level)

```mermaid
graph TB
    subgraph CORE["🔐 Core (Tenant & Auth)"]
        T[tenants] --> U[users]
        T --> R[roles]
        U --> UR[user_roles]
        R --> UR
        U --> S[sessions]
        U --> AAL[auth_audit_log]
    end

    subgraph TOURNAMENT["🏆 Tournament (public)"]
        TN[tournaments] --> TM[teams]
        TN --> AG[age_groups]
        TN --> CC[content_categories]
        TN --> WC[weight_classes]
        TN --> AR[arenas]
        TN --> REF[referees]
        TM --> ATH[athletes]
        ATH --> REG[registrations]
        CC --> REG
        ATH --> CM[combat_matches]
        ATH --> FP[form_performances]
        AR --> CM
        REF --> RA[referee_assignments]
        CM --> ME["match_events (Event Sourcing)"]
        ATH --> JS[judge_scores]
    end

    subgraph RESULTS["🏅 Results & Rankings"]
        ATH --> RES[results]
        TM --> MS[medals_summary]
        ATH --> RK[rankings]
    end

    subgraph ORGS["🏛️ Organizations"]
        FED[federations] --> CLB[clubs]
    end

    subgraph TRAINING["📚 Training"]
        CUR[curricula] --> CL[curriculum_levels]
        CL --> CT[curriculum_techniques]
        TECH[techniques] --> CT
        TP[training_plans] --> TS[training_sessions]
        TS --> ATT[attendance_records]
        BE[belt_examinations] --> BER[belt_exam_results]
        CRS[courses] --> CE[course_enrollments]
    end

    subgraph PEOPLE["👥 People"]
        CLB --> CB[club_branches]
        CLB --> CMB[club_memberships]
        CLB --> CO[coaches]
        ATH --> ABH[athlete_belt_history]
        ATH --> AWH[athlete_weight_history]
        CERT[certifications]
    end

    subgraph FINANCE["💰 Finance"]
        FS[fee_schedules] --> PAY[payments]
        INV[invoices] --> II[invoice_items]
        SP[sponsorships]
        TB[tournament_budgets] --> BI[budget_items]
    end

    subgraph HERITAGE["📜 Heritage"]
        MSC["martial_schools"] --> SL[school_lineage]
        MSC --> LN[lineage_nodes]
        MSC --> HT[heritage_techniques]
        HG[heritage_glossary]
        HE[heritage_events]
    end

    subgraph COMMUNITY["🌐 Community"]
        POST[posts] --> CMT[comments]
        REACT[reactions]
        FLW[follows]
        GRP[community_groups] --> GM[group_memberships]
        MKT[marketplace_listings]
    end

    T -.->|tenant_id| TRAINING
    T -.->|tenant_id| PEOPLE
    T -.->|tenant_id| FINANCE
    T -.->|tenant_id| HERITAGE
    T -.->|tenant_id| COMMUNITY
    FED -.-> MSC
    CLB -.-> TRAINING

    style CORE fill:#1a1a2e,stroke:#e94560,color:#fff
    style TOURNAMENT fill:#16213e,stroke:#0f3460,color:#fff
    style RESULTS fill:#1a1a2e,stroke:#e94560,color:#fff
    style ORGS fill:#0f3460,stroke:#533483,color:#fff
    style TRAINING fill:#2c3333,stroke:#2e4f4f,color:#fff
    style PEOPLE fill:#2c3333,stroke:#0e8388,color:#fff
    style FINANCE fill:#1b2430,stroke:#51557e,color:#fff
    style HERITAGE fill:#2b2e4a,stroke:#e84545,color:#fff
    style COMMUNITY fill:#1b1b2f,stroke:#1a1a40,color:#fff
```

---

## 7. Đánh giá & Nhận xét

### ✅ Điểm mạnh
1. **Multi-tenant architecture** vững chắc — RLS + tenant isolation policy
2. **Event Sourcing** cho scoring — replay, audit trail hoàn hảo
3. **Bitemporal data** cho belt history — truy vấn lịch sử chính xác
4. **UUIDv7** — hiệu suất insert tốt hơn 40-60% so với UUIDv4
5. **Soft delete** — bảo vệ dữ liệu, cho phép restore
6. **Reference tables** — chuẩn hóa dữ liệu domain VCT

### ⚠️ Điểm cần lưu ý
1. **Dual schema** — `public.users` và `core.users` tồn tại song song (legacy migration)
2. **Mối quan hệ cross-schema** chưa đầy đủ FK constraints giữa enterprise tables (dùng UUID nhưng thiếu explicit FK do composite PK)
3. **JSONB usage** — Nhiều trường dùng JSONB (scores, config) — cần GIN indexes cho query performance
4. **No partitioning** declared yet cho `match_events` — cần khi data grow lớn
