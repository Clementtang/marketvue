import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useTranslation, type Language } from '../i18n/translations';

interface StockManagerProps {
  stocks: string[];
  onAddStock: (symbol: string) => void;
  onRemoveStock: (symbol: string) => void;
  language: Language;
}

const StockManager = ({ stocks, onAddStock, onRemoveStock, language }: StockManagerProps) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const t = useTranslation(language);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const symbol = inputValue.trim().toUpperCase();

    if (!symbol) {
      setError(t.pleaseEnterSymbol);
      return;
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors h-full">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{t.stockManager}</h2>

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
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
            maxLength={10}
          />
          <button
            type="submit"
            disabled={stocks.length >= 18}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
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
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.trackedStocks}</h3>
          <div className="flex flex-wrap gap-2">
            {stocks.map((symbol) => (
              <div
                key={symbol}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-700 transition-colors"
              >
                <span className="font-medium">{symbol}</span>
                <button
                  onClick={() => onRemoveStock(symbol)}
                  className="hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded-full p-0.5 transition-colors"
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
