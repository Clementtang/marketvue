# MarketVue 文件導航

> **最後更新**: 2025-11-26
> **專案版本**: v1.4.0

歡迎來到 MarketVue 文件中心。本頁面提供所有文件的快速導航與索引。

---

## 🎯 快速開始

- **[快速安裝](../README.md)** - 專案主 README，包含安裝與使用說明
- **[ROADMAP](../ROADMAP.md)** - 專案發展規劃
- **[CHANGELOG](../CHANGELOG.md)** - 版本變更記錄

---

## 📚 文件分類

### 技術規範（根目錄）

技術文件與規範說明，面向開發者與維護者：

- **[API.md](API.md)** - API 端點完整說明
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - 系統架構設計文件
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - 部署指南（Vercel + Render）
- **[DEPLOYMENT_CONFIG.md](DEPLOYMENT_CONFIG.md)** - 部署配置詳情與環境變數
- **[DOCUMENTATION_GUIDE.md](DOCUMENTATION_GUIDE.md)** - 文件組織指南（本指南）

### 📖 使用指南

面向終端用戶的使用手冊與教學：

- **[guides/](guides/)** - 使用指南目錄
  - 快速開始（規劃中）
  - 使用手冊（規劃中）
  - 故障排除（規劃中）

### 🛠️ 開發文件

面向開發者的技術文件與規劃：

- **[development/](development/)** - 開發文件目錄
  - **[frontend-optimization-plan.md](development/frontend-optimization-plan.md)** - 前端優化計劃
  - **[implementation-roadmap.md](development/implementation-roadmap.md)** - 實作路線圖
  - **[meeting-notes/](development/meeting-notes/)** - 會議記錄
    - [2025-11-14.md](development/meeting-notes/2025-11-14.md) - Phase 2 技術會議

### 📚 專案歷史

專案開發歷史記錄與歸檔文件：

- **[project-history/](project-history/)** - 專案歷史目錄
  - **[PROJECT_PROGRESS_SUMMARY.md](project-history/PROJECT_PROGRESS_SUMMARY.md)** - 總體進度總結
  - **[recent-changes-timeline.md](project-history/recent-changes-timeline.md)** - 近期變更時間線
  - **[phases/](project-history/phases/)** - 按開發階段組織的文件
    - [Phase 1: CI/CD + 測試基礎](project-history/phases/phase1/)
    - [Phase 2: 前端重構](project-history/phases/phase2/)
    - [Phase 3: 後端重構](project-history/phases/phase3/)
  - **[optimizations/](project-history/optimizations/)** - 優化階段記錄
  - **[deployments/](project-history/deployments/)** - 部署驗證記錄
  - **[archive/](project-history/archive/)** - 過時文件歸檔

### 🔒 安全文件

安全相關的審計、指南與檢查清單：

- **[security/](security/)** - 安全文件目錄
  - **[README.md](security/README.md)** - 安全文件索引
  - **[IMPLEMENTATION-SUMMARY.md](security/IMPLEMENTATION-SUMMARY.md)** - 安全實作總結
  - **[audits/](security/audits/)** - 安全審計報告
  - **[checklists/](security/checklists/)** - 安全檢查清單
  - **[guides/](security/guides/)** - 安全實作指南
  - **[work-logs/](security/work-logs/)** - 安全相關工作日誌

### 🔄 工作流程

團隊協作流程與快速參考：

- **[workflows/](workflows/)** - 工作流程目錄
  - **[branch-management-sop.md](workflows/branch-management-sop.md)** - 分支管理 SOP
  - **[quick-reference.md](workflows/quick-reference.md)** - 快速參考指南

---

## 🗂️ 目錄結構總覽

```
docs/
├── README.md (本文件)
├── DOCUMENTATION_GUIDE.md
├── API.md
├── ARCHITECTURE.md
├── DEPLOYMENT.md
├── DEPLOYMENT_CONFIG.md
│
├── guides/               # 使用指南
├── development/          # 開發文件
│   ├── frontend-optimization-plan.md
│   ├── implementation-roadmap.md
│   └── meeting-notes/
│
├── project-history/      # 專案歷史
│   ├── PROJECT_PROGRESS_SUMMARY.md
│   ├── recent-changes-timeline.md
│   ├── phases/          # 按 Phase 組織
│   │   ├── phase1/
│   │   ├── phase2/
│   │   └── phase3/
│   ├── optimizations/
│   ├── deployments/
│   └── archive/
│
├── security/            # 安全文件
│   ├── README.md
│   ├── IMPLEMENTATION-SUMMARY.md
│   ├── audits/
│   ├── checklists/
│   ├── guides/
│   └── work-logs/
│
└── workflows/           # 工作流程
    ├── branch-management-sop.md
    └── quick-reference.md
```

---

## 🔍 尋找特定文件？

### 我想了解...

| 需求 | 建議文件 |
|------|---------|
| **如何使用 MarketVue** | [主 README](../README.md) |
| **API 端點說明** | [API.md](API.md) |
| **系統架構設計** | [ARCHITECTURE.md](ARCHITECTURE.md) |
| **如何部署** | [DEPLOYMENT.md](DEPLOYMENT.md) |
| **專案進度與成果** | [PROJECT_PROGRESS_SUMMARY.md](project-history/PROJECT_PROGRESS_SUMMARY.md) |
| **最近的變更** | [recent-changes-timeline.md](project-history/recent-changes-timeline.md) + [CHANGELOG](../CHANGELOG.md) |
| **Phase 1-3 的工作內容** | [project-history/phases/](project-history/phases/) |
| **安全實作** | [security/](security/) |
| **如何組織文件** | [DOCUMENTATION_GUIDE.md](DOCUMENTATION_GUIDE.md) |
| **未來規劃** | [ROADMAP](../ROADMAP.md) |

---

## 📝 文件維護

### 如何新增文件

1. 閱讀 [DOCUMENTATION_GUIDE.md](DOCUMENTATION_GUIDE.md) 了解組織原則
2. 根據文件性質選擇對應目錄
3. 遵循命名規範
4. 更新對應的 README.md 索引

### 如何歸檔文件

完成的工作日誌和過時文件應歸檔到 `project-history/`：

- 工作日誌 → `project-history/phases/phaseN/work-logs/`
- 計劃文件 → `project-history/phases/phaseN/planning/` 或 `archive/`
- 過時文件 → `project-history/archive/`（需說明歸檔原因）

詳見 [DOCUMENTATION_GUIDE.md](DOCUMENTATION_GUIDE.md#歸檔流程)

---

## 🤝 貢獻

文件有任何問題或建議？

1. 提交 [Issue](https://github.com/Clementtang/marketvue/issues)
2. 查看 [CONTRIBUTING.md](../CONTRIBUTING.md)（規劃中）
3. 提交 Pull Request

---

## 📌 重要提示

- ✅ 所有文件都應包含日期和版本資訊
- ✅ 每個主要目錄都有 README.md 索引
- ✅ 使用相對路徑連結，確保連結有效
- ✅ 定期審查並更新文件（每月第一週）

---

*最後更新: 2025-11-26*
*維護者: MarketVue 開發團隊*
