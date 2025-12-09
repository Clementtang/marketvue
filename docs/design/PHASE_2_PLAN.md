# Phase 2: Motion & Interaction 實作計劃

> **創建日期**: 2025-12-09
> **預計工期**: 3-5 天
> **優先級**: 🔴 HIGH
> **工作量**: 🟡 MEDIUM

---

## 📋 工作概述

Phase 2 專注於為介面注入生命力，透過精緻的動畫與微互動提升使用者體驗的專業度與愉悅感。

### 目標

- 讓介面感覺「活著」而非靜態
- 提供清晰的視覺回饋
- 增強數據變化的可感知性
- 保持 60fps 流暢度

---

## 🎯 核心任務清單

### Task 1: 安裝與配置動畫庫

**目標**: 引入 react-spring 作為動畫基礎設施

**步驟**:
```bash
npm install @react-spring/web
```

**配置檔案**:
- 創建 `src/utils/animations.ts` - 通用動畫配置
- 定義標準 spring 配置：
  - `config.gentle` - 柔和緩入緩出
  - `config.wobbly` - 彈性效果
  - `config.stiff` - 快速響應

**驗收標準**:
- ✅ react-spring 成功安裝
- ✅ 動畫配置檔案可被其他組件導入
- ✅ TypeScript 型別正確

**預計時間**: 30 分鐘

---

### Task 2: 頁面載入動畫（Stagger Effect）

**目標**: 股票卡片依序淡入上浮，避免突然全部出現

**實作位置**: `src/components/DashboardGrid.tsx`

**技術細節**:
```tsx
import { useTrail, animated } from '@react-spring/web';

// 在 DashboardGrid 組件內
const trails = useTrail(paginatedStocks.length, {
  from: { opacity: 0, transform: 'translateY(20px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
  config: { tension: 280, friction: 60 },
  delay: (index) => index * 50, // 每張卡片延遲 50ms
});

// 渲染時
{trails.map((style, index) => (
  <animated.div key={paginatedStocks[index]} style={style}>
    <StockCard ... />
  </animated.div>
))}
```

**驗收標準**:
- ✅ 卡片依序從下往上淡入
- ✅ 延遲間隔自然（約 50ms）
- ✅ 換頁時觸發動畫
- ✅ 動畫不影響拖放功能

**預計時間**: 2 小時

---

### Task 3: 數字計數動畫

**目標**: 價格與百分比變化時以動畫方式計數，而非瞬間跳變

**實作位置**: `src/components/stock-card/StockCardHeader.tsx`

**技術細節**:
```tsx
import { useSpring, animated } from '@react-spring/web';

const AnimatedNumber = ({ value, prefix = '', suffix = '' }) => {
  const { number } = useSpring({
    from: { number: 0 },
    number: value,
    config: { duration: 800 },
  });

  return (
    <animated.span>
      {prefix}
      {number.to((n) => n.toFixed(2))}
      {suffix}
    </animated.span>
  );
};

// 使用
<AnimatedNumber value={currentPrice} prefix="$" />
<AnimatedNumber value={changePercent} suffix="%" />
```

**驗收標準**:
- ✅ 價格更新時平滑計數
- ✅ 百分比變化帶動畫
- ✅ 動畫時長合理（約 800ms）
- ✅ 支援正負數

**預計時間**: 2 小時

---

### Task 4: 圖表過渡效果

**目標**: 圖表數據更新時線條流暢過渡，而非重新繪製

**實作位置**: `src/components/stock-card/StockCardChart.tsx`

**技術細節**:
```tsx
// 使用 recharts 內建動畫
<LineChart
  data={data}
  animationDuration={800}
  animationEasing="ease-in-out"
>
  <Line
    type="monotone"
    dataKey="close"
    animationBegin={0}
    animationDuration={1000}
  />
</LineChart>
```

**額外優化**:
- 添加 `isAnimationActive={true}` 確保動畫開啟
- 使用 cubic-bezier easing 增加流暢感

**驗收標準**:
- ✅ 線條平滑過渡
- ✅ 日期範圍切換時觸發動畫
- ✅ K線圖也支援動畫
- ✅ 不影響圖表互動性

**預計時間**: 1.5 小時

---

### Task 5: 載入狀態優化

**目標**: 用有個性的載入動畫取代基本 spinner

**實作位置**: `src/components/stock-card/StockCardLoading.tsx`

**技術細節**:

**選項 A: 脈衝圖標**
```tsx
<div className="flex items-center justify-center h-full">
  <div className="animate-pulse-subtle">
    <TrendingUp className="w-8 h-8 text-warm-accent-400" />
  </div>
</div>
```

**選項 B: 骨架屏（推薦）**
```tsx
<div className="p-3 space-y-3">
  <div className="h-6 bg-warm-200 dark:bg-warm-700 rounded animate-shimmer" />
  <div className="h-20 bg-warm-200 dark:bg-warm-700 rounded animate-shimmer" />
  <div className="h-12 bg-warm-200 dark:bg-warm-700 rounded animate-shimmer" />
</div>
```

**CSS 動畫**:
```css
@keyframes shimmer {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

.animate-shimmer {
  animation: shimmer 1.5s ease-in-out infinite;
}
```

**驗收標準**:
- ✅ 載入動畫視覺精緻
- ✅ 支援深色模式
- ✅ 動畫循環自然
- ✅ 不影響實際載入速度

**預計時間**: 1.5 小時

---

### Task 6: 懸停微互動優化

**目標**: 在 Phase 1 基礎上增加更多細節動畫

**實作位置**: `src/components/stock-card/StockCard.tsx`

**額外增強**:

1. **圖表懸停高亮**
```tsx
<Line
  dot={false}
  activeDot={{
    r: 6,
    fill: colorTheme.up,
    stroke: 'white',
    strokeWidth: 2,
  }}
/>
```

