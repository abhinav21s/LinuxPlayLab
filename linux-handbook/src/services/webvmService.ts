/**
 * Secure WebVM Alternative using Self-Contained Sandbox
 * Uses a combination of xterm.js + local bash emulator with strict security
 * Safe execution with command blocking
 */

import { checkCommandInterception } from './commandInterceptor';

export interface VMResponse {
  success: boolean;
  output: string;
  error?: string;
  exitCode: number;
}

class SecureWebVM {
  private history: string[] = [];
  private currentDir: string = '/home/user';
  private environment: Record<string, string> = {
    HOME: '/home/user',
    USER: 'sandbox',
    PATH: '/usr/bin:/bin',
    PWD: '/home/user',
    SHELL: '/bin/bash',
  };

  /**
   * Execute command with strict security checks
   */
  async executeCommand(command: string): Promise<VMResponse> {
    const trimmed = command.trim();

    if (!trimmed) {
      return {
        success: true,
        output: '',
        exitCode: 0,
      };
    }

    // FIRST: Check if command is blocked (security layer)
    const interception = checkCommandInterception(trimmed);
    if (interception.isBlocked) {
      return {
        success: false,
        output: `[BLOCKED] ${interception.message}\n[INFO] ${interception.explanation}`,
        error: interception.message,
        exitCode: 127,
      };
    }

    this.history.push(trimmed);

    // SECOND: Parse and execute safely
    const parts = trimmed.split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    try {
      const result = await this.executeSecureCommand(cmd, args);
      return result;
    } catch (error: any) {
      return {
        success: false,
        output: '',
        error: error.message,
        exitCode: 1,
      };
    }
  }

  /**
   * Safe command execution with timeout
   */
  private executeSecureCommand(
    cmd: string,
    args: string[]
  ): Promise<VMResponse> {
    return new Promise((resolve) => {
      // 5 second timeout for each command
      const timeout = setTimeout(() => {
        resolve({
          success: false,
          output: '',
          error: 'Command timeout after 5 seconds',
          exitCode: 124,
        });
      }, 5000);

      try {
        const result = this.executeSync(cmd, args);
        clearTimeout(timeout);
        resolve(result);
      } catch (error: any) {
        clearTimeout(timeout);
        resolve({
          success: false,
          output: '',
          error: error.message,
          exitCode: 1,
        });
      }
    });
  }

  /**
   * Core command execution logic
   */
  private executeSync(cmd: string, args: string[]): VMResponse {
    switch (cmd) {
      case 'ls':
        return this.cmd_ls(args);
      case 'pwd':
        return { success: true, output: this.currentDir, exitCode: 0 };
      case 'cd':
        return this.cmd_cd(args);
      case 'mkdir':
        return this.cmd_mkdir(args);
      case 'touch':
        return this.cmd_touch(args);
      case 'echo':
        return { success: true, output: args.join(' '), exitCode: 0 };
      case 'cat':
        return this.cmd_cat(args);
      case 'whoami':
        return { success: true, output: 'sandbox', exitCode: 0 };
      case 'hostname':
        return { success: true, output: 'webvm-sandbox', exitCode: 0 };
      case 'date':
        return { success: true, output: new Date().toString(), exitCode: 0 };
      case 'uname':
        if (args.includes('-a')) {
          return {
            success: true,
            output: 'Linux webvm-sandbox 5.15.0 #1 SMP x86_64 GNU/Linux',
            exitCode: 0,
          };
        }
        return { success: true, output: 'Linux', exitCode: 0 };
      case 'uptime':
        return { success: true, output: ' up 1 day,  2:34,  1 user,  load average: 0.23, 0.18, 0.15', exitCode: 0 };
      case 'free':
        if (args.includes('-h')) {
          return {
            success: true,
            output: '              total        used        free      shared  buff/cache   available\nMem:          7.7Gi       2.1Gi       3.2Gi       256Mi       2.4Gi       5.1Gi',
            exitCode: 0,
          };
        }
        return {
          success: true,
          output: '              total        used        free      shared  buff/cache   available\nMem:        8061504     2199024     3355443      262144     2500480     5350000',
          exitCode: 0,
        };
      case 'df':
        if (args.includes('-h')) {
          return {
            success: true,
            output: 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1       100G   23G   77G  23% /',
            exitCode: 0,
          };
        }
        return {
          success: true,
          output: 'Filesystem      1K-blocks     Used Available Use% Mounted on\n/dev/sda1      104857600 24117248 80740352  23% /',
          exitCode: 0,
        };
      case 'ps':
        if (args.includes('aux')) {
          return {
            success: true,
            output:
              'USER       PID %CPU %MEM    VSZ   RSS TTY STAT START   TIME COMMAND\nsandbox      1  0.1  0.2  19452  1256 ?   Ss   10:00  0:00 /sbin/init\nsandbox    123  0.5  0.5  45123  4256 ?   S    10:05  0:01 /bin/bash\nsandbox    456  0.2  0.3  23456  2456 ?   S    10:10  0:00 node',
            exitCode: 0,
          };
        }
        return {
          success: true,
          output: 'PID TTY TIME CMD\n  1 ?  00:00 /sbin/init\n123 ?  00:01 /bin/bash\n456 ?  00:00 node',
          exitCode: 0,
        };
      case 'find':
        return {
          success: true,
          output: './README.md\n./Documents\n./Downloads\n./Documents/notes.txt\n./Downloads/file.zip',
          exitCode: 0,
        };
      case 'grep':
        return {
          success: true,
          output: 'matching_line_1: content\nmatching_line_2: content\nmatching_line_3: content',
          exitCode: 0,
        };
      case 'wc':
        if (args.includes('-l')) {
          return { success: true, output: '      42 file.txt', exitCode: 0 };
        }
        return { success: true, output: '     42    150   1024 file.txt', exitCode: 0 };
      case 'head':
        return {
          success: true,
          output: Array.from({ length: 10 }, (_, i) => `Line ${i + 1}: content`).join('\n'),
          exitCode: 0,
        };
      case 'tail':
        return {
          success: true,
          output: Array.from({ length: 10 }, (_, i) => `Line ${91 + i}: content`).join('\n'),
          exitCode: 0,
        };
      case 'sort':
        return { success: true, output: 'apple\nbanana\ncherry\ndate\nelderberry', exitCode: 0 };
      case 'cut':
        return { success: true, output: 'field1\nfield2\nfield3\nfield4', exitCode: 0 };
      case 'clear':
        return { success: true, output: '\x1bc', exitCode: 0 };
      case 'help':
      case '?':
        return {
          success: true,
          output: `Available Commands:\n
File: ls, pwd, cd, mkdir, touch, rm, cp, mv, find, cat, head, tail\n
System: whoami, hostname, date, uname, uptime, free, df, ps\n
Text: grep, wc, sort, cut, echo\n
Other: help, clear, history, env\n
Blocked: ping, curl, wget, ssh, git, docker, systemctl, crontab, sudo\n
Type "man <command>" for help (simulated).`,
          exitCode: 0,
        };
      case 'history':
        return {
          success: true,
          output: this.history.map((cmd, i) => `${i + 1}  ${cmd}`).join('\n'),
          exitCode: 0,
        };
      case 'env':
        return {
          success: true,
          output: Object.entries(this.environment)
            .map(([k, v]) => `${k}=${v}`)
            .join('\n'),
          exitCode: 0,
        };
      default:
        return {
          success: false,
          output: '',
          error: `${cmd}: command not found`,
          exitCode: 127,
        };
    }
  }

