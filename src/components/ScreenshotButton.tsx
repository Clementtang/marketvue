import { useState, useCallback } from 'react';
import { Camera } from 'lucide-react';
import { captureAndCopyToClipboard, isClipboardAvailable } from '../utils/screenshot';
import { useTranslation } from '../i18n/translations';
import type { Language } from '../i18n/translations';

interface ScreenshotButtonProps {
  targetElementId: string;
  language: Language;
}

/**
 * Button component for capturing screenshots of the dashboard grid
 * Copies the screenshot to clipboard in 16:9 aspect ratio
 */
const ScreenshotButton = ({ targetElementId, language }: ScreenshotButtonProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCapture = useCallback(async () => {
    if (isCapturing) return;

    setIsCapturing(true);
    setShowSuccess(false);

    // Small delay to ensure UI is settled
    await new Promise((resolve) => setTimeout(resolve, 100));

    const success = await captureAndCopyToClipboard(targetElementId);

    setIsCapturing(false);

    if (success) {
      setShowSuccess(true);
      // Hide success message after 2 seconds
      setTimeout(() => setShowSuccess(false), 2000);
    }
  }, [targetElementId, isCapturing]);

  // Don't render if clipboard API is not available
  if (!isClipboardAvailable()) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={handleCapture}
        disabled={isCapturing}
        className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        title={language === 'zh-TW' ? '複製截圖到剪貼簿' : 'Copy screenshot to clipboard'}
      >
        <Camera size={18} className={isCapturing ? 'animate-pulse' : ''} />
        <span className="text-sm font-medium">
          {isCapturing
            ? language === 'zh-TW'
              ? '截圖中...'
              : 'Capturing...'
            : language === 'zh-TW'
            ? '截圖'
            : 'Screenshot'}
        </span>
      </button>

      {/* Success message */}
      {showSuccess && (
        <div className="absolute top-full left-0 mt-2 px-3 py-2 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-lg shadow-md text-sm whitespace-nowrap z-50">
          {language === 'zh-TW' ? '✓ 已複製到剪貼簿' : '✓ Copied to clipboard'}
        </div>
      )}
    </div>
  );
};

export default ScreenshotButton;
