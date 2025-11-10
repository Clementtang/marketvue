# MarketVue 程式碼審查與重構計劃

**日期**: 2025-11-09
**版本**: v1.3.4
**審查類型**: 全面程式碼品質審查

---

## 📊 執行摘要

### 審查範圍
- **前端**: 12 個 TypeScript/TSX 檔案
- **後端**: 13 個 Python 檔案
- **總代碼行數**: ~3000+ 行

### 發現問題總計
- **前端**: 39 個問題（12 High, 19 Medium, 8 Low）
- **後端**: 35 個問題（11 High, 14 Medium, 10 Low）
- **總計**: 74 個問題

### 工作量評估
- **前端**: 6-10 天
- **後端**: 10-15 天
- **總計**: 16-25 天（約 3-5 週）

---

## 🎯 重構優先級矩陣

### 第一優先級（P0 - 立即處理）
> **目標**: 2 週內完成
> **重點**: 效能、穩定性、架構基礎

#### 1. 添加效能優化 Hooks (前端) 🔴
- **問題**: 完全缺少 `useCallback` 和 `useMemo`，導致不必要的 re-renders
- **影響範圍**:
  - StockCard.tsx (fetchStockData, calculateMA, displayName)
  - DashboardGrid.tsx (handleLayoutChange)
  - CandlestickChart.tsx (價格範圍計算)
- **預期改善**: 減少 30-50% 不必要的渲染
- **工作量**: M (2-4 小時)
- **優先度**: ⭐⭐⭐⭐⭐

#### 2. 建立測試覆蓋 (後端) 🔴
- **問題**: 測試覆蓋率 0%
- **影響**: 代碼變更風險高，無法保證品質
- **實作項目**:
  - [ ] 單元測試 (services/)
  - [ ] 整合測試 (routes/)
  - [ ] API 端點測試
  - [ ] 模擬測試 (yfinance)
- **目標覆蓋率**: 70%+
- **工作量**: XL (16+ 小時)
- **優先度**: ⭐⭐⭐⭐⭐

#### 3. 拆分 StockCard 大組件 (前端) 🔴
- **問題**: 360 行組件，職責過多
- **拆分結構**:
  ```
  src/components/StockCard/
  ├── index.tsx              # 主組件 (50-80行)
  ├── useStockData.ts        # 數據獲取 Hook
  ├── StockCardHeader.tsx    # 標題區域
  ├── StockCardChart.tsx     # 圖表區域
  ├── StockCardVolume.tsx    # 成交量區域
  ├── StockCardFooter.tsx    # 底部資訊
  └── utils.ts               # 工具函數
  ```
- **工作量**: L (4-8 小時)
- **優先度**: ⭐⭐⭐⭐⭐

#### 4. 優化批次查詢效能 (後端) 🔴
- **問題**: 串行執行 N 次 API 調用
- **解決方案**: 使用 ThreadPoolExecutor 並行處理
- **預期改善**: 9 個股票從 9-18 秒降至 2-4 秒
- **工作量**: M (2-4 小時)
- **優先度**: ⭐⭐⭐⭐⭐

#### 5. 實作 Context API 解決 Props Drilling (前端) 🔴
- **問題**: language, colorTheme, chartType 經過 3 層傳遞
- **實作**:
  ```typescript
  src/contexts/
  ├── AppContext.tsx         # 全局設定
  └── ThemeContext.tsx       # 主題設定
  ```
- **工作量**: L (4-8 小時)
- **優先度**: ⭐⭐⭐⭐

#### 6. 添加 Type Hints (後端) 🔴
- **問題**: 大部分函數缺少型別提示
- **範圍**: routes/, utils/, app.py, config.py
- **工作量**: M (2-4 小時)
- **優先度**: ⭐⭐⭐⭐

---

### 第二優先級（P1 - 短期處理）
> **目標**: 1 個月內完成
> **重點**: 代碼品質、可維護性

#### 7. 建立共用工具函數 (前端)
- **localStorage 工具** (`src/utils/localStorage.ts`)
  - getLocalStorageItem<T>
  - setLocalStorageItem<T>
- **日期格式化工具** (`src/utils/formatters.ts`)
  - formatChartDate
  - formatTimestamp
- **統一 CustomTooltip** (`src/components/common/ChartTooltip.tsx`)
- **工作量**: M (3-4 小時)

#### 8. 實作依賴注入 (後端)
- **問題**: StockService 硬依賴 yfinance
- **解決方案**:
  ```python
  class StockDataProvider(ABC):
      @abstractmethod
      def fetch_data(...): pass

  class YFinanceProvider(StockDataProvider):
      def fetch_data(...): ...
  ```