  private cmd_ls(args: string[]): VMResponse {
    const hasL = args.includes('-l') || args.includes('-la');
    const hasA = args.includes('-a') || args.includes('-la');

    if (hasL) {
      const lines = [
        'total 24',
        'drwxr-xr-x  5 sandbox  group  4096 Aug  5 10:30 .',
        'drwxr-xr-x 10 root     root   4096 Aug  05 10:25 ..',
        '-rw-r--r--  1 sandbox  group   220 Aug  05 10:30 README.md',
        'drwxr-xr-x  3 sandbox  group  4096 Aug  05 10:30 Documents',
        'drwxr-xr-x  3 sandbox  group  4096 Aug  05 10:30 Downloads',
      ];
      if (hasA) {
        lines.push('-rw-r--r--  1 sandbox  group    512 Aug  05 10:20 .bashrc');
        lines.push('-rw-r--r--  1 sandbox  group    124 Aug  05 10:20 .profile');
      }
      return { success: true, output: lines.join('\n'), exitCode: 0 };
    }

    return {
      success: true,
      output: 'Documents\nDownloads\nREADME.md',
      exitCode: 0,
    };
  }

  private cmd_cd(args: string[]): VMResponse {
    if (args.length === 0) {
      this.currentDir = this.environment.HOME;
    } else {
      const dir = args[0];
      if (dir === '..') {
        const parts = this.currentDir.split('/');
        parts.pop();
        this.currentDir = parts.join('/') || '/';
      } else if (dir.startsWith('/')) {
        this.currentDir = dir;
      } else {
        this.currentDir = `${this.currentDir}/${dir}`.replace(/\/+/g, '/');
      }
    }
    this.environment.PWD = this.currentDir;
    return { success: true, output: '', exitCode: 0 };
  }

  private cmd_mkdir(args: string[]): VMResponse {
    if (args.length === 0) {
      return {
        success: false,
        output: '',
        error: 'mkdir: missing operand',
        exitCode: 1,
      };
    }
    return { success: true, output: `created directory: ${args[0]}`, exitCode: 0 };
  }

  private cmd_touch(args: string[]): VMResponse {
    if (args.length === 0) {
      return {
        success: false,
        output: '',
        error: 'touch: missing file operand',
        exitCode: 1,
      };
    }
    return { success: true, output: `created: ${args[0]}`, exitCode: 0 };
  }

  private cmd_cat(args: string[]): VMResponse {
    if (args.length === 0) {
      return { success: true, output: '', exitCode: 0 };
    }
    return {
      success: true,
      output: `[File: ${args[0]}]\nThis is simulated file content from the sandbox.`,
      exitCode: 0,
    };
  }
}

export const secureWebVM = new SecureWebVM();
