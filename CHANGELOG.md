# Changelog

All notable changes to MarketVue will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Phase 3 後續優化 - K 線圖智慧聚合與 UI 優化** (2025-11-25)
  - Candlestick Chart Enhancements:
    - Implemented smart date aggregation (daily/weekly/monthly)
      - ≤ 60 days (~2M): Daily view (no aggregation)
      - 61-365 days (2M-1Y): Weekly aggregation
      - > 365 days (>1Y): Monthly aggregation
      - Aligned with industry standards (TradingView, Yahoo Finance)
    - Created `src/utils/dateAggregation.ts` with aggregation utilities
    - Prevents candlesticks from being squeezed together on long date ranges
    - OHLC data correctly aggregated (open/high/low/close/volume)
    - Moving averages (MA20/MA60) preserved in aggregation
  - UI/UX Improvements:
    - Moved chart type toggle to dashboard header (right corner)
    - Global toggle affects all charts simultaneously
    - Time interval badge (日線/週線/月線) in each card's top-right
    - Improved layout: Stock Manager (66%) + Time Range (33%)
    - Removed redundant ChartTypeToggle component from main layout
    - Cleaner card interface with fewer controls
  - Backend - Period-Based Price Change Calculation:
    - Modified `backend/services/price_calculator.py` to calculate period change
    - Changed from daily change (previous day vs current) to period change (first day vs last day)
    - Now aligns with industry standards (Yahoo Finance, TradingView)
    - Example: 3M view shows 3-month change, not daily change
    - Updated `backend/tests/test_price_calculator.py` to reflect new behavior
    - All 215 backend tests passing, coverage: 89.87%
  - Internationalization:
    - Added translations for time intervals (daily/weekly/monthly)
    - English: "Daily", "Weekly", "Monthly"
    - Traditional Chinese: "日線", "週線", "月線"
  - Benefits:
    - Better chart readability for long date ranges
    - More intuitive chart type switching
    - Cleaner main layout
    - Consistent UX across all stock cards
    - Price changes now reflect the selected time period accurately

- **Phase 3 後續優化 - 測試覆蓋率改進 + 並行批次處理功能** (2025-11-25)
  - Test Coverage Enhancement:
    - Created comprehensive test suite for low-coverage modules
    - `tests/test_cache.py` - 18 tests for cache utilities (32% → 100% coverage)
    - `tests/test_error_handlers.py` - 17 tests for error handlers (59% → 94% coverage)
    - `tests/test_config.py` - 23 tests for configuration validation (57% → 93% coverage)
    - Overall backend coverage improved from 86.45% to 91.58%
    - Total: 204 tests passing (58 new tests added)
  - Parallel Batch Processing Feature (Option 4):
    - Implemented `StockService.get_batch_stocks_parallel()` with ThreadPoolExecutor
    - New API endpoint: `POST /api/v1/batch-stocks-parallel`
    - Performance improvement: 2-3x faster than sequential processing
    - Configurable worker pool (1-10 workers, default: 5)
    - Processing time measurement included in response
    - Created `tests/test_parallel_batch.py` - 11 tests for parallel functionality
    - Total: 215 tests passing (11 new tests)
    - Backend coverage: 89.87%
  - Benefits:
    - Enhanced code quality with comprehensive test coverage
    - Production-ready configuration validation
    - Significantly improved batch request performance
    - Better error handling and logging coverage

- **Production Deployment Verification** (2025-11-25)
  - Created comprehensive project progress summary document
  - Created deployment verification report with full testing
  - Verified Render backend deployment (Status: Live, 146 tests passing)
  - Verified Vercel frontend deployment (Status: READY, 145 tests passing)
  - Tested all API v1 endpoints in production
  - Confirmed backend cache performance (35% improvement)
  - Verified security headers on both platforms
  - Verified request ID tracking and logging system
  - New documentation:
    - `docs/PROJECT_PROGRESS_SUMMARY.md` - Complete Phase 1-3 summary
    - `docs/deployment-verification-2025-11-25.md` - Full verification report
  - Production status: ✅ All systems operational (95/100 score)

- **Frontend Optimization Day 1 + Day 3** (2025-11-24)
  - Day 1: React Performance Optimization
    - Added `React.memo` to StockCard and all 6 sub-components
    - Added `useCallback` to App.tsx handlers (handleAddStock, handleRemoveStock)
    - Removed debug `console.log` from useStockData retry callback
    - Fixed localStorage mock in test setup
  - Day 2: Skipped (architecture already clean from Phase 2 refactoring)
    - Rationale: App.tsx only 152 lines, StockCard already split into 6 components
    - Avoiding over-engineering and unnecessary file proliferation
  - Day 3: React Query Integration
    - Installed `@tanstack/react-query` for data fetching
    - Created `src/config/queryClient.ts` with optimized configuration
    - Created `src/api/stockApi.ts` for API function extraction
    - Refactored `useStockData.ts` to use `useQuery` (49% code reduction)
    - Benefits: automatic caching, request deduplication, background refetching
  - New files:
    - `src/config/queryClient.ts` - QueryClient configuration
    - `src/api/stockApi.ts` - Stock API functions
    - `docs/work-log-frontend-optimization-2025-11-24.md` - Work log
  - Test results: 145 frontend tests passing
  - Commits: `1209955`, `780b63b`

