import { memo } from "react";
import { Newspaper } from "lucide-react";
import { useVisualTheme } from "../../contexts/VisualThemeContext";
import type { Translations } from "../../i18n/translations";

interface NewsEmptyStateProps {
  symbol: string;
  t: Translations;
}

const NewsEmptyState = memo(function NewsEmptyState({
  symbol,
  t,
}: NewsEmptyStateProps) {
  const { visualTheme } = useVisualTheme();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <Newspaper
        size={48}
        className={
          visualTheme === "warm"
            ? "text-warm-300 dark:text-warm-600"
            : "text-gray-300 dark:text-gray-600"
        }
      />
      <p
        className={`mt-4 text-sm font-medium ${
          visualTheme === "warm"
            ? "text-warm-600 dark:text-warm-300"
            : "text-gray-500 dark:text-gray-400"
        }`}
      >
        {t.noNewsAvailableFor} {symbol}
      </p>
      <p
        className={`mt-1 text-xs ${
          visualTheme === "warm"
            ? "text-warm-400 dark:text-warm-500"
            : "text-gray-400 dark:text-gray-500"
        }`}
      >
        {t.tryCheckingLater}
      </p>
    </div>
  );
});

export default NewsEmptyState;
