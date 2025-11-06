# 通用開發原則 (General Development Principles)

> 這份文件包含可複用到其他專案的通用開發標準和最佳實踐

## 文件完整性 (Documentation Completeness)

### 核心原則
**所有程式碼變更都必須伴隨相應的文件更新**

### 必須維護的文件

#### 1. CHANGELOG.md
- **格式**：遵循 [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) 標準
- **結構**：
  ```markdown
  ## [Unreleased]

  ## [版本號] - YYYY-MM-DD

  ### Added
  - 新功能描述

  ### Changed
  - 變更描述

  ### Fixed
  - 修復描述

  ### Improved
  - 改進描述

  ### Removed
  - 移除功能描述
  ```
- **更新時機**：每次 commit 前
- **內容要求**：
  - 清楚描述變更內容和原因
  - 說明對使用者的影響
  - 包含技術細節（如效能提升倍數、新依賴等）

#### 2. README.md
- **基本資訊**：專案簡介、功能特色、技術棧
- **安裝指南**：前置需求、安裝步驟
- **使用說明**：基本操作、常見範例
- **更新時機**：新增功能、變更使用方式、更新技術棧時

#### 3. 程式碼註解
- **何時需要**：複雜邏輯、重要決策、非顯而易見的實作
- **語言**：主要使用英文
- **範例**：
  ```typescript
  // Retry delay strategy: 503 errors use longer intervals (5s, 10s, 15s)
  // to accommodate Render Free tier cold start time (30-60 seconds)
  const coldStartDelays = [5000, 10000, 15000];
  ```

#### 4. API 文件 (如適用)
- 端點說明、參數、回應格式、錯誤碼

## Git Commit 規範