- **Phase 3 Day 9 - API Version Control + Health Check Enhancement** (2025-11-24)
  - Implemented API versioning with `/api/v1` prefix
  - Created enhanced health check endpoints for production readiness
  - New files:
    - `backend/routes/health_routes.py` (175 lines) - Enhanced health endpoints
    - `backend/routes/legacy_routes.py` (140 lines) - Backward compatibility
    - `backend/tests/test_health_routes.py` (16 tests)
    - `backend/tests/test_api_versioning.py` (14 tests)
  - New health endpoints:
    - `/api/v1/health` - Basic health check
    - `/api/v1/health/detailed` - Full system status
    - `/api/v1/health/ready` - Kubernetes readiness probe
    - `/api/v1/health/live` - Kubernetes liveness probe
  - Legacy routes for backward compatibility:
    - `/api/*` routes still work but return deprecation headers
    - `X-API-Deprecated: true` header added
    - `X-API-Deprecation-Notice` with migration instructions
  - Frontend updated to use `/api/v1/stock-data`
  - Test results: 146 tests passing, 86.45% coverage
  - Phase 3 complete!

- **Phase 3 Day 8 - Logging Enhancement + Config Validation** (2025-11-24)
  - Implemented request context middleware with unique request_id per request
  - Created enhanced logging module with contextual formatting
  - New files:
    - `backend/utils/request_context.py` (70 lines) - Request ID and client IP tracking
    - `backend/utils/logger.py` (187 lines) - Structured logging with context
    - `backend/utils/config_validator.py` (196 lines) - Configuration validation
    - `backend/tests/test_config_validator.py` (15 tests)
    - `backend/tests/test_logger.py` (14 tests)
  - Features:
    - Unique request_id for distributed tracing
    - X-Request-ID header in responses
    - Client IP detection with X-Forwarded-For support
    - Request timing middleware
    - Configuration validation at startup
    - Structured log format: `[request_id] [client_ip] [method path] - message`
  - Test results: 116 tests passing, 85.17% coverage

- **Phase 3 Day 7 - Redis Cache Strategy** (2025-11-24)
  - Implemented Redis cache support for production environment
  - Created cache factory pattern with automatic fallback
  - New files:
    - `backend/utils/cache_factory.py` (196 lines) - Cache factory with Redis/SimpleCache support
    - `backend/tests/test_cache_factory.py` (162 lines) - 14 unit tests
    - `docker-compose.yml` - Docker Compose configuration with Redis
    - `backend/Dockerfile` - Backend Docker image
  - Configuration changes:
    - Added `REDIS_URL`, `CACHE_KEY_PREFIX` environment variables
    - Production validation for Redis URL when `CACHE_TYPE=redis`
  - Features:
    - Automatic fallback to SimpleCache if Redis connection fails
    - Redis connection testing on startup
    - Configurable socket timeouts and retry options
    - Docker Compose for local development with Redis
  - Documentation updates:
    - Added Redis cache configuration section to DEPLOYMENT.md
    - Added Docker deployment instructions (bilingual)
  - Test results: 87 tests passing, 83.81% coverage

- **Phase 3 Day 6 - Backend Service Layer Separation** (2025-11-24)
  - Refactored monolithic StockService (324 lines) into 5 single-responsibility services
  - New services created:
    - `StockDataFetcher` (95 lines) - yfinance API data retrieval
    - `StockDataTransformer` (100 lines) - DataFrame to dict transformation
    - `PriceCalculator` (105 lines) - Price calculations and metrics
    - `CompanyNameService` (138 lines) - Multilingual company name resolution
    - `StockService` (228 lines) - Coordinator with Dependency Injection
  - Applied SOLID principles (Single Responsibility, Dependency Inversion)
  - Implemented Facade pattern for backward compatibility
  - New unit tests: 35 tests for new services
  - Test coverage improved: 82.83% → 87.77% (+4.94%)
  - Total backend tests: 73 passing (was 43)
  - Benefits: Better testability, maintainability, and flexibility

- **Phase 3 Day 5 - Theme System + Toast Notifications** (2025-11-24)
  - Created unified chart theme configuration (`src/config/chartTheme.ts`)
    - Centralized chart colors (MA lines, volume, grid, axis)
    - Price themes (Asian/Western conventions)
    - UI theme colors (light/dark mode)
    - Toast notification colors (success, error, warning, info)
    - Helper functions: `getPriceColor()`, `getPriceBgColor()`
  - Created Toast notification system
    - `ToastContext` and `useToast()` hook
    - `ToastContainer` component with animations
    - Features: Auto-dismiss (4s), stacking (max 5), bilingual
    - Accessible: ARIA attributes for screen readers
  - Replaced browser `alert()` with Toast notifications
    - `TimeRangeSelector.tsx`: 2 alerts replaced with toasts
    - Bilingual messages (English/Chinese)
  - Build verification: ✅ TypeScript compilation successful, production build ok
  - Test results: 130/130 frontend tests passing

- **Phase 3 Day 4 - useRetry Hook Extraction** (2025-11-23)
  - Created reusable `useRetry` hook for async operations with automatic retry
  - Features:
    - Generic TypeScript support for any async function
    - Configurable max retries, initial delay, and backoff multiplier
    - Exponential backoff with maximum delay cap
    - Special handling for 503 (cold start) with extended delays
    - Special handling for 429 (rate limit) with retry-after header support
    - Non-retryable errors: 400, 401, 403, 404
    - Cancellation support for pending retries
    - Callbacks: onRetry, onMaxRetriesReached
    - Custom shouldRetry and calculateDelay functions
  - Created `src/hooks/useRetry.ts` (256 lines)
  - Created `src/hooks/index.ts` for clean exports
  - Refactored `useStockData` to use the new `useRetry` hook
  - Comprehensive test suite: 46 tests covering all scenarios
  - Total frontend tests: 130 passing
  - Build verification: ✅ TypeScript compilation successful, production build ok

