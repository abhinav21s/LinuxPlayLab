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
  // All commands display the same - no visual distinction for blocked
  return (
    <div className="group p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg dark:hover:shadow-lg dark:shadow-black/40 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-mono text-base font-semibold text-gray-900 dark:text-gray-100">
            {command.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {command.description}
          </p>
        </div>
        <div className="flex gap-1.5 ml-2 flex-shrink-0">
          {onCopy && (
            <button
              onClick={() => onCopy(command.example)}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              title="Copy command"
            >
              <Copy size={16} className="text-gray-600 dark:text-gray-400" />
            </button>
          )}
          {onFavorite && (
            <button
              onClick={() => onFavorite(command.id)}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              title={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart
                size={16}
                className={isFavorited ? "fill-blue-500 text-blue-500" : "text-gray-400"}
              />
            </button>
          )}
        </div>
      </div>

      <div className="mb-3 p-2.5 bg-gray-100 dark:bg-gray-900 rounded font-mono text-xs text-gray-800 dark:text-gray-300 break-all">
        {command.example}
      </div>

      {onTry && (
        <button
          onClick={() => onTry(command)}
          className="w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <Zap size={14} />
          Try it
        </button>
      )}
    </div>
  );
};
