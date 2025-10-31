# 時間區間 LocalStorage 測試說明

## 功能說明

已為股票儀表板添加了時間區間 (Date Range) 的 localStorage 持久化功能。現在當用戶選擇時間區間後，該設置會被保存，即使重新整理頁面也會保持。

## 修改的文件

### 1. `src/App.tsx`
- **新增載入邏輯** (第 78-85 行): 從 localStorage 讀取已保存的 `date-range`
- **新增保存邏輯** (第 135 行): 當用戶改變時間區間時，自動保存到 localStorage

### 2. `src/components/TimeRangeSelector.tsx`
- **更新時間選項**: 1D, 5D, 1M, 3M, 6M, YTD, 1Y, 5Y, ALL, Custom
- **新增 `subDays` 函數**: 支援以天為單位的時間範圍

## 測試方法

### 方法 1: 自動化測試頁面 (推薦)

1. 在瀏覽器中打開測試文件：
   ```
   file:///Users/clementtang/stock-dashboard/test-localstorage.html
   ```

2. 按照頁面上的說明依序執行 6 個測試：
   - **測試 1**: 儲存時間區間到 LocalStorage
   - **測試 2**: 從 LocalStorage 讀取時間區間
   - **測試 3**: 更新時間區間
   - **測試 4**: 自定義時間區間
   - **測試 5**: 頁面重新載入後的持久性（需要手動重新整理）
   - **測試 6**: 清除 LocalStorage

3. 每個測試都會顯示 PASS ✓ 或 FAIL ✗ 狀態

4. 查看測試摘要確認所有測試通過

### 方法 2: 手動測試

1. 啟動應用程式：
   ```bash
   # 前端 (Terminal 1)
   npm run dev

   # 後端 (Terminal 2)
   cd backend
   source venv/bin/activate
   PORT=5001 python app.py
   ```

2. 打開瀏覽器到 http://localhost:5173

3. 打開開發者工具 (F12) > Console 標籤

4. 執行以下測試步驟：

#### 步驟 1: 測試儲存功能
```javascript
// 點擊任意時間區間按鈕（例如 3M）
// 在 Console 中檢查
console.log('Saved date range:', localStorage.getItem('date-range'));
// 應該顯示類似: {"startDate":"2024-07-22","endDate":"2024-10-22","preset":"3m"}
```

#### 步驟 2: 測試持久性
```javascript
// 重新整理頁面 (F5)
// 檢查時間區間選項是否仍然是您之前選擇的（例如 3M 按鈕應該是藍色的）
// 在 Console 中驗證
console.log('Loaded date range:', localStorage.getItem('date-range'));
```

#### 步驟 3: 測試不同選項
```javascript
// 點擊不同的時間區間（例如 1M, 6M, 1Y）
// 每次點擊後檢查
console.log('Current range:', localStorage.getItem('date-range'));
// 重新整理頁面，確認選擇被保留
```

#### 步驟 4: 測試自定義範圍
```javascript
// 1. 點擊 Custom 按鈕
// 2. 選擇自定義的開始和結束日期
// 3. 點擊 Apply
// 4. 檢查
console.log('Custom range:', localStorage.getItem('date-range'));
// 應該顯示 preset: "custom" 以及您選擇的日期
// 5. 重新整理頁面，確認自定義範圍被保留
```

### 方法 3: 瀏覽器 DevTools 檢查

1. 打開應用程式 http://localhost:5173

2. 打開開發者工具 (F12) > Application 標籤

3. 在左側面板選擇 Storage > Local Storage > http://localhost:5173

4. 查看右側的 Key-Value 列表，應該看到：
   - Key: `date-range`
   - Value: JSON 格式的時間區間數據

5. 點擊不同的時間區間選項，觀察 `date-range` 的值是否即時更新

6. 重新整理頁面，確認 `date-range` 的值仍然存在

## 預期結果

### 正常行為：
1. ✅ 選擇任意時間區間後，數據會立即保存到 localStorage
2. ✅ 重新整理頁面後，之前選擇的時間區間會自動載入並顯示為選中狀態
3. ✅ 切換不同的時間區間時，localStorage 會即時更新
4. ✅ 自定義日期範圍也會被正確保存和恢復
5. ✅ localStorage 中的數據格式正確（包含 startDate, endDate, preset 三個欄位）

### 數據格式：
```json
{
  "startDate": "2024-09-22",
  "endDate": "2024-10-22",
  "preset": "1m"
}
```

## 故障排除

### 問題 1: 重新整理後時間區間沒有保留
**解決方法**:
1. 檢查 Console 是否有錯誤訊息
2. 確認 localStorage 權限沒有被瀏覽器阻擋
3. 清除瀏覽器緩存後重試

### 問題 2: localStorage 顯示 null
**解決方法**:
1. 至少點擊一次時間區間按鈕
2. 檢查是否有 JavaScript 錯誤阻止了保存邏輯

### 問題 3: 測試頁面無法打開
**解決方法**:
1. 確認測試文件路徑正確
2. 或者直接用瀏覽器拖拽 `test-localstorage.html` 文件到瀏覽器窗口

## 總結

此功能確保用戶的時間區間偏好設置會被保存，提升使用體驗。測試涵蓋了：
- 基本的儲存和讀取功能
- 數據更新功能
- 自定義範圍處理
- 頁面重新載入後的持久性
- 數據清除功能

所有測試應該都能通過，確保功能穩定可靠。
