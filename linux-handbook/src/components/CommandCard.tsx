import React from 'react';
import { Copy, Heart, Zap } from 'lucide-react';
import { Command } from '../types';

interface CommandCardProps {
  command: Command;
  onTry?: (command: Command) => void;
  onCopy?: (text: string) => void;
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
}

export const CommandCard: React.FC<CommandCardProps> = ({
  command,
  onTry,
  onCopy,
  onFavorite,
  isFavorited,
}) => {
  if (command.isBlocked) {
    return (
      <div className="p-4 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-mono text-lg font-semibold text-red-700 dark:text-red-400">
              {command.name}
            </h3>
            <p className="text-sm text-red-600 dark:text-red-300 mt-1">
              ⚠️ {command.blockReason || "This command is blocked for security reasons."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md dark:hover:shadow-lg dark:shadow-black/30 transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-mono text-lg font-semibold text-gray-900 dark:text-gray-100">
            {command.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {command.description}
          </p>
        </div>
        <div className="flex gap-2 ml-4">
          {onFavorite && (
            <button
              onClick={() => onFavorite(command.id)}
              className={`p-2 rounded-lg transition-colors ${
                isFavorited
                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
              title={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart size={18} fill={isFavorited ? "currentColor" : "none"} />
            </button>
          )}
        </div>
      </div>

      <div className="bg-gray-900 dark:bg-gray-950 rounded p-3 mb-3 font-mono text-sm text-green-400 overflow-x-auto">
        <code>{command.example}</code>
      </div>

      <div className="flex gap-2">
        {onCopy && (
          <button
            onClick={() => {
              onCopy(command.example);
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded text-sm transition-colors"
            title="Copy command to clipboard"
          >
            <Copy size={16} />
            Copy
          </button>
        )}
        {onTry && (
          <button
            onClick={() => {
              onTry(command);
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
            title="Try this command in the sandbox"
          >
            <Zap size={16} />
            Try it
          </button>
        )}
      </div>
    </div>
  );
};
