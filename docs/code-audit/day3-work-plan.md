# Day 3 Work Plan - Frontend Performance Optimization

**Date**: 2025-11-12 (Tuesday)
**Phase**: Phase 1 - Performance & Stability
**Status**: 🚀 Ready to Start
**Estimated Duration**: 3-4 hours

---

## 📋 Goals for Day 3

Based on [phase1-execution-plan.md](./phase1-execution-plan.md) and Day 1-2 progress:

### Primary Goals
1. ✅ Audit all components for unnecessary re-renders
2. ✅ Add `useCallback` to StockCard event handlers and functions
3. ✅ Add `useMemo` to expensive calculations (MA, price ranges, etc.)
4. ✅ Optimize DashboardGrid callback functions
5. ✅ Optimize CandlestickChart calculations
6. ✅ Measure performance improvements with React DevTools Profiler
7. ✅ Ensure no functional regressions

### Success Criteria
- [ ] StockCard re-renders reduced by 50%+
- [ ] All expensive calculations memoized
- [ ] All callback functions wrapped with useCallback
- [ ] React DevTools Profiler shows improved metrics
- [ ] No breaking changes or visual bugs
- [ ] Before/After performance screenshots captured
- [ ] Code committed and pushed

---

## 🎯 Task Breakdown

### Task 1: Audit Current Performance Issues (30 minutes)

#### 1.1 Identify Re-render Problems

**Current Issues Identified**:

**StockCard.tsx** (404 lines):
- ❌ `fetchStockData` recreated on every render (line 87-170)
- ❌ `calculateMA` recreated on every render (line 71-85)
- ❌ `getDisplayName` recreated on every render (line 220-234)
- ❌ `CustomTooltip` recreated on every render (line 237-276)
- ❌ `handleRetry` recreated on every render (line 172-175)
- ❌ Display name calculated inline (line 283)
- ❌ Average volume calculated inline (line 394-396)
- ❌ `isPositive` and `upColor` calculated on every render (line 216-217)

**DashboardGrid.tsx** (181 lines):
- ❌ `updateWidth` recreated on every render (line 25-30)
- ❌ `handleLayoutChange` recreated on every render (line 93-112)

**CandlestickChart.tsx** (286 lines):
- ❌ Price range calculations (minLow, maxHigh, domainMin, domainMax) on every render (line 207-211)
- ⚠️ `Candlestick` and `CustomTooltip` components defined inside - acceptable for this use case

#### 1.2 Performance Measurement Strategy

**Tools to Use**:
1. **React DevTools Profiler**
   - Record before optimization
   - Record after optimization
   - Compare render times and counts

2. **Browser DevTools Performance**
   - Record timeline
   - Check for long tasks
   - Measure paint/layout times

3. **Manual Testing**
   - Add/remove stocks
   - Change time ranges
   - Switch themes/languages
   - Resize grid items

---

### Task 2: Optimize StockCard Component (90 minutes)

#### 2.1 Add useCallback for Functions

**File**: `src/components/StockCard.tsx`

**Changes Required**:

```typescript
import { useState, useEffect, useCallback, useMemo } from 'react';

// ✅ CHANGE 1: Wrap fetchStockData with useCallback
const fetchStockData = useCallback(async (isRetry = false) => {
  setLoading(true);
  setError(null);

  try {
    const response = await axios.post(`${API_BASE_URL}/api/stock-data`, {
      symbol: symbol,
      start_date: startDate,
      end_date: endDate,
    }, {
      timeout: 30000,
    });

    // Calculate moving averages
    let processedData = response.data.data;
    processedData = calculateMA(processedData, 20);
    processedData = calculateMA(processedData, 60);

    setStockData({
      ...response.data,
      data: processedData,
    });
    setRetryCount(0);
  } catch (err: any) {
    // ... error handling (unchanged)
  } finally {
    setLoading(false);
  }
}, [symbol, startDate, endDate]); // Dependencies
```

**⚠️ Note**: `calculateMA` must be defined BEFORE `fetchStockData` or also wrapped in useCallback

```typescript
// ✅ CHANGE 2: Wrap calculateMA with useCallback
const calculateMA = useCallback((data: StockDataPoint[], period: number): StockDataPoint[] => {
  return data.map((point, index) => {
    if (index < period - 1) {
      return { ...point };
    }
    const sum = data
      .slice(index - period + 1, index + 1)
      .reduce((acc, p) => acc + p.close, 0);
    const ma = sum / period;
    return {
      ...point,
      [`ma${period}`]: ma,
    };
  });
}, []); // No dependencies - pure function
```

