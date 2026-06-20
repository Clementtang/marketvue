import { useState, useCallback } from 'react';
import { Camera, Download, Layers } from 'lucide-react';
import {
  captureScreenshot,
  captureAndDownload,
  isClipboardImageSupported,
} from '../utils/screenshot';
import { useVisualTheme } from '../contexts/VisualThemeContext';
import { useChart } from '../contexts/ChartContext';
import { useTranslation, type Language } from '../i18n/translations';

/** Resolve after the browser has painted (two animation frames). */
function nextPaint(): Promise<void> {
  return new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
}

interface ScreenshotButtonProps {
  targetElementId: string;
  language: Language;
  /**
   * Optional hooks for capturing content that spans multiple pages. When
   * provided, an extra "All" button renders. `prepare` must make every item
   * visible in `targetElementId` (and resolve once it is ready to capture);
   * `cleanup` restores the normal view afterwards.
   */
  fullCapture?: {
    prepare: () => Promise<void>;
    cleanup: () => void;
  };
}

type Feedback = 'copied' | 'downloaded' | 'failed' | null;

/**
 * Capture the dashboard grid as a PNG.
 *
 * Primary button copies to the clipboard when the browser supports image
 * clipboard writes, otherwise it transparently falls back to a file download.
 * A secondary button always offers an explicit PNG download, so the feature
 * works in every browser (including Firefox and Safari).
 */
const ScreenshotButton = ({
  targetElementId,
  language,
  fullCapture,
}: ScreenshotButtonProps) => {
  const { visualTheme } = useVisualTheme();
  const { setIsExporting } = useChart();
  const t = useTranslation(language);
  const isWarm = visualTheme === 'warm';
  const canCopy = isClipboardImageSupported();

  const [isCapturing, setIsCapturing] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const showFeedback = useCallback((result: Feedback) => {
    setFeedback(result);
    setTimeout(() => setFeedback(null), 2500);
  }, []);

  const handlePrimary = useCallback(async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    setFeedback(null);
    setIsExporting(true);
    try {
      // Wait for the export caption + static charts to paint before rasterizing.
      await nextPaint();
      showFeedback(await captureScreenshot(targetElementId));
    } finally {
      setIsExporting(false);
      setIsCapturing(false);
    }
  }, [isCapturing, targetElementId, showFeedback, setIsExporting]);

  const handleDownload = useCallback(async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    setFeedback(null);
    setIsExporting(true);
    try {
      await nextPaint();
      const ok = await captureAndDownload(targetElementId);
      showFeedback(ok ? 'downloaded' : 'failed');
    } finally {
      setIsExporting(false);
      setIsCapturing(false);
    }
  }, [isCapturing, targetElementId, showFeedback, setIsExporting]);

  const handleCaptureAll = useCallback(async () => {
    if (isCapturing || !fullCapture) return;
    setIsCapturing(true);
    setFeedback(null);
    setIsExporting(true);
    try {
      await fullCapture.prepare();
      showFeedback(await captureScreenshot(targetElementId));
    } catch {
      showFeedback('failed');
    } finally {
      fullCapture.cleanup();
      setIsExporting(false);
      setIsCapturing(false);
    }
  }, [isCapturing, fullCapture, targetElementId, showFeedback, setIsExporting]);

  const primaryClasses = isWarm
    ? 'bg-warm-accent-500 hover:bg-warm-accent-600 dark:bg-warm-accent-600 dark:hover:bg-warm-accent-700 rounded-2xl'
    : 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 rounded-lg';

  const secondaryClasses = isWarm
    ? 'bg-warm-100 hover:bg-warm-200 dark:bg-warm-700 dark:hover:bg-warm-600 text-warm-700 dark:text-warm-100 rounded-2xl'
    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-100 rounded-lg';

  const feedbackText =
    feedback === 'copied'
      ? t.screenshotCopied
      : feedback === 'downloaded'
        ? t.screenshotDownloaded
        : feedback === 'failed'
          ? t.screenshotFailed
          : '';

  const feedbackTone =
    feedback === 'failed'
      ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
      : isWarm
        ? 'bg-warm-accent-50 dark:bg-warm-accent-900/50 text-warm-accent-800 dark:text-warm-accent-200'
        : 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200';

  return (
    <div className="relative flex items-center gap-2">
      <button
        onClick={handlePrimary}
        disabled={isCapturing}
        className={`flex items-center gap-2 px-3 py-2 text-white transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${primaryClasses}`}
        title={canCopy ? t.copyScreenshotTitle : t.downloadScreenshotTitle}
        aria-label={canCopy ? t.copyScreenshotTitle : t.downloadScreenshotTitle}
      >
        <Camera size={18} className={isCapturing ? 'animate-pulse' : ''} />
        <span className="text-sm font-medium">
          {isCapturing ? t.capturing : t.screenshot}
        </span>
      </button>

      {/* Explicit download — always available, even when clipboard copy is supported */}
      {canCopy && (
        <button
          onClick={handleDownload}
          disabled={isCapturing}
          className={`flex items-center justify-center p-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${secondaryClasses}`}
          title={t.downloadScreenshotTitle}
          aria-label={t.downloadScreenshotTitle}
        >
          <Download size={18} />
        </button>
      )}

      {/* Capture every stock across all pages in a single image */}
      {fullCapture && (
        <button
          onClick={handleCaptureAll}
          disabled={isCapturing}
          className={`flex items-center gap-1.5 px-3 py-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${secondaryClasses}`}
          title={t.screenshotAllTitle}
          aria-label={t.screenshotAllTitle}
        >
          <Layers size={18} />
          <span className="text-sm font-medium">{t.screenshotAll}</span>
        </button>
      )}

      {feedbackText && (
        <div
          role="status"
          className={`absolute top-full right-0 mt-2 px-3 py-2 rounded-lg shadow-md text-sm whitespace-nowrap z-50 ${feedbackTone}`}
        >
          {feedbackText}
        </div>
      )}
    </div>
  );
};

export default ScreenshotButton;
