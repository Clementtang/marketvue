# 股票搜尋清單擴充計劃

## 目標

將台股、日股、美股的搜尋清單擴展至少三倍，提升股票搜尋的覆蓋率。

**處理順序**：台股 → 日股 → 美股

---

## 目前狀態

| 市場 | 目前數量 | 目標數量 (3x) |
|------|----------|---------------|
| 台股上市 (TW) | 97 檔 | ~290 檔 |
| 台股上櫃 (TWO) | 50 檔 | ~150 檔 |
| 日股 (JP) | 50 檔 | ~150 檔 |
| 美股 (US) | 119 檔 | ~360 檔 |
| 港股 (HK) | 50 檔 | (不擴充) |

**總計需新增**：約 530+ 檔股票資料

---

## 入選標準評估

### 方案 A：市值導向（Market Cap Based）

**標準**：依市值大小排序，選取前 N 大公司

**優點**：
- 客觀、可量化
- 涵蓋最重要的藍籌股
- 資料來源明確（交易所官方排名）

**缺點**：
- 可能遺漏散戶熱門但市值較小的股票
- 市值會隨時間變動

**建議門檻**：
- 台股上市：市值前 300 名
- 台股上櫃：市值前 150 名
- 日股：日經 225 成分股 + 東證 Prime 市場前 150 名
- 美股：S&P 500 + NASDAQ 100 成分股

---

### 方案 B：成交量導向（Trading Volume Based）

**標準**：依日均成交量/成交金額排序

**優點**：
- 反映實際交易熱度
- 涵蓋散戶關注的熱門股

**缺點**：
- 成交量波動大，排名不穩定
- 可能納入投機性強的股票

---

### 方案 C：混合式（Hybrid）— 建議採用

**標準**：結合市值 + 知名度 + 產業覆蓋

**入選條件**（符合任一即可）：
1. **市值門檻**：市值排名前 N%
2. **指數成分股**：主要指數成分（台灣 50、日經 225、S&P 500 等）
3. **產業代表**：各產業龍頭或知名企業
4. **散戶熱門**：常見於新聞、討論區的股票
5. **ETF 熱門持股**：主要 ETF 的前 N 大持股

**台股特別考量**：
- 金融股（15 檔金控）
- 電子股（半導體、PCB、伺服器）
- 傳產龍頭（台塑四寶、航運三雄）
- 民生消費（統一、全家、寶雅）
- ETF 成分股（0050、0056 成分）

**日股特別考量**：
- 日經 225 成分股（全部納入）
- 汽車產業（Toyota、Honda、Nissan 等）
- 電子/半導體（Sony、Keyence、Tokyo Electron）
- 遊戲/娛樂（Nintendo、Bandai Namco、Capcom）
- 消費品牌（Uniqlo、7-Eleven、花王）
- **軟體/IT 服務**（Cybozu、Freee、MoneyForward、Sansan）
- **新創/成長股**（Mercari、ZOZO、BASE、Rakuten）
- **零售品牌**（Don Quijote、Nitori、MUJI、ABC-Mart、Shimamura）

**美股特別考量**：
- S&P 500 成分股（重點納入）
- NASDAQ 100 成分股（科技股）
- 中概股 ADR（在美上市中國公司）
- Meme 股 / 散戶熱門股
- 各產業 ETF 龍頭

---

## 資料欄位需求

每檔股票需包含：

```json
{
  "symbol": "2330.TW",
  "name": {
    "zh-TW": "台積電",
    "en-US": "TSMC"
  },
  "market": "TW",
  "sector": "Semiconductors",
  "aliases": ["台積", "TSMC", "護國神山"]
}
```

### 產業分類 (sector) 標準

