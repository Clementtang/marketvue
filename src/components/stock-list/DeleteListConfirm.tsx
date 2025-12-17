/**
 * Delete List Confirmation Dialog
 */

import { AlertTriangle, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useVisualTheme } from '../../contexts/VisualThemeContext';
import { useTranslation } from '../../i18n/translations';
import type { StockList } from '../../types/stockList';

interface DeleteListConfirmProps {
  isOpen: boolean;
  list: StockList | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export function DeleteListConfirm({ isOpen, list, onClose, onConfirm }: DeleteListConfirmProps) {
  const { language } = useApp();
  const { visualTheme } = useVisualTheme();
  const t = useTranslation(language);

  const warmStyles = visualTheme === 'warm';

  if (!isOpen || !list) return null;

  const handleConfirm = () => {
    onConfirm(list.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md mx-4 p-6 shadow-xl ${
          warmStyles
            ? 'bg-warm-50 dark:bg-warm-800 rounded-3xl'
            : 'bg-white dark:bg-gray-800 rounded-xl'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <h3
              className={`text-lg font-semibold ${
                warmStyles
                  ? 'text-warm-800 dark:text-warm-100 font-serif'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {t.deleteList || 'Delete List'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${
              warmStyles
                ? 'hover:bg-warm-200 dark:hover:bg-warm-700 text-warm-600 dark:text-warm-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p
            className={`mb-2 ${
              warmStyles
                ? 'text-warm-700 dark:text-warm-300'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {(t.deleteListConfirm || 'Are you sure you want to delete "{name}"?').replace(
              '{name}',
              list.name
            )}
          </p>
          <p
            className={`text-sm ${
              warmStyles
                ? 'text-warm-500 dark:text-warm-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {t.deleteListWarning || 'This action cannot be undone.'}
            {list.stocks.length > 0 && (
              <>
                {' '}
                {(t.listContainsStocks || 'This list contains {count} stocks.').replace(
                  '{count}',
                  String(list.stocks.length)
                )}
              </>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              warmStyles
                ? 'bg-warm-200 hover:bg-warm-300 dark:bg-warm-700 dark:hover:bg-warm-600 text-warm-800 dark:text-warm-100 rounded-xl'
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg'
            }`}
          >
            {t.cancel || 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 transition-colors ${
              warmStyles ? 'rounded-xl' : 'rounded-lg'
            }`}
          >
            {t.delete || 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteListConfirm;
