# 工作日誌：股票搜尋清單擴充

**日期**：2025-12-19
**版本**：v1.13.0
**類別**：功能擴充 (Feature Expansion)

---

## 📋 任務概述

將台股、日股、美股的股票搜尋清單擴展至少三倍，提升股票搜尋的覆蓋率，並新增產業分類 (sector) 欄位。

### 處理順序
1. 台股上市 (TW)
2. 台股上櫃 (TWO)
3. 日股 (JP)
4. 美股 (US)
5. 港股 (HK) — 不動

---

## 📊 擴充成果

| 市場 | 原數量 | 新數量 | 增幅 | 備註 |
|------|--------|--------|------|------|
| 台股上市 (TW) | 97 檔 | 392 檔 | 4.0x | 新增 sector 欄位 |
| 台股上櫃 (TWO) | 50 檔 | 156 檔 | 3.1x | 新增 sector 欄位 |
| 日股 (JP) | 50 檔 | 151 檔 | 3.0x | 新增 sector 欄位 |
| 美股 (US) | 122 檔 | 379 檔 | 3.1x | 新增 sector 欄位 |
| 港股 (HK) | 50 檔 | 50 檔 | 不變 | 維持原狀 |
| **總計** | **374 檔** | **1,128 檔** | **3.0x** | |

---

## 🏷️ 新增功能：產業分類 (Sector)

### SectorCode 型別定義

新增 16 種產業分類：

```typescript
export type SectorCode =
  | 'Semiconductors'  // 半導體
  | 'Electronics'     // 電子零組件
  | 'Software'        // 軟體服務
  | 'Internet'        // 網路平台
  | 'Financial'       // 金融
  | 'Consumer'        // 消費品
  | 'Healthcare'      // 醫療保健
  | 'Industrial'      // 工業
  | 'Energy'          // 能源
  | 'Materials'       // 原物料
  | 'Telecom'         // 電信
  | 'Transportation'  // 運輸
  | 'RealEstate'      // 房地產
  | 'Gaming'          // 遊戲娛樂
  | 'Automotive'      // 汽車
  | 'Retail';         // 零售
```

### StockEntry 型別更新

```typescript
export interface StockEntry {
  symbol: string;
  name: BilingualName;
  market: MarketCode;
  sector?: SectorCode;  // 新增欄位（optional，向後相容）
  aliases?: string[];
}
```

---

## 📁 修改檔案

### 型別定義
- `src/types/stockSearch.ts` — 新增 `SectorCode` 型別定義

### 股票資料
- `src/data/stocks/tw-listed.json` — 97 → 392 檔 + sector
- `src/data/stocks/tw-otc.json` — 50 → 156 檔 + sector
- `src/data/stocks/jp-popular.json` — 50 → 151 檔 + sector
- `src/data/stocks/us-popular.json` — 122 → 379 檔 + sector

### 文件更新
- `CHANGELOG.md` — v1.13.0 發布紀錄
- `package.json` — 版本號 1.12.0 → 1.13.0
- `README.md` — 更新股票數量資訊
- `README_EN.md` — 更新股票數量資訊

---

## 🎯 入選標準

採用混合式標準（Hybrid Approach）：

1. **市值門檻** — 市值排名前 N%
2. **指數成分股** — 台灣 50、日經 225、S&P 500 等
3. **產業代表** — 各產業龍頭或知名企業
4. **散戶熱門** — 常見於新聞、討論區的股票
5. **ETF 熱門持股** — 主要 ETF 的前 N 大持股

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

## 📝 日股特別加強

依使用者要求，日股特別加強以下類別：

### 軟體/SaaS
- freee (4478.T) — 雲端會計
- Cybozu (4776.T) — kintone
- Sansan (4443.T) — 名片管理
- Money Forward (3994.T) — 個人理財
- Serverworks (4434.T) — AWS 合作夥伴
- Hennge (4475.T) — 雲端資安

### 新創/成長股
- Mercari (4385.T) — 二手交易平台
- ZOZO (3092.T) — 時尚電商
- BASE (4477.T) — 電商平台
- Giftee (4449.T) — 電子禮品券
- Speee (4499.T) — 數位行銷

### 零售品牌
- Don Quijote (7532.T) — 唐吉軻德
- Nitori (9843.T) — 家居零售
- ABC-Mart (2670.T) — 鞋類零售
- Shimamura (8227.T) — 平價服飾
- Welcia (3141.T) — 藥妝連鎖
- Matsumoto Kiyoshi (3088.T) — 藥妝

### 遊戲強化
- Nintendo (7974.T)
- Capcom (9697.T)
- Square Enix (9684.T)
- Konami (9766.T)
- SEGA Sammy (6460.T)
- Nexon (3659.T)
- Bandai Namco (7832.T)

---

## ✅ 驗證項目

- [x] TypeScript 型別編譯通過
- [x] 所有 JSON 檔案格式正確
- [x] sector 欄位向後相容（optional）
- [x] 版本號更新至 1.13.0
- [x] CHANGELOG 記錄完整
- [x] README 中英版本同步更新

---

## 🔮 未來可能的功能

- 依 sector 篩選股票
- sector 統計圖表
- 產業輪動分析
- 相關股票推薦

---

## 📚 相關文件

- [CHANGELOG.md](../../../CHANGELOG.md)
- [股票搜尋型別定義](../../../src/types/stockSearch.ts)
- [計劃文件](../../../.claude/plans/immutable-moseying-star.md)