### Conventional Commits
遵循 [Conventional Commits](https://www.conventionalcommits.org/) 規範

### Commit Message 格式
```
<type>: <subject>

<body>

<footer>
```

### Type 類型
- **feat**: 新功能 (New feature)
- **fix**: 修復 Bug (Bug fix)
- **docs**: 文件變更 (Documentation changes)
- **style**: 程式碼格式調整 (Code style changes, no logic change)
- **refactor**: 重構 (Refactoring)
- **perf**: 效能優化 (Performance improvement)
- **test**: 測試相關 (Test changes)
- **chore**: 建構工具、依賴更新 (Build tools, dependencies)
- **config**: 設定檔變更 (Configuration changes)

### Subject 撰寫原則
- 使用英文
- 使用現在式祈使語氣（"add" not "added" or "adds"）
- 首字母小寫
- 結尾不加句號
- 限制在 72 字元以內
- 清楚描述「做了什麼」

### 範例
```
feat: add CSV export functionality for stock data

Implemented CSV export feature allowing users to download
historical price data and technical indicators (MA20, MA60).

- Added export button to StockCard component
- Created CSV generation utility function
- Updated bilingual translations (zh-TW, en-US)
- Added documentation to README

Closes #42
```

### Commit 頻率
- **小而頻繁**：每個 commit 應該是一個邏輯單元
- **可回溯**：每個 commit 都應該可以獨立理解
- **可測試**：每個 commit 後專案應該處於可執行狀態

## 語意化版本控制 (Semantic Versioning)

### 版本格式
**MAJOR.MINOR.PATCH** (例如：1.3.1)

### 版本遞增規則
- **MAJOR**：不相容的 API 變更
- **MINOR**：向下相容的新功能
- **PATCH**：向下相容的 Bug 修復

### 版本號更新時機
- 每次發布到 production 前
- 確保 `package.json` 與 CHANGELOG.md 版本一致

### 範例
- `1.3.0` → `1.3.1`：修復 bug（503 錯誤處理）
- `1.3.1` → `1.4.0`：新功能（CSV 匯出）
- `1.4.0` → `2.0.0`：破壞性變更（API 格式改變）

## 程式碼品質標準

### TypeScript / React 標準

#### 1. 型別安全
```typescript
// ✅ Good: Explicit types
interface StockData {
  symbol: string;
  price: number;
  change: number;
}

function fetchStock(symbol: string): Promise<StockData> {
  // ...
}

// ❌ Bad: any types
function fetchStock(symbol: any): Promise<any> {
  // ...
}
```

#### 2. React 元件結構
```typescript
// ✅ Good: Functional component with TypeScript
interface StockCardProps {
  symbol: string;
  onRemove: (symbol: string) => void;
}

export const StockCard: React.FC<StockCardProps> = ({ symbol, onRemove }) => {
  // Use hooks
  const [data, setData] = useState<StockData | null>(null);

  useEffect(() => {
    // Side effects
  }, [symbol]);

  return (
    // JSX
  );
};
```

#### 3. 命名慣例
- **元件**：PascalCase（`StockCard`, `TimeRangeSelector`）
- **函式/變數**：camelCase（`fetchStockData`, `isLoading`）
- **常數**：UPPER_SNAKE_CASE（`MAX_RETRY_COUNT`, `API_BASE_URL`）
- **型別/介面**：PascalCase（`StockData`, `ApiResponse`）

### Python / Flask 標準

#### 1. PEP 8 遵循
```python
# ✅ Good: Clear function with type hints
def get_stock_data(symbol: str, start_date: str, end_date: str) -> dict:
    """
    Fetch stock data from yfinance API.

    Args:
        symbol: Stock ticker symbol (e.g., '2330.TW')
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format

    Returns:
        Dictionary containing stock data and metadata

    Raises:
        ValueError: If date format is invalid
    """
    # Implementation
    pass

# ❌ Bad: No types, no docstring
def get_stock_data(symbol, start_date, end_date):
    pass
```

#### 2. 命名慣例
- **函式/變數**：snake_case（`get_stock_data`, `retry_count`）
- **類別**：PascalCase（`StockService`, `ApiClient`）
- **常數**：UPPER_SNAKE_CASE（`MAX_RETRIES`, `CACHE_TIMEOUT`）
- **私有方法**：前綴底線（`_validate_symbol`, `_fetch_data`）

#### 3. 單一職責原則
每個函式應該只做一件事：
```python
# ✅ Good: Separate concerns
def fetch_raw_data(symbol: str) -> pd.DataFrame:
    """Fetch raw data from yfinance."""
    pass

def calculate_moving_averages(df: pd.DataFrame) -> pd.DataFrame:
    """Calculate MA20 and MA60."""
    pass

def format_response(df: pd.DataFrame) -> dict:
    """Format dataframe into API response."""
    pass

# ❌ Bad: Doing too much
def get_stock_data(symbol: str) -> dict:
    # Fetches data, calculates indicators, formats response
    pass
```

## 測試原則

### 測試層級
1. **單元測試**：測試個別函式/元件
2. **整合測試**：測試模組間互動
3. **端對端測試**：測試完整使用者流程

### 測試撰寫原則
- **可讀性**：測試名稱應清楚描述測試內容
- **獨立性**：每個測試應該獨立執行
- **可重複性**：測試結果應該一致

### 測試範例
```typescript
describe('StockCard', () => {
  it('should display loading state when fetching data', () => {
    // Arrange
    const mockSymbol = '2330.TW';

    // Act
    render(<StockCard symbol={mockSymbol} />);

    // Assert
    expect(screen.getByText(/載入中/i)).toBeInTheDocument();
  });

  it('should retry on 503 error with longer delays', async () => {
    // Test retry logic
  });
});
```

## 錯誤處理

### 錯誤處理層級
1. **使用者友善訊息**：告訴使用者發生什麼事
2. **開發者詳細資訊**：記錄完整錯誤以便 debug
3. **優雅降級**：錯誤不應導致整個應用崩潰

### 錯誤訊息原則
```typescript
// ✅ Good: Specific, actionable error message
if (error.response?.status === 503) {
  setError('服務正在啟動中（首次訪問需要 30-60 秒），請稍候...');
}

// ❌ Bad: Generic error message
setError('發生錯誤');
```

### 錯誤處理範例
```typescript
try {
  const data = await fetchStockData(symbol);
  setStockData(data);
} catch (error) {
  // Log for developers
  console.error('Failed to fetch stock data:', error);

  // Show user-friendly message
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    if (status === 503) {
      setError(translations[language].serviceStarting);
    } else if (status === 404) {
      setError(translations[language].stockNotFound);
    } else {
      setError(translations[language].networkError);
    }
  }
}
```

## 效能優化

### 優化原則
1. **先測量，再優化**：使用實際數據支持優化決策
2. **記錄效能提升**：在 CHANGELOG 中記錄具體數字
3. **考慮權衡**：效能 vs 可讀性 vs 維護性

### 範例
```
## [1.3.0] - 2025-11-06

### Added
- **API Caching System**: Implemented intelligent caching
  - **Performance Impact**: 634x faster (1.92s → 0.003s)
  - **API Load Reduction**: 99.84% fewer API calls
  - 5-minute cache timeout for optimal freshness
```

## 安全性

### 基本原則
1. **永不儲存敏感資料**：密碼、API keys、個人資料
2. **驗證所有輸入**：前端和後端都要驗證
3. **使用環境變數**：敏感設定不進版控

### 常見漏洞防範
- **XSS**：對使用者輸入進行 sanitization
- **SQL Injection**：使用 ORM 或參數化查詢
- **CSRF**：使用 CSRF tokens
- **Command Injection**：避免執行使用者輸入的指令

## 相依性管理

### 更新原則
1. **定期更新**：每季檢查一次依賴更新
2. **安全性優先**：立即更新有安全漏洞的套件
3. **測試後再部署**：更新後務必測試

### 版本鎖定
- **Frontend**: `package-lock.json`
- **Backend**: `requirements.txt` with pinned versions

## 文件雙語支援

### 何時需要雙語
- **使用者文件**：README、API 文件、使用指南
- **UI 文字**：所有介面文字
- **錯誤訊息**：所有使用者可見的錯誤

### 何時可以單語
- **開發者文件**：CONTRIBUTING、架構文件（可選）
- **程式碼註解**：主要使用英文
- **Git commit**：僅使用英文
- **內部 TODO**：依團隊偏好

### 雙語文件結構範例
**選項 1：分離檔案**
```
README.md       # 中文版
README_EN.md    # 英文版
```

**選項 2：同一檔案**
```markdown
# 專案標題 / Project Title

[繁體中文](#繁體中文) | [English](#english)

## 繁體中文
內容...

## English
Content...
```

## 持續改進

### 回顧與學習
- **記錄決策**：重要技術決策要記錄原因
- **分析失敗**：Bug 修復後分析根本原因
- **分享知識**：將學習到的經驗文件化

### 技術債管理
- **識別技術債**：在 CHANGELOG 或 TODO 中記錄
- **計畫償還**：定期排程重構工作
- **避免累積**：新功能不應增加技術債

---

**原則是死的，人是活的。根據專案特性和團隊需求，適當調整這些原則。**
