# Work Log — Cross-browser screenshot (v1.18.0)

**Date:** 2026-06-12
**Scope:** Make the dashboard screenshot feature work in every browser, with predictable output.

## Problem

The screenshot feature only wrote the captured PNG to the clipboard via
`ClipboardItem`. Firefox (and some Safari versions) do not support writing
images to the clipboard, and `ScreenshotButton` returned `null` when that API
was missing — so those users had **no way to capture a screenshot at all**,
even though screenshotting is the core purpose of MarketVue.

Two secondary issues:

- The capture claimed to be "16:9" but used `min(scaleX, scaleY)`, which
  letterboxed the element into a 1920×1080 box. The real output size varied
  with the number of cards.
- No file-download path existed.

## Changes

### `src/utils/screenshot.ts`

- Extracted `captureElementToBlob()` as the shared rasterization core.
- `captureAndCopyToClipboard()` now reuses the core and keeps clipboard logic.
- Added `captureAndDownload()` — triggers a timestamped PNG download
  (`marketvue-YYYY-MM-DD-HHmm.png`); works in all browsers.
- Added `captureScreenshot()` — copies to clipboard when supported, otherwise
  downloads, returning `'copied' | 'downloaded' | 'failed'`.
- Added `isClipboardImageSupported()` (also checks `clipboard.write`);
  `isClipboardAvailable()` kept as a deprecated alias.
- Scaling now uses width only (`targetWidth / width`, capped at 3×) for
  predictable dimensions and a true aspect ratio.

### `src/components/ScreenshotButton.tsx`

- Always renders. Primary button copies-or-downloads; a secondary Download
  button is shown when clipboard copy is available so a file export is always
  one click away.
- Distinct, bilingual feedback for copied / downloaded / failed, with
  `role="status"` and `aria-label`s.

### i18n

- Added `screenshot`, `capturing`, `downloadScreenshot`, `screenshotCopied`,
  `screenshotDownloaded`, `screenshotFailed`, `copyScreenshotTitle`,
  `downloadScreenshotTitle` (en-US / zh-TW).

## Verification

- `tsc -b` clean, `eslint` clean on changed files.
- `vitest run` — 201 tests pass.

## Follow-ups (next in sequence)

- Capture **all** stocks (not just the current page) — folded into the
  arrangement / pagination refactor (item 2).
