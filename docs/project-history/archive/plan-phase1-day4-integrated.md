# Day 4 Integrated Work Plan - Phase 2 Frontend Continuation

**Date**: 2025-11-16 (Saturday)
**Phase**: Phase 2 - Code Quality & Refactoring
**Status**: 🚀 Ready to Start
**Estimated Duration**: 6-8 hours

---

## 📊 Current Status Analysis

### What We Have (from this session - 2025-11-15)

#### ✅ Phase 1 Completed (Day 1-2, 11/13-11/14)
- **Backend Tests**: 43 tests, 82.49% coverage (exceeded 70% target)
- **Frontend Performance**: 10 React optimizations (useCallback + useMemo)
- **CI/CD**: 2 GitHub Actions workflows (backend + frontend)
- **All Phase 1 goals exceeded** ✅

#### ✅ Phase 2 Day 3 Completed (11/15)
- **Shared Utilities Created**:
  - `src/utils/localStorage.ts` (75 lines) - Type-safe storage
  - `src/utils/formatters.ts` (145 lines) - Date/number/currency formatting
  - `src/utils/errorHandlers.ts` (155 lines) - Centralized error handling
  - `src/types/stock.ts` (95 lines) - Unified type definitions
  - `src/components/common/ChartTooltip.tsx` (75 lines) - Reusable tooltip

- **StockCard Refactored**:
  - Reduced code by ~60 lines
  - Using centralized error handling
  - Using unified ChartTooltip component
  - All tests passing (43/43), coverage 82.49%

#### ⏸️ Day 3 Deferred Tasks
- **Utility Function Tests**: Deferred (no Vitest setup yet)
- **Apply utilities to other components**: Not started
- **Eliminate hard-coded values**: Not started

### What Docs Say We Should Do

#### From `phase1-revised-plan.md`:
- Original plan was for Phase 1 only (testing + performance)
- Phase 1 was **already completed** in our Day 1-2 work
- No specific Phase 2 detailed plan in old docs

#### From `plan-a-execution.md` (our actual guide):
- **Day 4 Tasks** (Phase 2 Frontend Day 2):
  1. Eliminate hard-coded values (create `src/config/constants.ts`)
  2. Apply utilities to other components
  3. Error Boundary implementation
  4. Frontend regression testing

---

## 🎯 Day 4 Goals (Integrated Plan)

### Priority 1: Testing Infrastructure (HIGH) ⭐⭐⭐⭐⭐
**Why First**: Foundation for all future work, ensure quality

1. **Setup Vitest Testing Framework** (1 hour)
   - Install: `vitest`, `@vitest/ui`, `jsdom`, `@testing-library/react`
   - Create `vitest.config.ts`
   - Update `package.json` scripts
   - Create test setup file

2. **Write Utility Function Tests** (1.5 hours)
   - `src/utils/localStorage.test.ts` - Storage operations
   - `src/utils/formatters.test.ts` - Formatting functions
   - `src/utils/errorHandlers.test.ts` - Error handling logic
   - Target: 80%+ coverage for utilities

### Priority 2: Eliminate Hard-Coded Values (HIGH) ⭐⭐⭐⭐
**Why**: Improves maintainability, follows Plan A Day 4

3. **Create Configuration Constants** (1.5 hours)
   - Create `src/config/constants.ts`:
     ```typescript
     export const API_CONFIG = {
       BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
       TIMEOUT: 30000,
       RETRY_COUNT: 3,
       RETRY_DELAY_BASE: 2000,
     };

     export const CHART_CONFIG = {
       STOCK_CARD_HEIGHT: 235,
       CANDLESTICK_HEIGHT: 145,
       VOLUME_HEIGHT: 80,
       MARGINS: { top: 5, right: 5, left: -20, bottom: 5 },
     };

     export const COLOR_THEMES = {
       WESTERN: { up: '#16a34a', down: '#dc2626' },
       ASIAN: { up: '#dc2626', down: '#16a34a' },
     };

     export const TIME_RANGES = {
       '5d': { days: 5, label: { 'en-US': '5 Days', 'zh-TW': '5 天' } },
       '1mo': { days: 30, label: { 'en-US': '1 Month', 'zh-TW': '1 個月' } },
       '3mo': { days: 90, label: { 'en-US': '3 Months', 'zh-TW': '3 個月' } },
       '6mo': { days: 180, label: { 'en-US': '6 Months', 'zh-TW': '6 個月' } },
       '1y': { days: 365, label: { 'en-US': '1 Year', 'zh-TW': '1 年' } },
       'ytd': { days: -1, label: { 'en-US': 'YTD', 'zh-TW': '今年至今' } },
     };
     ```

