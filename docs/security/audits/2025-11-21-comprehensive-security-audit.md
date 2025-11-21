# MarketVue 安全審計報告

**審計日期**: 2025-11-21
**審計範圍**: MarketVue v1.3.4 全端應用程式
**審計人員**: Claude Security Audit
**專案**: Real-time multi-market stock dashboard

---

## 執行摘要

本次安全審計針對 MarketVue 專案進行全面的安全評估,包括前端 React 應用程式和後端 Flask API。審計發現了多個需要立即處理的高優先級安全問題,以及一些中低優先級的改善建議。

### 關鍵統計
- **高優先級問題**: 4 個
- **中優先級問題**: 5 個
- **低優先級問題**: 3 個
- **良好實踐**: 8 個

### 整體風險評級: **中等**

雖然應用程式實施了一些良好的安全實踐(如輸入驗證、速率限制),但缺少關鍵的安全標頭和認證機制,使其面臨多種潛在攻擊。

---

## 1. 高優先級安全問題

### 1.1 缺少 HTTP 安全標頭 ⚠️ 【嚴重】

**問題描述**:
後端 Flask 應用程式缺少關鍵的 HTTP 安全標頭,使應用程式容易受到多種攻擊。

**受影響文件**:
- `backend/app.py`

**缺少的安全標頭**:
1. **Content-Security-Policy (CSP)**: 防止 XSS 攻擊
2. **X-Frame-Options**: 防止點擊劫持 (Clickjacking)
3. **X-Content-Type-Options**: 防止 MIME 類型混淆攻擊
4. **Strict-Transport-Security (HSTS)**: 強制使用 HTTPS
5. **X-XSS-Protection**: 啟用瀏覽器內建 XSS 防護
6. **Referrer-Policy**: 控制 referrer 資訊洩漏

**風險影響**:
- XSS 攻擊風險
- 點擊劫持攻擊
- 中間人攻擊 (MITM)
- 資訊洩漏

**建議解決方案**:

```python
# backend/app.py - 在 create_app() 函數中添加

from flask_talisman import Talisman

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # 添加安全標頭
    if not app.config['DEBUG']:
        # 生產環境啟用 Talisman
        Talisman(app,
            force_https=True,
            strict_transport_security=True,
            content_security_policy={
                'default-src': "'self'",
                'script-src': ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
                'style-src': ["'self'", "'unsafe-inline'"],
                'img-src': ["'self'", "data:", "https:"],
                'font-src': ["'self'", "data:"],
                'connect-src': ["'self'"],
            },
            content_security_policy_nonce_in=['script-src']
        )
    else:
        # 開發環境使用較寬鬆的設定
        @app.after_request
        def add_security_headers(response):
            response.headers['X-Content-Type-Options'] = 'nosniff'
            response.headers['X-Frame-Options'] = 'DENY'
            response.headers['X-XSS-Protection'] = '1; mode=block'
            return response

    # ... 其餘配置
```

**實施步驟**:
1. 安裝 `flask-talisman`: `pip install flask-talisman`
2. 更新 `requirements.txt`
3. 在 `app.py` 中實施上述代碼
4. 測試應用程式確保功能正常

---

### 1.2 弱預設 SECRET_KEY ⚠️ 【嚴重】

**問題描述**:
配置文件中使用了弱預設的 SECRET_KEY,且在註釋中明確標示為開發用。

**受影響文件**:
- `backend/config.py:35`
- `backend/.env.example:4`

**當前配置**:
```python
SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
```

**風險影響**:
- Session 劫持
- CSRF 令牌可被預測
- 簽名數據可被偽造

**建議解決方案**:

1. **立即措施**: 在生產環境禁止使用預設值

```python
# backend/config.py
class ProductionConfig(Config):
    DEBUG = False

    @property
    def SECRET_KEY(self):
        secret = os.getenv('SECRET_KEY')
        if not secret or secret == 'dev-secret-key-change-in-production':
            raise ValueError(
                "SECRET_KEY must be set in production environment. "
                "Generate one using: python -c 'import secrets; print(secrets.token_hex(32))'"
            )
        return secret
```

2. **生成安全的 SECRET_KEY**:

```bash
# 生成強密鑰
python -c 'import secrets; print(secrets.token_hex(32))'
```

