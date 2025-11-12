# 分支管理快速參考

**一頁紙快速查詢**

---

## 🚀 每日工作流程（5 步驟）

```bash
# 1️⃣ 同步
git fetch --prune

# 2️⃣ 檢查（有新計劃嗎？）
git branch -r

# 3️⃣ 合併計劃
git merge origin/claude/[分支名] --ff-only

# 4️⃣ 刪除分支 ⭐ 重要！
git push origin --delete claude/[分支名]

# 5️⃣ 推送
git push
```

---

## 🔧 常用命令

### 查看分支
```bash
# 查看所有遠端分支
git branch -r

# 查看已合併的分支
git branch -r --merged origin/main

# 查看未合併的分支
git branch -r --no-merged origin/main
```

### 查看內容
```bash
# 查看分支的 commits
git log origin/claude/[分支名] --oneline

# 查看新增的文件
git diff origin/main..origin/claude/[分支名] --name-only
```

### 合併與清理
```bash
# 合併
git merge origin/claude/[分支名] --ff-only

# 刪除遠端分支
git push origin --delete claude/[分支名]

# 清理本地追蹤
git fetch --prune
```

---

## 🛠️ 自動化腳本

```bash
# 檢查狀態（不刪除）
./.scripts/check-merged-branches.sh

# 清理已合併的分支（會詢問確認）
./.scripts/cleanup-merged-branches.sh

# 智能分析
./.scripts/manage-claude-branches.sh
```

---

## ⚠️ 緊急情況

### 不小心刪除了未合併的分支
1. 立即去 GitHub 網頁
2. Settings → Branches → Deleted branches
3. 30 天內可以恢復

### 合併有衝突
1. `git status` 查看衝突文件
2. 手動編輯解決衝突
3. `git add .`
4. `git commit`
5. 繼續刪除分支

---

## ✅ 理想狀態

```bash
$ git branch -r
origin/main
```

只有一個分支 = 完美！ 🎉

---

## 📋 檢查清單

每次合併計劃時：
- [ ] fetch
- [ ] merge
- [ ] delete ⭐
- [ ] push

每週檢查：
- [ ] 運行 cleanup 腳本
- [ ] 確認只剩 main

---

**詳細文檔**: [branch-management-sop.md](./branch-management-sop.md)
