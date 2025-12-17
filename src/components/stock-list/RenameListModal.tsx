/**
 * Rename List Modal Component
 */

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useVisualTheme } from '../../contexts/VisualThemeContext';
import { useTranslation } from '../../i18n/translations';
import { STOCK_LIST_CONFIG } from '../../config/constants';
import type { StockList } from '../../types/stockList';

interface RenameListModalProps {
  isOpen: boolean;
  list: StockList | null;
  onClose: () => void;
  onConfirm: (id: string, name: string) => void;
}

export function RenameListModal({ isOpen, list, onClose, onConfirm }: RenameListModalProps) {
  const { language } = useApp();
  const { visualTheme } = useVisualTheme();
  const t = useTranslation(language);

  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const warmStyles = visualTheme === 'warm';

  // Initialize name when modal opens
  useEffect(() => {
    if (isOpen && list) {
      setName(list.name);
      setError('');
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen, list]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!list) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(t.listNameRequired || 'List name is required');
      return;
    }

    if (trimmedName.length > STOCK_LIST_CONFIG.MAX_LIST_NAME_LENGTH) {
      setError(
        t.listNameTooLong ||
          `Name must be ${STOCK_LIST_CONFIG.MAX_LIST_NAME_LENGTH} characters or less`
      );
      return;
    }

    onConfirm(list.id, trimmedName);
    onClose();
  };

  if (!isOpen || !list) return null;

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
          <h3
            className={`text-lg font-semibold ${
              warmStyles
                ? 'text-warm-800 dark:text-warm-100 font-serif'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {t.renameList || 'Rename List'}
          </h3>
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

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="rename-list-name"
              className={`block text-sm font-medium mb-2 ${
                warmStyles
                  ? 'text-warm-700 dark:text-warm-300'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {t.listName || 'List Name'}
            </label>
            <input
              ref={inputRef}
              id="rename-list-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder={t.listNamePlaceholder || 'Enter list name...'}
              maxLength={STOCK_LIST_CONFIG.MAX_LIST_NAME_LENGTH}
              className={`w-full px-4 py-2 border outline-none transition-colors ${
                warmStyles
                  ? 'bg-white dark:bg-warm-700 border-warm-300 dark:border-warm-600 text-warm-800 dark:text-warm-100 rounded-xl focus:ring-2 focus:ring-warm-accent-500'
                  : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500'
              }`}
            />
            {error && <p className="mt-2 text-sm text-red-500 dark:text-red-400">{error}</p>}
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
              type="submit"
              className={`px-4 py-2 text-sm font-medium text-white transition-colors ${
                warmStyles
                  ? 'bg-warm-accent-500 hover:bg-warm-accent-600 dark:bg-warm-accent-600 dark:hover:bg-warm-accent-700 rounded-xl'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg'
              }`}
            >
              {t.save || 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RenameListModal;