3. **更新部署文件**: 確保在 Render.com 或其他平台設置環境變數

**實施步驟**:
1. 修改 `config.py` 添加驗證邏輯
2. 在 Render.com 設置 SECRET_KEY 環境變數
3. 更新 `README.md` 和部署文檔
4. 在 `.env.example` 中添加警告說明

---

### 1.3 缺少 API 認證與授權機制 ⚠️ 【高】

**問題描述**:
所有 API 端點完全公開,沒有任何認證或授權機制。

**受影響文件**:
- `backend/routes/stock_routes.py`
  - `/api/stock-data` (POST)
  - `/api/batch-stocks` (POST)

**當前狀況**:
- 任何人都可以無限制訪問 API(僅受速率限制約束)
- 無法追蹤或審計 API 使用情況
- 無法區分合法用戶和濫用者

**風險影響**:
- API 濫用和資源耗盡
- 無法進行用戶級別的速率限制
- 數據抓取 (scraping)
- 服務成本增加(第三方 API 調用成本)

**建議解決方案**:

由於這是一個公開的股票儀表板應用,有兩種推薦方案:

**方案 A: API Key 認證(推薦用於公開服務)**

```python
# backend/utils/auth.py
from functools import wraps
from flask import request, jsonify
import os

def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        valid_keys = os.getenv('API_KEYS', '').split(',')

        if not api_key or api_key not in valid_keys:
            return jsonify({'error': 'Invalid or missing API key'}), 401

        return f(*args, **kwargs)
    return decorated_function

# 在路由中使用
@stock_bp.route('/stock-data', methods=['POST'])
@require_api_key
@cache.cached(...)
def get_stock_data():
    # ... 現有邏輯
```

**方案 B: 保持公開 + 增強速率限制(適合完全公開的服務)**

```python
# backend/app.py
# 針對 IP 地址實施更嚴格的速率限制
limiter.limit("100 per hour")(stock_bp)  # 每小時 100 次請求
limiter.limit("10 per minute")(stock_bp)  # 每分鐘 10 次請求

# 添加請求日誌以便監控
@stock_bp.before_request
def log_api_request():
    logger.info(f"API Request: {request.method} {request.path} from {request.remote_addr}")
```

**實施建議**:
- 短期: 實施方案 B(增強速率限制和日誌)
- 長期: 評估是否需要方案 A(API Key)

---

### 1.4 CORS 配置過於寬鬆 ⚠️ 【高】

**問題描述**:
開發環境的 CORS 設定可能被意外部署到生產環境。

**受影響文件**:
- `backend/config.py:39`
- `backend/app.py:48-54`

**當前配置**:
```python
CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(',')
```

**潛在問題**:
1. 如果 `CORS_ORIGINS` 環境變數未設置,將回退到本地主機
2. 沒有驗證 CORS_ORIGINS 是否正確設置
3. 可能意外允許不受信任的來源

**風險影響**:
- 跨站請求偽造 (CSRF)
- 未授權的跨域訪問
- 數據洩漏

**建議解決方案**:

```python
# backend/config.py
class ProductionConfig(Config):
    DEBUG = False

    def __init__(self):
        super().__init__()
        # 驗證 CORS_ORIGINS 已正確設置
        cors_origins = os.getenv('CORS_ORIGINS')
        if not cors_origins or 'localhost' in cors_origins:
            raise ValueError(
                "CORS_ORIGINS must be explicitly set in production. "
                "Example: CORS_ORIGINS=https://marketvue.vercel.app,https://marketvue-staging.vercel.app"
            )
        self.CORS_ORIGINS = cors_origins.split(',')

    # 額外的 CORS 安全設置
    CORS_SUPPORTS_CREDENTIALS = False  # 除非需要,否則不支持憑證
    CORS_MAX_AGE = 600  # 預檢請求緩存時間(秒)
```

**實施步驟**:
1. 修改 `config.py` 添加 CORS 驗證
2. 確保在 Render.com 正確設置 `CORS_ORIGINS`
3. 添加部署檢查清單
4. 測試跨域請求

---

## 2. 中優先級安全問題

### 2.1 依賴套件漏洞 🔶