- **工作量**: L (4-8 小時)

#### 9. 統一型別定義 (前端)
- **建立**: `src/types/stock.ts`
  - StockDataPoint
  - ColorTheme
  - Language
  - ChartType
- **消除**: 重複的 interface 定義
- **工作量**: S (1-2 小時)

#### 10. 拆分過長函數 (後端)
- **StockService.get_stock_data()** (88 行)
  - _fetch_history()
  - _convert_to_data_points()
  - _calculate_price_info()
  - _get_company_name_safe()
- **工作量**: L (4-8 小時)

#### 11. 改進錯誤處理 (前端)
- **抽取錯誤訊息函數**:
  ```typescript
  src/utils/errorHandlers.ts
  - getErrorMessage(err, language, t)
  - shouldRetry(error, retryCount)
  - calculateRetryDelay(retryCount, is503)
  ```
- **工作量**: M (2-4 小時)

#### 12. 建立錯誤處理裝飾器 (後端)
- **實作**: `@handle_api_errors`
- **消除**: 重複的 try-catch 區塊
- **工作量**: S (1-2 小時)

#### 13. 消除硬編碼值 (前後端)
- **前端**: 建立 `src/config/constants.ts`
  - API_CONFIG, CHART_HEIGHTS, COLORS, RETRY_CONFIG
- **後端**: 擴展 `config.py`
  - API_VERSION, STOCK_FALLBACK_PERIOD, MAX_BATCH_STOCKS
- **工作量**: M (3-4 小時)

#### 14. 添加 Error Boundary (前端)
- **實作**: `src/components/ErrorBoundary.tsx`
- **包裹**: App 和關鍵組件
- **工作量**: M (2-3 小時)

---

### 第三優先級（P2 - 中期改進）
> **目標**: 2-3 個月內完成
> **重點**: 使用者體驗、代碼風格

#### 15. 統一 Docstrings (後端)
- **格式**: Google Style
- **範圍**: 所有函數和類
- **工作量**: M (3-4 小時)

#### 16. 抽取重試邏輯為 Hook (前端)
- **建立**: `src/hooks/useRetry.ts`
- **重構**: StockCard 重試邏輯
- **工作量**: L (4-6 小時)

#### 17. 優化快取策略 (後端)
- **生產環境**: 從 SimpleCache 遷移到 Redis
- **配置**: 環境變數 REDIS_URL
- **工作量**: M (3-4 小時)

#### 18. 改善日誌記錄 (後端)
- **添加上下文**: request_id, ip, endpoint
- **使用**: logger.exception() 取代 logger.error()
- **工作量**: M (2-3 小時)

#### 19. 分離關注點 (後端)
- **拆分服務**:
  - StockDataFetcher
  - StockDataTransformer
  - PriceCalculator
  - CompanyNameService
- **工作量**: L (6-8 小時)

#### 20. 統一顏色主題系統 (前端)
- **建立**: `src/config/chartTheme.ts`
- **統一**: MA20, MA60, Volume 顏色
- **工作量**: M (2-3 小時)

#### 21. 替換 alert 為 Toast (前端)
- **問題**: TimeRangeSelector 使用原生 alert
- **方案**: 使用 NotificationBanner 或新建 Toast
- **工作量**: M (2-3 小時)

#### 22. 添加配置驗證 (後端)
- **實作**: Config._validate()
- **檢查**: 必需環境變數、值有效性
- **工作量**: M (2-3 小時)

---

### 第四優先級（P3 - 長期優化）
> **目標**: 持續改進
> **重點**: 細節優化、最佳實踐

#### 23. 添加型別守衛 (前端)
- isValidThemeMode()
- isValidLanguage()
- isValidColorTheme()
- **工作量**: S (1 小時)

#### 24. 組件記憶化 (前端)
- React.memo: Footer, ChartTypeToggle, NotificationBanner
- **工作量**: S (1 小時)

#### 25. 改善輸入驗證 (前端)
- TimeRangeSelector: 日期格式、範圍限制
- **工作量**: S (1-2 小時)

#### 26. 添加 API 版本控制 (後端)
- url_prefix: `/api/v1`
- **工作量**: S (30 分鐘)

#### 27. 增強健康檢查 (後端)
- `/health/detail`: 檢查 cache, yfinance
- **工作量**: M (2-3 小時)

#### 28. 優化小細節
- 移除生產環境 console.log
- 統一可選鏈使用
- 修復 useEffect 依賴
- 移除未使用的 isVisible 狀態
- **工作量**: M (2-3 小時)

