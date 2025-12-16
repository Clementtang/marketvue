import { useState } from 'react';
import { Plus, X, Copy, ClipboardPaste } from 'lucide-react';
import { useTranslation } from '../i18n/translations';
import { useApp } from '../contexts/AppContext';
import { useVisualTheme } from '../contexts/VisualThemeContext';
import { useToast } from '../contexts/ToastContext';
import { logger } from '../utils/logger';

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

  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let symbol = inputValue.trim().toUpperCase();

    if (!symbol) {
      setError(t.pleaseEnterSymbol);
      return;
    }

    // Convert .JP to .T for Japanese stocks (yfinance requirement)
    if (symbol.endsWith('.JP')) {
      symbol = symbol.replace(/\.JP$/, '.T');
    }

    if (stocks.length >= 18) {
      setError(t.maxStocksReached);
      return;
    }

    if (stocks.includes(symbol)) {
      setError(t.stockAlreadyAdded);
      return;
    }

    onAddStock(symbol);
    setInputValue('');
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

        if (stocks.length + addedCount >= 18) {
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
    <div className={`shadow-sm p-6 transition-all duration-300 h-full ${
      visualTheme === 'warm'
        ? 'bg-warm-100 dark:bg-warm-800 rounded-3xl border border-warm-200/50 dark:border-warm-700/50'
        : 'bg-white dark:bg-gray-800 rounded-lg'
    }`}>
      <div className="flex items-center justify-between mb-4">
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
            disabled={stocks.length >= 18}
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

      {/* Add Stock Form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError('');
            }}
            placeholder="TW Listed: 2330.TW | TW OTC: 5904.TWO | US: AAPL | JP: 9983.JP"
            className={`flex-1 px-4 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none transition-colors ${
              visualTheme === 'warm'
                ? 'border-warm-300 dark:border-warm-600 rounded-2xl focus:ring-2 focus:ring-warm-accent-500 focus:border-transparent'
                : 'border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            }`}
            maxLength={10}
          />
          <button
            type="submit"
            disabled={stocks.length >= 18}
            className={`px-4 py-2 text-white disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2 transition-colors ${
              visualTheme === 'warm'
                ? 'bg-warm-accent-500 hover:bg-warm-accent-600 dark:bg-warm-accent-600 dark:hover:bg-warm-accent-700 rounded-2xl'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 rounded-lg'
            }`}
          >
            <Plus size={20} />
            {t.add}
          </button>
        </div>
        {error && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-2">{error}</p>
        )}
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          {stocks.length}/18 {t.stocksAdded}
        </p>
      </form>

      {/* Stock List */}
      {stocks.length > 0 && (
        <div>
          <h3 className={`text-sm font-medium mb-2 ${
            visualTheme === 'warm'
              ? 'text-warm-700 dark:text-warm-300 font-serif'
              : 'text-gray-700 dark:text-gray-300'
          }`}>{t.trackedStocks}</h3>
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
        </div>
      )}

      {stocks.length === 0 && (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500">
          <p>{t.noStocksYet}</p>
        </div>
      )}
    </div>
  );
};

export default StockManager;
