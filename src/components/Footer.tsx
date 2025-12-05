import { Github } from 'lucide-react';
import { useTranslation } from '../i18n/translations';
import { useApp } from '../contexts/AppContext';

const Footer = () => {
  // Use Context
  const { language } = useApp();
  const t = useTranslation(language);
  return (
    <footer className="bg-warm-100 dark:bg-warm-800 border-t border-warm-200 dark:border-warm-700 transition-colors mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-warm-600 dark:text-warm-400">
          {/* Left: App Name & Copyright */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-warm-700 dark:text-warm-300">MarketVue</span>
            <span>© 2025</span>
          </div>

          {/* Center: Made by */}
          <div className="flex items-center gap-2">
            <span>{t.madeBy}</span>
            <a
              href="https://github.com/clementtang"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-primary dark:text-accent-secondary hover:text-accent-hover dark:hover:text-accent-hover font-medium"
            >
              @clementtang
            </a>
          </div>

          {/* Right: GitHub Link */}
          <a
            href="https://github.com/clementtang/marketvue"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-warm-700 dark:text-warm-300 hover:text-accent-primary dark:hover:text-accent-secondary transition-colors"
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