```typescript
// ✅ CHANGE 3: Wrap handleRetry with useCallback
const handleRetry = useCallback(() => {
  setRetryCount(0);
  fetchStockData();
}, [fetchStockData]);
```

```typescript
// ✅ CHANGE 4: Memoize CustomTooltip
const CustomTooltip = useCallback(({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3 text-xs z-50">
        {/* ... tooltip content (unchanged) */}
      </div>
    );
  }
  return null;
}, [t]); // Dependencies: translations
```

#### 2.2 Add useMemo for Expensive Calculations

```typescript
// ✅ CHANGE 5: Memoize display name
const displayName = useMemo(() => {
  if (!stockData || !stockData.company_name) {
    return stockData?.symbol || symbol;
  }

  const companyName = language === 'zh-TW'
    ? stockData.company_name['zh-TW']
    : stockData.company_name['en-US'];

  if (companyName) {
    return `${companyName} (${stockData.symbol})`;
  }

  return stockData.symbol;
}, [stockData, language, symbol]);
```

```typescript
// ✅ CHANGE 6: Memoize price change indicators
const priceInfo = useMemo(() => {
  if (!stockData) return null;

  const isPositive = (stockData.change ?? 0) >= 0;
  const upColor = isPositive ? colorTheme.up : colorTheme.down;

  return { isPositive, upColor };
}, [stockData, colorTheme]);
```

```typescript
// ✅ CHANGE 7: Memoize average volume
const averageVolume = useMemo(() => {
  if (!stockData || stockData.data.length === 0) {
    return 'N/A';
  }

  const sum = stockData.data.reduce((acc, d) => acc + d.volume, 0);
  const avg = Math.round(sum / stockData.data.length);
  return avg.toLocaleString();
}, [stockData]);
```

#### 2.3 Remove Inline Function Definitions

**Before** (line 220-234):
```typescript
const getDisplayName = () => {
  // ... inline function
};
```

**After**:
```typescript
// Remove getDisplayName function entirely, use displayName from useMemo
```

**Before** (line 283):
```typescript
<h3 className="..." title={getDisplayName()}>{getDisplayName()}</h3>
```

**After**:
```typescript
<h3 className="..." title={displayName}>{displayName}</h3>
```

**Before** (line 216-217):
```typescript
const isPositive = (stockData.change ?? 0) >= 0;
const upColor = isPositive ? colorTheme.up : colorTheme.down;
```

**After**:
```typescript
const priceInfo = useMemo(/* ... */);
// Use priceInfo.isPositive and priceInfo.upColor
```

---

### Task 3: Optimize DashboardGrid Component (30 minutes)

#### 3.1 Add useCallback for Event Handlers

**File**: `src/components/DashboardGrid.tsx`

```typescript
import { useState, useEffect, useCallback } from 'react';

// ✅ CHANGE 1: Wrap updateWidth with useCallback
const updateWidth = useCallback(() => {
  const container = document.getElementById('grid-container');
  if (container && container.offsetWidth > 0) {
    setContainerWidth(container.offsetWidth);
  }
}, []); // No dependencies
```

```typescript
// ✅ CHANGE 2: Wrap handleLayoutChange with useCallback
const handleLayoutChange = useCallback((newLayout: GridLayout.Layout[]) => {
  // Check if all items are stacked vertically (all x=0)
  if (newLayout.length >= 3) {
    const allAtXZero = newLayout.filter(item => item.x === 0).length === newLayout.length;

    if (allAtXZero) {
      const fixedLayout = newLayout.map((item, index) => ({
        ...item,
        x: index % 3,
        y: Math.floor(index / 3),
      }));
      setLayout(fixedLayout);
      localStorage.setItem('dashboard-layout', JSON.stringify(fixedLayout));
      return;
    }
  }

  setLayout(newLayout);
  localStorage.setItem('dashboard-layout', JSON.stringify(newLayout));
}, []); // No dependencies - uses only parameters
```

---

### Task 4: Optimize CandlestickChart Component (30 minutes)

#### 4.1 Add useMemo for Price Range Calculations

**File**: `src/components/CandlestickChart.tsx`

