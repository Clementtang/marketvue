import { memo } from "react";
import { useVisualTheme } from "../../contexts/VisualThemeContext";
import type { NewsArticle } from "../../types/news";
import type { Language, Translations } from "../../i18n/translations";

interface NewsCardProps {
  article: NewsArticle;
  language: Language;
  t: Translations;
}

function formatRelativeTime(publishedAt: string, t: Translations): string {
  const now = Date.now();
  const published = new Date(publishedAt).getTime();
  const diffMs = now - published;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return t.justNow;
  if (diffMinutes < 60) return t.minutesAgo.replace("{n}", String(diffMinutes));
  if (diffHours < 24) return t.hoursAgo.replace("{n}", String(diffHours));
  return t.daysAgo.replace("{n}", String(diffDays));
}

const NewsCard = memo(function NewsCard({ article, t }: NewsCardProps) {
  const { visualTheme } = useVisualTheme();

  const relativeTime = formatRelativeTime(article.published_at, t);

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block p-3 transition-colors cursor-pointer ${
        visualTheme === "warm"
          ? "hover:bg-warm-100 dark:hover:bg-warm-700/50 border-b border-warm-200/50 dark:border-warm-700/50"
          : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700"
      }`}
      aria-label={article.headline}
    >
      <div className="flex gap-3">
        {article.image && (
          <img
            src={article.image}
            alt=""
            className={`w-[60px] h-[60px] object-cover flex-shrink-0 ${
              visualTheme === "warm" ? "rounded-xl" : "rounded-lg"
            }`}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        <div className="flex-1 min-w-0">
          <h4
            className={`text-sm font-semibold leading-snug line-clamp-2 ${
              visualTheme === "warm"
                ? "text-warm-800 dark:text-warm-100"
                : "text-gray-800 dark:text-gray-100"
            }`}
          >
            {article.headline}
          </h4>
          <div
            className={`flex items-center gap-1.5 mt-1 text-xs ${
              visualTheme === "warm"
                ? "text-warm-500 dark:text-warm-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            <span>{article.source}</span>
            <span>·</span>
            <span>{relativeTime}</span>
          </div>
          {article.summary && (
            <p
              className={`mt-1.5 text-xs leading-relaxed line-clamp-3 ${
                visualTheme === "warm"
                  ? "text-warm-600 dark:text-warm-300"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {article.summary}
            </p>
          )}
        </div>
      </div>
    </a>
  );
});

export default NewsCard;
