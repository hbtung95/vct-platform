# Walkthrough: Bộ Dữ Liệu Mặc Định VCT Platform

## Tổng quan

**16 JSON files** + **3 seed SQL** + **1 Go loader** = Bộ dữ liệu mặc định hoàn chỉnh cho VCT Platform.

## Danh sách files (`backend/data/`)

| # | File | Nội dung | KB |
|---|---|---|---|
| 1 | `vietnam_divisions.json` | 34 tỉnh/TP (đã có sẵn) | 581 |
| 2 | `system_configs.json` | Cấu hình platform, tournament | 1.8 |
| 3 | `belt_ranks.json` | 14 cấp đai (trắng → cửu đẳng) | 3.2 |
| 4 | `standard_weight_classes.json` | 30 hạng cân | 3.0 |
| 5 | `standard_age_groups.json` | 6 nhóm lứa tuổi | 1.3 |
| 6 | `standard_forms.json` | QT: 18, BK: 20, SL: 6, ĐĐ: 4 + 10 bài quy định + 18 ban binh khí | 7.6 |
| 7 | `roles_permissions.json` | 11 vai trò RBAC | 5.1 |
| 8 | `notification_templates.json` | 16 template thông báo | 6.1 |
| 9 | `email_templates.json` | 8 template email HTML | 4.7 |
| 10 | `violation_types.json` | 10 vi phạm + 7 hình thức xử lý | 4.8 |
| 11 | `sample_clubs.json` | 30 CLB mẫu | 10.7 |
| 12 | `tournament_history.json` | 3 giải đấu lịch sử | 5.3 |
| 13 | `scoring_criteria.json` | Chấm điểm quyền + đối kháng + mức trừ lỗi | ~7 |
| 14 | `fee_schedule.json` | Biểu phí giải đấu, chứng chỉ, hội phí | ~4 |
| 15 | `countries.json` | 30 quốc gia có phong trào VCT/Vovinam | ~4 |
| 16 | `equipment_standards.json` | Sàn + bảo hộ + vũ khí + võ phục | ~6 |
| 17 | `training_syllabus.json` | Giáo trình thi lên đai (vàng → ngũ đẳng) | ~7 |

## Seed SQL (`backend/sql/seeds/`)

| File | Loads |
|---|---|
| `0004_seed_administrative.sql` | Belt ranks, weight classes, age groups, config, violations |
| `0005_seed_reference_data.sql` | 31 standard forms + 11 notification templates |
| `0006_seed_demo_expanded.sql` | 20 sample clubs + 3 tournament history |

## Go Loader (`backend/data/refdata.go`)

```go
// All loaders — build ✅
refdata.LoadBeltRanks()             // []BeltRank
refdata.LoadWeightClasses()         // map[string][]WeightClass
refdata.LoadAgeGroups()             // []AgeGroup
refdata.LoadStandardForms()         // map[string][]StandardForm
refdata.LoadSystemConfig()          // *SystemConfig
refdata.LoadRoles()                 // []Role
refdata.LoadViolationTypes()        // []ViolationType
refdata.LoadSanctionTypes()         // []SanctionType
refdata.LoadNotificationTemplates() // []NotificationTemplate
refdata.LoadEmailTemplates()        // []EmailTemplate
refdata.LoadSampleClubs()           // []SampleClub
refdata.LoadScoringCriteria()       // map[string]any
refdata.LoadFeeSchedule()           // map[string]any
refdata.LoadCountries()             // []Country
refdata.LoadEquipmentStandards()    // map[string]any
refdata.LoadTrainingSyllabus()      // []BeltRequirement
```

## Verification

- ✅ `go build ./data/` — thành công
- ✅ 17 JSON files valid
- ✅ Seed SQL idempotent (`ON CONFLICT ... DO UPDATE`)
- ✅ Tất cả files có `"_editable": true` — chỉnh sửa trực tiếp
