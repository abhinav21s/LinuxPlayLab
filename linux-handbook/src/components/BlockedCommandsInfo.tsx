import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { blockedCommandsList, getBlockedCommandsByCategory } from '../data/blockedCommands';

export const BlockedCommandsInfo: React.FC = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const categories = Array.from(new Set(blockedCommandsList.map((cmd) => cmd.category)));

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="mt-8 border border-yellow-200 dark:border-yellow-900/50 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-6">
      <div className="flex items-start gap-3 mb-4">
        <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-200">
            Blocked Commands (Security Sandbox)
          </h3>
          <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
            Some commands are blocked to keep the sandbox safe. Click to see details.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {categories.map((category) => {
          const isExpanded = expandedCategories.has(category);
          const commands = getBlockedCommandsByCategory(category);

          return (
            <div key={category} className="border border-yellow-200 dark:border-yellow-900/30 rounded">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition-colors text-left"
              >
                <div>
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-200">
                    {category}
                  </h4>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">
                    {commands.length} command{commands.length !== 1 ? 's' : ''} blocked
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronUp className="text-yellow-600 dark:text-yellow-400" size={20} />
                ) : (
                  <ChevronDown className="text-yellow-600 dark:text-yellow-400" size={20} />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-yellow-200 dark:border-yellow-900/30 px-4 py-3 space-y-2">
                  {commands.map((cmd) => (
                    <div key={cmd.command} className="py-2 border-b border-yellow-100 dark:border-yellow-900/20 last:border-b-0">
                      <p className="font-mono text-sm font-semibold text-yellow-900 dark:text-yellow-200">
                        {cmd.command}
                      </p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                        {cmd.reason}
                      </p>
                      {cmd.alternatives && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                          <span className="font-medium">Alternative:</span> {cmd.alternatives}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