4. **Refactor Components to Use Constants** (1.5 hours)
   - Update StockCard to use `API_CONFIG`
   - Update charts to use `CHART_CONFIG`
   - Update TimeRangeSelector to use `TIME_RANGES`
   - Remove all magic numbers and hard-coded strings

### Priority 3: Apply Utilities to Components (MEDIUM) ⭐⭐⭐
**Why**: Reduce code duplication, improve consistency

5. **Extend Utility Usage** (1 hour)
   - Apply `formatters` to CandlestickChart
   - Apply `formatters` to DashboardGrid
   - Apply `errorHandlers` to any other components with error handling
   - Use unified types across all components

### Priority 4: Error Boundary (MEDIUM) ⭐⭐⭐
**Why**: Improve error resilience, better UX

6. **Implement Error Boundary** (1.5 hours)
   - Create `src/components/ErrorBoundary.tsx`:
     ```typescript
     class ErrorBoundary extends React.Component<Props, State> {
       // Catch errors in child components
       // Display fallback UI
       // Reset error state
       // Support bilingual error messages
     }
     ```
   - Wrap App with ErrorBoundary
   - Wrap StockCard with ErrorBoundary
   - Test error scenarios

### Priority 5: Testing & Documentation (HIGH) ⭐⭐⭐⭐
**Why**: Ensure quality, document progress

7. **Comprehensive Testing** (1 hour)
   - Run all backend tests (should still be 43/43)
   - Run new frontend utility tests
   - TypeScript compilation check
   - Production build test
   - Manual regression testing

8. **Documentation** (30 minutes)
   - Update CHANGELOG.md
   - Create Day 4 work log
   - Update Plan A execution tracking

---

## 📋 Detailed Task Breakdown

### Task 1: Setup Vitest (1 hour)

#### 1.1 Install Dependencies
```bash
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom happy-dom
```

#### 1.2 Create `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/',
      ],
    },
  },
});
```

#### 1.3 Create Test Setup
```typescript
// src/test/setup.ts
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

afterEach(() => {
  cleanup();
});
```

#### 1.4 Update package.json
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

---

### Task 2: Write Utility Tests (1.5 hours)

#### 2.1 localStorage Tests
```typescript
// src/utils/localStorage.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getLocalStorageItem,
  setLocalStorageItem,
  removeLocalStorageItem,
  isLocalStorageAvailable
} from './localStorage';

describe('localStorage utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should set and get items', () => {
    setLocalStorageItem('test', { value: 123 });
    const result = getLocalStorageItem('test', { value: 0 });
    expect(result).toEqual({ value: 123 });
  });

  it('should return default value when key does not exist', () => {
    const result = getLocalStorageItem('nonexistent', 'default');
    expect(result).toBe('default');
  });

  // ... more tests (8-10 total)
});
```

#### 2.2 Formatters Tests
```typescript
// src/utils/formatters.test.ts
import { describe, it, expect } from 'vitest';
import {
  formatChartDate,
  formatCurrency,
  formatPercentage,
  formatNumber,
  formatLargeNumber
} from './formatters';

describe('formatters', () => {
  describe('formatChartDate', () => {
    it('should format date for en-US', () => {
      const result = formatChartDate('2025-01-15', 'en-US');
      expect(result).toBe('Jan 15');
    });

    it('should format date for zh-TW', () => {
      const result = formatChartDate('2025-01-15', 'zh-TW');
      expect(result).toBe('1/15');
    });
  });

  describe('formatCurrency', () => {
    it('should format USD correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('should handle null values', () => {
      expect(formatCurrency(null)).toBe('N/A');
    });
  });

  // ... more tests (15-20 total)
});
```

#### 2.3 Error Handlers Tests
```typescript
// src/utils/errorHandlers.test.ts
import { describe, it, expect } from 'vitest';
import {
  getErrorMessage,
  shouldRetry,
  calculateRetryDelay,
  isNetworkError,
  isServerError
} from './errorHandlers';

