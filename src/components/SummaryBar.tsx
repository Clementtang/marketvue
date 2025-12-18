/**
 * SummaryBar - Collapsed state display for ControlPanel
 * Shows a compact summary of stocks and time range when collapsed
 */

import { ChevronDown, BarChart3, Calendar } from 'lucide-react';
import { useVisualTheme } from '../contexts/VisualThemeContext';
import { useTranslation } from '../i18n/translations';
import { useApp } from '../contexts/AppContext';

interface SummaryBarProps {
  listName: string;
  stocks: string[];
  datePreset: string;
  onExpand: () => void;
}

export function SummaryBar({ listName, stocks, datePreset, onExpand }: SummaryBarProps) {
  const { visualTheme } = useVisualTheme();
  const { language } = useApp();
  const t = useTranslation(language);
  const isWarm = visualTheme === 'warm';

  // Format stocks display - show first 3 and "..." for more
  const displayStocks = stocks.slice(0, 3);
  const hasMore = stocks.length > 3;

  // Map preset to display label
  const presetLabels: Record<string, string> = {
    '1w': '1W',
    '1m': '1M',
    '3m': '3M',
    '6m': '6M',
    '1y': '1Y',
    'custom': t.custom,
  };

  const presetLabel = presetLabels[datePreset] || datePreset;

  return (
    <button
      onClick={onExpand}
      className={`
        group w-full flex items-center justify-between gap-4 px-4 py-3
        transition-colors duration-200 cursor-pointer
        active:scale-[0.998]
        ${isWarm
          ? 'bg-warm-100 dark:bg-warm-800 rounded-2xl border border-warm-200 dark:border-warm-700 hover:bg-warm-50 dark:hover:bg-warm-750 hover:border-warm-300 dark:hover:border-warm-600'
          : 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-gray-300 dark:hover:border-gray-600'
        }
      `}
      aria-label={t.expandPanel}
    >
      {/* Left: List name and count */}
      <div className="flex items-center gap-2 min-w-0">
        <BarChart3
          size={16}
          className={`flex-shrink-0 ${isWarm ? 'text-warm-accent-500' : 'text-blue-500'}`}
        />
        <span className="font-medium truncate max-w-[150px]">
          {listName}
        </span>
        <span className={`
          text-xs px-1.5 py-0.5 rounded-full flex-shrink-0
          ${isWarm
            ? 'bg-warm-200 dark:bg-warm-700 text-warm-600 dark:text-warm-300'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }
        `}>
          {stocks.length}
        </span>
      </div>

      {/* Center: Stock symbols */}
      <div className={`
        hidden sm:flex items-center gap-2 flex-1 justify-center text-sm
        ${isWarm
          ? 'text-warm-600 dark:text-warm-400'
          : 'text-gray-500 dark:text-gray-400'
        }
      `}>
        {stocks.length > 0 ? (
          <>
            <span className="truncate max-w-[200px]">
              {displayStocks.join(', ')}
            </span>
            {hasMore && (
              <span className="flex-shrink-0">+{stocks.length - 3}</span>
            )}
          </>
        ) : (
          <span className="italic">{t.noStocksYet}</span>
        )}
      </div>

      {/* Right: Date range and expand button */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className={`
          flex items-center gap-1.5 text-sm
          ${isWarm
            ? 'text-warm-600 dark:text-warm-400'
            : 'text-gray-500 dark:text-gray-400'
          }
        `}>
          <Calendar size={14} className="flex-shrink-0" />
          <span className="font-medium">{presetLabel}</span>
        </div>

        <div className={`
          flex items-center gap-1 text-sm font-medium
          ${isWarm
            ? 'text-warm-accent-600 dark:text-warm-accent-400'
            : 'text-blue-600 dark:text-blue-400'
          }
        `}>
          <span className="hidden md:inline">{t.expandPanel}</span>
          <ChevronDown
            size={18}
            className="transition-transform duration-200 group-hover:translate-y-0.5"
          />
        </div>
      </div>
    </button>
  );
}

export default SummaryBar;
