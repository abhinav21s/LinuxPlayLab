import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { CommandCard } from './CommandCard';
import { Command } from '../types';

interface CommandSectionProps {
  id: number;
  title: string;
  commands: Command[];
  onTryCommand?: (command: Command) => void;
  onCopyCommand?: (text: string) => void;
  onFavorite?: (id: string) => void;
  favorites?: Set<string>;
}

export const CommandSection: React.FC<CommandSectionProps> = ({
  id,
  title,
  commands,
  onTryCommand,
  onCopyCommand,
  onFavorite,
  favorites = new Set(),
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-6 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold bg-white/20 px-2.5 py-0.5 rounded">
            {id}
          </span>
          <h2 className="text-xl font-semibold">{title}</h2>
          <span className="text-sm bg-white/20 px-2.5 py-0.5 rounded">
            {commands.length} commands
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp size={24} />
        ) : (
          <ChevronDown size={24} />
        )}
      </button>

      {isExpanded && (
        <div className="p-6 bg-gray-50 dark:bg-gray-900">
          <div className="grid gap-4">
            {commands.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No commands in this section.
              </p>
            ) : (
              commands.map((cmd) => (
                <CommandCard
                  key={cmd.id}
                  command={cmd}
                  onTry={onTryCommand}
                  onCopy={onCopyCommand}
                  onFavorite={onFavorite}
                  isFavorited={favorites.has(cmd.id)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