describe('errorHandlers', () => {
  const mockT = {
    failedToFetch: 'Failed to fetch',
    rateLimitExceeded: 'Rate limit exceeded',
  };

  describe('getErrorMessage', () => {
    it('should return timeout message', () => {
      const err = { code: 'ECONNABORTED' };
      const msg = getErrorMessage(err, 'en-US', mockT);
      expect(msg).toContain('timeout');
    });

    it('should return 503 cold start message', () => {
      const err = { response: { status: 503 } };
      const msg = getErrorMessage(err, 'en-US', mockT);
      expect(msg).toContain('starting up');
    });
  });

  describe('shouldRetry', () => {
    it('should not retry on 404', () => {
      const err = { response: { status: 404 } };
      expect(shouldRetry(err, 0, 3)).toBe(false);
    });

    it('should retry on 500', () => {
      const err = { response: { status: 500 } };
      expect(shouldRetry(err, 0, 3)).toBe(true);
    });
  });

  // ... more tests (10-12 total)
});
```

---

### Task 3: Create Configuration Constants (1.5 hours)

**File**: `src/config/constants.ts`

Already outlined above - implement and test each configuration section.

---

### Task 4: Refactor Components (1.5 hours)

#### 4.1 Update StockCard
```typescript
import { API_CONFIG } from '../config/constants';

// Replace:
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const MAX_RETRIES = 3;

// With:
const { BASE_URL, RETRY_COUNT, TIMEOUT } = API_CONFIG;
```

#### 4.2 Update Charts
```typescript
import { CHART_CONFIG } from '../config/constants';

// Use CHART_CONFIG.MARGINS instead of hard-coded values
// Use CHART_CONFIG heights consistently
```

#### 4.3 Search for All Magic Numbers
```bash
# Find potential hard-coded values
grep -r "30000" src/
grep -r "5001" src/
grep -r "235" src/
```

---

### Task 5: Error Boundary Implementation (1.5 hours)

**File**: `src/components/ErrorBoundary.tsx`

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import type { Language } from '../i18n/translations';

interface Props {
  children: ReactNode;
  language: Language;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const { language } = this.props;
      const message = language === 'zh-TW'
        ? '發生錯誤，請重新載入頁面'
        : 'Something went wrong. Please reload the page.';

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {message}
            </h2>
            <button
              onClick={this.resetError}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {language === 'zh-TW' ? '重試' : 'Retry'}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

---

## ✅ Success Criteria

### Must Complete
- [ ] Vitest installed and configured
- [ ] 25+ utility tests written and passing
- [ ] Utility test coverage ≥ 80%
- [ ] `src/config/constants.ts` created
- [ ] All hard-coded values eliminated
- [ ] StockCard using constants
- [ ] ErrorBoundary implemented and tested
- [ ] All tests passing (backend 43 + frontend 25+)
- [ ] TypeScript compilation successful
- [ ] Production build successful
- [ ] CHANGELOG updated
- [ ] Day 4 work log created

### Nice to Have
- [ ] Utility coverage ≥ 90%
- [ ] ErrorBoundary with error reporting
- [ ] Performance benchmarks
- [ ] Bundle size analysis

---

## 📊 Progress Tracking

### Phase 2 Overall Progress

| Day | Date | Tasks | Status |
|-----|------|-------|--------|
| Day 3 | 11/15 | Utilities + Types + StockCard refactor | ✅ Complete |
| **Day 4** | **11/16** | **Testing + Constants + Error Boundary** | **🚀 In Progress** |
| Day 5 | 11/17 | Backend refactoring start | ⏳ Pending |
| Day 6 | 11/18 | Backend DI + Docstrings | ⏳ Pending |
| Day 7 | 11/19 | Final testing + report | ⏳ Pending |

### Code Quality Metrics

| Metric | Current | Day 4 Target |
|--------|---------|--------------|
| Backend Test Coverage | 82.49% | 82.49% (maintain) |
| Backend Tests | 43 | 43 (maintain) |
| Frontend Tests | 0 | 25+ (new) |
| Hard-coded values | Many | 0 |
| Error boundaries | 0 | 1 |
| Utility modules | 5 | 5 (tested) |

---

## 🚨 Risks & Mitigation

### High Risk
1. **Vitest setup issues**
   - Mitigation: Follow official docs, use standard config
   - Backup: Use simple test setup first, expand later

2. **Breaking changes from constants refactor**
   - Mitigation: Test thoroughly after each change
   - Backup: Git revert if needed, one file at a time

### Medium Risk
1. **Time overrun (6-8 hours is a lot)**
   - Mitigation: Prioritize P1 tasks, defer P2 if needed
   - Backup: ErrorBoundary can be Day 5 task

---

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library React](https://testing-library.com/docs/react-testing-library/intro/)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

---

**Plan Created**: 2025-11-16
**Based On**: Plan A execution + this session's Day 3 progress
**Status**: 🚀 Ready to execute
**Next Step**: Install Vitest and setup testing infrastructure