---

## 📋 分階段執行計劃

### Phase 1: 效能與穩定性基礎（2 週）

**目標**: 建立穩固的效能和測試基礎

**前端任務** (Week 1):
1. ✅ 添加 useCallback/useMemo 優化
2. ✅ 拆分 StockCard 大組件
3. ✅ 實作 Context API
4. ✅ 統一型別定義

**後端任務** (Week 2):
1. ✅ 建立完整測試套件
2. ✅ 優化批次查詢效能
3. ✅ 添加 Type Hints
4. ✅ 實作依賴注入

**驗收標準**:
- [ ] 前端渲染性能提升 30%+
- [ ] 後端測試覆蓋率 ≥ 70%
- [ ] 批次查詢速度提升 4-5x
- [ ] 所有 TypeScript/Python 檔案有完整型別

---

### Phase 2: 代碼品質提升（2 週）

**目標**: 消除冗餘，提高可維護性

**前端任務** (Week 3):
1. ✅ 建立共用工具函數庫
2. ✅ 改進錯誤處理
3. ✅ 消除硬編碼值
4. ✅ 添加 Error Boundary

**後端任務** (Week 4):
1. ✅ 拆分過長函數
2. ✅ 建立錯誤處理裝飾器
3. ✅ 消除硬編碼值
4. ✅ 統一 Docstrings

**驗收標準**:
- [ ] 代碼重複率 < 5%
- [ ] 平均函數長度 < 50 行
- [ ] 所有硬編碼值已配置化
- [ ] 所有函數有完整文檔

---

### Phase 3: 架構優化（2-3 週）

**目標**: 改善架構設計，分離關注點

**前端任務** (Week 5-6):
1. ✅ 抽取重試邏輯為 Hook
2. ✅ 統一顏色主題系統
3. ✅ 替換 alert 為 Toast
4. ✅ 組件記憶化優化

**後端任務** (Week 5-7):
1. ✅ 分離服務層職責
2. ✅ 優化快取策略
3. ✅ 改善日誌記錄
4. ✅ 添加配置驗證

**驗收標準**:
- [ ] 服務層職責清晰
- [ ] 日誌包含完整上下文
- [ ] 快取策略適合生產環境
- [ ] UX 體驗一致性高

---

### Phase 4: 細節優化（持續進行）

**目標**: 持續改進和最佳實踐

**長期任務**:
1. ⏳ 添加型別守衛
2. ⏳ 改善輸入驗證
3. ⏳ API 版本控制
4. ⏳ 增強健康檢查
5. ⏳ 持續性能監控

**驗收標準**:
- [ ] 代碼通過所有 linter 規則
- [ ] 無 TypeScript/mypy 錯誤
- [ ] 符合最佳實踐標準

---

## 🎯 關鍵指標追蹤

### 效能指標

| 指標 | 當前 | 目標 | Phase 1 後 | Phase 2 後 | Phase 3 後 |
|------|------|------|-----------|-----------|-----------|
| 前端首次渲染 | - | -20% | ✓ | - | - |
| StockCard 重渲染次數 | - | -50% | ✓ | - | - |
| 批次查詢時間 (9 stocks) | 9-18s | <4s | ✓ | - | - |
| 單一股票查詢 | 1-2s | <1s | - | ✓ | - |

### 品質指標

| 指標 | 當前 | 目標 | Phase 1 後 | Phase 2 後 | Phase 3 後 |
|------|------|------|-----------|-----------|-----------|
| 測試覆蓋率 (後端) | 0% | 70% | ✓ | 80% | 85% |
| 測試覆蓋率 (前端) | 0% | 50% | - | ✓ | 60% |
| TypeScript any 使用 | ~10 | 0 | ✓ | - | - |
| 代碼重複率 | ~15% | <5% | - | ✓ | - |
| 平均函數長度 | ~80 | <50 | - | ✓ | <40 |

### 架構指標

| 指標 | 當前 | 目標 | Phase 1 後 | Phase 2 後 | Phase 3 後 |
|------|------|------|-----------|-----------|-----------|
| 組件平均行數 | 180 | <100 | ✓ | - | - |
| Props drilling 層數 | 3 | 1 | ✓ | - | - |
| 服務職責數 | 4+ | 1-2 | - | - | ✓ |
| 配置化程度 | 40% | 90% | - | ✓ | - |

---

## 🚨 風險評估與緩解

### 高風險項目

#### 1. 大規模重構 StockCard
**風險**: 破壞現有功能
**緩解措施**:
- 先建立完整測試覆蓋
- 使用漸進式重構
- 每個子組件獨立測試
- 保留舊版本作為備份