- **Phase 3 Day 3 - StockCard Component Complete Splitting** (2025-11-23)
  - Refactored 326-line monolithic StockCard.tsx into 9 smaller modules
  - New folder structure: `src/components/stock-card/`
  - Created sub-components:
    - `StockCard.tsx` (114 lines) - Main orchestrator component
    - `StockCardHeader.tsx` (83 lines) - Company name and price display
    - `StockCardChart.tsx` (102 lines) - Line/candlestick chart
    - `StockVolumeChart.tsx` (54 lines) - Volume bar chart
    - `StockCardFooter.tsx` (31 lines) - Average volume display
    - `StockCardLoading.tsx` (32 lines) - Loading state with spinner
    - `StockCardError.tsx` (53 lines) - Error state with retry button
    - `index.ts` (32 lines) - Clean module exports
  - Created custom hook:
    - `hooks/useStockData.ts` (122 lines) - Data fetching with retry logic
  - Benefits achieved:
    - Average file size: ~69 lines (vs original 326 lines)
    - Each file has single responsibility
    - Improved testability and maintainability
    - Preserved all existing functionality
  - Build verification: ✅ TypeScript compilation successful, production build ok
  - Test results: 84 passing (localStorage tests unrelated to this change)

### Fixed

- **Render Deployment - Missing gunicorn** (2025-11-23)
  - Fixed deployment failure on Render with exit status 127
  - Error: `bash: line 1: gunicorn: command not found`
  - Root cause: `gunicorn` was not included in `backend/requirements.txt`
  - Solution: Added `gunicorn==21.2.0` to requirements.txt
  - Impact: Render deployments now complete successfully
  - Note: Previous instance was running on old build; new deployments failed

- **React Hooks Ordering Violation** (2025-11-21)
  - Fixed critical production error: "Rendered more hooks than during the previous render"
  - Issue: `useMemo` and `useCallback` hooks in StockCard were placed AFTER conditional early returns
  - Root cause: Hooks at lines 166-202 only executed when loading/error states were false, violating Rules of Hooks
  - Solution: Moved 4 hooks (displayName, priceInfo, averageVolume, CustomTooltip) to BEFORE early returns
  - Impact: All hooks now execute unconditionally in the same order on every render
  - Location: `src/components/StockCard.tsx:127-165`
  - User report: Production frontend showed hook ordering error on https://marketvue.vercel.app
  - Verification: Local testing confirmed clean console logs with no React errors

### Added

- **Phase 3 Day 2 - Component Context Migration (Part 2)** (2025-11-20)
  - Migrated all components to use Context API (7/7 components completed)
  - Components refactored:
    - DashboardGrid: removed language, colorTheme props → uses useApp()
    - StockCard: removed language, colorTheme, chartType props → uses useApp() + useChart()
    - CandlestickChart: removed language, colorTheme props → uses useApp()
    - StockManager: removed language prop → uses useApp()
    - ChartTypeToggle: removed ALL props (100% self-contained) → uses useApp() + useChart()
    - TimeRangeSelector: removed ALL props (100% self-contained) → uses useApp() + useChart()
    - Footer: removed t prop → uses useApp()
  - Props reduction: 52% overall (27 → 13 total props)
  - Self-contained components: 2 (ChartTypeToggle, TimeRangeSelector with 0 props)
  - Fixed TypeScript compilation errors:
    - Removed unused variables in App.tsx
    - Removed unused useChart import in DashboardGrid.tsx
    - Fixed translation key in TimeRangeSelector.tsx (dateRange → currentRange)
  - Comprehensive regression testing: ✅ PASS (100% functionality verified)
  - Build verification: ✅ TypeScript compilation successful, production build ok (1.76s)
  - Props drilling completely eliminated for all UI settings
  - Best practices demonstrated: fully self-contained components with Context
  - Documentation: Complete Phase 3 Day 2 work log with component migration details

- **Phase 3 Day 1 - Context API Architecture** (2025-11-20)
  - Created AppContext for global UI settings (language, colorTheme, themeMode)
  - Created ChartContext for chart settings (chartType, dateRange)
  - Implemented custom hooks: useApp(), useChart()
  - Automatic localStorage persistence for all settings (5 keys)
  - TypeScript type safety with proper error boundaries
  - Fixed verbatimModuleSyntax import errors (type-only imports)
  - Provider hierarchy: AppProvider → ChartProvider → AppContent
  - Documentation: Complete Phase 3 Day 1 work log

- **Phase 2 COMPLETE - Backend Refactoring & Code Quality** (2025-11-14 ~ 2025-11-20)
  - **Summary**: 7-day intensive refactoring achieving 91.36% test coverage
  - **Total Tests**: 142 (Backend: 43, Frontend: 99)
  - **Coverage Improvement**: +8.87% (82.49% → 91.36%)
  - **Major Achievements**:
    - ✅ Dependency injection pattern implemented
    - ✅ Comprehensive Google-style docstrings (100% coverage)
    - ✅ Function splitting (88-line method → 4 focused methods)
    - ✅ Error handling decorators (centralized exception handling)
    - ✅ Constants extraction (zero magic numbers)
    - ✅ Shared utility library (60+ lines of duplicates eliminated)
    - ✅ Frontend testing infrastructure (99 tests)
    - ✅ ErrorBoundary component with bilingual support
  - **Code Quality**: Excellent (91.36% coverage, zero technical debt in core)
  - **Build Status**: ✅ All tests passing, TypeScript successful, production build ok
  - **Documentation**: Complete Phase 2 report available in docs/code-audit/
  - See individual day entries below for detailed changes

