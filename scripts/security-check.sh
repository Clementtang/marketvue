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

# 檢查 flask-talisman 已安裝
if grep -q "flask-talisman" backend/requirements.txt; then
    check "flask-talisman in requirements.txt"
else
    echo -e "${RED}✗${NC} flask-talisman not in requirements.txt"
    ((FAIL++))
fi

# 檢查環境變數範例
if grep -q "your-secret-key-here-change-me" backend/.env.example 2>/dev/null; then
    warn ".env.example 包含提示文字(正常)"
fi

# 檢查是否有硬編碼的秘密
echo ""
echo "🔐 檢查硬編碼秘密..."

if grep -r "sk-" . --exclude-dir={node_modules,venv,.git,backend/venv} --exclude="*.md" 2>/dev/null | grep -v ".env.example" > /dev/null; then
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
else
    warn "backend/.env 不存在(開發環境可能正常)"
fi

# 檢查生產環境變數文件
if [ -f .env.production ]; then
    if grep -q "localhost" .env.production; then
        echo -e "${RED}✗${NC} .env.production 包含 localhost"
        ((FAIL++))
    else
        check ".env.production 配置正確"
    fi
fi

# 檢查 Git
echo ""
echo "📝 檢查 Git..."

if git diff --quiet 2>/dev/null; then
    check "工作目錄乾淨"
else
    warn "有未提交的更改"
fi

# 檢查是否有 .env 文件被追蹤
if git ls-files | grep -E "^\.env$|backend/\.env$" > /dev/null 2>&1; then
    echo -e "${RED}✗${NC} .env 文件被 Git 追蹤!"
    ((FAIL++))
else
    check ".env 文件未被 Git 追蹤"
fi

# 檢查安全相關文件
echo ""
echo "📄 檢查安全文件..."

test -f docs/security-audit-2025-11-21.md
check "安全審計報告存在"

test -f docs/security-implementation-guide.md
check "安全實施指南存在"

test -f docs/security-checklist.md
check "安全檢查清單存在"

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
    echo -e "${GREEN}✅ 安全檢查通過!${NC}"
    if [ $WARN -gt 0 ]; then
        echo -e "${YELLOW}⚠️  有 $WARN 個警告,請檢查。${NC}"
    fi
    exit 0
fi
