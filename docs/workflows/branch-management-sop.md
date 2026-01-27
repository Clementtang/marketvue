# 分支管理標準作業流程 (SOP)

**適用於**: Web/CLI 混合開發模式
**最後更新**: 2025-11-11
**維護者**: MarketVue Team

---

## 🎯 分支策略概述

### 核心原則
1. **只保留 `main` 作為穩定分支**
2. **短期分支：創建 → 合併 → 立即刪除**
3. **分支命名：語義化、描述用途**

### 角色分工
- **Web 端**: 創建 planning 分支，撰寫工作計劃
- **CLI 端**: 合併計劃、執行工作、清理分支

---

## 📋 標準工作流程

### Phase 1: Web 端創建計劃分支

**Web 端自動創建分支**（通常格式）：
```
claude/[描述]-[隨機ID]
例如：claude/github-files-review-plan-011CV1Rv4W3ChzRFXasvnw9P
```

**包含內容**：
- Day X 工作計劃
- Phase 修訂計劃
- 執行指南文檔

---

### Phase 2: CLI 端查看新計劃

#### Step 1: 同步遠端分支
```bash
cd /Users/clementtang/marketvue
git fetch --prune
```

#### Step 2: 檢查有哪些新分支
```bash
git branch -r
# 或使用檢查腳本
./.scripts/check-merged-branches.sh
```

#### Step 3: 查看分支內容
```bash
# 查看分支的 commits
git log origin/claude/[分支名] --oneline

# 查看新增的文件
git diff origin/main..origin/claude/[分支名] --name-only

# 預覽特定文件
git show origin/claude/[分支名]:docs/code-audit/day3-work-plan.md | head -50
```

---

### Phase 3: CLI 端合併計劃

#### Step 1: 確保在 main 分支
```bash
git checkout main
git pull origin main
```

#### Step 2: 合併計劃分支
```bash
# 使用 fast-forward 合併（推薦）
git merge origin/claude/[分支名] --ff-only

# 如果有衝突，使用一般合併
git merge origin/claude/[分支名] --no-edit
```

#### Step 3: 立即刪除遠端分支 ⭐ **重要**
```bash
# 合併完成後立即執行
git push origin --delete claude/[分支名]

# 清理本地追蹤
git fetch --prune
```

#### Step 4: 推送合併結果
```bash
git push origin main
```

---

### Phase 4: CLI 端執行工作

#### 在 main 分支直接工作（單人專案推薦）
```bash
# 按照計劃執行測試、開發
# 完成後直接提交到 main
git add .
git commit -m "feat: implement Day X tasks"
git push
```

#### 或創建 feature 分支（團隊協作推薦）
```bash
# 創建 feature 分支
git checkout -b feature/day3-performance

# 執行工作
# ...

# 完成後合併回 main
git checkout main
git merge feature/day3-performance --no-ff
git branch -d feature/day3-performance
git push
```

---

## 🔄 完整範例：Day 3 工作流程

### 場景：Web 端創建了 Day 3 計劃

```bash
# 1. 同步並查看
git fetch --prune
git branch -r
# 輸出：origin/claude/day3-planning-xxx

# 2. 查看計劃內容
git log origin/claude/day3-planning-xxx --oneline
git diff origin/main..origin/claude/day3-planning-xxx --name-only

# 3. 合併計劃
git checkout main
git merge origin/claude/day3-planning-xxx --ff-only

# 4. 立即刪除分支 ⭐
git push origin --delete claude/day3-planning-xxx
git fetch --prune

# 5. 推送合併結果
git push

# 6. 執行 Day 3 工作
# ... 寫代碼、測試 ...

# 7. 提交工作成果
git add .
git commit -m "feat: optimize frontend performance (Phase 1 Day 3)"
git push
```

---

## ⚠️ 常見錯誤與解決

### 錯誤 1: 忘記刪除已合併的分支

**症狀**：
```bash
git branch -r
# 看到很多 claude/ 分支
```

**解決**：
```bash
# 使用清理腳本
./.scripts/cleanup-merged-branches.sh

# 或手動刪除
git push origin --delete claude/[分支名]
```

---

### 錯誤 2: 合併時有衝突

**症狀**：
```
CONFLICT (content): Merge conflict in .gitignore
```

**解決**：
```bash
# 1. 查看衝突文件
git status

# 2. 手動解決衝突（編輯文件）
# 保留需要的內容，刪除衝突標記

# 3. 標記為已解決
git add .

# 4. 完成合併
git commit

# 5. 繼續刪除分支
git push origin --delete claude/[分支名]
```

---

### 錯誤 3: 不小心刪除了未合併的分支

**症狀**：
```
error: The branch 'claude/xxx' is not fully merged.
```