| Sector | 中文 | 範例 |
|--------|------|------|
| `Semiconductors` | 半導體 | 台積電、聯發科、NVIDIA |
| `Electronics` | 電子零組件 | 鴻海、廣達、PCB 廠 |
| `Software` | 軟體服務 | Microsoft、Adobe、ServiceNow |
| `Internet` | 網路平台 | Google、Meta、騰訊 |
| `Financial` | 金融 | 金控、銀行、保險 |
| `Consumer` | 消費品 | 統一、Nike、可口可樂 |
| `Healthcare` | 醫療保健 | 輝瑞、嬌生、藥華藥 |
| `Industrial` | 工業 | 台達電、Caterpillar |
| `Energy` | 能源 | 台塑化、Exxon、中油 |
| `Materials` | 原物料 | 中鋼、台泥、化工 |
| `Telecom` | 電信 | 中華電、AT&T、NTT |
| `Transportation` | 運輸 | 長榮、華航、UPS |
| `RealEstate` | 房地產 | 興富發、新鴻基 |
| `Gaming` | 遊戲娛樂 | Nintendo、EA、網易 |
| `Automotive` | 汽車 | Toyota、Tesla、鴻海 |
| `Retail` | 零售 | 全家、Costco、Amazon |

### 別名 (aliases) 規則

**包含**：
- 常用簡稱（台積、聯發科 → MTK）
- 英文名稱/縮寫
- 產品/品牌名稱（Uniqlo、iPhone）
- 子公司知名品牌

**不包含**：
- 創辦人/CEO 名字
- 過於冷門的別稱

---

## 已確認決策

- **入選標準**：方案 C 混合式（市值 + 知名度 + 產業覆蓋）
- **別名深度**：包含品牌名、產品名，不包含創辦人
- **產業分類**：新增 sector 欄位（僅台、日、美）
- **港股**：完全不動，維持現狀

---

## 實作步驟

### Phase 1：台股擴充

**Step 1.1：更新現有資料結構**
- 為現有 97 檔台股上市 + 50 檔上櫃股票新增 sector 欄位
- 檔案：`src/data/stocks/tw-listed.json`, `src/data/stocks/tw-otc.json`

**Step 1.2：擴充台股上市清單**
- 目標：97 → 290 檔（+193 檔）
- 來源：台灣 50、中型 100 成分股、各產業龍頭
- 涵蓋：半導體、金融、傳產、航運、電子代工

**Step 1.3：擴充台股上櫃清單**
- 目標：50 → 150 檔（+100 檔）
- 來源：上櫃指數成分股、生技醫療、IC 設計

### Phase 2：日股擴充

**Step 2.1：更新現有日股 sector**
- 為現有 50 檔日股新增 sector 欄位

**Step 2.2：擴充日股清單**
- 目標：50 → 150 檔（+100 檔）
- 來源：日經 225 成分股（全部納入）
- 涵蓋：汽車、電子、遊戲、消費品、金融

### Phase 3：美股擴充

**Step 3.1：更新現有美股 sector**
- 為現有 119 檔美股新增 sector 欄位

**Step 3.2：擴充美股清單**
- 目標：119 → 360 檔（+241 檔）
- 來源：S&P 500、NASDAQ 100 成分股
- 涵蓋：科技、金融、醫療、消費、能源

### Phase 4：TypeScript 型別更新

**Step 4.1：更新 StockInfo 型別**
- 檔案：`src/types/stockSearch.ts`
- 新增 `sector?: string` 欄位

### Phase 5：文件更新

- 更新 CHANGELOG.md
- 更新 package.json 版本號（MINOR +1）
- 更新 README（如需要）

---

## 需要修改的檔案

| 檔案 | 操作 | 說明 |
|------|------|------|
| `src/data/stocks/tw-listed.json` | 修改 | 擴充至 290 檔 + 新增 sector |
| `src/data/stocks/tw-otc.json` | 修改 | 擴充至 150 檔 + 新增 sector |
| `src/data/stocks/jp-popular.json` | 修改 | 擴充至 150 檔 + 新增 sector |
| `src/data/stocks/us-popular.json` | 修改 | 擴充至 360 檔 + 新增 sector |
| `src/data/stocks/hk-popular.json` | 不動 | 維持現狀 50 檔，不加 sector |
| `src/types/stockSearch.ts` | 修改 | 新增 sector 欄位（optional） |
| `CHANGELOG.md` | 修改 | 記錄版本變更 |
| `package.json` | 修改 | 版本號 1.12.0 → 1.13.0 |
