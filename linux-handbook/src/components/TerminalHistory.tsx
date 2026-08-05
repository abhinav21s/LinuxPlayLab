import React, { useState, useEffect } from 'react';
import { Clock, Star, Trash2, Download } from 'lucide-react';
import { commandHistoryService } from '../services/commandHistory';

interface TerminalHistoryProps {
  onSelectCommand: (command: string) => void;
  isOpen: boolean;
  refreshTrigger?: number;
}

export const TerminalHistory: React.FC<TerminalHistoryProps> = ({
  onSelectCommand,
  isOpen,
  refreshTrigger = 0,
}) => {
  const [tab, setTab] = useState<'recent' | 'favorites' | 'stats'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [, setRefresh] = useState(0);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    setRefresh((prev) => prev + 1);
  }, [refreshTrigger]);

  const getDisplayItems = () => {
    if (searchQuery) {
      return commandHistoryService.searchHistory(searchQuery);
    }

    switch (tab) {
      case 'favorites':
        return commandHistoryService.getFavoriteCommands();
      case 'stats':
        return [];
      default:
        return commandHistoryService.getRecentCommands(20);
    }
  };

  const stats = commandHistoryService.getStatistics();
  const items = getDisplayItems();

  const handleExport = () => {
    const data = commandHistoryService.exportHistory();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `command-history-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm('Clear all command history? This cannot be undone.')) {
      commandHistoryService.clearHistory();
      setSearchQuery('');
      setRefresh((prev) => prev + 1);
    }
  };

  const handleToggleFavorite = (command: string, e: React.MouseEvent) => {
    e.stopPropagation();
    commandHistoryService.toggleFavorite(command);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 w-80 h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-lg flex flex-col z-40">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={18} className="text-blue-500" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Command History
          </h2>
        </div>

        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search commands..."
          className="w-full px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 outline-none focus:border-blue-500"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <button
          onClick={() => setTab('recent')}
          className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
            tab === 'recent'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Recent
        </button>
        <button
          onClick={() => setTab('favorites')}
          className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
            tab === 'favorites'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Favorites
        </button>
        <button
          onClick={() => setTab('stats')}
          className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
            tab === 'stats'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Stats
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {tab === 'stats' ? (
          <div className="p-4 space-y-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Commands
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalCommands}
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Unique Commands
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.uniqueCommands}
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Favorite Count
              </div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.favoriteCount}
              </div>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p className="text-sm">
              {tab === 'favorites' ? 'No favorites yet' : 'No history'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {items.map((entry) => (
              <button
                key={entry.id}
                onClick={() => onSelectCommand(entry.command)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-start gap-2 group"
              >
                <div className="flex-1 min-w-0">
                  <code className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                    {entry.command}
                  </code>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <button
                  onClick={(e) => handleToggleFavorite(entry.command, e)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Star
                    size={14}
                    className={
                      entry.isFavorite
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-400 hover:text-yellow-400'
                    }
                  />
                </button>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex gap-2">
        <button
          onClick={handleExport}
          title="Export history as JSON"
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
        >
          <Download size={14} />
          Export
        </button>
        <button
          onClick={handleClear}
          title="Clear all history"
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
        >
          <Trash2 size={14} />
          Clear
        </button>
      </div>
    </div>
  );
};
