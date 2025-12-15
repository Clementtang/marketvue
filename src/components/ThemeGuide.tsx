import { useState } from 'react';
import { useVisualTheme } from '../contexts/VisualThemeContext';
import { useApp } from '../contexts/AppContext';
import {
  ThemeGuideHeader,
  ThemeGuideNavigation,
  ColorsSection,
  TypographySection,
  ComponentsSection,
} from './theme-guide';

interface ThemeGuideProps {
  onClose: () => void;
}

const ThemeGuide = ({ onClose }: ThemeGuideProps) => {
  const { visualTheme } = useVisualTheme();
  const { language } = useApp();
  const [selectedSection, setSelectedSection] = useState<'colors' | 'typography' | 'components'>('colors');

  return (
    <div className={`min-h-screen transition-colors ${
      visualTheme === 'warm'
        ? 'bg-warm-50 dark:bg-warm-900'
        : 'bg-gray-50 dark:bg-gray-900'
    }`}>
      <ThemeGuideHeader
        visualTheme={visualTheme}
        language={language}
        onClose={onClose}
      />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <ThemeGuideNavigation
          visualTheme={visualTheme}
          language={language}
          selectedSection={selectedSection}
          onSectionChange={setSelectedSection}
        />

        {selectedSection === 'colors' && (
          <ColorsSection visualTheme={visualTheme} language={language} />
        )}

        {selectedSection === 'typography' && (
          <TypographySection visualTheme={visualTheme} language={language} />
        )}

        {selectedSection === 'components' && (
          <ComponentsSection visualTheme={visualTheme} language={language} />
        )}
      </main>
    </div>
  );
};

export default ThemeGuide;