```typescript
import { useMemo } from 'react';

const CandlestickChart = ({ data, colorTheme, language, showMA = true }: CandlestickChartProps) => {
  // ✅ CHANGE 1: Memoize price range calculations
  const priceRangeInfo = useMemo(() => {
    const minLow = Math.min(...data.map(d => d.low));
    const maxHigh = Math.max(...data.map(d => d.high));
    const domainMin = minLow * 0.995; // 0.5% padding
    const domainMax = maxHigh * 1.005; // 0.5% padding
    const priceRange = domainMax - domainMin;

    return { minLow, maxHigh, domainMin, domainMax, priceRange };
  }, [data]); // Recalculate only when data changes

  const { domainMin, domainMax, priceRange } = priceRangeInfo;

  // Rest of component unchanged, use destructured values
  return (
    <ResponsiveContainer width="100%" height={145}>
      <ComposedChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        {/* ... use domainMin, domainMax, priceRange */}
      </ComposedChart>
    </ResponsiveContainer>
  );
};
```

---

### Task 5: Performance Testing and Validation (60 minutes)

#### 5.1 Setup React DevTools Profiler

**Steps**:
1. Install React DevTools browser extension (if not already installed)
2. Open DevTools → Profiler tab
3. Click "Record" button (⏺)
4. Perform test actions
5. Click "Stop" button (⏹)
6. Analyze flame graph and ranked chart

#### 5.2 Before Optimization Measurements

**Test Scenarios**:
1. **Add Stock Test**
   - Start with 0 stocks
   - Add 3 stocks (AAPL, GOOGL, TSLA)
   - Measure total render time

2. **Time Range Change Test**
   - With 3 stocks loaded
   - Change time range from 1W → 1M
   - Measure re-render count and time

3. **Theme Switch Test**
   - With 3 stocks loaded
   - Toggle dark mode
   - Switch color theme (Western ↔ Asian)
   - Measure re-render count

4. **Language Switch Test**
   - With 3 stocks loaded
   - Switch language (zh-TW ↔ en-US)
   - Measure re-render count

**Metrics to Record**:
```
BEFORE OPTIMIZATION:
┌─────────────────────┬──────────────┬─────────────┬───────────┐
│ Test Scenario       │ Render Count │ Total Time  │ Avg Time  │
├─────────────────────┼──────────────┼─────────────┼───────────┤
│ Add 3 Stocks        │              │             │           │
│ Change Time Range   │              │             │           │
│ Toggle Dark Mode    │              │             │           │
│ Switch Theme        │              │             │           │
│ Switch Language     │              │             │           │
└─────────────────────┴──────────────┴─────────────┴───────────┘
```

#### 5.3 Apply Optimizations

**Implementation Order**:
1. ✅ Optimize StockCard (useCallback + useMemo)
2. ✅ Optimize DashboardGrid (useCallback)
3. ✅ Optimize CandlestickChart (useMemo)
4. ✅ Test each component after optimization
5. ✅ Fix any issues immediately

#### 5.4 After Optimization Measurements

**Same Test Scenarios**, record metrics:
```
AFTER OPTIMIZATION:
┌─────────────────────┬──────────────┬─────────────┬───────────┬────────────┐
│ Test Scenario       │ Render Count │ Total Time  │ Avg Time  │ Improvement│
├─────────────────────┼──────────────┼─────────────┼───────────┼────────────┤
│ Add 3 Stocks        │              │             │           │            │
│ Change Time Range   │              │             │           │            │
│ Toggle Dark Mode    │              │             │           │            │
│ Switch Theme        │              │             │           │            │
│ Switch Language     │              │             │           │            │
└─────────────────────┴──────────────┴─────────────┴───────────┴────────────┘
```

#### 5.5 Functional Regression Testing

**Test Checklist**:
- [ ] Stock cards load correctly
- [ ] Charts render properly (line + candlestick)
- [ ] MA20/MA60 lines display correctly
- [ ] Volume charts render
- [ ] Tooltips work on hover
- [ ] Error handling works (invalid symbol, network error)
- [ ] Retry button works
- [ ] Grid layout drag & drop works
- [ ] Layout persists in localStorage
- [ ] Dark mode works
- [ ] Theme switching works (Western ↔ Asian colors)
- [ ] Language switching works (zh-TW ↔ en-US)
- [ ] Time range selection works
- [ ] Responsive design intact (mobile, tablet, desktop)

---

## 📊 Expected Performance Improvements

### Target Metrics

**Render Count Reduction**:
- **Theme/Language Switch**: 50-70% fewer re-renders
  - Before: Every StockCard re-renders
  - After: Only App-level components re-render

**Render Time Reduction**:
- **Initial Load**: 20-30% faster
  - Calculations happen once, not every render

- **User Interactions**: 30-50% faster
  - Callbacks stable, no unnecessary function recreation

