# Work Log — Dead code & config drift cleanup (v1.19.1)

**Date:** 2026-06-12
**Scope:** Remove unused modules and stale/conflicting configuration.

## Removed

### `useRetry` hook (353 lines)

`src/hooks/useRetry.ts` and `src/hooks/__tests__/useRetry.test.ts`. Verified no
non-test importers — React Query already provides retry/backoff for stock data
(`useStockData`). Deleting it removed ~46 now-pointless tests.

### `hooks/index.ts` barrel

No file imported from the `../hooks` barrel; every consumer imports the specific
hook file directly (`../hooks/usePersistedState`, etc.). The barrel only
re-exported `useRetry`, `usePersistedState`, and `stockListReducer`, so it was
dead once `useRetry` was gone.

### Unreachable single-fetch path

`fetchStockData` + its duplicate `calculateMA` in `api/stockApi.ts` were only
reachable via the hardcoded `USE_BATCH_API = true` branch in `useStockData`,
i.e. never. `useStockData` now always calls `fetchStockDataBatched`, and
`stockApi.ts` keeps only `getStockQueryKey` / `FetchStockDataParams`. The
moving-average duplication between `stockApi.ts` and `batchStockApi.ts` is gone
(single copy lives in `batchStockApi.ts`).

### Stale config in `constants.ts`

All verified as having zero external references:

| Block | Why removed |
| --- | --- |
| `TIME_RANGES` | Unused; keys drifted (`1mo`/`3mo`/`6mo`) from the actual selector values (`1m`/`3m`/`6m`) |
| `STORAGE_KEYS` | Unused |
| `GRID_CONFIG` | Unused; described a 12-column grid the app doesn't use |
| `DEFAULT_STOCKS` | Unused |
| `VALIDATION` | Unused; `MAX_STOCK_CARDS: 20` conflicted with `STOCK_LIST_CONFIG.MAX_STOCKS_PER_LIST: 18` |
| `APP_METADATA` | Unused; duplicated the version string — `package.json` is now the single source |

## Verification

- `tsc -b` clean, `eslint .` clean, `npm run build` succeeds.
- `vitest run` — 161 tests pass (was 207; −46 from the removed `useRetry` test).

## Note

Because `APP_METADATA.VERSION` is gone, the version no longer needs to be kept
in sync inside `constants.ts`. The documentation update order in `CLAUDE.md`
can drop the "constants version bump" step — `package.json` is authoritative.