**問題描述**:
前端依賴套件 `js-yaml` 存在原型污染漏洞。

**受影響套件**:
- `js-yaml@4.0.0-4.1.0` (Moderate severity)

**漏洞詳情**:
- **CVE/Advisory**: GHSA-mh29-5h37-fv8m
- **CWE**: CWE-1321 (Prototype Pollution)
- **CVSS Score**: 5.3 (Medium)
- **影響**: 原型污染可能導致 DoS 或數據完整性問題

**解決方案**:
```bash
# 更新套件
npm audit fix

# 如果自動修復失敗,手動更新
npm install js-yaml@latest
```

**驗證修復**:
```bash
npm audit
```

---

### 2.2 缺少 HTTPS 強制執行 🔶

**問題描述**:
應用程式沒有在代碼層面強制使用 HTTPS。

**受影響組件**:
- 後端 API
- 前端 Vite 配置

**風險影響**:
- 中間人攻擊
- 數據竊聽
- Session 劫持

**建議解決方案**:

1. **後端**: 使用 flask-talisman (見 1.1)

2. **前端**: 更新 Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    https: false,  // 開發環境
  },
  build: {
    // 確保生產構建移除 console.log
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
})
```

3. **Vercel 配置**: 添加 `vercel.json`

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

---

### 2.3 錯誤訊息可能洩漏資訊 🔶

**問題描述**:
某些錯誤訊息可能洩漏內部實作細節。

**受影響文件**:
- `backend/services/stock_service.py:259-260`
- `backend/routes/stock_routes.py:146-164`

**風險範例**:
```python
raise ValueError(f"Failed to fetch stock data for {symbol}: {str(e)}")
```

這可能洩漏:
- 內部錯誤堆疊
- 第三方 API 回應
- 系統路徑

**建議解決方案**:

```python
# backend/utils/error_handlers.py
def sanitize_error_message(error_msg: str, is_production: bool) -> str:
    """清理錯誤訊息,移除敏感資訊"""
    if is_production:
        # 生產環境返回通用訊息
        generic_messages = {
            'ValueError': 'Invalid input provided',
            'ConnectionError': 'Service temporarily unavailable',
            'TimeoutError': 'Request timed out',
        }
        error_type = type(error_msg).__name__
        return generic_messages.get(error_type, 'An error occurred')
    return error_msg  # 開發環境顯示完整訊息

# backend/services/stock_service.py
from flask import current_app

except Exception as e:
    logger.error(f"Error fetching stock data for {symbol}: {str(e)}")
    sanitized_msg = sanitize_error_message(str(e), not current_app.config['DEBUG'])
    raise ValueError(f"Failed to fetch stock data for {symbol}: {sanitized_msg}")
```

---

### 2.4 缺少請求/回應日誌 🔶

**問題描述**:
缺少詳細的安全審計日誌,難以追蹤可疑活動。

**當前狀況**:
- 只有基本的 INFO 級別日誌
- 沒有結構化日誌格式
- 沒有異常活動監控

**建議解決方案**:

```python
# backend/utils/audit_logger.py
import logging
from datetime import datetime
from flask import request, g
import json

class AuditLogger:
    def __init__(self, app=None):
        if app:
            self.init_app(app)

    def init_app(self, app):
        @app.before_request
        def before_request():
            g.start_time = datetime.utcnow()

        @app.after_request
        def after_request(response):
            if hasattr(g, 'start_time'):
                duration = (datetime.utcnow() - g.start_time).total_seconds()

                audit_log = {
                    'timestamp': datetime.utcnow().isoformat(),
                    'method': request.method,
                    'path': request.path,
                    'ip': request.remote_addr,
                    'user_agent': request.user_agent.string,
                    'status_code': response.status_code,
                    'duration_seconds': duration,
                }

                # 記錄可疑活動
                if response.status_code >= 400:
                    logging.warning(f"Suspicious request: {json.dumps(audit_log)}")
                else:
                    logging.info(f"Request: {json.dumps(audit_log)}")

            return response

# backend/app.py
from utils.audit_logger import AuditLogger