- **Phase 2 Day 7 - Final Testing & Phase 2 Completion** (2025-11-20)
  - Comprehensive backend test suite verification: ✅ All 43 tests passing
  - Frontend TypeScript compilation check: ✅ No errors
  - Production build verification: ✅ 716KB gzipped
  - Test coverage verification: ✅ 91.36%
  - Created Phase 2 completion report documenting all achievements
  - Updated CHANGELOG with Phase 2 summary
  - Test Results:
    - Backend tests: 43/43 passing (100%)
    - Coverage: 91.36% (target ≥70%, exceeded by 21.36%)
    - Frontend build: ✅
    - TypeScript check: ✅
    - Zero regressions: ✅
  - Documentation:
    - Phase 2 completion report (comprehensive 300+ line analysis)
    - Day 7 work log
    - Updated CHANGELOG with Phase 2 summary
  - Phase 2 Status: ✅ **COMPLETED** - All objectives achieved

- **Phase 2 Day 6 - Dependency Injection & Comprehensive Docstrings** (2025-11-17)
  - Implemented Dependency Injection pattern for StockService:
    - Refactored StockService from static methods to instance methods
    - Created get_stock_service() and set_stock_service() in stock_routes.py
    - Enables easy mocking for testing and better separation of concerns
    - Improved testability without changing external API behavior
  - Added comprehensive Google-style docstrings to all backend modules:
    - StockService: Complete method documentation with Args, Returns, Raises, Examples
    - Routes: Enhanced endpoint documentation with request/response formats
    - Config: Documented all configuration classes and attributes
    - Constants: Added inline comments explaining each constant's purpose
    - Decorators: Full documentation for error handling and logging decorators
    - Cache key functions: Detailed documentation with examples
    - App factory: Enhanced create_app() documentation
  - Updated all tests for dependency injection:
    - Added stock_service pytest fixture to test_stock_service.py
    - Added stock_service pytest fixture to test_stock_service_batch.py
    - Updated 32 test methods to use instance-based service calls
    - All 43 tests passing with improved maintainability
  - Test Results:
    - All 43 tests passing (100% pass rate)
    - Coverage: 91.36% (increased from 85.75%)
    - Backend coverage breakdown:
      - app.py: 86% coverage
      - config.py: 100% coverage
      - constants.py: 100% coverage
      - routes/stock_routes.py: 90% coverage
      - services/stock_service.py: 90% coverage
      - utils/decorators.py: 100% coverage
  - Code Quality Improvements:
    - Improved dependency injection enables easier testing
    - Complete documentation for all public APIs
    - Better code discoverability through docstring examples
    - Consistent documentation style across entire backend
    - Facilitates future maintenance and onboarding

- **Phase 2 Day 5 - Backend Refactoring & Function Splitting** (2025-11-17)
  - Refactored StockService.get_stock_data() method using Single Responsibility Principle:
    - Extracted _fetch_history(): Fetches historical data from yfinance with fallback logic
    - Extracted _convert_to_data_points(): Converts DataFrame to data point dictionaries
    - Extracted _calculate_price_info(): Calculates current price, change, and change percentage
    - Extracted _get_ticker_info_safe(): Safely retrieves ticker info with error handling
    - Main method reduced from 88 lines to 35 lines (orchestration only)
  - Created error handling decorators (`backend/utils/decorators.py`):
    - handle_errors: Centralized exception handling (ValidationError→400, ValueError→400, Exception→500)
    - log_request: Automatic request logging with method, path, and remote address
  - Applied decorators to all API routes:
    - Simplified route functions by removing repetitive try-catch blocks
    - Consistent error response format across all endpoints
  - Created backend constants system (`backend/constants.py`):
    - Cache configuration: CACHE_TIMEOUT_SECONDS, CACHE_DEFAULT_TIMEOUT
    - yfinance configuration: FALLBACK_PERIOD ('3mo')
    - Data rounding: PRICE_DECIMAL_PLACES (2), PERCENT_DECIMAL_PLACES (2)
    - Batch limits: MAX_BATCH_SYMBOLS (18), DEFAULT_DATE_RANGE_DAYS (30)
    - HTTP status codes: HTTP_OK, HTTP_BAD_REQUEST, HTTP_NOT_FOUND, HTTP_INTERNAL_ERROR
    - Logging format: LOG_FORMAT, LOG_DATE_FORMAT
  - Refactored services and routes to use constants:
    - Eliminated all magic numbers from backend codebase
    - Single source of truth for all configuration values
  - Test Results:
    - All 43 tests passing (routes + service + batch)
    - Coverage: 85.75% (increased from 82.49%)
    - test_stock_routes.py: 11/11 passing
    - test_stock_service.py: 22/22 passing
    - test_stock_service_batch.py: 10/10 passing
  - Code Quality Improvements:
    - Improved testability through function extraction
    - Enhanced maintainability with centralized error handling
    - Better readability with orchestration pattern
    - Zero magic numbers in backend codebase

