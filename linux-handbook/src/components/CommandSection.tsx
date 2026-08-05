import React from 'react';
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
  return (
    <div className="mb-12">
      {/* Section Header - Always visible, not clickable */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            {id}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            {commands.length} commands
          </span>
        </div>
        <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-transparent rounded-full"></div>
      </div>

      {/* Commands Grid - Always displayed */}
      <div className="grid gap-4 lg:grid-cols-2">
        {commands.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8 col-span-full">
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
  );
};