**Memory Usage**:
- **Function Objects**: Fewer function allocations
  - Before: New functions every render × number of components
  - After: Functions created once, reused

---

## 🛠️ Implementation Details

### useCallback vs useMemo - When to Use

**useCallback**: For functions
```typescript
// ✅ Use for event handlers
const handleClick = useCallback(() => {
  doSomething();
}, [dependency]);

// ✅ Use for callback props
const fetchData = useCallback(async () => {
  const result = await api.fetch();
  setData(result);
}, [api]);
```

**useMemo**: For values
```typescript
// ✅ Use for expensive calculations
const expensiveValue = useMemo(() => {
  return data.map(item => complexTransform(item));
}, [data]);

// ✅ Use for object/array creation
const config = useMemo(() => ({
  theme: colorTheme,
  language: language
}), [colorTheme, language]);
```

### Common Pitfalls to Avoid

❌ **Don't over-optimize**:
```typescript
// ❌ NO: Premature optimization for simple values
const count = useMemo(() => items.length, [items]);

// ✅ YES: Just use directly
const count = items.length;
```

❌ **Don't forget dependencies**:
```typescript
// ❌ NO: Missing dependency
const fetchData = useCallback(async () => {
  await api.get(userId); // userId not in deps!
}, []); // ⚠️ Stale closure bug

// ✅ YES: Include all dependencies
const fetchData = useCallback(async () => {
  await api.get(userId);
}, [userId, api]);
```

❌ **Don't memoize everything**:
```typescript
// ❌ NO: Unnecessary memoization
const title = useMemo(() => 'My App', []); // Static string!

// ✅ YES: Just use constant
const TITLE = 'My App';
```

---

## 📝 Execution Checklist

### Morning (9:00 AM - 12:00 PM)

- [ ] **Setup** (15 min)
  - [ ] git pull origin main
  - [ ] npm install (ensure deps updated)
  - [ ] npm run dev (start dev server)
  - [ ] Open React DevTools

- [ ] **Baseline Measurements** (30 min)
  - [ ] Record current performance metrics
  - [ ] Take screenshots of Profiler results
  - [ ] Document baseline in day3-completion-report.md

- [ ] **Optimize StockCard** (90 min)
  - [ ] Add useCallback for fetchStockData
  - [ ] Add useCallback for calculateMA
  - [ ] Add useCallback for handleRetry
  - [ ] Add useCallback for CustomTooltip
  - [ ] Add useMemo for displayName
  - [ ] Add useMemo for priceInfo
  - [ ] Add useMemo for averageVolume
  - [ ] Remove getDisplayName function
  - [ ] Update JSX to use memoized values
  - [ ] Test component functionality

- [ ] **Lunch Break** (12:00 PM - 1:00 PM)

### Afternoon (1:00 PM - 4:00 PM)

- [ ] **Optimize DashboardGrid** (30 min)
  - [ ] Add useCallback for updateWidth
  - [ ] Add useCallback for handleLayoutChange
  - [ ] Test grid layout functionality

- [ ] **Optimize CandlestickChart** (30 min)
  - [ ] Add useMemo for priceRangeInfo
  - [ ] Update component to use memoized values
  - [ ] Test chart rendering

- [ ] **Performance Testing** (45 min)
  - [ ] Record after-optimization metrics
  - [ ] Take screenshots of improved Profiler results
  - [ ] Calculate improvement percentages
  - [ ] Document in day3-completion-report.md

- [ ] **Regression Testing** (30 min)
  - [ ] Test all functional requirements
  - [ ] Fix any bugs introduced
  - [ ] Verify no visual regressions

- [ ] **Documentation** (30 min)
  - [ ] Create day3-completion-report.md
  - [ ] Add before/after screenshots
  - [ ] Document performance improvements
  - [ ] Update CHANGELOG.md

- [ ] **Final Checks** (15 min)
  - [ ] Run npm run build (ensure production builds)
  - [ ] Test built version
  - [ ] Git commit and push
  - [ ] Verify changes on GitHub

---

## 🎯 Expected Deliverables

### Code Changes

1. **src/components/StockCard.tsx** (updated)
   - 7 optimizations (4 useCallback, 3 useMemo)
   - ~20 lines added (imports + hooks)
   - ~10 lines removed (inline functions)

2. **src/components/DashboardGrid.tsx** (updated)
   - 2 optimizations (2 useCallback)
   - ~5 lines changed

3. **src/components/CandlestickChart.tsx** (updated)
   - 1 optimization (1 useMemo)
   - ~10 lines changed

### Documentation