- **Phase 2 Day 4 - Testing Infrastructure & Configuration Management** (2025-11-16)
  - Vitest testing framework setup with comprehensive configuration
  - Frontend test suite: 99 tests across 3 utility modules
    - localStorage.test.ts: 15 tests for type-safe storage operations
    - formatters.test.ts: 45 tests for date/currency/number formatting
    - errorHandlers.test.ts: 39 tests for error handling and retry logic
  - Configuration constants centralization (`src/config/constants.ts`):
    - API_CONFIG: Base URL, timeout, retry settings
    - CHART_CONFIG: Heights, margins, animation settings
    - COLOR_THEMES: Western/Asian color schemes
    - TIME_RANGES: 5d, 1mo, 3mo, 6mo, 1y, ytd configurations
    - MA_PERIODS: Moving average periods (20/60)
    - STORAGE_KEYS, GRID_CONFIG, APP_METADATA, VALIDATION constants
  - Refactored components to use constants:
    - StockCard: API_CONFIG, MA_PERIODS, CHART_CONFIG
    - CandlestickChart: CHART_CONFIG for heights and margins
  - ErrorBoundary component implementation:
    - React class-based error boundary with bilingual support
    - Fallback UI with error details (dev mode only)
    - Retry and reload functionality
    - Wrapped App component for global error catching
  - Eliminated hard-coded values across codebase
  - Test Results:
    - Frontend: 99/99 tests passing
    - Backend: 43/43 tests passing (82.49% coverage)
    - TypeScript compilation: ✅
    - Production build: ✅ (716KB gzipped)
  - Code quality improvements: All magic numbers eliminated

- **Phase 2 Day 3 - Shared Utilities & Code Organization** (2025-11-15)
  - Created shared utility library infrastructure
  - `src/utils/localStorage.ts`: Type-safe localStorage operations with error handling
  - `src/utils/formatters.ts`: Unified date, currency, number formatting utilities
  - `src/utils/errorHandlers.ts`: Centralized error message handling and retry logic
  - `src/types/stock.ts`: Unified type definitions (StockData, StockDataPoint, ColorTheme, etc.)
  - `src/components/common/ChartTooltip.tsx`: Extracted reusable chart tooltip component
  - Refactored StockCard to use new utilities:
    - Replaced inline error handling with getErrorMessage(), shouldRetry(), calculateRetryDelay()
    - Replaced CustomTooltip inline component with unified ChartTooltip
    - Imported unified types from central location
  - Code reduction: Eliminated ~60 lines of duplicate error handling logic
  - All tests passing (43/43), coverage maintained at 82.49%
  - Build successful (TypeScript + Vite)
  - Next: Apply utilities to other components, eliminate hard-coded values

- **Phase 1 Complete - CI/CD & Testing Infrastructure** (2025-11-14)
  - Established comprehensive testing infrastructure with 82.49% coverage (target 70%)
  - Total tests: 43 (32 service + 11 routes)
  - GitHub Actions CI/CD workflows:
    - Backend: Python 3.9-3.11 matrix testing, coverage enforcement
    - Frontend: TypeScript check, ESLint, production build
  - Coverage enforcement: ≥70% threshold, minimum 40 tests
  - Artifacts: Coverage reports (7-day retention) + build outputs
  - All tests passing, TypeScript compilation successful

- **Frontend Performance Optimizations** (2025-11-13)
  - Optimized React components with useCallback and useMemo
  - StockCard: 4 useCallback + 3 useMemo (calculateMA, fetchStockData, handleRetry, CustomTooltip, displayName, priceInfo, averageVolume)
  - DashboardGrid: 2 useCallback (updateWidth, handleLayoutChange)
  - CandlestickChart: 1 useMemo (priceRangeInfo)
  - Expected performance: 30-50% reduction in unnecessary re-renders
  - All optimizations validated with TypeScript and production build

- **API Routes Testing Suite** (2025-11-13)
  - Added 11 comprehensive routes tests (test_stock_routes.py)
  - Stock data endpoint tests: success, invalid symbol, missing params, invalid JSON
  - Batch stocks endpoint tests: success, partial failure, empty list
  - Error handling tests: 500 errors, health endpoint
  - CORS headers tests: preflight and actual requests
  - Test environment: NullCache configuration to avoid serialization issues
  - All routes tests passing (11/11)

- **Session Decision Log and Documentation** (2025-11-12)
  - Created comprehensive decision log documenting entire session analysis process
  - Recorded all decision points: 7-day feasibility, 4x workload analysis, Plan A adoption
  - Documented decision criteria: work estimation, efficiency curves, risk assessment
  - Key decisions: Phase 1-4 not feasible in 7 days, 4x workload not recommended, Plan A optimal
  - Decision validation: data-driven analysis, multiple alternatives evaluated
  - Lessons learned: sustainability over sprint, prioritization importance, realistic planning
  - Complete decision tree and rationale documented
  - File: docs/code-audit/session-decision-log-2025-11-12.md

- **Plan A Execution Strategy Confirmed** (2025-11-12)
  - Adopted intensive 7-day plan to complete Phase 1 + Phase 2 (50% total progress)
  - Work intensity: 10 hours/day (sustainable high-performance schedule)
  - Total work: 70 hours over 7 days
  - Phase 1 completion: Day 1-2 (frontend performance + 70% coverage + CI/CD)
  - Phase 2 completion: Day 3-6 (code quality + refactoring + dependency injection)
  - Final testing: Day 7 (comprehensive testing + Phase 1-2 report)
  - Expected outcomes: Zero hard-coded values, unified error handling, 70%+ coverage
  - Detailed execution plan: docs/code-audit/plan-a-execution.md
  - Today's tasks: docs/code-audit/day1-plan-a-tasks.md

