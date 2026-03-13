# Walkthrough: VCT Development Workflows

## Tổng Quan

**28 workflow files** trong [.agent/workflows/](file:///d:/VCT%20PLATFORM/vct-platform/.agent/workflows) — bộ workflow hoàn chỉnh cho toàn bộ development lifecycle, quality assurance, và self-improvement.

## Danh Sách Workflows (28)

### 🔨 Core Development (5)
| Command | Mục đích |
|---|---|
| `/new-feature` | Full-stack development (BA→SA→Dev→QA) |
| `/add-module` | Tạo module hoàn chỉnh (10 bước) |
| `/add-page` | Tạo trang frontend mới |
| `/add-api` | Tạo API endpoint backend |
| `/add-component` | Tạo UI component (`VCT_` prefix) |

### 🐛 Fix & Maintenance (3)
| Command | Mục đích |
|---|---|
| `/fix-bug` | Điều tra & sửa bug |
| `/hotfix` | Sửa lỗi khẩn cấp production |
| `/refactor` | Refactoring (behavior unchanged) |

### ✅ Quality & Security (4)
| Command | Mục đích |
|---|---|
| `/code-review` | Review chất lượng code (CTO) |
| `/testing` | Viết tests (Go, Playwright E2E) |
| `/security-audit` | Audit bảo mật toàn diện |
| **`/audit`** | **Rà soát, phản biện, đề xuất nâng cấp (12-point framework)** |

### ⚙️ Operations (5)
| Command | Mục đích |
|---|---|
| `/deploy` | Build & deploy verification |
| `/db-migration` | Database migration |
| `/i18n` | Đa ngôn ngữ (vi + en) |
| `/add-seed-data` | Dữ liệu seed (đai, hạng cân, quy chế) |
| `/update-deps` | Cập nhật dependencies |

### 📚 Supplementary (5)
| Command | Mục đích |
|---|---|
| `/onboarding` | Setup dev environment từ đầu |
| `/add-realtime` | WebSocket/real-time |
| `/performance` | Performance profiling & optimization |
| `/documentation` | Viết/cập nhật docs, API docs, ADR |
| `/design-review` | UI/UX design review |

### 🧬 Meta-Learning & Self-Improvement (6)
| Command | Mục đích |
|---|---|
| `/upgrade-skill` | Nâng cấp skill AI đã có |
| `/upgrade-workflow` | Nâng cấp workflow đã có |
| `/create-skill` | Tạo skill AI mới + đăng ký orchestrator |
| `/create-workflow` | Tạo workflow mới từ pattern lặp lại |
| `/retrospective` | Rút kinh nghiệm sau task → cải thiện |
| `/learn` | Tự học từ codebase, docs, resources |
