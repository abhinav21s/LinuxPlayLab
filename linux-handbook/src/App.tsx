import { useState, useEffect } from 'react';
import { ThemeToggle } from './components/ThemeToggle';
import { SearchBar } from './components/SearchBar';
import { CommandSection } from './components/CommandSection';
import { SecurityStatus } from './components/SecurityStatus';
import { Terminal } from './components/Terminal';
import { commandSections } from './data/commands';
import { useSearch } from './hooks/useSearch';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Command } from './types';
import { Book, Terminal as TerminalIcon, Search } from 'lucide-react';

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
        <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Book className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Linux Command Handbook
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Learn and practice Linux commands in a safe sandbox environment
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    isTerminalOpen
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  title="Toggle terminal"
                >
                  <TerminalIcon size={18} />
                  <span className="hidden sm:inline">Terminal</span>
                </button>
                <ThemeToggle isDark={darkMode} onToggle={() => setDarkMode(!darkMode)} />
              </div>
            </div>

            {/* Search Bar */}
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
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {filteredSections.length === 0 && searchQuery ? (
            <div className="text-center py-16">
              <Search className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-lg text-gray-600 dark:text-gray-400">
                No commands found matching <strong className="text-gray-900 dark:text-gray-100">"{searchQuery}"</strong>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Try searching for a different command name, description, or example
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
        <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-center py-8 mt-16">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            🔒 Phase 1-6 Complete: UI • Search • Dark Mode • Secure WebVM • Command Blocking • Security Hardening • Themes • Testing
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
