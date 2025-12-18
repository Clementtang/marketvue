/**
 * ControlPanel - Collapsible wrapper for StockManager and TimeRangeSelector
 * Provides expand/collapse functionality with smooth CSS transitions
 */

import { type ReactNode } from 'react';
import { ChevronUp } from 'lucide-react';
import { usePersistedState } from '../hooks/usePersistedState';
import { useVisualTheme } from '../contexts/VisualThemeContext';
import { useTranslation } from '../i18n/translations';
import { useApp } from '../contexts/AppContext';
import SummaryBar from './SummaryBar';

interface ControlPanelProps {
  stocks: string[];
  listName: string;
  datePreset: string;
  children: ReactNode;
}

export function ControlPanel({ stocks, listName, datePreset, children }: ControlPanelProps) {
  const [isCollapsed, setIsCollapsed] = usePersistedState('control-panel-collapsed', false);
  const { visualTheme } = useVisualTheme();
  const { language } = useApp();
  const t = useTranslation(language);
  const isWarm = visualTheme === 'warm';

  return (
    <div className="mb-6 relative z-20">
      {isCollapsed ? (
        /* Collapsed State: Summary Bar */
        <div className="animate-fade-in">
          <SummaryBar
            listName={listName}
            stocks={stocks}
            datePreset={datePreset}
            onExpand={() => setIsCollapsed(false)}
          />
        </div>
      ) : (
        /* Expanded State: Full Content */
        <div className="animate-fade-in">
          {children}

          {/* Collapse Button */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setIsCollapsed(true)}
              className={`
                group flex items-center gap-2 px-4 py-2 text-sm font-medium
                transition-colors duration-200 cursor-pointer
                active:scale-[0.98]
                ${isWarm
                  ? 'text-warm-500 dark:text-warm-400 hover:text-warm-700 dark:hover:text-warm-200 rounded-xl border border-transparent hover:border-warm-200 dark:hover:border-warm-700 hover:bg-warm-50/80 dark:hover:bg-warm-800/60'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50/80 dark:hover:bg-gray-800/60'
                }
              `}
              aria-label={t.collapsePanel}
            >
              <span>{t.collapsePanel}</span>
              <ChevronUp
                size={16}
                className="transition-transform duration-200 group-hover:-translate-y-0.5"
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ControlPanel;
