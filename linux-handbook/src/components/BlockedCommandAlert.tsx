import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { InterceptionResult } from '../services/commandInterceptor';

interface BlockedCommandAlertProps {
  result: InterceptionResult;
  onDismiss: () => void;
}

export const BlockedCommandAlert: React.FC<BlockedCommandAlertProps> = ({
  result,
  onDismiss,
}) => {
  if (!result.isBlocked) return null;

  const categoryColors: Record<string, string> = {
    networking: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    services: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    scheduling: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    docker: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    privileged: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  };

  const categoryTextColors: Record<string, string> = {
    networking: 'text-red-700 dark:text-red-300',
    services: 'text-orange-700 dark:text-orange-300',
    scheduling: 'text-yellow-700 dark:text-yellow-300',
    docker: 'text-purple-700 dark:text-purple-300',
    privileged: 'text-red-700 dark:text-red-300',
  };

  const colorClass = categoryColors[result.category || 'networking'] || categoryColors.networking;
  const textColor = categoryTextColors[result.category || 'networking'] || categoryTextColors.networking;

  return (
    <div className={`border rounded-lg p-4 mb-4 ${colorClass}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className={`mt-0.5 flex-shrink-0 ${textColor}`} size={20} />
        <div className="flex-1">
          <p className={`font-semibold ${textColor}`}>{result.message}</p>
          {result.explanation && (
            <p className={`text-sm mt-1 ${textColor.replace('700', '600').replace('300', '400')}`}>
              {result.explanation}
            </p>
          )}
        </div>
        <button
          onClick={onDismiss}
          className={`flex-shrink-0 ${textColor} hover:opacity-75 transition-opacity`}
          title="Dismiss"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
