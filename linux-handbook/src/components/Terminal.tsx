import React, { useEffect, useRef, useState } from 'react';
import { X, RotateCcw, Minimize2, Maximize2, History } from 'lucide-react';
import { securityService } from '../services/securityHardening';
import { secureWebVM } from '../services/webvmService';
import { commandHistoryService } from '../services/commandHistory';
import { terminalThemesService } from '../services/terminalThemes';
import { TerminalHistory } from './TerminalHistory';
import { TerminalThemeSelector } from './TerminalThemeSelector';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledCommand?: string;
}

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
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showHistory, setShowHistory] = useState(false);
  const [currentThemeId, setCurrentThemeId] = useState('dracula');
  const outputRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const commandHistory = commandHistoryService.getRecentCommands(50);

  // Apply theme to terminal
  useEffect(() => {
    if (terminalRef.current) {
      const theme = terminalThemesService.getTheme(currentThemeId);
      if (theme) {
        terminalThemesService.applyThemeToElement(terminalRef.current);
      }
    }
  }, [currentThemeId]);

  // Keyboard shortcuts - Phase 5
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      // Ctrl+L: Clear terminal
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        setOutput([]);
        setHistoryIndex(-1);
        return;
      }

      // Arrow Up: Previous command
      if (e.key === 'ArrowUp' && input === '') {
        e.preventDefault();
        const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
        if (newIndex >= 0) {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex].command);
        }
        return;
      }

      // Arrow Down: Next command
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex].command);
        } else if (historyIndex === 0) {
          setHistoryIndex(-1);
          setInput('');
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, historyIndex, commandHistory, input]);

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
      '$ Type "help" for available commands',
      '$ Networking/Docker/Git/Services are BLOCKED',
      '',
    ]);
    setInput('');
    setHistoryIndex(-1);
    securityService.resetMetrics();
  };

  const handleCommand = async () => {
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

    // Record command and execute via Secure WebVM
    securityService.recordCommand(cmdTrimmed);
    const result = await secureWebVM.executeCommand(cmdTrimmed);
    commandHistoryService.addCommand(cmdTrimmed, result.exitCode);

    // Display output
    if (result.output) {
      setOutput((prev) => [...prev, result.output]);
    }
    if (result.error && !result.success) {
      setOutput((prev) => [...prev, `[ERROR] ${result.error}`]);
    }
    if (!result.success && result.exitCode !== 0) {
      setOutput((prev) => [...prev, `exit code: ${result.exitCode}`]);
    }

    setInput('');
    setHistoryIndex(-1);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={terminalRef}
      className="fixed bottom-0 right-0 w-full sm:w-1/2 h-1/2 sm:h-2/3 bg-gray-900 dark:bg-gray-950 border-t border-l border-gray-700 dark:border-gray-800 rounded-tl-lg shadow-2xl flex flex-col z-50"
      style={{
        backgroundColor: 'var(--terminal-bg, #282c34)',
        color: 'var(--terminal-fg, #abb2bf)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--terminal-selection)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-sm font-mono">
            Secure WebVM - Phase 5: Keyboard Shortcuts, History, Themes
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-1.5 hover:opacity-70 transition-opacity"
            title="Command History (↑/↓)"
          >
            <History size={16} />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 hover:opacity-70 transition-opacity"
            title="Clear (Ctrl+L)"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:opacity-70 transition-opacity"
            title={isMinimized ? 'Restore' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:opacity-70 transition-opacity"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Theme Selector - Phase 5 */}
      <TerminalThemeSelector
        currentThemeId={currentThemeId}
        onThemeChange={setCurrentThemeId}
      />

      {/* History Panel - Phase 5 */}
      {showHistory && (
        <TerminalHistory
          isOpen={showHistory}
          onSelectCommand={(cmd) => {
            setInput(cmd);
            setShowHistory(false);
          }}
        />
      )}

      {/* Terminal Body */}
      {!isMinimized && (
        <>
          <div
            ref={outputRef}
            className="flex-1 overflow-auto p-3 font-mono text-sm whitespace-pre-wrap break-words"
          >
            {output.map((line, i) => (
              <div
                key={i}
                className={
                  line.includes('[BLOCKED]')
                    ? 'text-red-400'
                    : line.includes('[ERROR]')
                      ? 'text-red-500'
                      : line.includes('[RATE LIMITED]')
                        ? 'text-orange-400'
                        : line.includes('exit code:')
                          ? 'text-gray-500 text-xs'
                          : ''
                }
              >
                {line}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 py-2 border-t flex gap-1" style={{ borderColor: 'var(--terminal-selection)' }}>
            <span className="font-mono text-sm">$</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCommand();
                }
              }}
              className="flex-1 bg-transparent font-mono text-sm outline-none"
              style={{ color: 'var(--terminal-fg, #abb2bf)' }}
              placeholder="Type command... (help, ls, pwd, etc.)"
              autoFocus
            />
          </div>
        </>
      )}

      {isMinimized && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm opacity-50">Terminal minimized</p>
        </div>
      )}

      {/* Footer */}
      <div className="px-3 py-2 text-xs opacity-60 border-t" style={{ borderColor: 'var(--terminal-selection)' }}>
        <span>✅ Secure WebVM | ⌨️ Shortcuts: Ctrl+L (clear), ↑↓ (history) | 🎨 Themes: {terminalThemesService.getCurrentTheme().name}</span>
      </div>
    </div>
  );
};
