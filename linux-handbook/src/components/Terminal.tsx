import React, { useEffect, useRef, useState } from 'react';
import { X, RotateCcw, Minimize2, Maximize2 } from 'lucide-react';
import { checkCommandInterception } from '../services/commandInterceptor';
import { securityService } from '../services/securityHardening';
import { bashEmulator } from '../services/bashEmulator';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledCommand?: string;
}

// Simple WebVM terminal simulation - stores output history
export const Terminal: React.FC<TerminalProps> = ({
  isOpen,
  onClose,
  prefilledCommand,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [output, setOutput] = useState<string[]>([
    '$ Welcome to Linux Command Handbook Sandbox',
    '$ Type "help" for available commands',
    '$ Networking/Docker/Git/Services are BLOCKED',
    '',
  ]);
  const [input, setInput] = useState('');
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefilledCommand && isOpen) {
      setInput(prefilledCommand);
    }
  }, [prefilledCommand, isOpen]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleReset = () => {
    setOutput([
      '$ Welcome to Linux Command Handbook Sandbox',
      '$ Type commands below. Networking/Docker/Git/Services are blocked.',
      '',
    ]);
    setInput('');
    securityService.resetMetrics();
  };

  const handleCommand = () => {
    if (!input.trim()) return;

    const cmdTrimmed = input.trim();
    setOutput((prev) => [...prev, `$ ${cmdTrimmed}`]);

    // Phase 4: Check rate limiting
    const rateLimitCheck = securityService.canExecuteCommand();
    if (!rateLimitCheck.allowed) {
      setOutput((prev) => [...prev, `[RATE LIMITED] ${rateLimitCheck.message}`]);
      securityService.recordBlockedAttempt(cmdTrimmed, 'Rate limited');
      setInput('');
      return;
    }

    // Check if command is blocked
    const interception = checkCommandInterception(cmdTrimmed);

    if (interception.isBlocked) {
      setOutput((prev) => [
        ...prev,
        `[BLOCKED] ${interception.message}`,
        `[INFO] ${interception.explanation}`,
      ]);
      securityService.recordBlockedAttempt(cmdTrimmed, interception.message || 'Unknown');
      setInput('');
      return;
    }

    // Check resource limits
    if (securityService.isMemoryLimitExceeded()) {
      setOutput((prev) => [...prev, `[ERROR] Memory limit exceeded: ${securityService.getMetrics().memoryUsedMb}MB used`]);
      setInput('');
      return;
    }

    if (securityService.isDiskLimitExceeded()) {
      setOutput((prev) => [...prev, `[ERROR] Disk quota exceeded: ${securityService.getMetrics().diskUsedMb}MB used`]);
      setInput('');
      return;
    }

    // Record command and execute
    securityService.recordCommand(cmdTrimmed);
    const result = bashEmulator.execute(cmdTrimmed);

    if (result.output) {
      setOutput((prev) => [...prev, result.output]);
    }
    if (result.stderr) {
      setOutput((prev) => [...prev, `stderr: ${result.stderr}`]);
    }
    if (result.exitCode !== 0) {
      setOutput((prev) => [...prev, `exit code: ${result.exitCode}`]);
    }

    setInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 right-0 w-full sm:w-1/2 h-1/2 sm:h-2/3 bg-gray-900 dark:bg-gray-950 border-t border-l border-gray-700 dark:border-gray-800 rounded-tl-lg shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 dark:bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-sm font-mono text-gray-300">
            WebVM Sandbox - Networking/Docker/Git/Services Blocked
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="p-1.5 hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors"
            title="Reset"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors"
            title={isMinimized ? 'Restore' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      {!isMinimized && (
        <>
          <div
            ref={outputRef}
            className="flex-1 overflow-auto p-3 font-mono text-sm text-green-400 bg-gray-900 dark:bg-gray-950 whitespace-pre-wrap break-words"
          >
            {output.map((line, i) => (
              <div
                key={i}
                className={
                  line.includes('[BLOCKED]')
                    ? 'text-red-400'
                    : line.includes('[INFO]')
                      ? 'text-yellow-400'
                      : line.includes('[ERROR]')
                        ? 'text-red-500'
                        : line.includes('[RATE LIMITED]')
                          ? 'text-orange-400'
                          : line.includes('exit code:')
                            ? 'text-gray-500 text-xs'
                            : 'text-green-400'
                }
              >
                {line}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 py-2 bg-gray-800 border-t border-gray-700 flex gap-1">
            <span className="text-green-400 font-mono text-sm">$</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCommand();
                }
              }}
              className="flex-1 bg-transparent text-green-400 font-mono text-sm outline-none"
              placeholder="Type command... (ls, pwd, echo, help, etc.)"
              autoFocus
            />
          </div>
        </>
      )}

      {isMinimized && (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p className="text-sm">Terminal minimized</p>
        </div>
      )}

      {/* Footer */}
      <div className="px-3 py-2 bg-gray-800 text-xs text-gray-500 border-t border-gray-700">
        <span>✅ Bash Emulator Ready | Blocked: ping curl wget ssh git docker systemctl | Rate: 10/min</span>
      </div>
    </div>
  );
};