2. **標題淡入淡出**
```tsx
// 懸停時標題稍微變暗
.stock-card:hover h3 {
  opacity: 0.9;
  transition: opacity 200ms;
}
```

3. **數據放大**
```tsx
// 懸停時價格字體稍微放大
.stock-card:hover .price {
  transform: scale(1.05);
  transition: transform 200ms;
}
```

**驗收標準**:
- ✅ 懸停體驗更豐富
- ✅ 動畫細節精緻
- ✅ 不過度干擾閱讀
- ✅ 效能無明顯影響

**預計時間**: 1 小時

---

## 📦 依賴項

### 新增 npm 套件

| 套件名稱 | 版本 | 用途 |
|---------|------|------|
| `@react-spring/web` | `^9.7.0` | 核心動畫庫 |

### 現有依賴

- React 19
- TypeScript
- Recharts（已內建動畫支援）

---

## 🎨 動畫設計原則

### 1. **微妙而非誇張**
   - 動畫幅度小（translate 10-20px max）
   - 避免過度彈跳或旋轉
   - 金融應用需保持專業

### 2. **回饋而非裝飾**
   - 每個動畫都應有目的（告知狀態、引導視線、確認操作）
   - 避免無意義的炫技動畫

### 3. **性能優先**
   - 使用 `transform` 和 `opacity`（GPU 加速）
   - 避免 `width`、`height`、`top`、`left` 動畫
   - 監控 FPS，確保不低於 60fps

### 4. **可選退出**
   - 尊重系統 `prefers-reduced-motion` 設定
   - 提供關閉動畫選項（未來考慮）

---

## 🧪 測試檢查清單

### 功能測試

- [ ] 頁面載入時卡片依序出現
- [ ] 換頁時動畫重新觸發
- [ ] 數字從舊值平滑過渡到新值
- [ ] 圖表線條流暢變化
- [ ] 載入狀態動畫循環正常
- [ ] 懸停時所有微互動正常

### 性能測試

- [ ] Chrome DevTools Performance 記錄無掉幀
- [ ] 動畫期間 CPU 使用率正常（<50%）
- [ ] 記憶體無異常增長
- [ ] 移動裝置測試流暢度

### 跨瀏覽器測試

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS/iOS)
- [ ] 移動瀏覽器（Android Chrome, iOS Safari）

### 可訪問性測試

- [ ] 遵守 `prefers-reduced-motion`
- [ ] 鍵盤導航不受影響
- [ ] 螢幕閱讀器可正確讀取內容
- [ ] 動畫不引發視覺不適（閃爍、抖動）

---

## 📊 成功指標

### 定性指標

- [ ] 介面感覺「活著」而非靜態
- [ ] 使用者主動稱讚流暢度
- [ ] 動畫增強而非分散注意力
- [ ] 專業度提升

### 定量指標

| 指標 | 目標 | 測量方式 |
|------|------|----------|
| 頁面載入動畫完成時間 | < 1.5s | Performance API |
| 數字計數動畫時長 | 800ms | react-spring config |
| 卡片懸停響應延遲 | < 16ms (60fps) | DevTools Performance |
| 載入狀態動畫 FPS | ≥ 60fps | Chrome FPS meter |

---

## 🚨 風險與緩解

### 風險 1: 動畫過度降低性能

**緩解**:
- 限制同時執行的動畫數量
- 使用 `will-change` CSS 提示瀏覽器
- 監控 FPS，低於 50fps 時降級

### 風險 2: react-spring 學習曲線

**緩解**:
- 先從簡單的 `useSpring` 開始
- 參考官方範例與文件
- 逐步引入複雜動畫（`useTrail`, `useChain`）

### 風險 3: 與現有互動衝突

**緩解**:
- 仔細測試拖放功能
- 確保動畫不阻擋 pointer events
- 動畫執行時保持 UI 可操作

---

## 📝 實作順序建議

**第一天**:
1. Task 1: 安裝配置 (30min)
2. Task 2: 頁面載入動畫 (2h)
3. Task 3: 數字計數動畫 (2h)

**第二天**:
4. Task 4: 圖表過渡效果 (1.5h)
5. Task 5: 載入狀態優化 (1.5h)
6. Task 6: 懸停微互動 (1h)

**第三天**:
7. 整合測試與除錯 (全天)
8. 性能優化與調整參數

**第四天**:
9. 跨瀏覽器測試
10. 可訪問性檢查
11. 文件更新

**第五天** (Buffer):
12. 處理意外問題
13. 細節打磨
14. 準備部署

---

## 📚 參考資源

### React Spring 官方文件
- https://www.react-spring.dev/
- [useSpring API](https://www.react-spring.dev/docs/components/use-spring)
- [useTrail API](https://www.react-spring.dev/docs/components/use-trail)

### 動畫設計參考
- [Motion Design Principles](https://m2.material.io/design/motion/understanding-motion.html)
- [Framer Motion Examples](https://www.framer.com/motion/examples/)
- [CodePen React Spring Examples](https://codepen.io/tag/react-spring)

### 性能優化
- [Rendering Performance](https://web.dev/rendering-performance/)
- [FLIP Technique](https://aerotwist.com/blog/flip-your-animations/)

---

## ✅ 完成後的 Checklist

- [ ] 所有 6 個任務完成
- [ ] 測試檢查清單全部通過
- [ ] 成功指標達成
- [ ] CHANGELOG.md 更新
- [ ] Git commit 創建
- [ ] 推送到 production
- [ ] 更新 `docs/design/README.md` Phase 2 進度

---

**建立者**: Frieren (Claude Code)
**最後更新**: 2025-12-09
**狀態**: 📝 待實作
