import { memo, useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { useTransition, animated } from "@react-spring/web";
import { useApp } from "../../contexts/AppContext";
import { useVisualTheme } from "../../contexts/VisualThemeContext";
import { useTranslation } from "../../i18n/translations";
import { useNewsData } from "../../hooks/useNewsData";
import { shouldReduceMotion } from "../../utils/animations";
import NewsPanelHeader from "./NewsPanelHeader";
import NewsCard from "./NewsCard";
import NewsCardSkeletonList from "./NewsCardSkeleton";
import NewsEmptyState from "./NewsEmptyState";

interface NewsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}

const NewsPanel = memo(function NewsPanel({
  isOpen,
  onClose,
  symbol,
}: NewsPanelProps) {
  const { language } = useApp();
  const { visualTheme } = useVisualTheme();
  const t = useTranslation(language);
  const isMobile = useIsMobile();
  const immediate = shouldReduceMotion();

  const { news, isLoading, error, refetch } = useNewsData({
    symbol,
    enabled: isOpen,
  });

  // ESC key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  // Panel slide transition
  const panelTransitions = useTransition(isOpen, {
    from: isMobile
      ? { transform: "translateY(100%)" }
      : { transform: "translateX(100%)" },
    enter: isMobile
      ? { transform: "translateY(0%)" }
      : { transform: "translateX(0%)" },
    leave: isMobile
      ? { transform: "translateY(100%)" }
      : { transform: "translateX(100%)" },
    config: { tension: 280, friction: 30 },
    immediate,
  });

  // Backdrop transition
  const backdropTransitions = useTransition(isOpen, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { tension: 280, friction: 30 },
    immediate,
  });

  const panelBg =
    visualTheme === "warm"
      ? "bg-warm-50 dark:bg-warm-900"
      : "bg-white dark:bg-gray-900";

  const panelContent = (
    <>
      {backdropTransitions((style, item) =>
        item ? (
          <animated.div
            style={style}
            className="fixed inset-0 z-40 bg-black/30 dark:bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />
        ) : null,
      )}
      {panelTransitions((style, item) =>
        item ? (
          <animated.div
            style={style}
            className={`fixed z-50 flex flex-col shadow-2xl ${panelBg} ${
              isMobile
                ? "inset-0"
                : "top-0 right-0 bottom-0 w-[420px] border-l " +
                  (visualTheme === "warm"
                    ? "border-warm-200/50 dark:border-warm-700/50"
                    : "border-gray-200 dark:border-gray-700")
            }`}
            role="dialog"
            aria-modal="true"
            aria-label={t.newsFor.replace("{symbol}", symbol)}
          >
            <NewsPanelHeader
              symbol={symbol}
              t={t}
              onClose={onClose}
              isMobile={isMobile}
            />

            <div className="flex-1 overflow-y-auto">
              {isLoading && news.length === 0 ? (
                <NewsCardSkeletonList />
              ) : error && news.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <p
                    className={`text-sm ${
                      visualTheme === "warm"
                        ? "text-warm-600 dark:text-warm-300"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {t.newsLoadError}
                  </p>
                  <button
                    onClick={() => refetch()}
                    className={`mt-3 px-4 py-2 text-sm font-medium text-white transition-colors ${
                      visualTheme === "warm"
                        ? "bg-warm-accent-500 hover:bg-warm-accent-600 dark:bg-warm-accent-600 dark:hover:bg-warm-accent-700 rounded-2xl"
                        : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 rounded-lg"
                    }`}
                  >
                    {t.newsRetry}
                  </button>
                </div>
              ) : news.length === 0 ? (
                <NewsEmptyState symbol={symbol} t={t} />
              ) : (
                <>
                  {news.map((article) => (
                    <NewsCard
                      key={article.id}
                      article={article}
                      language={language}
                      t={t}
                    />
                  ))}
                </>
              )}
            </div>
          </animated.div>
        ) : null,
      )}
    </>
  );

  return createPortal(panelContent, document.body);
});

export default NewsPanel;
