/**
 * Stock List Selector Component
 * Allows users to switch between multiple watchlists
 *
 * Design: Inline action buttons that slide in on hover/focus
 * for better UX without nested dropdown overlap issues
 */

import { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Check,
  Plus,
  Pencil,
  Trash2,
  Copy,
  FolderOpen,
} from 'lucide-react';
import { useStockList } from '../../contexts/StockListContext';
import { useApp } from '../../contexts/AppContext';
import { useVisualTheme } from '../../contexts/VisualThemeContext';
import { useTranslation } from '../../i18n/translations';
import type { StockList } from '../../types/stockList';

interface StockListSelectorProps {
  onCreateNew: () => void;
  onSaveAsCopy: () => void;
  onRename: (list: StockList) => void;
  onDelete: (list: StockList) => void;
}

export function StockListSelector({
  onCreateNew,
  onSaveAsCopy,
  onRename,
  onDelete,
}: StockListSelectorProps) {
  const { state, activeList, isListLimitReached, actions } = useStockList();
  const { language } = useApp();
  const { visualTheme } = useVisualTheme();
  const t = useTranslation(language);

  const [isOpen, setIsOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHoveredId(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchList = (id: string) => {
    actions.switchList(id);
    setIsOpen(false);
  };

  const warmStyles = visualTheme === 'warm';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-200 ${
          warmStyles
            ? 'bg-warm-200/50 hover:bg-warm-200 dark:bg-warm-700/50 dark:hover:bg-warm-700 text-warm-800 dark:text-warm-100 rounded-xl'
            : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg'
        }`}
      >
        <FolderOpen size={16} />
        <span className="max-w-[150px] truncate">{activeList.name}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
          warmStyles
            ? 'bg-warm-300/50 dark:bg-warm-600/50 text-warm-700 dark:text-warm-300'
            : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
        }`}>
          {activeList.stocks.length}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 top-full mt-2 w-80 z-50 shadow-xl border overflow-hidden ${
            warmStyles
              ? 'bg-warm-50 dark:bg-warm-800 border-warm-200 dark:border-warm-700 rounded-2xl'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl'
          }`}
          style={{
            animation: 'dropdownFadeIn 0.15s ease-out',
          }}
        >
          <style>{`
            @keyframes dropdownFadeIn {
              from { opacity: 0; transform: translateY(-4px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes slideIn {
              from { opacity: 0; transform: translateX(8px); }
              to { opacity: 1; transform: translateX(0); }
            }
          `}</style>

          {/* List Items */}
          <div className="py-1">
            {state.lists.map((list) => {
              const isActive = list.id === activeList.id;
              const isHovered = hoveredId === list.id;

              return (
                <div
                  key={list.id}
                  className={`group relative flex items-center px-3 py-2.5 cursor-pointer transition-all duration-150 ${
                    isActive
                      ? warmStyles
                        ? 'bg-warm-accent-100/80 dark:bg-warm-accent-900/40'
                        : 'bg-blue-50 dark:bg-blue-900/30'
                      : warmStyles
                        ? 'hover:bg-warm-100/80 dark:hover:bg-warm-700/60'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/60'
                  }`}
                  onClick={() => handleSwitchList(list.id)}
                  onMouseEnter={() => setHoveredId(list.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Left side: Check + Name */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="w-5 flex-shrink-0 flex items-center justify-center">
                      {isActive && (
                        <Check
                          size={16}
                          className={`${warmStyles ? 'text-warm-accent-600 dark:text-warm-accent-400' : 'text-blue-600 dark:text-blue-400'}`}
                        />
                      )}
                    </div>
                    <span
                      className={`truncate font-medium ${
                        warmStyles
                          ? 'text-warm-800 dark:text-warm-100'
                          : 'text-gray-800 dark:text-gray-100'
                      }`}
                    >
                      {list.name}
                    </span>
                    {list.isDefault && (
                      <span
                        className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wide ${
                          warmStyles
                            ? 'bg-warm-accent-200/60 dark:bg-warm-accent-800/40 text-warm-accent-700 dark:text-warm-accent-300'
                            : 'bg-blue-100 dark:bg-blue-800/40 text-blue-600 dark:text-blue-300'
                        }`}
                      >
                        {t.defaultList || 'Default'}
                      </span>
                    )}
                  </div>

                  {/* Right side: Count + Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Stock count - always visible but fades when actions show */}
                    <span
                      className={`text-xs tabular-nums px-1.5 py-0.5 rounded transition-opacity duration-150 ${
                        isHovered ? 'opacity-0 w-0 px-0' : 'opacity-100'
                      } ${
                        warmStyles
                          ? 'text-warm-500 dark:text-warm-400 bg-warm-200/50 dark:bg-warm-700/50'
                          : 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50'
                      }`}
                    >
                      {list.stocks.length}
                    </span>

                    {/* Inline action buttons - appear on hover */}
                    <div
                      className={`flex items-center gap-0.5 transition-all duration-150 ${
                        isHovered
                          ? 'opacity-100 translate-x-0'
                          : 'opacity-0 translate-x-2 pointer-events-none absolute right-3'
                      }`}
                      style={isHovered ? { animation: 'slideIn 0.15s ease-out' } : {}}
                    >
                      {/* Rename button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRename(list);
                          setIsOpen(false);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          warmStyles
                            ? 'hover:bg-warm-200 dark:hover:bg-warm-600 text-warm-600 dark:text-warm-300'
                            : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
                        }`}
                        title={t.renameList || 'Rename'}
                      >
                        <Pencil size={14} />
                      </button>

                      {/* Delete button - not for default */}
                      {!list.isDefault && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(list);
                            setIsOpen(false);
                          }}
                          className="p-1.5 rounded-lg transition-colors text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
                          title={t.deleteList || 'Delete'}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}

                      {/* Stock count badge - compact version shown with actions */}
                      <span
                        className={`text-[10px] tabular-nums ml-1 px-1.5 py-0.5 rounded-full ${
                          warmStyles
                            ? 'text-warm-500 dark:text-warm-400 bg-warm-200/70 dark:bg-warm-700/70'
                            : 'text-gray-500 dark:text-gray-400 bg-gray-200/70 dark:bg-gray-700/70'
                        }`}
                      >
                        {list.stocks.length}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div
            className={`mx-3 border-t ${
              warmStyles ? 'border-warm-200 dark:border-warm-700' : 'border-gray-200 dark:border-gray-700'
            }`}
          />

          {/* Actions */}
          <div className="py-1">
            <button
              onClick={() => {
                onCreateNew();
                setIsOpen(false);
              }}
              disabled={isListLimitReached}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                warmStyles
                  ? 'hover:bg-warm-100 dark:hover:bg-warm-700 text-warm-accent-600 dark:text-warm-accent-400'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400'
              }`}
            >
              <div className="w-5 flex items-center justify-center">
                <Plus size={16} />
              </div>
              <span className="font-medium">{t.createNewList || 'Create New List'}</span>
            </button>

            <button
              onClick={() => {
                onSaveAsCopy();
                setIsOpen(false);
              }}
              disabled={isListLimitReached}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                warmStyles
                  ? 'hover:bg-warm-100 dark:hover:bg-warm-700 text-warm-600 dark:text-warm-400'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <div className="w-5 flex items-center justify-center">
                <Copy size={16} />
              </div>
              <span>{t.saveAsCopy || 'Save as Copy'}</span>
            </button>
          </div>

          {/* Limit Warning */}
          {isListLimitReached && (
            <div
              className={`mx-3 mb-2 px-3 py-2 text-xs rounded-lg ${
                warmStyles
                  ? 'text-warm-600 dark:text-warm-300 bg-warm-200/50 dark:bg-warm-700/50'
                  : 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50'
              }`}
            >
              {t.maxListsReached || 'Maximum lists reached (5)'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default StockListSelector;
