import React, { useEffect, useRef, useState } from 'react';
import { X, RotateCcw, Minimize2, Maximize2 } from 'lucide-react';
import { checkCommandInterception } from '../services/commandInterceptor';

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
    '$ Type commands below. Networking/Docker/Git/Services are blocked.',
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
  };

  const handleCommand = () => {
    if (!input.trim()) return;

    const cmdTrimmed = input.trim();
    setOutput((prev) => [...prev, `$ ${cmdTrimmed}`]);

    // Check if command is blocked
    const interception = checkCommandInterception(cmdTrimmed);

    if (interception.isBlocked) {
      setOutput((prev) => [
        ...prev,
        `[BLOCKED] ${interception.message}`,
        `[INFO] ${interception.explanation}`,
      ]);
      setInput('');
      return;
    }

    // Simulate command execution based on command type
    simulateCommand(cmdTrimmed);
    setInput('');
  };

  const simulateCommand = (cmd: string) => {
    const parts = cmd.split(/\s+/);
    const command = parts[0];

    switch (command) {
      // File listing
      case 'ls':
      case 'ls-l':
      case 'ls-la':
        setOutput((prev) => [
          ...prev,
          'total 24',
          'drwxr-xr-x  5 user  group  4096 Aug  5 10:30 .',
          'drwxr-xr-x 10 user  group  4096 Aug  05 10:25 ..',
          '-rw-r--r--  1 user  group   220 Aug  05 10:30 README.md',
          'drwxr-xr-x  3 user  group  4096 Aug  05 10:30 src',
          'drwxr-xr-x  2 user  group  4096 Aug  05 10:30 docs',
        ]);
        break;

      // Current directory
      case 'pwd':
        setOutput((prev) => [...prev, '/home/user/project']);
        break;

      // Make directory
      case 'mkdir':
        if (parts[1]) {
          setOutput((prev) => [...prev, `created directory: ${parts[1]}`]);
        } else {
          setOutput((prev) => [...prev, 'mkdir: missing operand']);
        }
        break;

      // Touch (create file)
      case 'touch':
        if (parts[1]) {
          setOutput((prev) => [...prev, `created: ${parts[1]}`]);
        } else {
          setOutput((prev) => [...prev, 'touch: missing file operand']);
        }
        break;

      // Echo
      case 'echo':
        const text = parts.slice(1).join(' ');
        setOutput((prev) => [...prev, text]);
        break;

      // Cat (view file)
      case 'cat':
        if (!parts[1]) {
          setOutput((prev) => [...prev, 'cat: missing file operand']);
        } else {
          setOutput((prev) => [
            ...prev,
            `[File: ${parts[1]}]`,
            'This is a simulated file content.',
            'In a real WebVM, this would show actual file contents.',
          ]);
        }
        break;

      // Grep (search)
      case 'grep':
        setOutput((prev) => [
          ...prev,
          'example_line_1: matching content',
          'example_line_3: matching content',
        ]);
        break;

      // System info
      case 'uname':
        if (cmd.includes('-a')) {
          setOutput((prev) => [
            ...prev,
            'Linux sandbox 5.15.0-generic #1 SMP x86_64 GNU/Linux',
          ]);
        } else {
          setOutput((prev) => [...prev, 'Linux']);
        }
        break;

      case 'whoami':
        setOutput((prev) => [...prev, 'user']);
        break;

      case 'hostname':
        setOutput((prev) => [...prev, 'sandbox']);
        break;

      case 'date':
        setOutput((prev) => [
          ...prev,
          new Date().toLocaleString('en-US', { timeZone: 'UTC' }),
        ]);
        break;

      // Help
      case 'help':
      case '?':
        setOutput((prev) => [
          ...prev,
          'Available commands (simulated):',
          '  ls, pwd, mkdir, touch, echo, cat, grep',
          '  uname, whoami, hostname, date',
          '  cp, mv, rm, find, head, tail',
          '  wc, sort, cut, tr',
          '',
          'Blocked commands:',
          '  ping, curl, wget, ssh, git, docker, systemctl, crontab, sudo',
        ]);
        break;

      case 'clear':
        setOutput([]);
        break;

      default:
        // For unrecognized commands, just show command not found
        setOutput((prev) => [...prev, `${command}: command not found`]);
    }
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
                      : line.includes('[File:')
                        ? 'text-blue-400'
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
              placeholder="Type command... (try: ls, pwd, echo hello)"
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
        <span>Type "help" for commands | Blocked: ping curl wget ssh git docker systemctl</span>
      </div>
    </div>
  );
};