audit_logger = AuditLogger(app)
```

---

### 2.5 輸入驗證可以加強 🔶

**問題描述**:
雖然使用了 Marshmallow 進行驗證,但某些邊界情況可能未被覆蓋。

**受影響文件**:
- `backend/schemas/stock_schemas.py`

**改善建議**:

```python
# backend/schemas/stock_schemas.py
from marshmallow import Schema, fields, validate, validates, ValidationError
from datetime import datetime, timedelta

class StockDataRequestSchema(Schema):
    symbol = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=10),
        error_messages={'required': 'Stock symbol is required'}
    )
    start_date = fields.Date(
        required=True,
        format='%Y-%m-%d',
        error_messages={'required': 'Start date is required'}
    )
    end_date = fields.Date(
        required=True,
        format='%Y-%m-%d',
        error_messages={'required': 'End date is required'}
    )

    @validates('symbol')
    def validate_symbol(self, value):
        # 更嚴格的驗證
        if not value.replace('.', '').replace('-', '').replace('^', '').isalnum():
            raise ValidationError('Invalid stock symbol format')
        # 防止過長的符號
        if len(value) > 10:
            raise ValidationError('Stock symbol too long')
        return value.upper()

    @validates('start_date')
    def validate_start_date(self, value):
        # 防止過舊的日期(避免大量數據查詢)
        if value < datetime.now().date() - timedelta(days=365*10):
            raise ValidationError('Start date cannot be more than 10 years ago')
        if value > datetime.now().date():
            raise ValidationError('Start date cannot be in the future')
        return value

    @validates('end_date')
    def validate_end_date(self, value):
        if value > datetime.now().date():
            raise ValidationError('End date cannot be in the future')
        return value
```

---

## 3. 低優先級安全建議

### 3.1 LocalStorage 安全考量 📋

**問題描述**:
應用程式使用 localStorage 存儲用戶偏好設定。

**當前用途**:
- 語言偏好 (`language`)
- 顏色主題 (`color-theme`)
- 布局設定 (`dashboard-layout`)
- 股票列表 (`stocks`)

**風險**:
- XSS 攻擊可讀取 localStorage
- 無加密存儲
- 無過期機制

**建議**:
由於當前只存儲非敏感數據,風險較低,但建議:

1. 添加數據驗證:
```typescript
// src/utils/localStorage.ts
export function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;

    const parsed = JSON.parse(item) as T;

    // 添加基本驗證
    if (typeof parsed !== typeof defaultValue) {
      console.warn(`Type mismatch for localStorage key "${key}"`);
      return defaultValue;
    }

    return parsed;
  } catch (error) {
    console.warn(`Failed to get localStorage item "${key}":`, error);
    return defaultValue;
  }
}
```

2. 添加數據完整性檢查(未來如存儲敏感數據):
```typescript
// 為敏感數據添加簽名驗證
import { createHmac } from 'crypto';

function signData(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('hex');
}
```

---

### 3.2 添加安全相關的 Meta 標籤 📋

**建議在 index.html 添加**:

```html
<!-- index.html -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- 安全相關 Meta 標籤 -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />

    <!-- 防止搜索引擎緩存敏感頁面(如需要) -->
    <!-- <meta name="robots" content="noarchive" /> -->

    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <title>MarketVue</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

### 3.3 環境變數管理改善 📋

**建議**:

1. 添加環境變數驗證腳本:

```javascript
// scripts/validate-env.js
const requiredEnvVars = {
  production: ['VITE_API_URL'],
  development: [],
};

const env = process.env.NODE_ENV || 'development';
const required = requiredEnvVars[env] || [];

const missing = required.filter(varName => !process.env[varName]);

if (missing.length > 0) {
  console.error(`Missing required environment variables for ${env}:`);
  missing.forEach(varName => console.error(`  - ${varName}`));
  process.exit(1);
}

console.log('Environment variables validation passed ✓');
```

2. 在 package.json 中使用:

```json
{
  "scripts": {
    "validate-env": "node scripts/validate-env.js",
    "build": "npm run validate-env && tsc -b && vite build",
    "dev": "npm run validate-env && vite"
  }
}
```

---

## 4. 良好的安全實踐 ✅

以下是專案中已經實施的良好安全實踐:

### 4.1 輸入驗證 ✅
- 使用 Marshmallow schema 進行嚴格的輸入驗證
- 類型安全的 TypeScript 實現
- 前後端雙重驗證

