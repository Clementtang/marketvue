# 文件組織指南 | Documentation Organization Guide

> **建立日期**: 2025-11-26
> **最後更新**: 2025-11-26
> **維護者**: MarketVue 開發團隊

本文件說明 MarketVue 專案的文件組織原則與目錄結構，確保文件易於查找、維護與擴展。

---

## 📋 目錄

1. [組織原則](#組織原則)
2. [目錄結構](#目錄結構)
3. [文件分類規則](#文件分類規則)
4. [工作日誌管理](#工作日誌管理)
5. [歸檔流程](#歸檔流程)
6. [命名規範](#命名規範)
7. [維護指南](#維護指南)

---

## 組織原則

### 核心理念

1. **按用途分類** - 不同受眾（用戶、開發者、維護者）的文件分開
2. **按時間歸檔** - 歷史文件按專案階段（Phase）組織
3. **保持簡潔** - 避免重複文件，定期清理過時內容
4. **易於導航** - 每個主要目錄都有 README.md 索引
5. **版本控制** - 重要文件包含日期和版本資訊

### 業界參考

本指南參考以下業界標準：
- [Google Documentation Best Practices](https://google.github.io/styleguide/docguide/best_practices.html)
- [GitLab Documentation Structure](https://docs.gitlab.com/ee/development/documentation/structure.html)
- [Microsoft Docs Contributor Guide](https://learn.microsoft.com/en-us/contribute/)

---

## 目錄結構

### 完整結構

```
docs/
├── README.md                          # 📌 文件導航索引
├── API.md                             # API 端點說明
├── ARCHITECTURE.md                    # 系統架構設計
├── DEPLOYMENT.md                      # 部署指南
├── DEPLOYMENT_CONFIG.md               # 部署配置詳情
├── DOCUMENTATION_GUIDE.md             # 本文件
│
├── guides/                            # 🎯 使用指南（面向用戶）
│   ├── README.md                     # 指南索引
│   ├── quick-start.md                # 快速開始
│   ├── user-manual.md                # 使用手冊
│   └── troubleshooting.md            # 故障排除
│
├── development/                       # 🛠️ 開發文件（面向開發者）
│   ├── README.md                     # 開發文件索引
│   ├── implementation-roadmap.md     # 實作路線圖
│   ├── frontend-optimization-plan.md # 前端優化計劃
│   ├── contributing.md               # 貢獻指南
│   └── meeting-notes/                # 會議記錄
│       ├── README.md
│       └── 2025-11-14.md
│
├── project-history/                   # 📚 專案歷史（歸檔）
│   ├── README.md                     # 歷史索引
│   ├── PROJECT_PROGRESS_SUMMARY.md   # 總體進度總結
│   ├── recent-changes-timeline.md    # 近期變更時間線
│   │
│   ├── phases/                       # 按開發階段組織
│   │   ├── phase1/                   # Phase 1: CI/CD + 測試基礎
│   │   │   ├── README.md            # Phase 1 總結
│   │   │   ├── report-completion.md # 完成報告
│   │   │   ├── work-logs/           # 工作日誌
│   │   │   │   ├── 2025-11-10.md
│   │   │   │   └── 2025-11-11.md
│   │   │   └── planning/            # 計劃文件（已完成）
│   │   │       └── *.md
│   │   │
│   │   ├── phase2/                   # Phase 2: 前端重構
│   │   │   ├── README.md
│   │   │   ├── report-completion.md
│   │   │   └── work-logs/
│   │   │       ├── 2025-11-17-day5.md
│   │   │       ├── 2025-11-17-day6.md
│   │   │       └── 2025-11-20-day7.md
│   │   │
│   │   └── phase3/                   # Phase 3: 後端重構
│   │       ├── README.md
│   │       └── work-logs/
│   │           ├── 2025-11-20-day1.md
│   │           ├── 2025-11-20-day2.md
│   │           ├── 2025-11-23-day3.md
│   │           ├── 2025-11-23-day4.md
│   │           ├── 2025-11-24-day5.md
│   │           ├── 2025-11-24-day6.md
│   │           ├── 2025-11-24-day7.md
│   │           ├── 2025-11-24-day8.md
│   │           └── 2025-11-24-day9.md
│   │
│   ├── optimizations/                # 優化階段
│   │   └── frontend-2025-11-24.md
│   │
│   ├── deployments/                  # 部署驗證記錄
│   │   └── deployment-verification-2025-11-25.md
│   │
│   └── archive/                      # 過時文件歸檔
│       ├── README.md                # 說明歸檔原因
│       └── (已過時的分析、計劃文件)
│
├── security/                          # 🔒 安全文件
│   ├── README.md
│   ├── IMPLEMENTATION-SUMMARY.md
│   ├── audits/                       # 安全審計報告
│   ├── checklists/                   # 安全檢查清單
│   ├── guides/                       # 安全實作指南
│   └── work-logs/                    # 安全相關工作日誌
│
└── workflows/                         # 🔄 工作流程
    ├── README.md
    ├── branch-management-sop.md      # 分支管理 SOP
    └── quick-reference.md            # 快速參考
```

### `.todo/` 目錄（專案根目錄）

⚠️ **重要**: `.todo/` 是臨時工作區，不是歷史歸檔區

```
.todo/
├── current-tasks.md                   # 當前任務清單
├── planning/                          # 當前規劃中的內容
│   └── (進行中的計劃文件)
└── scratch/                           # 臨時筆記、研究
    └── (可隨時刪除的檔案)
```

**原則**:
- 只放**當前進行中**的任務和臨時筆記
- 工作完成後，重要內容**必須**歸檔到 `docs/`
- 定期清理（建議每週或每個 Phase 結束時）

---

## 文件分類規則

### 按受眾分類

| 受眾 | 目錄 | 文件類型 |
|------|------|---------|
| **終端用戶** | `docs/guides/` | 使用手冊、快速開始、FAQ |
| **開發者** | `docs/development/` | 架構設計、API 文件、貢獻指南 |
| **維護者** | `docs/project-history/` | 工作日誌、決策記錄、歷史文件 |
| **DevOps** | `docs/` (根目錄) | 部署指南、配置說明 |

### 按性質分類

| 性質 | 存放位置 | 範例 |
|------|---------|------|
| **技術規範** | `docs/` 根目錄 | API.md, ARCHITECTURE.md |
| **指南教學** | `docs/guides/` | user-manual.md, troubleshooting.md |
| **開發規劃** | `docs/development/` | roadmap.md, optimization-plan.md |
| **歷史記錄** | `docs/project-history/` | work-logs, completion reports |
| **安全相關** | `docs/security/` | audits, implementation guides |
| **工作流程** | `docs/workflows/` | SOPs, quick references |

---

## 工作日誌管理

### 命名規範

```
YYYY-MM-DD-description.md
或
YYYY-MM-DD-dayN.md (用於多日連續工作)
```

**範例**:
- ✅ `2025-11-10.md` - 單日工作日誌
- ✅ `2025-11-24-day5.md` - Phase 的第 5 天
- ✅ `2025-11-24-frontend-optimization.md` - 主題明確
- ❌ `work-log-phase3-day3-2025-11-23.md` - 太冗長

### 內容結構

每個工作日誌應包含：

```markdown
# [日期] - [主題]

> **Phase**: Phase 3 - 後端重構
> **Day**: Day 5
> **日期**: 2025-11-24
> **工作時間**: 4 小時

## 📋 今日目標

- [ ] 目標 1
- [ ] 目標 2

## 🛠️ 實際完成

### 1. 功能實作
- 詳細描述...

### 2. 測試結果
- 測試覆蓋率: XX%
- 測試通過: XX/XX

## 🐛 遇到的問題

### 問題 1: 問題描述
- **原因**: ...
- **解決方案**: ...

## 📝 筆記與學習

- 重要決策記錄
- 技術發現

## ⏭️ 明日計劃

- [ ] 待辦事項 1
- [ ] 待辦事項 2

---

**相關 Commits**: `abc1234`, `def5678`
**相關文件**: `docs/API.md`, `CHANGELOG.md`
```

### 存放位置邏輯

```
當前進行中 → .todo/planning/
  ↓ 完成後
歸檔到對應 Phase → docs/project-history/phases/phaseN/work-logs/
```

---

## 歸檔流程

### Phase 完成時的歸檔

#### Step 1: 整理工作日誌

```bash
# 1. 建立 Phase 目錄結構
mkdir -p docs/project-history/phases/phase3/{work-logs,planning}

# 2. 移動工作日誌
mv docs/work-log-phase3-*.md docs/project-history/phases/phase3/work-logs/

# 3. 重新命名（統一格式）
cd docs/project-history/phases/phase3/work-logs/
mv work-log-phase3-day3-2025-11-23.md 2025-11-23-day3.md
mv work-log-phase3-day4-2025-11-23.md 2025-11-23-day4.md
# ... 以此類推
```

#### Step 2: 建立 Phase 總結

建立 `docs/project-history/phases/phase3/README.md`:

```markdown
# Phase 3: 後端重構

> **執行期間**: 2025-11-20 ~ 2025-11-24 (5 天，9 個工作日)
> **狀態**: ✅ 完成

## 目標

- 重構後端服務層
- 實作 Redis 快取
- API 版本化
- 增強日誌系統

## 主要成果

- 服務層拆分成 5 個單一職責服務
- Redis 快取支援
- API v1 版本化
- 測試覆蓋率達到 86.45%

## 工作日誌

- [Day 1 - 2025-11-20](work-logs/2025-11-20-day1.md)
- [Day 2 - 2025-11-20](work-logs/2025-11-20-day2.md)
- [Day 3 - 2025-11-23](work-logs/2025-11-23-day3.md)
- ...

## 相關文件

- [完成報告](report-completion.md)
- [CHANGELOG.md](../../../CHANGELOG.md#phase-3)
```

#### Step 3: 更新索引

更新 `docs/project-history/README.md`，新增 Phase 3 連結。

#### Step 4: 清理臨時檔案

```bash
# 清理 .todo/ 中已完成的檔案
rm -rf .todo/phase3-planning/
```

### 定期維護歸檔

**頻率**: 每週五或每個 Phase 結束時

**檢查清單**:
- [ ] 所有完成的工作日誌已移到對應 phase
- [ ] 臨時計劃檔案已歸檔或刪除
- [ ] `.todo/` 只包含當前任務
- [ ] README.md 索引已更新
- [ ] 過時文件移到 `archive/` 並說明原因

---

## 命名規範

### 文件命名

| 文件類型 | 格式 | 範例 |
|---------|------|------|
| **技術文件** | `UPPERCASE.md` | `API.md`, `DEPLOYMENT.md` |
| **指南** | `lowercase-with-dashes.md` | `quick-start.md`, `user-manual.md` |
| **工作日誌** | `YYYY-MM-DD-description.md` | `2025-11-24-frontend-optimization.md` |
| **會議記錄** | `YYYY-MM-DD.md` | `2025-11-14.md` |
| **總結報告** | `descriptive-name-YYYY-MM-DD.md` | `deployment-verification-2025-11-25.md` |

### 目錄命名

- 使用 **小寫** + **連字號** (`lowercase-with-dashes`)
- 複數形式（如 `guides/`, `phases/`, `work-logs/`）
- 清楚表達內容（`project-history/` 而非 `history/`）

---

## 維護指南

### 新增文件時

1. **確定受眾** - 這是給誰看的？
2. **選擇目錄** - 根據分類規則選擇位置
3. **遵循命名** - 使用標準命名格式
4. **更新索引** - 在對應的 README.md 新增連結
5. **加入 metadata** - 日期、作者、版本

### 文件審查

**每月第一週**進行文件審查：

```markdown
## 文件審查檢查清單

- [ ] 所有 README.md 索引是否最新？
- [ ] 是否有重複或過時的文件？
- [ ] `.todo/` 是否保持輕量？
- [ ] 工作日誌是否已歸檔？
- [ ] 所有文件的日期是否正確？
- [ ] 連結是否都有效？
```

### 刪除文件

**原則**: 不要直接刪除，先歸檔

1. 移動到 `docs/project-history/archive/`
2. 在 `archive/README.md` 記錄：
   - 檔案名稱
   - 歸檔日期
   - 歸檔原因
   - 替代文件（如有）

**範例**:

```markdown
## 歸檔記錄

### 2025-11-26

- **檔案**: `old-deployment-guide.md`
- **原因**: 已被新版 DEPLOYMENT.md 取代
- **替代**: 參考 [DEPLOYMENT.md](../../DEPLOYMENT.md)
```

---

## 文件模板

### 技術文件模板

```markdown
# 文件標題

> **建立日期**: YYYY-MM-DD
> **最後更新**: YYYY-MM-DD
> **維護者**: 團隊名稱

簡短描述文件目的和內容。

---

## 📋 目錄

1. [章節一](#章節一)
2. [章節二](#章節二)

---

## 章節一

內容...

## 章節二

內容...

---

## 參考資料

- [相關文件](link)
- [外部資源](link)

---

*最後更新: YYYY-MM-DD*
```

### README 索引模板

```markdown
# [目錄名稱]

> 本目錄包含 [簡短描述]

## 📁 目錄結構

```
directory/
├── file1.md - 描述
├── file2.md - 描述
└── subdirectory/
    └── file3.md - 描述
```

## 📄 文件列表

### [分類一]

- **[文件名](file.md)** - 簡短描述
- **[文件名](file.md)** - 簡短描述

### [分類二]

- **[文件名](file.md)** - 簡短描述

---

*最後更新: YYYY-MM-DD*
```

---

## 快速參考

### 常見問題

**Q: 我的工作日誌該放哪裡？**

A:
- 進行中 → `.todo/planning/`
- 完成後 → `docs/project-history/phases/phaseN/work-logs/`

**Q: 計劃文件完成後怎麼處理？**

A:
- 如果仍有參考價值 → `docs/development/` 或對應 phase 的 `planning/`
- 如果已過時 → `docs/project-history/archive/`

**Q: 如何決定文件放在 `docs/` 根目錄還是子目錄？**

A:
- 根目錄：技術規範、部署指南（經常查閱）
- 子目錄：按性質分類（guides, development, history）

**Q: README.md 一定要有嗎？**

A: 每個包含 3 個以上文件的目錄都應該有 README.md 索引。

---

## 相關資源

- [CONTRIBUTING.md](../../CONTRIBUTING.md) - 貢獻指南
- [ROADMAP.md](../../ROADMAP.md) - 專案規劃
- [CHANGELOG.md](../../CHANGELOG.md) - 變更日誌

---

**維護承諾**: 本指南會隨著專案演進持續更新。如有建議，請提交 Issue 或 Pull Request。

---

*建立於: 2025-11-26*
*參考標準: Google Docs, GitLab Docs, Microsoft Learn*
