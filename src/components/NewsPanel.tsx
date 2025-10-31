import { X, ExternalLink, Clock, Building2 } from 'lucide-react';
import { useTranslation, type Language } from '../i18n/translations';

export interface NewsItem {
  title: string;
  publisher: string;
  link: string;
  published_date: string;
  thumbnail?: string;
}

interface NewsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  news: NewsItem[];
  loading?: boolean;
  language: Language;
}

const NewsPanel = ({ isOpen, onClose, symbol, news, loading, language }: NewsPanelProps) => {
  const t = useTranslation(language);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white">
          <div>
            <h2 className="text-2xl font-bold">{symbol}</h2>
            <p className="text-blue-100 dark:text-blue-200 text-sm">{t.latestNews}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-88px)] p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-lg">{t.noNewsAvailableFor} {symbol}</p>
              <p className="text-sm mt-2">{t.tryCheckingLater}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {news.map((item, index) => (
                <article
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-750"
                >
                  {/* Thumbnail */}
                  {item.thumbnail && (
                    <div className="mb-3 rounded-lg overflow-hidden">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-40 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {item.title}
                  </h3>

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Building2 size={14} />
                      <span>{item.publisher}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{item.published_date}</span>
                    </div>
                  </div>

                  {/* Read More Link */}
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                  >
                    {t.readFullArticle}
                    <ExternalLink size={14} />
                  </a>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NewsPanel;
