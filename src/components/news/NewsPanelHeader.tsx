import { memo } from "react";
import { X, ArrowLeft } from "lucide-react";
import { useVisualTheme } from "../../contexts/VisualThemeContext";
import type { Translations } from "../../i18n/translations";

interface NewsPanelHeaderProps {
  symbol: string;
  t: Translations;
  onClose: () => void;
  isMobile: boolean;
}

const NewsPanelHeader = memo(function NewsPanelHeader({
  symbol,
  t,
  onClose,
  isMobile,
}: NewsPanelHeaderProps) {
  const { visualTheme } = useVisualTheme();

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 flex-shrink-0 ${
        visualTheme === "warm"
          ? "border-b border-warm-200/50 dark:border-warm-700/50"
          : "border-b border-gray-200 dark:border-gray-700"
      }`}
    >
      <div className="flex items-center gap-2">
        {isMobile && (
          <button
            onClick={onClose}
            className={`p-1 -ml-1 transition-colors ${
              visualTheme === "warm"
                ? "text-warm-500 hover:bg-warm-100/80 dark:text-warm-400 dark:hover:bg-warm-700/50 rounded-xl"
                : "text-gray-400 hover:bg-gray-100/80 dark:text-gray-500 dark:hover:bg-gray-700/50 rounded-lg"
            }`}
            aria-label={t.closeButton}
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h2
          className={`text-base font-semibold ${
            visualTheme === "warm"
              ? "text-warm-800 dark:text-warm-100"
              : "text-gray-800 dark:text-gray-100"
          }`}
        >
          {symbol} {t.news}
        </h2>
      </div>
      {!isMobile && (
        <button
          onClick={onClose}
          className={`p-1.5 transition-colors ${
            visualTheme === "warm"
              ? "text-warm-500 hover:bg-warm-100/80 dark:text-warm-400 dark:hover:bg-warm-700/50 rounded-xl"
              : "text-gray-400 hover:bg-gray-100/80 dark:text-gray-500 dark:hover:bg-gray-700/50 rounded-lg"
          }`}
          aria-label={t.closeButton}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
});

export default NewsPanelHeader;
