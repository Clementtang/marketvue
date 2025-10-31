import { Palette } from 'lucide-react';

export interface ColorTheme {
  up: string;
  down: string;
  name: string;
}

export const COLOR_THEMES: ColorTheme[] = [
  { name: 'Asian (Red Up / Green Down)', up: '#dc2626', down: '#16a34a' },
  { name: 'Western (Green Up / Red Down)', up: '#16a34a', down: '#dc2626' },
];

interface ColorThemeSelectorProps {
  currentTheme: ColorTheme;
  onThemeChange: (theme: ColorTheme) => void;
}

const ColorThemeSelector = ({ currentTheme, onThemeChange }: ColorThemeSelectorProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Palette size={20} className="text-gray-700" />
        <h2 className="text-lg font-semibold text-gray-800">Color Theme</h2>
      </div>

      <div className="flex gap-3">
        {COLOR_THEMES.map((theme) => (
          <button
            key={theme.name}
            onClick={() => onThemeChange(theme)}
            className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
              currentTheme.name === theme.name
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="text-sm font-medium text-gray-800 mb-2">{theme.name}</div>
            <div className="flex gap-2 justify-center">
              <div className="flex items-center gap-1">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: theme.up }}
                />
                <span className="text-xs text-gray-600">Up</span>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: theme.down }}
                />
                <span className="text-xs text-gray-600">Down</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorThemeSelector;
