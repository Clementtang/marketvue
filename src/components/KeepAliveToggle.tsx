import { useKeepAlive } from '../hooks/useKeepAlive';
import { useApp } from '../contexts/AppContext';
import { useVisualTheme } from '../contexts/VisualThemeContext';
import { useTranslation } from '../i18n/translations';

/**
 * KeepAliveToggle Component
 *
 * Provides UI control for the Keep-Alive functionality.
 * Displays toggle switch, status, and last ping time.
 *
 * Features:
 * - Toggle switch with visual feedback
 * - Bilingual support (zh-TW/en-US)
 * - Status indicator (Enabled/Disabled)
 * - Last ping time display
 * - Descriptive help text
 */
export default function KeepAliveToggle() {
  const { language } = useApp();
  const { visualTheme } = useVisualTheme();
  const t = useTranslation(language);
  const { keepAliveEnabled, setKeepAliveEnabled, lastPingTime, isPinging } = useKeepAlive();

  const formatLastPingTime = (date: Date | null) => {
    if (!date) return t.never;
    return date.toLocaleTimeString(language === 'zh-TW' ? 'zh-TW' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="space-y-2">
      {/* Title and Toggle */}
      <div className="flex items-center justify-between">
        <label htmlFor="keep-alive-toggle" className="text-sm font-medium">
          {t.keepAlive}
        </label>
        <button
          id="keep-alive-toggle"
          type="button"
          role="switch"
          aria-checked={keepAliveEnabled}
          onClick={() => setKeepAliveEnabled(!keepAliveEnabled)}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
            ${visualTheme === 'warm'
              ? `focus:ring-warm-accent-500 ${keepAliveEnabled ? 'bg-warm-accent-500' : 'bg-gray-300 dark:bg-gray-600'}`
              : `focus:ring-blue-500 ${keepAliveEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`
            }
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${keepAliveEnabled ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-600 dark:text-gray-400">
        {t.keepAliveDescription}
      </p>

      {/* Status and Last Ping Time */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-gray-600 dark:text-gray-400">{language === 'zh-TW' ? '狀態' : 'Status'}:</span>
          <span
            className={`font-medium ${
              keepAliveEnabled
                ? visualTheme === 'warm'
                  ? 'text-warm-accent-600 dark:text-warm-accent-400'
                  : 'text-green-600 dark:text-green-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {keepAliveEnabled ? t.keepAliveEnabled : t.keepAliveDisabled}
          </span>
          {isPinging && (
            <span className={`inline-flex h-2 w-2 animate-pulse rounded-full ${
              visualTheme === 'warm' ? 'bg-warm-accent-500' : 'bg-blue-500'
            }`}></span>
          )}
        </div>

        {keepAliveEnabled && (
          <div className="text-gray-600 dark:text-gray-400">
            {t.lastPing}: <span className="font-mono">{formatLastPingTime(lastPingTime)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
