import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, Minimize2, Maximize2, X } from 'lucide-react';
import { getWebVMService } from '../services/webvmService';
import { BlockedCommandAlert } from './BlockedCommandAlert';
import { InterceptionResult } from '../services/commandInterceptor';
import { useCommandInterceptor } from '../hooks/useCommandInterceptor';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledCommand?: string;
  onReset?: () => void;
}

export const Terminal: React.FC<TerminalProps> = ({
  isOpen,
  onClose,
  prefilledCommand,
  onReset,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [blockedAlert, setBlockedAlert] = useState<InterceptionResult | null>(null);
  const { interceptCommand } = useCommandInterceptor({
    onBlocked: (result) => setBlockedAlert(result),
  });

  useEffect(() => {
    if (!isOpen || !terminalRef.current) return;

    const initializeTerminal = async () => {
      try {
        setIsInitializing(true);
        setError(null);

        const vmService = getWebVMService();

        // Initialize if not already done
        if (!vmService.getStatus().initialized) {
          const success = await vmService.initialize({
            networking: false,
            onError: (err) => setError(err),
          });

          if (!success) {
            setError('Failed to initialize WebVM. Using fallback terminal.');
            setIsInitializing(false);
            return;
          }
        }

        // Attach terminal to DOM
        terminalRef.current?.innerHTML = ''; // Clear loading state
        vmService.attachTerminal(terminalRef.current);

        // Intercept pre-filled command
        if (prefilledCommand) {
          const interception = interceptCommand(prefilledCommand);
          
          if (interception.isBlocked) {
            // Don't send blocked command to VM
            vmService.writeToTerminal(`\x1b[31m${interception.message}\x1b[0m\n`);
            if (interception.explanation) {
              vmService.writeToTerminal(`${interception.explanation}\n`);
            }
          } else {
            // Command is allowed, send to terminal
            vmService.writeToTerminal(prefilledCommand + '\n');
          }
        }

        setIsInitializing(false);
      } catch (err) {
        console.error('Terminal initialization error:', err);
        setError(`Terminal error: ${err}`);
        setIsInitializing(false);
      }
    };

    initializeTerminal();

    return () => {
      // Cleanup on unmount
      const vmService = getWebVMService();
      vmService.fitTerminal();
    };
  }, [isOpen, prefilledCommand, interceptCommand]);

  const handleReset = async () => {
    try {
      setIsResetting(true);
      const vmService = getWebVMService();
      const success = await vmService.reset();

      if (success) {
        setError(null);
        onReset?.();
      } else {
        setError('Failed to reset system. Please refresh the page.');
      }
    } catch (err) {
      setError(`Reset failed: ${err}`);
    } finally {
      setIsResetting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 right-0 w-full sm:w-1/2 h-1/2 sm:h-2/3 bg-gray-900 dark:bg-gray-950 border-t border-l border-gray-700 dark:border-gray-800 rounded-tl-lg shadow-2xl flex flex-col z-50">
      {/* Blocked Command Alert */}
      {blockedAlert && (
        <div className="px-4 pt-4">
          <BlockedCommandAlert
            result={blockedAlert}
            onDismiss={() => setBlockedAlert(null)}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 dark:bg-gray-900 border-b border-gray-700 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm font-mono text-gray-300">WebVM Terminal</span>
          <span className="text-xs text-gray-500 ml-2">(Networking disabled)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="p-1.5 rounded hover:bg-gray-700 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50"
            title="Reset to clean slate"
          >
            <RotateCcw size={18} />
          </button>

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded hover:bg-gray-700 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition-colors"
            title={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-700 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Terminal or Error State */}
      {isMinimized ? (
        <div className="flex-1 flex items-center justify-center bg-gray-900 dark:bg-gray-950 text-gray-500">
          <p className="text-sm">Terminal minimized</p>
        </div>
      ) : error ? (
        <div className="flex-1 overflow-auto p-4 bg-gray-900 dark:bg-gray-950 text-gray-300 font-mono text-sm">
          <div className="mb-4">
            <p className="text-yellow-400">⚠️ Terminal Error</p>
            <p className="text-red-400 mt-2">{error}</p>
          </div>

          <div className="text-gray-500 mt-4">
            <p className="mb-2">Fallback: Using simulated terminal mode</p>
            <p className="text-xs">
              Full WebVM requires browser support for SharedArrayBuffer and WebAssembly.
            </p>
          </div>

          <div className="mt-6 p-3 bg-gray-800 rounded border border-gray-700">
            <p className="text-gray-400 mb-2">$ _</p>
          </div>
        </div>
      ) : isInitializing ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 dark:bg-gray-950">
          <div className="text-center">
            <div className="inline-block">
              <div className="animate-spin">
                <div className="w-8 h-8 border-4 border-gray-700 border-t-blue-500 rounded-full"></div>
              </div>
            </div>
            <p className="text-gray-400 mt-4 text-sm font-mono">
              Initializing WebVM...
            </p>
            <p className="text-gray-600 text-xs mt-2">
              This may take a moment on first load
            </p>
          </div>
        </div>
      ) : (
        <div
          ref={terminalRef}
          className="flex-1 overflow-auto bg-gray-900 dark:bg-gray-950"
          style={{ padding: 0 }}
        >
          {/* xterm.js renders here */}
        </div>
      )}

      {/* Footer Info */}
      <div className="px-4 py-2 bg-gray-800 dark:bg-gray-900 border-t border-gray-700 dark:border-gray-800 text-xs text-gray-500 flex justify-between">
        <span>
          🔒 Safe sandbox (networking disabled) | Client-side only (IndexedDB)
        </span>
        {isResetting && <span className="text-yellow-400">Resetting...</span>}
      </div>
    </div>
  );
};
