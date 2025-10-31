import { useState, useEffect, useRef } from 'react';
import { Settings, Sun, Moon, Monitor, TrendingUp, X, Languages } from 'lucide-react';
import type { ColorTheme } from './ColorThemeSelector';
import type { Language, Translations } from '../i18n/translations';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeSettingsProps {
  colorTheme: ColorTheme;
  onColorThemeChange: (theme: ColorTheme) => void;
  themeMode: ThemeMode;
  onThemeModeChange: (mode: ThemeMode) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  t: Translations;
}

const COLOR_THEMES = [
  { name: 'Asian', label: 'Red Up / Green Down', up: '#dc2626', down: '#16a34a' },
  { name: 'Western', label: 'Green Up / Red Down', up: '#16a34a', down: '#dc2626' },
];

const LANGUAGES = [
  { code: 'en-US' as Language, name: 'English' },
  { code: 'zh-TW' as Language, name: '繁中' },
];

const ThemeSettings = ({
  colorTheme,
  onColorThemeChange,
  themeMode,
  onThemeModeChange,
  language,
  onLanguageChange,
  t,
}: ThemeSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getThemeIcon = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return <Sun size={18} />;
      case 'dark':
        return <Moon size={18} />;
      case 'system':
        return <Monitor size={18} />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
        title="Settings"
      >
        <Settings size={24} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{t.settings}</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">
            {/* Language Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Languages size={16} />
                {t.language}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => onLanguageChange(lang.code)}
                    className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      language === lang.code
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Mode Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t.appearance}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => onThemeModeChange(mode)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      themeMode === mode
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className={themeMode === mode ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}>
                      {getThemeIcon(mode)}
                    </div>
                    <span className={`text-xs font-medium ${
                      themeMode === mode
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {mode === 'light' ? t.light : mode === 'dark' ? t.dark : t.system}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Theme Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t.priceColorScheme}
              </label>
              <div className="space-y-2">
                {COLOR_THEMES.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => onColorThemeChange(theme)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                      colorTheme.name === theme.name
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className="text-gray-600 dark:text-gray-400" />
                      <div className="text-left">
                        <div className={`text-sm font-medium ${
                          colorTheme.name === theme.name
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {theme.name === 'Asian' ? t.asian : t.western}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {theme.name === 'Asian' ? t.redUpGreenDown : t.greenUpRedDown}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div
                        className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: theme.up }}
                        title="Up"
                      />
                      <div
                        className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: theme.down }}
                        title="Down"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSettings;
