import { Github } from 'lucide-react';
import type { Translations } from '../i18n/translations';

interface FooterProps {
  t: Translations;
}

const Footer = ({ t }: FooterProps) => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors mt-auto">
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
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              @clementtang
            </a>
          </div>

          {/* Right: GitHub Link */}
          <a
            href="https://github.com/clementtang/marketvue"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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
