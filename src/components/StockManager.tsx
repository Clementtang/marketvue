import { useState } from 'react';
import { X, Copy, ClipboardPaste } from 'lucide-react';
import { useTranslation } from '../i18n/translations';
import { useApp } from '../contexts/AppContext';
import { useVisualTheme } from '../contexts/VisualThemeContext';
import { useToast } from '../contexts/ToastContext';
import { useStockList } from '../contexts/StockListContext';
import { logger } from '../utils/logger';
import {
  StockListSelector,
  CreateListModal,
  RenameListModal,
  DeleteListConfirm,
} from './stock-list';
import { StockSearchInput } from './StockSearchInput';
import type { StockList } from '../types/stockList';
import { STOCK_LIST_CONFIG } from '../config/constants';

interface StockManagerProps {
  stocks: string[];
  onAddStock: (symbol: string) => void;
  onRemoveStock: (symbol: string) => void;
}

const StockManager = ({ stocks, onAddStock, onRemoveStock }: StockManagerProps) => {
  // Use Context
  const { language } = useApp();
  const { visualTheme } = useVisualTheme();
  const t = useTranslation(language);
  const { showToast } = useToast();
  const { isStockLimitReached, actions } = useStockList();

  const [error, setError] = useState('');

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalMode, setCreateModalMode] = useState<'create' | 'copy'>('create');
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<StockList | null>(null);

  // List management handlers
  const handleCreateNew = () => {
    setCreateModalMode('create');
    setCreateModalOpen(true);
  };

  const handleSaveAsCopy = () => {
    setCreateModalMode('copy');
    setCreateModalOpen(true);
  };

  const handleRename = (list: StockList) => {
    setSelectedList(list);
    setRenameModalOpen(true);
  };

  const handleDelete = (list: StockList) => {
    setSelectedList(list);
    setDeleteConfirmOpen(true);
  };

  const handleCreateConfirm = (name: string) => {
    if (createModalMode === 'create') {
      const success = actions.createList(name);
      if (success) {
        showToast('success', t.listCreated || 'List created');
      }
    } else {
      const success = actions.saveCurrentAsNew(name);
      if (success) {
        showToast('success', t.listCreated || 'List created');
      }
    }
  };

  const handleRenameConfirm = (id: string, name: string) => {
    const success = actions.renameList(id, name);
    if (success) {
      showToast('success', t.listRenamed || 'List renamed');
    }
  };

  const handleDeleteConfirm = (id: string) => {
    const success = actions.deleteList(id);
    if (success) {
      showToast('success', t.listDeleted || 'List deleted');
    }
  };

  const handleAddStock = (symbol: string) => {
    // Convert .JP to .T for Japanese stocks (yfinance requirement)
    let processedSymbol = symbol;
    if (processedSymbol.endsWith('.JP')) {
      processedSymbol = processedSymbol.replace(/\.JP$/, '.T');
    }

    if (stocks.length >= STOCK_LIST_CONFIG.MAX_STOCKS_PER_LIST) {
      setError(t.maxStocksReached);
      return;
    }

    if (stocks.includes(processedSymbol)) {
      setError(t.stockAlreadyAdded);
      return;
    }

    onAddStock(processedSymbol);
    setError('');
  };

  // Export stocks to clipboard
  const handleExportToClipboard = async () => {
    if (stocks.length === 0) {
      showToast('error', t.noStocksToExport || 'No stocks to export');
      return;
    }

    try {
      // Convert .T back to .JP for user-friendly format
      const exportedStocks = stocks.map(symbol =>
        symbol.endsWith('.T') ? symbol.replace(/\.T$/, '.JP') : symbol
      );
      const stockText = exportedStocks.join(', ');
      await navigator.clipboard.writeText(stockText);
      showToast(
        'success',
        `${t.exportedToClipboard || 'Exported to clipboard'}: ${stocks.length} ${t.stocksAdded || 'stocks'}`
      );
    } catch (err) {
      logger.error('Failed to copy to clipboard:', err);
      showToast('error', t.exportFailed || 'Failed to export to clipboard');
    }
  };

  // Import stocks from clipboard
  const handleImportFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        showToast('error', t.clipboardEmpty || 'Clipboard is empty');
        return;
      }

      // Parse comma-separated symbols
      const symbols = text
        .split(',')
        .map(s => s.trim().toUpperCase())
        .filter(s => s.length > 0);

      if (symbols.length === 0) {
        showToast('error', t.noValidSymbols || 'No valid symbols found');
        return;
      }

      let addedCount = 0;
      let skippedCount = 0;

      for (let symbol of symbols) {
        // Convert .JP to .T
        if (symbol.endsWith('.JP')) {
          symbol = symbol.replace(/\.JP$/, '.T');
        }

        // Skip if already added or reached max limit
        if (stocks.includes(symbol)) {
          skippedCount++;
          continue;
        }

        if (stocks.length + addedCount >= STOCK_LIST_CONFIG.MAX_STOCKS_PER_LIST) {
          break;
        }

        onAddStock(symbol);
        addedCount++;
      }

      if (addedCount > 0) {
        showToast(
          'success',
          `${t.importedStocks || 'Imported'}: ${addedCount} ${t.stocksAdded || 'stocks'}` +
          (skippedCount > 0 ? ` (${t.skipped || 'Skipped'}: ${skippedCount})` : '')
        );
      } else {
        showToast(
          'info',
          t.noNewStocks || 'No new stocks to import'
        );
      }
    } catch (err) {
      logger.error('Failed to read clipboard:', err);
      showToast('error', t.importFailed || 'Failed to import from clipboard');
    }
  };

  return (
    <>
      <div className={`shadow-sm p-6 transition-all duration-300 h-full ${
        visualTheme === 'warm'
          ? 'bg-warm-100 dark:bg-warm-800 rounded-3xl border border-warm-200/50 dark:border-warm-700/50'
          : 'bg-white dark:bg-gray-800 rounded-lg'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className={`text-xl font-semibold ${
            visualTheme === 'warm'
              ? 'text-warm-800 dark:text-warm-100 font-serif'
              : 'text-gray-800 dark:text-white'
          }`}>{t.stockManager}</h2>

          {/* Import/Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleExportToClipboard}
              disabled={stocks.length === 0}
              className={`px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm transition-colors ${
                visualTheme === 'warm' ? 'rounded-xl' : 'rounded-lg'
              }`}
              title={t.exportToClipboard || 'Export to clipboard'}
            >
              <Copy size={16} />
              <span className="hidden sm:inline">{t.export || 'Export'}</span>
            </button>
            <button
              onClick={handleImportFromClipboard}
              disabled={isStockLimitReached}
              className={`px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm transition-colors ${
                visualTheme === 'warm' ? 'rounded-xl' : 'rounded-lg'
              }`}
              title={t.importFromClipboard || 'Import from clipboard'}
            >
              <ClipboardPaste size={16} />
              <span className="hidden sm:inline">{t.import || 'Import'}</span>
            </button>
          </div>
        </div>

      {/* Add Stock Search */}
      <div className="mb-4">
        <StockSearchInput
          trackedSymbols={stocks}
          onSelectStock={handleAddStock}
          disabled={isStockLimitReached}
        />
        {error && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-2">{error}</p>
        )}
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          {stocks.length}/{STOCK_LIST_CONFIG.MAX_STOCKS_PER_LIST} {t.stocksAdded}
        </p>
      </div>

        {/* Stock List Section */}
        <div>
          {/* List Selector + Label Row */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <StockListSelector
              onCreateNew={handleCreateNew}
              onSaveAsCopy={handleSaveAsCopy}
              onRename={handleRename}
              onDelete={handleDelete}
            />
            <span className={`text-sm font-medium ${
              visualTheme === 'warm'
                ? 'text-warm-600 dark:text-warm-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {t.trackedStocks}
            </span>
          </div>

          {/* Stock Tags */}
          {stocks.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {stocks.map((symbol) => (
                <div
                  key={symbol}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${
                    visualTheme === 'warm'
                      ? 'bg-warm-accent-50 dark:bg-warm-accent-900/30 text-warm-accent-700 dark:text-warm-accent-300 border-warm-accent-200 dark:border-warm-accent-700'
                      : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700'
                  }`}
                >
                  <span className="font-medium">{symbol}</span>
                  <button
                    onClick={() => onRemoveStock(symbol)}
                    className={`rounded-full p-0.5 transition-colors ${
                      visualTheme === 'warm'
                        ? 'hover:bg-warm-accent-100 dark:hover:bg-warm-accent-800/50'
                        : 'hover:bg-blue-100 dark:hover:bg-blue-800/50'
                    }`}
                    title={`Remove ${symbol}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-6 rounded-xl ${
              visualTheme === 'warm'
                ? 'bg-warm-50/50 dark:bg-warm-900/20 text-warm-500 dark:text-warm-400'
                : 'bg-gray-50 dark:bg-gray-700/30 text-gray-400 dark:text-gray-500'
            }`}>
              <p>{t.noStocksYet}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateListModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onConfirm={handleCreateConfirm}
        mode={createModalMode}
      />

      <RenameListModal
        isOpen={renameModalOpen}
        list={selectedList}
        onClose={() => {
          setRenameModalOpen(false);
          setSelectedList(null);
        }}
        onConfirm={handleRenameConfirm}
      />

      <DeleteListConfirm
        isOpen={deleteConfirmOpen}
        list={selectedList}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setSelectedList(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default StockManager;