**位置**:
- `backend/schemas/stock_schemas.py`
- `src/utils/localStorage.ts`

### 4.2 速率限制 ✅
- 使用 Flask-Limiter 實施 API 速率限制
- 每小時 1000 次請求限制
- 基於 IP 地址的限制

**位置**: `backend/app.py:62-72`

### 4.3 錯誤處理 ✅
- 集中式錯誤處理器
- 適當的 HTTP 狀態碼
- 結構化錯誤回應

**位置**: `backend/utils/error_handlers.py`

### 4.4 無 XSS 漏洞 ✅
- 未使用 `dangerouslySetInnerHTML`
- 未使用 `eval()` 或 `Function()`
- React 自動轉義輸出

### 4.5 CORS 配置 ✅
- 使用 Flask-CORS 進行跨域控制
- 明確定義允許的來源
- 限制允許的 HTTP 方法

**位置**: `backend/app.py:48-54`

### 4.6 依賴項管理 ✅
- 使用 `requirements.txt` 鎖定 Python 版本
- 使用 `package-lock.json` 鎖定 npm 版本
- 定期依賴項更新

### 4.7 環境配置分離 ✅
- 開發/生產環境分離
- 使用 `.env` 文件管理配置
- `.env` 文件正確地被 gitignore

**位置**: `backend/config.py`

### 4.8 無 SQL 注入風險 ✅
- 使用 yfinance API,無直接資料庫訪問
- 無動態 SQL 查詢

---

## 5. 安全改善實施計劃

### 第一階段:緊急修復(1-2 天)

**優先級**: 🔴 緊急

1. ✅ **修復 SECRET_KEY**
   - 生成強密鑰
   - 更新生產環境配置
   - 添加驗證邏輯

2. ✅ **添加 HTTP 安全標頭**
   - 安裝 flask-talisman
   - 配置 CSP、HSTS 等
   - 測試應用功能

3. ✅ **修復 js-yaml 漏洞**
   - 運行 `npm audit fix`
   - 驗證修復

4. ✅ **驗證 CORS 配置**
   - 確保生產環境正確設置
   - 添加配置驗證

### 第二階段:重要改善(3-5 天)

**優先級**: 🟡 高

1. ⚠️ **評估認證需求**
   - 決定是否需要 API Key
   - 實施方案 A 或 B

2. ⚠️ **增強速率限制**
   - 實施更細緻的限制
   - 添加異常監控

3. ⚠️ **改善錯誤處理**
   - 清理錯誤訊息
   - 實施審計日誌

4. ⚠️ **添加 Vercel 安全標頭**
   - 創建 `vercel.json`
   - 配置前端安全標頭

### 第三階段:持續改善(1-2 週)

**優先級**: 🟢 中

1. 📋 加強輸入驗證
2. 📋 實施安全日誌
3. 📋 添加監控告警
4. 📋 定期安全掃描

### 第四階段:長期維護(持續)

**優先級**: 🔵 低

1. 定期依賴項更新
2. 安全補丁監控
3. 代碼審查
4. 滲透測試

---

## 6. 安全檢查清單

部署前請確認以下項目:

### 後端安全檢查清單

- [ ] SECRET_KEY 已設置為強隨機值
- [ ] CORS_ORIGINS 明確設置,不包含 localhost
- [ ] 所有環境變數已正確配置
- [ ] HTTP 安全標頭已啟用(flask-talisman)
- [ ] 速率限制已啟用並測試
- [ ] 錯誤訊息不洩漏敏感資訊
- [ ] 審計日誌已啟用
- [ ] Python 依賴項無已知漏洞
- [ ] HTTPS 強制執行已啟用
- [ ] API 認證機制已實施(如需要)

### 前端安全檢查清單

- [ ] VITE_API_URL 指向正確的生產 API
- [ ] npm 依賴項無已知漏洞(`npm audit`)
- [ ] 無 console.log 在生產構建中
- [ ] vercel.json 安全標頭已配置
- [ ] 環境變數已驗證
- [ ] localStorage 數據驗證已實施
- [ ] 無硬編碼的 API 密鑰或機密
- [ ] CSP 配置允許所需資源

### 基礎設施安全檢查清單