#### 2. 改變快取策略
**風險**: 影響生產環境性能
**緩解措施**:
- 在測試環境充分驗證
- 使用功能開關 (feature flag)
- 監控 Redis 性能指標
- 準備回滾計劃

#### 3. 實作依賴注入
**風險**: 大幅改變架構
**緩解措施**:
- 先建立抽象層
- 保持向後兼容
- 逐步遷移現有代碼
- 完整的單元測試

### 中風險項目

#### 4. Context API 遷移
**風險**: 影響渲染性能
**緩解措施**:
- 拆分 Context 避免過度渲染
- 使用 React DevTools 監控
- 性能測試對比

#### 5. 批次查詢並行化
**風險**: 可能觸發 API 限流
**緩解措施**:
- 限制並行數量 (max_workers=5)
- 添加重試機制
- 監控 API 響應時間

---

## 📊 詳細問題清單

### 前端問題 (39 個)

#### 代碼冗餘 (6 個)
- [HIGH] 重複的型別定義 - StockDataPoint (S)
- [HIGH] COLOR_THEMES 定義重複 (S)
- [MED] CustomTooltip 組件重複 (M)
- [LOW] 日期格式化邏輯重複 (S)
- [MED] localStorage 錯誤處理重複 (M)
- [MED] 內聯翻譯字串 (M)

#### 效能問題 (13 個)
- [HIGH] 完全缺少 useCallback 和 useMemo (M)
  - StockCard.fetchStockData
  - StockCard.calculateMA
  - StockCard.getDisplayName
  - StockCard.avgVolume
- [HIGH] DashboardGrid.handleLayoutChange 未優化 (M)
- [MED] CandlestickChart 價格範圍計算未記憶化 (S)
- [HIGH] 內聯組件造成不必要 re-render (M)
- [MED] StockCard MA 計算重複執行 (M)
- [LOW] 雙重 requestAnimationFrame (S)

#### 代碼品質 (9 個)
- [HIGH] StockCard 組件過長 360 行 (L)
- [HIGH] 複雜的錯誤處理邏輯 7 層嵌套 (M)
- [MED] 硬編碼值過多 (M)
  - API 配置
  - 魔術數字
  - 重試延遲
  - 顏色值
- [HIGH] 缺少 Error Boundary (M)
- [LOW] 生產環境存在 console.log (S)
- [MED] 使用原生 alert (M)
- [LOW] 缺少輸入驗證 (S)
- [LOW] 版本號硬編碼 (S)

#### TypeScript 問題 (4 個)
- [HIGH] 過度使用 any 型別 (M)
  - StockCard catch (err: any)
  - CustomTooltip props: any
  - Candlestick props: any
- [MED] 型別斷言缺少驗證 (S)
- [LOW] 可選鏈使用不一致 (S)
- [LOW] 缺少 Enum 型別 (M)

#### React 最佳實踐 (7 個)
- [HIGH] 嚴重的 Props Drilling 3 層 (L)
- [HIGH] useEffect 依賴項問題 (M)
- [MED] 狀態管理過於集中 7 個狀態 (L)
- [LOW] 副作用處理不當 (S)
- [LOW] 不必要的 isVisible 狀態 (S)
- [LOW] 組件未記憶化 (S)
- [HIGH] 重試邏輯應該抽取為 Hook (L)

---

### 後端問題 (35 個)

#### 代碼冗餘 (5 個)
- [HIGH] 錯誤處理模式重複 (S)
- [MED] 日期範圍驗證重複 (S)
- [MED] 快取鍵生成邏輯重複 (S)
- [HIGH] 數據提取邏輯複雜且冗長 (M)
- [LOW] 未使用的快取工具函數 (S)

#### 效能問題 (6 個)
- [HIGH] 批次查詢效能差 - 串行執行 (M)
- [HIGH] 不必要的昂貴 ticker.info 調用 (S)
- [MED] 快取配置不夠靈活 (S)
- [MED] SimpleCache 不適合生產環境 (M)
- [LOW] 重複讀取 JSON 文件風險 (S)

#### 代碼品質 (6 個)
- [HIGH] get_stock_data 函數過長 88 行 (L)
- [HIGH] 硬編碼值散布各處 (M)
- [MED] 複雜的三元運算符鏈 (S)
- [MED] 過於寬泛的異常捕獲 (M)
- [LOW] 缺少輸入驗證 (S)