- **Phase 1 Timeline Assessment and Planning** (2025-11-12)
  - Conducted comprehensive review of past 3 days' changes (11/09-11/12)
  - Created detailed timeline assessment report evaluating all Phase 1-4 tasks
  - Confirmed Phase 1 core objectives achievable within 7 days (including today)
  - Identified Phase 2-4 require additional 4-6 weeks (28-42 days)
  - Analyzed 4x workload feasibility: Not recommended due to efficiency degradation
  - Alternative recommendation: Plan A (Phase 1-2 in 7 days at 10h/day)
  - Created final 7-day execution plan (11/12-11/18) for Phase 1 completion
  - Documented 15 git commits, 19 major files changed in past 3 days
  - Current progress: 25% Phase 1 complete (Day 1-2 done, Day 3-8 remaining)
  - Key findings: Day 1-2 exceeded targets (65% vs 40% coverage goal)

- **Backend Testing Infrastructure** (Phase 1 Day 1 - 2025-11-10)
  - Established pytest testing framework with coverage reporting
  - Created comprehensive test suite for StockService (10 tests, 70% service coverage)
  - Added shared test fixtures (mock yfinance, Flask app, test client)
  - Configured pytest.ini and .coveragerc for test automation
  - Current overall coverage: 59% (baseline for Phase 1)
  - Target: 70% coverage by end of Phase 1 (Day 7)

- **Expanded StockService Test Coverage** (Phase 1 Day 2 - 2025-11-11)
  - Increased StockService coverage from 70% to 90% (+20%)
  - Increased overall project coverage from 59% to 65% (+6%)
  - Added 22 new tests (10 → 32 total tests)
  - Created test_stock_service_batch.py with 10 batch operation tests
  - Added comprehensive error handling tests (empty data, None responses, timeouts)
  - Added data conversion tests (NaN values, volume types, zero volume)
  - Added company name resolution tests (fallback logic, exception handling)
  - Added edge case tests (malformed data, future dates)
  - All tests passing with no regressions

## [1.3.4] - 2025-11-09

### Fixed
- **Build Error**: Fixed TypeScript compilation error preventing Vercel deployment
  - Issue: TS6133 error - 'domainMin' declared but never used in CandlestickChart component
  - Location: src/components/CandlestickChart.tsx:36:45
  - Root cause: Variable was destructured from props but not utilized in coordinate calculations
  - Solution: Removed unused domainMin parameter from Candlestick component
  - Impact: Deployment now completes successfully without TypeScript errors
  - Only domainMax and priceRange are needed for current coordinate calculation implementation

## [1.3.4] - 2025-11-09 (Earlier Fix)

### Fixed
- **Candlestick Chart Coordinate Calculation**: Fixed critical issue where high-volatility stocks rendered outside chart bounds
  - Issue: K-line charts for high-volatility stocks (e.g., 6763.TWO with 9.3% daily range) extended beyond the bottom of the chart area
  - Root cause: Initial implementation used fixed 10% estimation for price range, which failed for stocks with larger daily movements
  - Solution: Implemented precise coordinate calculation using actual data range from parent component
  - Technical approach:
    - Parent component calculates actual min/max price range across entire dataset
    - Price range (domainMin, domainMax) passed as props to Candlestick component
    - Coordinate calculation uses actual chart area height (135px after margins) instead of estimated values
    - Reverse-engineering method: uses known close position (y) to calculate chartTop, then derives all other OHLC positions
  - Result: Perfect rendering for all stocks regardless of volatility (tested 0.5% - 10% daily ranges)

### Improved
- **Chart Margin Accuracy**: Corrected chart height calculation to account for top/bottom margins
  - ResponsiveContainer height: 145px
  - Actual drawing area: 135px (145 - 5 top - 5 bottom margin)
  - Ensures pixel-perfect alignment for all price points

### Technical Details
- Modified `CandlestickChart` component to pre-calculate price domain in parent (lines 249-254)
- Updated coordinate calculation formula in `Candlestick` component:
  ```typescript
  chartHeight = 135px (accounting for margins)
  pixelsPerPrice = chartHeight / priceRange
  chartTop = y - (domainMax - close) * pixelsPerPrice
  yHigh = chartTop + (domainMax - high) * pixelsPerPrice
  yLow = chartTop + (domainMax - low) * pixelsPerPrice
  yOpen = chartTop + (domainMax - open) * pixelsPerPrice
  ```
- Verified with edge cases: 6763.TWO (9.3% volatility), 2330.TW (<2% volatility), all time ranges (5D/1M/3M/6M/1Y)
- No breaking changes, backward compatible

## [1.3.3] - 2025-11-09

### Fixed
- **Candlestick Chart Rendering**: Fixed critical React key duplication error in K-line chart
  - Issue: Console showed "Encountered two children with the same key" errors for ErrorBar components
  - Root cause: Using Bar + ErrorBar approach caused React key conflicts when rendering bullish/bearish candles
  - Solution: Completely rewrote candlestick rendering using Recharts `Customized` component with direct SVG rendering
  - Behavior: Candlesticks now render as pure SVG elements (rect for body, line for wicks) with unique keys
  - Result: Eliminated all console errors and improved rendering performance

### Technical Details
- Removed `Bar` and `ErrorBar` components from candlestick implementation
- Added new `Candlesticks` component that renders using `<Customized>` wrapper
- Each candlestick consists of:
  - Upper wick: SVG `<line>` from high to body top
  - Body: SVG `<rect>` from open to close (minimum 1px for doji candles)
  - Lower wick: SVG `<line>` from body bottom to low
- Unique keys generated using `candle-${date}-${index}` pattern
- Improved Y-axis domain to `['dataMin', 'dataMax']` for better chart scaling
- No breaking changes, backward compatible

## [1.3.2] - 2025-11-06