- [ ] Render.com 環境變數已設置
- [ ] Vercel 環境變數已設置
- [ ] HTTPS 證書有效
- [ ] 備份策略已制定
- [ ] 監控和告警已設置
- [ ] 訪問控制已配置
- [ ] 日誌保留策略已制定

---

## 7. 安全資源和工具

### 推薦的安全掃描工具

1. **前端**:
   - `npm audit` - 依賴漏洞掃描
   - Snyk - 持續安全監控
   - OWASP ZAP - 網頁應用程式掃描

2. **後端**:
   - `safety check` - Python 依賴掃描
   - Bandit - Python 代碼安全分析
   - `pip-audit` - pip 套件審計

3. **整體**:
   - GitHub Dependabot - 自動化依賴更新
   - SonarQube - 代碼質量和安全分析

### 安全掃描命令

```bash
# 前端掃描
npm audit
npm audit fix

# 後端掃描
cd backend
pip install safety
safety check --json

# 或使用 pip-audit
pip install pip-audit
pip-audit
```

### 持續安全監控

建議設置 GitHub Actions 進行自動化安全掃描:

```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * 0'  # 每週日運行

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run npm audit
        run: npm audit --audit-level=moderate

      - name: Run Python safety check
        run: |
          cd backend
          pip install safety
          safety check
```

---

## 8. 結論與建議

### 總體評估

MarketVue 專案展現了一些良好的安全實踐,特別是在輸入驗證、錯誤處理和依賴管理方面。然而,關鍵的安全基礎設施(如 HTTP 安全標頭、強 SECRET_KEY)仍需加強。

### 關鍵行動項目

**立即處理** (本週內):
1. 修復 SECRET_KEY 配置
2. 添加 HTTP 安全標頭
3. 修復 npm 依賴漏洞
4. 驗證 CORS 配置

**短期處理** (2 週內):
1. 評估並實施 API 認證
2. 增強速率限制和日誌
3. 添加前端安全標頭(Vercel)
4. 改善錯誤訊息處理

**長期維護** (持續):
1. 定期安全掃描
2. 依賴項更新
3. 安全培訓
4. 滲透測試

### 風險接受聲明

如果某些建議無法立即實施,請記錄原因並制定緩解計劃:

| 風險項目 | 接受原因 | 緩解措施 | 複審日期 |
|---------|---------|---------|---------|
| (範例)無 API 認證 | 公開服務性質 | 加強速率限制和監控 | 2025-12-01 |

---

## 9. 附錄

### A. 安全測試腳本

```bash
#!/bin/bash
# scripts/security-test.sh

echo "Running security checks..."

# 檢查環境變數
echo "Checking environment variables..."
if grep -r "dev-secret-key" backend/.env* 2>/dev/null; then
    echo "⚠️  WARNING: Found default SECRET_KEY in .env files"
fi

# 檢查硬編碼秘密
echo "Checking for hardcoded secrets..."
if grep -rE "(password|secret|api_key|token).*=.*['\"]" backend/ --exclude-dir=venv --exclude="*.md"; then
    echo "⚠️  WARNING: Possible hardcoded secrets found"
fi

# npm 審計
echo "Running npm audit..."
npm audit --audit-level=moderate

# Python 安全檢查(如果安裝了 safety)
if command -v safety &> /dev/null; then
    echo "Running Python safety check..."
    cd backend && safety check
fi

echo "Security checks complete!"
```

### B. 相關資源連結

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Flask Security Best Practices](https://flask.palletsprojects.com/en/2.3.x/security/)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
- [CSP Generator](https://report-uri.com/home/generate)
- [Security Headers Scanner](https://securityheaders.com/)

### C. 聯絡資訊

如有安全問題或發現漏洞,請聯絡:
- 專案維護者: [GitHub Issues](https://github.com/Clementtang/marketvue/issues)
- 安全報告: 創建 private security advisory

---

**報告版本**: 1.0
**最後更新**: 2025-11-21
**下次審計建議日期**: 2025-12-21 (1個月後)

---

**免責聲明**: 本安全審計報告基於當前代碼庫狀態(commit: claude/security-audit-01BLX6fnoVUGAmDZMM874pyR)。安全性是一個持續的過程,建議定期進行審計和更新。