**預防**：
```bash
# 使用檢查腳本確認
./.scripts/check-merged-branches.sh

# 或手動檢查
git branch -r --merged origin/main
git branch -r --no-merged origin/main
```

**恢復**（30天內）：
```bash
# 從 GitHub 網頁找回（Settings → Branches → Deleted branches）
# 或聯繫 GitHub support
```

---

## 📊 定期維護檢查清單

### 每日檢查（工作開始前）
```bash
# 1. 同步遠端
git fetch --prune

# 2. 檢查有無新計劃
./.scripts/check-merged-branches.sh

# 3. 如有新分支，查看並合併
git log origin/claude/[分支名] --oneline
git merge origin/claude/[分支名] --ff-only
git push origin --delete claude/[分支名]
```

### 每週檢查（週末或完成 Phase 後）
```bash
# 1. 全面掃描
./.scripts/manage-claude-branches.sh

# 2. 清理所有已合併分支
./.scripts/cleanup-merged-branches.sh

# 3. 確認只剩 main
git branch -r
# 期望輸出：只有 origin/main
```

---

## 🎯 關鍵指標

### 良好狀態
```bash
git branch -r
# 輸出：
origin/main
```

**特徵**：
- ✅ 只有 `main` 分支
- ✅ 沒有殘留的 `claude/` 分支
- ✅ Git 歷史乾淨清晰

### 需要清理
```bash
git branch -r
# 輸出：
origin/main
origin/claude/old-plan-1
origin/claude/old-plan-2
```

**行動**：
```bash
./.scripts/check-merged-branches.sh
./.scripts/cleanup-merged-branches.sh
```

---

## 📝 分支命名建議（給未來參考）

### 當前狀況（Web 端自動生成）
```
claude/github-files-review-plan-011CV1Rv4W3ChzRFXasvnw9P
                                 ^^^^^^^^^^^^^^^^^^^^^^^^
                                 隨機 ID（不易理解）
```

### 理想命名（如果可以控制）
```
planning/day2-testing-expansion
planning/day3-performance-optimization
planning/phase1-revision-v2
docs/phase1-week1-summary
```

**好處**：
- ✅ 一眼就知道用途
- ✅ 方便搜尋和管理
- ✅ 符合 Git 最佳實踐

---

## 🔧 自動化工具

### 可用腳本（在 `.scripts/` 目錄）

1. **check-merged-branches.sh**
   - 功能：檢查分支狀態，不刪除
   - 使用：`./scripts/check-merged-branches.sh`

2. **cleanup-merged-branches.sh**
   - 功能：互動式刪除已合併分支
   - 使用：`./scripts/cleanup-merged-branches.sh`

3. **manage-claude-branches.sh**
   - 功能：智能分析並提供建議
   - 使用：`./scripts/manage-claude-branches.sh`

---

## ✅ 檢查清單

### 合併 Web 端計劃時
- [ ] `git fetch --prune` - 同步遠端
- [ ] `git log origin/claude/[分支名]` - 查看內容
- [ ] `git checkout main` - 切到 main
- [ ] `git merge origin/claude/[分支名] --ff-only` - 合併
- [ ] `git push origin --delete claude/[分支名]` - **立即刪除** ⭐
- [ ] `git fetch --prune` - 清理本地追蹤
- [ ] `git push` - 推送合併結果

### 完成一天工作時
- [ ] 執行測試通過
- [ ] 提交代碼到 main
- [ ] 更新工作日誌
- [ ] 檢查是否有殘留分支

### 每週維護
- [ ] 運行 `check-merged-branches.sh`
- [ ] 運行 `cleanup-merged-branches.sh`
- [ ] 確認只剩 `origin/main`

---

## 📚 相關資源

### 文檔
- [Git 最佳實踐](https://git-scm.com/book/en/v2)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)

### 專案文檔
- [.scripts/README.md](./.scripts/README.md) - 腳本使用說明
- [phase1-execution-plan.md](../code-audit/phase1-execution-plan.md) - Phase 1 計劃

---

## 🎓 最佳實踐總結

### DO ✅
- ✅ 合併後立即刪除分支
- ✅ 使用檢查腳本確認狀態
- ✅ 保持 main 分支乾淨
- ✅ 提交訊息清晰（Conventional Commits）
- ✅ 定期運行 `git fetch --prune`

### DON'T ❌
- ❌ 保留已合併的分支
- ❌ 直接刪除未檢查的分支
- ❌ 忘記推送合併結果
- ❌ 在計劃分支上執行工作
- ❌ 累積大量未處理的分支

---

**建立日期**: 2025-11-11
**最後更新**: 2025-11-11
**版本**: 1.0
**狀態**: ✅ 已實施

---

## 📝 變更日誌

### 2025-11-11
- 初始版本建立
- 基於 Day 1-2 的實際經驗
- 清理了 2 個 Claude 分支
- 建立完整的 SOP 流程