### Fixed
- **Rate Limit Error Handling**: Fixed incorrect error message for 429 (Too Many Requests) errors
  - Issue: When backend rate limit was exceeded (429 status), frontend incorrectly displayed "Stock symbol not found" error
  - Root cause: Missing 429 status code handling in error logic
  - Solution: Added specific 429 error detection and bilingual error messages
  - Behavior: 429 errors now display "請求次數過多，請稍候片刻後再試" (zh-TW) / "Too many requests. Please wait a moment and try again." (en-US)
  - Auto-retry disabled for 429 errors to prevent worsening the rate limit situation
  - Users can manually retry after waiting

### Technical Details
- Added `rateLimitExceeded` translation key to `translations.ts` (zh-TW + en-US)
- Modified `StockCard.tsx` error handling to detect 429 status code
- Updated retry logic to exclude 429 errors from automatic retries (along with 404)
- No breaking changes, backward compatible

## [1.3.1] - 2025-11-06

### Improved
- **Smart 503 Error Handling**: Optimized retry logic for Render Free tier cold starts
  - Implemented status-code-specific retry delays
  - 503 errors now use longer retry intervals (5s, 10s, 15s) to accommodate 30-60 second cold start time
  - Other errors continue to use exponential backoff (1s, 2s, 4s)
  - Better user experience when API service is waking up from sleep
- **Enhanced Error Messages**: More user-friendly error messaging for service availability
  - 503 errors now show: "Service may be starting up (first visit takes 30-60 seconds), please wait..."
  - Bilingual support for all new messages (Traditional Chinese and English)
  - Users are informed about expected wait times during cold starts

### Technical Details
- Modified `StockCard.tsx` retry mechanism to differentiate between error types
- Cold start delays: [5000ms, 10000ms, 15000ms] for 503 errors
- Standard delays: exponential backoff up to 5000ms for other errors
- No breaking changes, backward compatible

## [1.3.0] - 2025-11-06

### Added
- **18 Stock Support**: Increased maximum trackable stocks from 9 to 18
  - Updated `StockManager` validation to allow up to 18 stocks
  - Enhanced `DashboardGrid` layout to support 6x3 grid (18 stocks)
  - Updated UI text and translations (English and Traditional Chinese)
  - Improved scalability for users tracking multiple portfolios
- **Enhanced Error Handling**: Significantly improved error handling and user feedback
  - Auto-retry mechanism with exponential backoff (up to 3 retries)
  - Specific error messages for different failure scenarios (timeout, 404, 500, network offline)
  - Bilingual error messages (English and Traditional Chinese)
  - Manual retry button for failed requests
  - Improved loading state with retry counter display
  - Visual error state with icon and helpful messaging
  - 30-second request timeout to prevent indefinite waiting
- **API Caching System**: Implemented intelligent caching for dramatic performance improvements
  - Added `@cache.cached()` decorators to `/api/stock-data` and `/api/batch-stocks` endpoints
  - Custom cache key functions based on symbol and date range parameters
  - 5-minute cache timeout for optimal balance of freshness and performance
  - **Performance Impact**: 634x faster response times for cached requests (1.92s → 0.003s)
  - **API Load Reduction**: 99.84% fewer API calls for repeated requests
  - **User Experience**: Near-instant loading for returning users within cache window
  - Zero infrastructure changes (uses existing SimpleCache in-memory storage)

### Fixed
- **Volume Display Bug**: Changed stock card footer to show average volume instead of last day volume
  - Previously showed volume of the last trading day in the date range
  - Issue: Volume appeared unchanged when switching time ranges with same end date
  - Now displays average volume across the entire selected time range
  - Average volume changes dynamically with different time ranges
  - Better reflects trading activity over the period
  - Bilingual labels: "平均成交量" (zh-TW) / "Avg Volume" (en-US)

### Changed
- Grid layout now supports up to 6 rows (previously 3 rows) for better 18-stock display
- Stock counter now shows "X/18" instead of "X/9"
- Error messages are now more specific and user-friendly
- Loading state now shows retry progress when auto-retrying
- Stock card footer now displays average volume instead of last day volume
- Backend API routes now utilize caching for improved performance

## [1.2.1] - 2025-11-04

### Removed
- **News Feature**: Completely removed news functionality from the application
  - Removed backend news API endpoint (`/api/stock-news/<symbol>`)
  - Removed `StockService.get_stock_news()` method
  - Removed all news-related schemas
  - Deleted `NewsPanel.tsx` component
  - Removed news buttons from stock cards
  - Removed all news-related state management

### Rationale
The yfinance news API has significant limitations that make it unsuitable for our user base:
- ❌ **No Chinese language support**: Only provides English news
- ❌ **Limited Taiwan stock coverage**: Small/mid-cap Taiwan stocks have no news
- ❌ **Inconsistent quality**: News coverage varies greatly by market and stock size
- ✅ **Better alternatives exist**: Google News RSS and NewsAPI.ai offer better multilingual support

The news feature will be **re-implemented in Q2 2025** (P2 priority) using a hybrid news aggregation approach:
- Taiwan stocks (.TW, .TWO) → Google News RSS (Traditional Chinese)
- US stocks → NewsAPI.org or Google News RSS (English)
- Hong Kong stocks (.HK) → Google News RSS (Chinese/English)
- Japan stocks (.T) → Google News RSS (Japanese/English)

This ensures all users, especially Chinese-speaking users, receive relevant news in their preferred language.

## [1.2.0] - 2025-11-04

### Added
- **Notification Banner**: Added dismissible warning banner about free hosting limitations
  - Displays information about backend sleep time and first-load delays
  - Banner remembers dismissal state using localStorage
  - Responsive design with yellow warning styling
  - Bilingual support (English and Traditional Chinese)