#### Python 最佳實踐 (6 個)
- [HIGH] Type Hints 幾乎完全缺失 (M)
- [HIGH] Docstrings 格式不一致且不完整 (M)
- [MED] 未使用 logging.exception() (S)
- [MED] 缺少日誌上下文信息 (M)
- [LOW] 未使用常數而是魔術數字 (S)

#### 架構問題 (12 個)
- [HIGH] 完全缺少測試 - 0% 覆蓋率 (XL)
- [HIGH] 缺少依賴注入 (L)
- [MED] 業務邏輯混在路由層 (M)
- [MED] 關注點未適當分離 (L)
- [MED] 缺少配置驗證 (M)
- [LOW] 缺少 API 版本控制 (S)
- [LOW] 缺少健康檢查細節 (M)

---

## 📚 參考資料

### 技術文檔
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)
- [Flask Testing Guide](https://flask.palletsprojects.com/en/3.0.x/testing/)
- [Python Type Hints](https://docs.python.org/3/library/typing.html)

### 專案文檔
- ARCHITECTURE.md - 架構設計
- API.md - API 文檔
- CONTRIBUTING.md - 貢獻指南
- .claude-public/CLAUDE.md - 開發規範

---

## 💡 實作建議

### 開發流程
1. **每個 Phase 開始前**:
   - 創建專門的 feature branch
   - 更新 ROADMAP.md
   - 與團隊同步計劃

2. **開發過程中**:
   - 小步提交，清晰的 commit message
   - 每個子任務完成後進行測試
   - 更新相關文檔

3. **Phase 完成後**:
   - 執行完整測試套件
   - 更新 CHANGELOG.md
   - 創建 Pull Request
   - 進行 Code Review
   - 部署到測試環境驗證

### 代碼審查重點
- 是否引入新的技術債
- 是否符合專案編碼規範
- 是否有完整測試覆蓋
- 是否有雙語文檔

### 測試策略
- **單元測試**: 覆蓋所有工具函數和服務層
- **整合測試**: 測試 API 端點和數據流
- **E2E 測試**: 測試關鍵用戶流程
- **性能測試**: 對比重構前後的性能指標

---

## ✅ 驗收標準

### Phase 1 完成標準
- [ ] 前端所有關鍵組件使用 useCallback/useMemo
- [ ] StockCard 成功拆分為 6+ 個子組件
- [ ] Context API 實作並移除 Props Drilling
- [ ] 後端測試覆蓋率 ≥ 70%
- [ ] 批次查詢速度 < 4 秒
- [ ] 所有檔案添加 Type Hints

### Phase 2 完成標準
- [ ] 建立完整的 utils 工具庫
- [ ] 錯誤處理統一且優雅
- [ ] 零硬編碼值（全部配置化）
- [ ] Error Boundary 覆蓋關鍵區域
- [ ] 函數平均長度 < 50 行
- [ ] Docstrings 100% 覆蓋

### Phase 3 完成標準
- [ ] 重試邏輯抽取為可復用 Hook
- [ ] 顏色主題系統統一
- [ ] Toast 通知取代所有 alert
- [ ] 服務層職責單一清晰
- [ ] Redis 快取配置完成
- [ ] 日誌包含完整上下文

### 最終驗收標準
- [ ] 所有測試通過（前後端）
- [ ] 性能指標達標
- [ ] 代碼品質指標達標
- [ ] 架構指標達標
- [ ] 文檔完整更新
- [ ] 部署到生產環境成功

---

## 📝 附錄

### A. 工具建議

**前端**:
- ESLint + TypeScript ESLint
- Prettier
- Jest + React Testing Library
- React DevTools Profiler

**後端**:
- pytest + pytest-cov
- mypy (type checking)
- black (formatting)
- flake8 (linting)
- pylint

### B. 相關 Issues

建議創建以下 GitHub Issues：
- [ ] #1: [P0] 添加前端效能優化 Hooks
- [ ] #2: [P0] 建立後端測試覆蓋
- [ ] #3: [P0] 拆分 StockCard 大組件
- [ ] #4: [P0] 優化批次查詢效能
- [ ] #5: [P1] 實作 Context API
- [ ] #6: [P1] 建立共用工具函數庫
- [ ] #7: [P1] 實作依賴注入模式
- [ ] #8: [P2] 統一 Docstrings 格式

### C. 技術債務追蹤

在 `.todo/tech-debt.md` 中持續追蹤：
- 已知但未修復的問題
- 臨時解決方案（需要長期解決）
- 效能瓶頸
- 安全性問題

---

**文檔版本**: 1.0
**最後更新**: 2025-11-09
**下次審查**: 每個 Phase 完成後

**記住**: 這是一個持續改進的計劃，根據實際情況靈活調整呢。
