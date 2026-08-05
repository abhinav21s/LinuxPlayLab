import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { securityService, SecurityMetrics } from '../services/securityHardening';

interface SecurityStatusProps {
  className?: string;
}

export const SecurityStatus: React.FC<SecurityStatusProps> = ({ className = '' }) => {
  const [metrics, setMetrics] = useState<SecurityMetrics>(securityService.getMetrics());
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Update metrics every second
    const interval = setInterval(() => {
      setMetrics(securityService.getMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const memPercent = securityService.getMemoryUsagePercent();
  const diskPercent = securityService.getDiskUsagePercent();
  const status = securityService.getSecurityStatus();

  const getStatusColor = () => {
    if (status.status === 'healthy') return 'text-green-500';
    if (status.status === 'warning') return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusIcon = () => {
    if (status.status === 'healthy') return <CheckCircle size={16} />;
    if (status.status === 'warning') return <AlertTriangle size={16} />;
    return <AlertCircle size={16} />;
  };

  return (
    <div className={`${className}`}>
      {/* Collapsed View */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-mono transition-all ${
          status.status === 'healthy'
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            : status.status === 'warning'
              ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
        }`}
      >
        <span className={getStatusColor()}>{getStatusIcon()}</span>
        <span className="text-xs">{status.message}</span>
        <span className="text-xs opacity-60">({metrics.commandsThisMinute}/10 cmds)</span>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-mono space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {/* Rate Limiting */}
            <div className="bg-white dark:bg-gray-900 p-2 rounded">
              <div className="text-gray-600 dark:text-gray-400 mb-1">📊 Commands</div>
              <div className="flex justify-between items-center mb-1">
                <span>Per Minute</span>
                <span className={metrics.commandsThisMinute > 8 ? 'text-orange-600 dark:text-orange-400 font-bold' : ''}>
                  {metrics.commandsThisMinute}/10
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    metrics.commandsThisMinute > 8 ? 'bg-orange-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((metrics.commandsThisMinute / 10) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-gray-500 dark:text-gray-400 text-xs mt-1">
                <span>Per Hour</span>
                <span>{metrics.commandsThisHour}/60</span>
              </div>
            </div>

            {/* Memory Usage */}
            <div className="bg-white dark:bg-gray-900 p-2 rounded">
              <div className="text-gray-600 dark:text-gray-400 mb-1">💾 Memory</div>
              <div className="flex justify-between items-center mb-1">
                <span>Used</span>
                <span className={memPercent > 80 ? 'text-orange-600 dark:text-orange-400 font-bold' : ''}>
                  {metrics.memoryUsedMb}MB / 256MB
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    memPercent > 80 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(memPercent, 100)}%` }}
                />
              </div>
            </div>

            {/* Disk Usage */}
            <div className="bg-white dark:bg-gray-900 p-2 rounded">
              <div className="text-gray-600 dark:text-gray-400 mb-1">💿 Disk</div>
              <div className="flex justify-between items-center mb-1">
                <span>Used</span>
                <span className={diskPercent > 80 ? 'text-orange-600 dark:text-orange-400 font-bold' : ''}>
                  {metrics.diskUsedMb}MB / 100MB
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    diskPercent > 80 ? 'bg-orange-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${Math.min(diskPercent, 100)}%` }}
                />
              </div>
            </div>

            {/* Blocked Attempts */}
            <div className="bg-white dark:bg-gray-900 p-2 rounded">
              <div className="text-gray-600 dark:text-gray-400 mb-1">🚫 Security</div>
              <div className="flex justify-between items-center">
                <span>Blocked</span>
                <span className={metrics.totalBlockedAttempts > 10 ? 'text-orange-600 dark:text-orange-400 font-bold' : ''}>
                  {metrics.totalBlockedAttempts}
                </span>
              </div>
            </div>
          </div>

          {/* Status Details */}
          {status.details.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              {status.details.map((detail, idx) => (
                <div key={idx} className="text-gray-600 dark:text-gray-400">
                  {detail}
                </div>
              ))}
            </div>
          )}

          {/* Command Timeout */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 text-gray-600 dark:text-gray-400">
            <div>⏱️ Command Timeout: {securityService.getCommandTimeout() / 1000}s</div>
          </div>
        </div>
      )}
    </div>
  );
};