- **Enhanced Footer**: New footer component with improved functionality
  - MarketVue branding with copyright year
  - Author information with GitHub profile link
  - Repository link with GitHub icon
  - Responsive layout for desktop and mobile
  - Replaced old footer that only showed yfinance attribution
- **Vercel Analytics**: Integrated Vercel Analytics for visitor tracking
  - Added @vercel/analytics package (v1.5.0)
  - Configured Analytics component for React/Vite
  - Enables page view and visitor analytics in Vercel dashboard
- **Vercel Speed Insights**: Integrated Vercel Speed Insights for performance monitoring
  - Added @vercel/speed-insights package (v1.2.0)
  - Configured SpeedInsights component for React/Vite
  - Enables Core Web Vitals and performance tracking in Vercel dashboard

### Changed
- **Application Branding**: Updated application name from "Stock Dashboard" to "MarketVue"
  - Updated browser title in index.html
  - Updated all UI text in translations (English and Traditional Chinese)
  - Changed header subtitle to "Real-time Multi-Market Stock Dashboard" / "即時多市場股票追蹤儀表板"
- **Render Deployment**: Updated backend deployment configuration
  - Changed deployment region from Oregon to Singapore for better latency in Asia
  - Configured health check path (/api/health) for improved deployment reliability
  - Ensures faster API response times for Asian users
- **Package Version**: Bumped version to 1.2.0

### Fixed
- **Dark Mode Styling**: Improved notification banner appearance in dark mode
  - Adjusted background opacity from 20% to 30% for better visibility
  - Changed border color to lighter yellow-700/50 to remove harsh orange line
  - Brightened icon and text colors (yellow-400 and yellow-100) for better contrast
  - Updated hover effects for better visual feedback
- **Footer Layout**: Fixed footer positioning to stick to viewport bottom
  - Added flexbox layout to App container (flex flex-col)
  - Made main content area flexible with flex-grow
  - Changed footer margin from mt-12 to mt-auto for proper alignment
  - Footer now stays at bottom when content is short, without being sticky

### Technical
- Created NotificationBanner component with localStorage integration
- Created Footer component with bilingual link support
- Added new translation keys: freeHostingNotice, madeBy, viewOnGitHub
- Integrated new components into main App.tsx layout
- Implemented flexbox-based footer positioning for responsive layouts
- **Project Management**: Established TODO tracking system
  - Created `.todo/` directory for internal task management (excluded from Git)
  - Added `ROADMAP.md` for public-facing development roadmap
  - Organized tasks with 6-dimensional classification (Phase, Category, Effort, Impact, Status, Module)
  - Documented Q1-Q4 2025 feature planning

## [1.1.1] - 2025-11-04

### Fixed
- **API URL Configuration**: Corrected duplicate `/api` path in environment variables
  - Removed `/api` suffix from `VITE_API_URL` base URL
  - Fixed double `/api/api` path issue causing API request failures in production
  - Updated `.env.example` and `.env.production` with correct configuration

## [1.1.0] - 2025-11-03

### Added
- **Production Deployment Support**: Complete deployment configuration for Vercel + Render
  - Environment variable configuration (.env.example, .env.production)
  - Render deployment configuration (render.yaml)
  - Comprehensive bilingual deployment guide (docs/DEPLOYMENT.md)
- **Gunicorn**: Production-ready WSGI server for Flask backend
- **TypeScript Type Definitions**: Added @types/react-grid-layout for production builds

### Changed
- Updated CORS configuration with production environment documentation
- Enhanced README with deployment guide link

### Documentation
- Added complete deployment guide in English and Traditional Chinese
- Updated README files with deployment links

## [1.0.0] - 2025-10-31

### Added
- **Multi-Market Support**: Track stocks from Taiwan (Listed/OTC), US, Hong Kong, and Japan markets
- **Technical Indicators**: MA20 and MA60 moving averages with interactive charts
- **Real-time Data**: Live stock prices and changes powered by yfinance
- **News Integration**: Access latest stock-related news with one click
- **Multi-language UI**: Full support for Traditional Chinese and English
- **Company Name Mapping**: Built-in translations for 36+ major companies
- **Theme Customization**:
  - Color themes (Western red-up/green-down, Eastern green-up/red-down)
  - Dark mode / Light mode with system auto-detection
- **Interactive Charts**:
  - Price charts with Recharts
  - Volume analysis
  - Moving average overlays
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Local Storage**: Auto-save tracked stocks and user preferences
- **Stock Management**: Track up to 9 stocks simultaneously
- **Time Range Selection**: Preset ranges (1W, 1M, 3M, 6M, 1Y) or custom dates

### Technical
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Recharts
- **Backend**: Flask, yfinance, Flask-CORS, Flask-Caching
- **Build Tools**: Vite for fast development and optimized production builds
- **Icons**: Lucide Icons library
- **Date Handling**: date-fns for reliable date operations

### Documentation
- Comprehensive README in both Chinese and English
- API documentation
- Architecture documentation
- Contributing guidelines
- MIT License

---

## 🗺️ Future Development

> 📍 **查看專案發展規劃：** [ROADMAP.md](./ROADMAP.md)

本專案持續開發中，未來功能規劃請參考 [ROADMAP.md](./ROADMAP.md)，包含：
- **Q1 2025**: K線圖、18檔股票支援、API優化
- **Q2 2025**: 技術指標擴充、匯出數據、測試提升
- **Q3-Q4 2025**: 投資組合追蹤、行動應用、AI洞察

---

**Note**: This is the initial release of MarketVue. We welcome feedback and contributions!
