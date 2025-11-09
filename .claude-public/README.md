# .claude-public/ 目錄

這個目錄包含 MarketVue 專案的**團隊共享 Claude Code 配置**。

## 📂 目錄結構

```
.claude-public/
├── CLAUDE.md          # 專案規範和開發指南（團隊共享）
├── commands/          # 共享的 Claude Code 斜線命令
├── docs/              # 工作流程文檔
└── README.md          # 本文件
```

## 🎯 用途

### 1. Claude Code Web 支援
- **Web 端可訪問**：此目錄提交到 Git，Claude Code Web 可以讀取
- **本地配置隔離**：個人化設定保存在 `.claude/`（在 .gitignore 中）

### 2. 團隊協作
- **統一規範**：所有開發者遵循相同的編碼標準
- **共享命令**：團隊可以使用相同的快捷命令
- **一致工作流**：確保團隊使用統一的開發流程

## 📄 文件說明

### CLAUDE.md
主要配置文件，包含：
- ✅ 專案基本資訊和技術棧
- ✅ 編碼規範和命名慣例
- ✅ 雙語支援要求
- ✅ Git commit 規範
- ✅ 開發工作流程
- ✅ 測試和部署流程
- ✅ 常見問題解答

### commands/ (待添加)
共享的 Claude Code 斜線命令：
- `/review` - 代碼審查檢查清單
- `/deploy` - 部署前檢查
- `/test` - 測試檢查清單
- `/i18n` - 新增雙語翻譯

### docs/ (待添加)
工作流程文檔：
- `hybrid-workflow.md` - Web/CLI 混合工作流程
- `release-checklist.md` - 發布檢查清單
- `troubleshooting.md` - 常見問題排查

## 🔒 隱私說明

### 提交到 Git（公開）
- ✅ 專案規範和標準
- ✅ 團隊共享的命令
- ✅ 工作流程指南
- ✅ 公開的最佳實踐

### 保持私有（不提交）
- ❌ 個人 MCP 配置（在 `.claude/`）
- ❌ 個人工作日誌（在 `.todo/`）
- ❌ API keys 和密鑰
- ❌ 個人筆記和草稿

## 🚀 使用方式

### Claude Code CLI
```bash
# CLI 會優先讀取 .claude/，然後讀取 .claude-public/
# 無需特殊配置
```

### Claude Code Web
```bash
# Web 只能讀取已提交到 Git 的文件
# 確保推送後才能在 Web 訪問
git add .claude-public/
git commit -m "docs: update shared Claude configuration"
git push
```

## 🔄 更新流程

1. **編輯配置**
   ```bash
   # 編輯 .claude-public/CLAUDE.md
   vim .claude-public/CLAUDE.md
   ```

2. **測試本地**
   ```bash
   # 在 Claude Code CLI 中測試
   # 確認配置正確
   ```

3. **提交更改**
   ```bash
   git add .claude-public/
   git commit -m "docs: update team Claude configuration"
   git push
   ```

4. **通知團隊**
   - 在 PR 或 issue 中說明重大變更
   - 確保團隊成員了解新的規範

## 📝 維護建議

### 保持簡潔
- 只包含必要的團隊共享資訊
- 避免過於詳細的個人偏好
- 定期檢查和更新過時內容

### 版本控制
- 重大變更在 CHANGELOG 記錄
- 保持向後兼容
- 逐步引入新規範

### 團隊共識
- 重大規範變更需團隊討論
- 鼓勵團隊成員提出改進建議
- 定期回顧和優化

## 🆚 .claude/ vs .claude-public/

| 特性 | `.claude/` | `.claude-public/` |
|------|-----------|------------------|
| **提交到 Git** | ❌ 否（.gitignore） | ✅ 是 |
| **Web 可訪問** | ❌ 否 | ✅ 是 |
| **用途** | 個人配置 | 團隊共享 |
| **內容** | MCP、個人偏好 | 專案規範、標準 |
| **誰維護** | 個人 | 團隊 |

## 🔗 相關資源

- **CONTRIBUTING.md** - 貢獻指南
- **CHANGELOG.md** - 版本變更記錄
- **ROADMAP.md** - 開發路線圖
- **.gitignore** - 查看哪些文件被忽略

---

**創建日期**：2025-11-09
**最後更新**：2025-11-09
**維護者**：MarketVue Team