1. **docs/code-audit/day3-completion-report.md** (new)
   - Performance metrics (before/after)
   - Screenshots from React DevTools Profiler
   - Challenges and solutions
   - Recommendations for future

2. **CHANGELOG.md** (updated)
   - Day 3 achievements entry
   - Performance improvements documented

### Metrics

- **Render Count Reduction**: 50%+ for StockCard
- **Render Time Improvement**: 30-50% faster interactions
- **Code Quality**: No eslint warnings, TypeScript strict mode
- **Functionality**: 100% regression test pass rate

---

## 🚨 Risk Assessment

### Potential Issues

1. **Dependency Array Mistakes**
   - Risk: Missing dependencies causing stale closures
   - Mitigation: Use ESLint exhaustive-deps rule, careful review

2. **Over-Optimization**
   - Risk: Adding useMemo/useCallback where not needed
   - Mitigation: Only optimize components with measured issues

3. **Breaking Changes**
   - Risk: Refactoring introduces bugs
   - Mitigation: Test thoroughly after each change, small commits

4. **React DevTools Not Showing Improvements**
   - Risk: Optimizations don't show expected gains
   - Mitigation: Focus on real-world scenarios, not synthetic tests

### Contingency Plan

If issues arise:
- ✅ Revert individual optimizations using git
- ✅ Test each optimization in isolation
- ✅ Prioritize StockCard (biggest impact)
- ⏭️ Defer DashboardGrid/CandlestickChart to Day 4 if needed

---

## 🔄 Integration with Week 1 Plan

### Progress Tracking

**Week 1 Days 1-4**: Testing + Performance
- ✅ Day 1: Backend testing infrastructure (DONE)
- ✅ Day 2: StockService test expansion (DONE - assumed)
- 🚀 Day 3: Frontend performance optimization (TODAY)
- ⏭️ Day 4: Additional frontend optimizations (if needed)
- ⏭️ Day 5-7: Routes testing + API batch optimization

### Day 4 Preview

**If Day 3 completes ahead of schedule**:
- Additional performance optimizations
- React.memo for child components
- Code splitting for bundle size reduction

**If Day 3 runs over**:
- Complete remaining optimizations from Day 3
- May combine with Day 4 tasks

---

## 📚 Reference Materials

### React Performance Docs
- [useCallback Hook](https://react.dev/reference/react/useCallback)
- [useMemo Hook](https://react.dev/reference/react/useMemo)
- [React.memo](https://react.dev/reference/react/memo)
- [Profiler API](https://react.dev/reference/react/Profiler)

### Tools
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)

### Best Practices
- [Before You memo()](https://overreacted.io/before-you-memo/)
- [When to useMemo and useCallback](https://kentcdodds.com/blog/usememo-and-usecallback)

---

## 💡 Performance Optimization Principles

### Measure First, Optimize Second
1. ✅ Use React DevTools Profiler
2. ✅ Identify actual bottlenecks
3. ✅ Don't guess, measure
4. ✅ Optimize high-impact areas first

### Optimization Priority
1. **Prevent unnecessary re-renders** (biggest impact)
   - useCallback for stable function references
   - useMemo for stable object/array references
   - React.memo for expensive child components

2. **Optimize expensive calculations** (medium impact)
   - useMemo for complex computations
   - Move calculations outside render when possible

3. **Code splitting** (long-term benefit)
   - Lazy loading for routes
   - Dynamic imports for heavy libraries

---

## ✅ Definition of Done

Day 3 is complete when:
- [ ] All planned optimizations implemented
- [ ] Performance metrics show 50%+ improvement in re-renders
- [ ] All functional tests pass (no regressions)
- [ ] React DevTools Profiler shows improvements
- [ ] Before/after screenshots captured
- [ ] Day 3 completion report written
- [ ] CHANGELOG.md updated
- [ ] Code committed and pushed to GitHub
- [ ] Production build succeeds

---

## 🎉 Success Indicators

**Quantitative**:
- 50%+ reduction in StockCard re-renders
- 30%+ reduction in render time for user interactions
- 0 new TypeScript/ESLint errors
- 100% functional test pass rate

**Qualitative**:
- Smoother user experience
- No visual glitches
- Faster theme/language switching
- Responsive UI interactions

---

**Document Created**: 2025-11-11 (Monday)
**Author**: MarketVue Team + Claude Code
**Status**: 📋 Ready for Execution
**Next**: Execute Day 3 tasks (3-4 hours)
**Follow-up**: Day 4 - Additional Frontend Optimizations (if needed)
