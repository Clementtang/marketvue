import { useState, useEffect } from 'react';
import { Info, X } from 'lucide-react';
import type { Translations } from '../i18n/translations';

interface NotificationBannerProps {
  t: Translations;
}

const BANNER_DISMISS_KEY = 'marketvue_banner_dismissed';

const NotificationBanner = ({ t }: NotificationBannerProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed the banner
    const isDismissed = localStorage.getItem(BANNER_DISMISS_KEY) === 'true';
    setIsVisible(!isDismissed);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(BANNER_DISMISS_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-amber-50/80 dark:bg-amber-900/20 border-b border-warm-200 dark:border-warm-700/50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Info size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <p className="text-sm text-warm-800 dark:text-warm-100 truncate md:whitespace-normal">
              {t.freeHostingNotice}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded hover:bg-warm-200 dark:hover:bg-warm-700/30 transition-colors flex-shrink-0"
            aria-label="Close notification"
          >
            <X size={18} className="text-warm-600 dark:text-warm-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;
