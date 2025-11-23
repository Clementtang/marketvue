# MarketVue 安全檢查清單

**用途**: 部署前快速安全檢查
**相關文件**:
- `security-audit-2025-11-21.md` (完整審計報告)
- `security-implementation-guide.md` (實施指南)

---

## 🔴 緊急 - 必須修復才能部署生產環境

### 後端安全

- [ ] **SECRET_KEY 已設置為強隨機值**
  ```bash
  # 驗證方法:
  echo $SECRET_KEY | wc -c  # 應該 > 32
  ```

- [ ] **CORS_ORIGINS 不包含 localhost**
  ```bash
  # 檢查環境變數
  echo $CORS_ORIGINS  # 應該只有 https:// URLs
  ```

- [ ] **Flask-Talisman 已安裝並啟用**
  ```bash
  # 檢查
  pip list | grep talisman
  curl -I https://your-api.onrender.com/api/health | grep -i "strict-transport-security"
  ```

- [ ] **FLASK_ENV=production**
  ```bash
  echo $FLASK_ENV  # 應該是 "production"
  ```

### 前端安全

- [ ] **npm 依賴無高/嚴重漏洞**
  ```bash
  npm audit --audit-level=high
  ```

- [ ] **vercel.json 安全標頭已配置**
  ```bash
  # 檢查文件存在
  test -f vercel.json && echo "OK" || echo "Missing"
  ```

- [ ] **VITE_API_URL 指向正確的生產 API**
  ```bash
  grep VITE_API_URL .env.production
  ```

---

## 🟡 重要 - 應該盡快完成

### 監控與日誌

- [ ] 審計日誌已啟用 (`AuditLogger` in app.py)
- [ ] 錯誤訊息已清理(不洩漏敏感資訊)
- [ ] 日誌級別設置為 INFO 或更高

### 速率限制

- [ ] API 速率限制已啟用並測試
- [ ] 速率限制標頭已啟用
- [ ] 429 錯誤處理正確

### 輸入驗證

- [ ] 所有 API 端點使用 Marshmallow schemas
- [ ] 日期範圍驗證已加強
- [ ] 符號格式驗證已加強

---

## 🟢 建議 - 長期改善

### 依賴管理

- [ ] 設置 Dependabot 自動更新
- [ ] 每月運行 `npm audit` 和 `pip-audit`
- [ ] 記錄依賴更新歷史

### 安全監控

- [ ] 設置 Sentry 或類似錯誤追蹤
- [ ] 設置 Uptime 監控
- [ ] 設置安全掃描自動化(GitHub Actions)

### 文檔

- [ ] README 包含安全設置說明
- [ ] DEPLOYMENT.md 包含環境變數清單
- [ ] 團隊了解安全最佳實踐

---

## 快速驗證腳本

將以下內容保存為 `scripts/security-check.sh`:

```bash
#!/bin/bash

echo "🔍 MarketVue 安全檢查..."
echo ""

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 計數器
PASS=0
FAIL=0
WARN=0

# 檢查函數
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $1"
        ((FAIL++))
    fi
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARN++))
}

# 開始檢查
echo "📦 檢查依賴..."

# NPM 審計
npm audit --audit-level=high > /dev/null 2>&1
check "NPM 依賴無高危漏洞"

# 檢查文件存在
test -f vercel.json
check "vercel.json 存在"

test -f backend/requirements.txt
check "requirements.txt 存在"

# 檢查環境變數範例
if grep -q "your-secret-key-here-change-me" backend/.env.example; then
    warn ".env.example 包含提示文字(正常)"
fi

# 檢查是否有硬編碼的秘密
echo ""
echo "🔐 檢查硬編碼秘密..."

if grep -r "sk-" . --exclude-dir={node_modules,venv,.git} --exclude="*.md" > /dev/null 2>&1; then
    warn "發現可能的 API 密鑰,請檢查"
fi

# 檢查 SECRET_KEY
if [ -f backend/.env ]; then
    if grep -q "dev-secret-key" backend/.env; then
        echo -e "${RED}✗${NC} backend/.env 使用開發用 SECRET_KEY"
        ((FAIL++))
    else
        check "backend/.env SECRET_KEY 已設置"
    fi
fi

# 檢查 Git
echo ""
echo "📝 檢查 Git..."

if git diff --quiet; then
    check "工作目錄乾淨"
else
    warn "有未提交的更改"
fi

# 總結
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "總結:"
echo -e "${GREEN}通過: $PASS${NC}"
echo -e "${RED}失敗: $FAIL${NC}"
echo -e "${YELLOW}警告: $WARN${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAIL -gt 0 ]; then
    echo ""
    echo -e "${RED}❌ 安全檢查失敗!請修復上述問題後再部署。${NC}"
    exit 1
else
    echo ""
    echo -e "${GREEN}✅ 安全檢查通過!可以部署。${NC}"
    exit 0
fi
```

### 使用方法:

```bash
# 賦予執行權限
chmod +x scripts/security-check.sh

# 運行檢查
./scripts/security-check.sh
```

---

## 在線安全掃描

部署後使用以下工具驗證:

### 1. Security Headers
```
https://securityheaders.com/
輸入: https://marketvue.vercel.app
目標: A 或 A+ 評級
```

### 2. SSL Labs
```
https://www.ssllabs.com/ssltest/
輸入: https://marketvue-api.onrender.com
目標: A 評級
```

### 3. Mozilla Observatory
```
https://observatory.mozilla.org/
掃描前端和後端
目標: B+ 或更高
```

---

## 環境變數檢查清單

### Render.com 後端

必須設置:
- ✅ `SECRET_KEY` (64+ 字符隨機字符串)
- ✅ `FLASK_ENV` = `production`
- ✅ `CORS_ORIGINS` (只有 https:// URLs,逗號分隔)

可選:
- `LOG_LEVEL` = `INFO`
- `CACHE_TYPE` = `SimpleCache`
- `RATELIMIT_DEFAULT` = `1000 per hour`

### Vercel 前端

必須設置:
- ✅ `VITE_API_URL` = `https://marketvue-api.onrender.com`

---

## 緊急聯絡資訊

如果發現安全問題:

1. **不要** 在公開 issue 中報告安全漏洞
2. 使用 GitHub Security Advisories (私密報告)
3. 或發送郵件給專案維護者

---

## 最後檢查(部署前)

```bash
# 1. 運行所有測試
npm test
cd backend && pytest

# 2. 運行安全掃描
npm audit --audit-level=moderate
./scripts/security-check.sh

# 3. 檢查環境變數
echo "檢查以下環境變數已在 Render/Vercel 設置:"
echo "- SECRET_KEY"
echo "- FLASK_ENV"
echo "- CORS_ORIGINS"
echo "- VITE_API_URL"

# 4. 構建測試
npm run build
cd backend && pip install -r requirements.txt

# 5. 提交代碼
git status
git add .
git commit -m "security: implement security improvements"
git push
```

---

**記住**: 安全是持續的過程,不是一次性任務!

- 每月檢查依賴更新
- 每季度進行安全審計
- 持續監控安全告警
- 定期審查訪問日誌

**最後更新**: 2025-11-21
