import { useState, useEffect } from 'react';
import { ThemeToggle } from './components/ThemeToggle';
import { SearchBar } from './components/SearchBar';
import { CommandSection } from './components/CommandSection';
import { SecurityStatus } from './components/SecurityStatus';
import { BlockedCommandsInfo } from './components/BlockedCommandsInfo';
import { Terminal } from './components/Terminal';
import { commandSections } from './data/commands';
import { useSearch } from './hooks/useSearch';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Command } from './types';
import { Book, Terminal as TerminalIcon } from 'lucide-react';

function App() {
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('linuxhandbook-darkmode', false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useLocalStorage<string[]>('linuxhandbook-favorites', []);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [prefilledCommand, setPrefilledCommand] = useState<string>('');

  const favoriteSet = new Set(favorites);
  const filteredSections = useSearch({ sections: commandSections, query: searchQuery });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleToggleFavorite = (id: string) => {
    setFavorites(
      favorites.includes(id)
        ? favorites.filter(f => f !== id)
        : [...favorites, id]
    );
  };

  const handleCopyCommand = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied:', text);
    }).catch(err => {
      console.error('Copy failed:', err);
    });
  };

  const handleTryCommand = (command: Command) => {
    setPrefilledCommand(command.example);
    setIsTerminalOpen(true);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Book className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Linux Command Handbook</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Learn and practice Linux commands safely
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isTerminalOpen
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  title="Toggle terminal"
                >
                  <TerminalIcon size={18} />
                  <span className="text-sm hidden sm:inline">Terminal</span>
                </button>
                <ThemeToggle isDark={darkMode} onToggle={() => setDarkMode(!darkMode)} />
              </div>
            </div>

            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search commands by name, description, or example..."
            />

            {/* Phase 4: Security Status Monitor */}
            <div className="mt-4">
              <SecurityStatus className="w-full" />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {filteredSections.length === 0 && searchQuery ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600 dark:text-gray-400">
                No commands found matching "<strong>{searchQuery}</strong>"
              </p>
            </div>
          ) : (
            <>
              {filteredSections.map(section => (
                <CommandSection
                  key={section.id}
                  id={section.id}
                  title={section.title}
                  commands={section.commands}
                  onTryCommand={handleTryCommand}
                  onCopyCommand={handleCopyCommand}
                  onFavorite={handleToggleFavorite}
                  favorites={favoriteSet}
                />
              ))}

              {!searchQuery && <BlockedCommandsInfo />}
            </>
          )}
        </main>

        {/* Terminal Component */}
        <Terminal
          isOpen={isTerminalOpen}
          onClose={() => setIsTerminalOpen(false)}
          prefilledCommand={prefilledCommand}
        />

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-center py-6 mt-12">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Phase 1 & 3: UI, Search, Copy, Terminal + Command Interception
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
