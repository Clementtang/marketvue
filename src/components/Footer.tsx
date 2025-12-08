import { Github } from 'lucide-react';
import { useTranslation } from '../i18n/translations';
import { useApp } from '../contexts/AppContext';
import { useVisualTheme } from '../contexts/VisualThemeContext';

const Footer = () => {
  // Use Context
  const { language } = useApp();
  const { visualTheme } = useVisualTheme();
  const t = useTranslation(language);
  return (
    <footer className={`border-t transition-colors mt-auto ${
      visualTheme === 'warm'
        ? 'bg-warm-100/80 dark:bg-warm-800/80 border-warm-200/50 dark:border-warm-700/50'
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }`}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
          {/* Left: App Name & Copyright */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700 dark:text-gray-300">MarketVue</span>
            <span>© 2025</span>
          </div>

          {/* Center: Made by */}
          <div className="flex items-center gap-2">
            <span>{t.madeBy}</span>
            <a
              href="https://github.com/clementtang"
              target="_blank"
              rel="noopener noreferrer"
              className={`font-medium cursor-pointer ${
                visualTheme === 'warm'
                  ? 'text-warm-accent-600 dark:text-warm-accent-400 hover:text-warm-accent-700 dark:hover:text-warm-accent-300'
                  : 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
              }`}
            >
              @clementtang
            </a>
          </div>

          {/* Right: GitHub Link */}
          <a
            href="https://github.com/clementtang/marketvue"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer ${
              visualTheme === 'warm'
                ? 'hover:text-warm-accent-600 dark:hover:text-warm-accent-400'
                : 'hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <Github size={18} />
            <span>{t.viewOnGitHub}</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
