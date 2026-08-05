import React from 'react';
import { Palette } from 'lucide-react';
import { terminalThemesService } from '../services/terminalThemes';

interface TerminalThemeSelectorProps {
  onThemeChange: (themeId: string) => void;
  currentThemeId: string;
}

export const TerminalThemeSelector: React.FC<TerminalThemeSelectorProps> = ({
  onThemeChange,
  currentThemeId,
}) => {
  const themes = terminalThemesService.getThemes();

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <Palette size={16} className="text-gray-600 dark:text-gray-400" />
      <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
        Theme:
      </label>
      <select
        value={currentThemeId}
        onChange={(e) => onThemeChange(e.target.value)}
        className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-pointer outline-none focus:border-blue-500"
      >
        {themes.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.name}
          </option>
        ))}
      </select>

      {/* Theme preview swatches */}
      <div className="flex gap-1 ml-auto">
        {themes.slice(0, 3).map((theme) => (
          <button
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            title={theme.name}
            className={`w-6 h-6 rounded border-2 transition-all ${
              currentThemeId === theme.id
                ? 'border-blue-500 scale-110'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
            style={{
              background: theme.background,
              boxShadow: `0 0 0 2px ${theme.background}`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
