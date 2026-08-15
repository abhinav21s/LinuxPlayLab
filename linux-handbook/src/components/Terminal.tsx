import React, { useEffect, useRef, useState } from 'react';
import { X, RotateCcw, Minimize2, Maximize2, History, GripHorizontal } from 'lucide-react';
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
  placement?: 'floating' | 'right' | 'bottom';
  onRightDockResize?: (width: number) => void;
  onBottomDockResize?: (height: number) => void;
}

export const Terminal: React.FC<TerminalProps> = ({
  isOpen,
  onClose,
  prefilledCommand,
  placement = 'floating',
  onRightDockResize,
  onBottomDockResize,
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
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
  const outputRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, offsetX: 0, offsetY: 0 });
  const resizeRef = useRef({ active: false, startX: 0, startY: 0, width: 0, height: 0 });
  const [position, setPosition] = useState({ x: Math.max(24, window.innerWidth - 620), y: Math.max(80, window.innerHeight - 520) });
  const [size, setSize] = useState({ width: Math.min(720, window.innerWidth - 16), height: 560 });
  const commandHistory = commandHistoryService.getRecentCommands(50);

  useEffect(() => {
    if (placement === 'right') {
      const nextWidth = Math.max(360, Math.round(window.innerWidth * 0.36));
      setSize((current) => ({ ...current, width: nextWidth }));
      onRightDockResize?.(nextWidth);
    } else if (placement === 'bottom') {
      const nextHeight = Math.round(window.innerHeight * 0.58);
      setSize((current) => ({ ...current, height: nextHeight }));
      onBottomDockResize?.(nextHeight);
    }
  }, [placement]);

  // Apply theme to terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalThemesService.setTheme(currentThemeId);
      const theme = terminalThemesService.getTheme(currentThemeId);
      if (theme) {
        terminalThemesService.applyThemeToElement(terminalRef.current);
        // Force update CSS variables
        terminalRef.current.style.setProperty('--terminal-bg', theme.background);
        terminalRef.current.style.setProperty('--terminal-fg', theme.foreground);
        terminalRef.current.style.setProperty('--terminal-selection', theme.selection);
        terminalRef.current.style.setProperty('--terminal-cursor', theme.cursor);
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

    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

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
    setHistoryRefreshTrigger((prev) => prev + 1);
  };

  const handleCommand = async () => {
    if (!input.trim()) return;

    const cmdTrimmed = input.trim();
    setOutput((prev) => [...prev, `$ ${cmdTrimmed}`]);
    // Clear immediately so a slow first VM startup cannot leave the submitted
    // command sitting in the editor and make it look like execution failed.
    setInput('');
    setHistoryIndex(-1);

    // Phase 4: Check rate limiting
    const rateLimitCheck = securityService.canExecuteCommand();
    if (!rateLimitCheck.allowed) {
      setOutput((prev) => [...prev, `[RATE LIMITED] ${rateLimitCheck.message}`]);
      securityService.recordBlockedAttempt(cmdTrimmed, 'Rate limited');
      return;
    }

    // Check resource limits
    if (securityService.isMemoryLimitExceeded()) {
      setOutput((prev) => [...prev, `[ERROR] Memory limit exceeded: ${securityService.getMetrics().memoryUsedMb}MB used`]);
      return;
    }

    if (securityService.isDiskLimitExceeded()) {
      setOutput((prev) => [...prev, `[ERROR] Disk quota exceeded: ${securityService.getMetrics().diskUsedMb}MB used`]);
      return;
    }

    // Record command and execute via Secure WebVM
    securityService.recordCommand(cmdTrimmed);
    setOutput((prev) => [...prev, '[VM] Executing in browser Linux…']);
    const result = await secureWebVM.executeCommand(cmdTrimmed);
    commandHistoryService.addCommand(cmdTrimmed, result.exitCode);
    // Refresh the in-memory list used by ArrowUp/ArrowDown immediately after
    // a command completes (without requiring the history dialog to open).
    setHistoryRefreshTrigger((prev) => prev + 1);

    // Display output
    if (result.output) {
      setOutput((prev) => [...prev, result.output]);
    }
    if (result.error && !result.success) {
      setOutput((prev) => [...prev, `[ERROR] ${result.error}`]);
    }
    if (result.success && !result.output.trim()) {
      setOutput((prev) => [...prev, `[done] exit code: ${result.exitCode}`]);
    }
    if (!result.success && result.exitCode !== 0) {
      setOutput((prev) => [...prev, `exit code: ${result.exitCode}`]);
    }

  };

  const handleHistoryKey = (key: 'up' | 'down') => {
    if (key === 'up') {
      if (input !== '' && historyIndex === -1) return;
      const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
      if (newIndex >= 0) {
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex].command);
      }
      return;
    }

    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setInput(commandHistory[newIndex].command);
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      setInput('');
    }
  };

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (placement !== 'floating' || !terminalRef.current) return;
    const rect = terminalRef.current.getBoundingClientRect();
    dragRef.current = { active: true, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    setPosition({ x: Math.max(8, Math.min(window.innerWidth - 360, event.clientX - dragRef.current.offsetX)), y: Math.max(8, Math.min(window.innerHeight - 180, event.clientY - dragRef.current.offsetY)) });
  };

  const stopDrag = () => { dragRef.current.active = false; };

  const startResize = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!terminalRef.current) return;
    const rect = terminalRef.current.getBoundingClientRect();
    resizeRef.current = { active: true, startX: event.clientX, startY: event.clientY, width: rect.width, height: rect.height };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveResize = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!resizeRef.current.active) return;
    const deltaX = event.clientX - resizeRef.current.startX;
    const deltaY = event.clientY - resizeRef.current.startY;
    if (placement === 'right') {
      const nextWidth = Math.max(360, Math.min(window.innerWidth - 280, resizeRef.current.width - deltaX));
      setSize((current) => ({ ...current, width: nextWidth }));
      onRightDockResize?.(nextWidth);
    } else if (placement === 'bottom') {
      const nextHeight = Math.max(140, Math.min(Math.round(window.innerHeight * 0.86), resizeRef.current.height - deltaY));
      setSize((current) => ({ ...current, height: nextHeight }));
      onBottomDockResize?.(nextHeight);
    } else {
      setSize({ width: Math.max(360, Math.min(window.innerWidth - 16, resizeRef.current.width + deltaX)), height: Math.max(260, Math.min(window.innerHeight - 16, resizeRef.current.height + deltaY)) });
    }
  };

  const stopResize = () => { resizeRef.current.active = false; };

  if (!isOpen) return null;

  return (
    <div
      ref={terminalRef}
      className={`terminal-window fixed flex flex-col z-50 overflow-hidden border border-slate-700/80 bg-gray-950 shadow-2xl ${placement === 'right' ? 'terminal-dock-right right-0 rounded-none border-y-0 border-r-0' : placement === 'bottom' ? 'terminal-dock-bottom bottom-0 right-0 rounded-t-2xl border-b-0' : 'terminal-dock-floating h-[560px] w-[min(720px,calc(100vw-16px))] rounded-2xl'}`}
      style={{
        backgroundColor: 'var(--terminal-bg, #282c34)',
        color: 'var(--terminal-fg, #abb2bf)',
        ...(placement === 'floating'
          ? { left: position.x, top: position.y, width: size.width, height: size.height }
          : placement === 'right'
            ? { top: '9rem', right: 0, bottom: 0, width: size.width, height: 'auto' }
            : { left: '280px', right: 0, bottom: 'auto', top: `calc(100vh - ${size.height}px)`, width: 'auto', height: size.height }),
      }}
    >
      {/* Header */}
      <div onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={stopDrag} onPointerCancel={stopDrag} className={`flex items-center justify-between border-b px-4 py-3 ${placement === 'floating' ? 'cursor-move' : ''}`} style={{ borderColor: 'var(--terminal-selection)' }}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-400/80" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" /></div>
          <GripHorizontal size={14} className="ml-2 opacity-50" />
          <span className="text-sm font-semibold tracking-tight">Secure Linux Sandbox</span>
        </div>
        <div className="flex gap-2">
          <button
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => setShowHistory(!showHistory)}
            className="p-1.5 hover:opacity-70 transition-opacity"
            title="Command History (↑/↓)"
          >
            <History size={16} />
          </button>
          <button
            onPointerDown={(event) => event.stopPropagation()}
            onClick={handleReset}
            className="p-1.5 hover:opacity-70 transition-opacity"
            title="Clear (Ctrl+L)"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:opacity-70 transition-opacity"
            title={isMinimized ? 'Restore' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onPointerDown={(event) => event.stopPropagation()}
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
          refreshTrigger={historyRefreshTrigger}
          onSelectCommand={(cmd) => {
            setInput(cmd);
            setShowHistory(false);
          }}
          onClose={() => setShowHistory(false)}
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
              onKeyDown={(e) => {
                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  handleHistoryKey('up');
                  return;
                }
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  handleHistoryKey('down');
                  return;
                }
                if (e.key === 'Enter') {
                  e.preventDefault();
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

      <div onPointerDown={startResize} onPointerMove={moveResize} onPointerUp={stopResize} onPointerCancel={stopResize} className={`terminal-resize-handle ${placement === 'right' ? 'terminal-resize-left' : placement === 'bottom' ? 'terminal-resize-top' : ''}`} aria-label="Resize terminal" />

      {/* Footer */}
      <div className="px-3 py-2 text-xs opacity-60 border-t" style={{ borderColor: 'var(--terminal-selection)' }}>
        <span>✅ Secure WebVM | ⌨️ Shortcuts: Ctrl+L (clear), ↑↓ (history) | 🎨 Themes: {terminalThemesService.getCurrentTheme().name}</span>
      </div>
    </div>
  );
};
