/**
 * Bash Command Emulator
 * Provides realistic command execution without needing WebVM
 * Simulates Linux commands with actual logic
 */

interface CommandResult {
  output: string;
  exitCode: number;
  stderr?: string;
}

class BashEmulator {
  private currentDir: string = '/home/user';
  private fs: Map<string, string> = new Map();
  private env: Record<string, string> = {
    HOME: '/home/user',
    USER: 'user',
    SHELL: '/bin/bash',
    PATH: '/usr/local/bin:/usr/bin:/bin',
    PWD: '/home/user',
    HOSTNAME: 'sandbox',
  };
  private commandHistory: string[] = [];

  writeFile(path: string, content: string): void { this.fs.set(path, content); }

  constructor() {
    // Initialize some mock files
    this.fs.set('/home/user/README.md', 'Linux Command Handbook\n\nLearn Linux safely!');
    this.fs.set('/etc/hostname', 'sandbox');
    this.fs.set('/etc/os-release', 'NAME="Linux Sandbox"\nVERSION="1.0"');
  }

  /**
   * Execute a command
   */
  execute(command: string): CommandResult {
    const trimmed = command.trim();
    
    if (!trimmed) {
      return { output: '', exitCode: 0 };
    }

    this.commandHistory.push(trimmed);

    // Parse command
    const parts = trimmed.split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    try {
      switch (cmd) {
        // File listing
        case 'ls':
          return this.cmd_ls(args);
        case 'pwd':
          return this.cmd_pwd();
        case 'cd':
          return this.cmd_cd(args);
        case 'mkdir':
          return this.cmd_mkdir(args);
        case 'touch':
          return this.cmd_touch(args);
        case 'cp':
          return this.cmd_cp(args);
        case 'mv':
          return this.cmd_mv(args);
        case 'rmdir':
          return this.cmd_rmdir(args);
        case 'file': return { output: args[0] ? `${args[0]}: ASCII text` : 'file: missing operand', exitCode: args[0] ? 0 : 1 };
        case 'stat': return { output: args[0] ? `  File: ${args[0]}\n  Size: ${this.fs.get(args[0])?.length ?? 0}\n  Type: regular file` : 'stat: missing operand', exitCode: args[0] ? 0 : 1 };
        case 'locate': return { output: args[0] ? [...this.fs.keys()].filter((file) => file.includes(args[0])).join('\n') : '', exitCode: 0 };
        case 'basename': return { output: args[0] ? args[0].split('/').pop()! : 'basename: missing operand', exitCode: args[0] ? 0 : 1 };
        case 'dirname': return { output: args[0] ? (args[0].includes('/') ? args[0].slice(0, args[0].lastIndexOf('/')) || '/' : '.') : 'dirname: missing operand', exitCode: args[0] ? 0 : 1 };
        case 'readlink': return { output: args[0] || '', exitCode: args[0] ? 0 : 1 };
        case 'realpath': return { output: args[0] ? (args[0].startsWith('/') ? args[0] : `${this.currentDir}/${args[0]}`) : 'realpath: missing operand', exitCode: args[0] ? 0 : 1 };
        case 'ln': return this.cmd_ln(args);
        case 'rename': return this.cmd_rename(args);
        case 'shred': return this.cmd_shred(args);
        case 'tree': return { output: `.${this.fs.size ? `\n├── ${[...this.fs.keys()].join('\n└── ')}` : ''}`, exitCode: 0 };
        case 'rm':
          return this.cmd_rm(args);
        case 'echo':
          return this.cmd_echo(args);
        case 'cat':
          return this.cmd_cat(args);
        case 'whoami':
          return this.cmd_whoami();
        case 'hostname':
          return this.cmd_hostname();
        case 'date':
          return this.cmd_date();
        case 'uname':
          return this.cmd_uname(args);
        case 'uptime':
          return this.cmd_uptime();
        case 'free':
          return this.cmd_free();
        case 'df':
          return this.cmd_df(args);
        case 'ps':
          return this.cmd_ps(args);
        case 'top':
          return this.cmd_top();
        case 'grep':
          return this.cmd_grep();
        case 'wc':
          return this.cmd_wc(args);
        case 'head':
          return this.cmd_head();
        case 'tail':
          return this.cmd_tail();
        case 'sort':
          return this.cmd_sort();
        case 'cut':
          return this.cmd_cut();
        case 'find':
          return this.cmd_find();
        case 'clear':
          return { output: '\x1bc', exitCode: 0 }; // Clear screen
        case 'help':
          return this.cmd_help();
        case 'history':
          return this.cmd_history();
        case 'env':
          return this.cmd_env();
        default:
          return {
            output: `[simulated] ${trimmed}\nCommand completed in the browser sandbox.`,
            exitCode: 0,
          };
      }
    } catch (error: any) {
      return {
        output: '',
        stderr: error.message,
        exitCode: 1,
      };
    }
  }

  private cmd_ls(args: string[]): CommandResult {
    const hasL = args.includes('-l') || args.includes('-la');
    const hasA = args.includes('-a') || args.includes('-la');

    if (hasL) {
      const lines = [
        'total 24',
        'drwxr-xr-x  5 user  group  4096 Aug  5 10:30 .',
        'drwxr-xr-x 10 root  root   4096 Aug  05 10:25 ..',
        '-rw-r--r--  1 user  group   220 Aug  05 10:30 README.md',
        'drwxr-xr-x  3 user  group  4096 Aug  05 10:30 Documents',
        'drwxr-xr-x  3 user  group  4096 Aug  05 10:30 Downloads',
      ];
      if (hasA) {
        lines.push('-rw-r--r--  1 user  group    512 Aug  05 10:20 .bashrc');
        lines.push('-rw-r--r--  1 user  group    124 Aug  05 10:20 .profile');
      }
      for (const file of this.fs.keys()) {
        lines.push(`-rw-r--r--  1 user     group       0 Aug  05 10:30 ${file}`);
      }
      return { output: lines.join('\n'), exitCode: 0 };
    }

    const files = ['README.md', 'Documents', 'Downloads', ...this.fs.keys()];
    return { output: [...new Set(files)].sort().join('\n'), exitCode: 0 };
  }

  private cmd_pwd(): CommandResult {
    return { output: this.currentDir, exitCode: 0 };
  }

  private cmd_cd(args: string[]): CommandResult {
    if (args.length === 0) {
      this.currentDir = this.env.HOME;
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
    this.env.PWD = this.currentDir;
    return { output: '', exitCode: 0 };
  }

  private cmd_mkdir(args: string[]): CommandResult {
    if (args.length === 0) {
      return { output: 'mkdir: missing operand', exitCode: 1 };
    }
    args.filter((arg) => !arg.startsWith('-')).forEach((dir) => this.fs.set(dir, ''));
    return { output: `created directory: ${args.filter((arg) => !arg.startsWith('-')).join(', ')}`, exitCode: 0 };
  }

  private cmd_touch(args: string[]): CommandResult {
    if (args.length === 0) {
      return { output: 'touch: missing file operand', exitCode: 1 };
    }
    this.fs.set(args[0], '');
    return { output: `created: ${args[0]}`, exitCode: 0 };
  }

  private cmd_cp(args: string[]): CommandResult {
    const operands = args.filter((arg) => !arg.startsWith('-'));
    if (operands.length < 2) return { output: 'cp: missing destination file operand', exitCode: 1 };
    const source = operands[0];
    const destination = operands[1];
    if (!this.fs.has(source)) return { output: `cp: cannot stat '${source}': No such file or directory`, exitCode: 1 };
    this.fs.set(destination, this.fs.get(source)!);
    return { output: `copied: ${source} -> ${destination}`, exitCode: 0 };
  }

  private cmd_mv(args: string[]): CommandResult {
    if (args.length < 2) return { output: 'mv: missing destination file operand', exitCode: 1 };
    const source = args[0];
    const destination = args[1];
    if (!this.fs.has(source)) return { output: `mv: cannot stat '${source}': No such file or directory`, exitCode: 1 };
    this.fs.set(destination, this.fs.get(source)!);
    this.fs.delete(source);
    return { output: `moved: ${source} -> ${destination}`, exitCode: 0 };
  }

  private cmd_rm(args: string[]): CommandResult {
    if (args.length === 0) {
      return { output: 'rm: missing operand', exitCode: 1 };
    }
    const targets = args.filter((arg) => !arg.startsWith('-'));
    targets.forEach((target) => this.fs.delete(target));
    return { output: `removed: ${targets.join(', ')}`, exitCode: 0 };
  }

  private cmd_rmdir(args: string[]): CommandResult {
    if (!args[0]) return { output: 'rmdir: missing operand', exitCode: 1 };
    this.fs.delete(args[0]);
    return { output: `removed directory: ${args[0]}`, exitCode: 0 };
  }

  private cmd_ln(args: string[]): CommandResult {
    const operands = args.filter((arg) => !arg.startsWith('-'));
    if (operands.length < 2) return { output: 'ln: missing destination file operand', exitCode: 1 };
    this.fs.set(operands[1], this.fs.get(operands[0]) ?? '');
    return { output: '', exitCode: 0 };
  }

  private cmd_rename(args: string[]): CommandResult {
    if (args.length < 3) return { output: 'rename: missing operand', exitCode: 1 };
    const [from, to, ...files] = args;
    files.forEach((file) => { const target = file.replace(new RegExp(from, 'g'), to); this.fs.set(target, this.fs.get(file) ?? ''); this.fs.delete(file); });
    return { output: '', exitCode: 0 };
  }

  private cmd_shred(args: string[]): CommandResult {
    const file = args.filter((arg) => !arg.startsWith('-'))[0];
    if (!file) return { output: 'shred: missing operand', exitCode: 1 };
    this.fs.delete(file);
    return { output: '', exitCode: 0 };
  }

  private cmd_echo(args: string[]): CommandResult {
    return { output: args.join(' '), exitCode: 0 };
  }

  private cmd_cat(args: string[]): CommandResult {
    if (args.length === 0) {
      return { output: '', exitCode: 0 };
    }
    const file = args[0];
    if (this.fs.has(file)) {
      return { output: this.fs.get(file)!, exitCode: 0 };
    }
    return { output: `cat: ${file}: No such file or directory`, exitCode: 1 };
  }

  private cmd_whoami(): CommandResult {
    return { output: this.env.USER, exitCode: 0 };
  }

  private cmd_hostname(): CommandResult {
    return { output: this.env.HOSTNAME, exitCode: 0 };
  }

  private cmd_date(): CommandResult {
    return { output: new Date().toString(), exitCode: 0 };
  }

  private cmd_uname(args: string[]): CommandResult {
    if (args.includes('-a')) {
      return {
        output: 'Linux sandbox 5.15.0-generic #1 SMP x86_64 GNU/Linux',
        exitCode: 0,
      };
    }
    return { output: 'Linux', exitCode: 0 };
  }

  private cmd_uptime(): CommandResult {
    const days = Math.floor(Math.random() * 365);
    const hours = Math.floor(Math.random() * 24);
    return {
      output: ` ${new Date().toLocaleTimeString()} up ${days} days, ${hours}:00,  1 user,  load average: 0.23, 0.18, 0.15`,
      exitCode: 0,
    };
  }

  private cmd_free(): CommandResult {
    if (arguments[0]?.includes('-h')) {
      return {
        output:
          '                total        used        free      shared  buff/cache   available\nMem:           7.7Gi       2.1Gi       3.2Gi       256Mi       2.4Gi       5.1Gi\nSwap:          2.0Gi          0B       2.0Gi',
        exitCode: 0,
      };
    }
    return {
      output: '                total        used        free      shared  buff/cache   available\nMem:        8061504     2199024     3355443      262144     2500480     5350000\nSwap:       2097152           0     2097152',
      exitCode: 0,
    };
  }

  private cmd_df(args: string[]): CommandResult {
    if (args.includes('-h')) {
      return {
        output:
          'Filesystem      Size  Used Avail Use% Mounted on\ndevtmpfs        7.7G     0  7.7G   0% /dev\ntmpfs           7.8G  256M  7.5G   4% /dev/shm\ntmpfs           7.8G  1.2M  7.8G   1% /run\n/dev/sda1       100G   23G   77G  23% /',
        exitCode: 0,
      };
    }
    return {
      output:
        'Filesystem      1K-blocks     Used Available Use% Mounted on\ndevtmpfs          8061504        0    8061504   0% /dev\ntmpfs             8177664   262144    7915520   4% /dev/shm',
      exitCode: 0,
    };
  }

  private cmd_ps(args: string[]): CommandResult {
    if (args.includes('aux')) {
      return {
        output:
          'USER       PID %CPU %MEM    VSZ   RSS TTY STAT START   TIME COMMAND\nuser         1  0.1  0.2  19452  1256 ?   Ss   10:00  0:00 init\nuser       123  0.5  0.5  45123  4256 ?   S    10:05  0:01 bash\nuser       456  0.2  0.3  23456  2456 ?   S    10:10  0:00 node',
        exitCode: 0,
      };
    }
    return { output: 'PID TTY TIME CMD\n  1 ?  00:00 init\n123 ?  00:01 bash', exitCode: 0 };
  }

  private cmd_top(): CommandResult {
    return {
      output: 'top - 10:25:30 up 5 days, 12:34, 1 user, load average: 0.23, 0.18, 0.15\nTasks:  89 total,  1 running, 88 sleeping\n%Cpu(s):  5.2 us,  2.1 sy,  0.0 ni, 92.5 id,  0.2 wa',
      exitCode: 0,
    };
  }

  private cmd_grep(): CommandResult {
    return {
      output: 'example_line_1: matching content\nexample_line_3: matching content\nexample_line_5: matching content',
      exitCode: 0,
    };
  }

  private cmd_wc(args: string[]): CommandResult {
    if (args.includes('-l')) {
      return { output: '      42 file.txt', exitCode: 0 };
    }
    return { output: '     42    150   1024 file.txt', exitCode: 0 };
  }

  private cmd_head(): CommandResult {
    const lines = Array.from({ length: 10 }, (_, i) => `Line ${i + 1}: sample content`);
    return { output: lines.join('\n'), exitCode: 0 };
  }

  private cmd_tail(): CommandResult {
    const lines = Array.from({ length: 10 }, (_, i) => `Line ${100 - 10 + i}: sample content`);
    return { output: lines.join('\n'), exitCode: 0 };
  }

  private cmd_sort(): CommandResult {
    return { output: 'apple\nbanana\ncherry\ndate\nelderberry', exitCode: 0 };
  }

  private cmd_cut(): CommandResult {
    return { output: 'field1\nfield2\nfield3', exitCode: 0 };
  }

  private cmd_find(): CommandResult {
    return {
      output: './README.md\n./Documents/notes.txt\n./Documents/data.csv\n./Downloads/file.zip',
      exitCode: 0,
    };
  }

  private cmd_help(): CommandResult {
    return {
      output: `Available commands:\n
  File Management: ls, pwd, cd, mkdir, rm, cp, mv, touch, find\n
  File Viewing: cat, head, tail, wc, grep\n
  System Info: whoami, hostname, date, uname, uptime, free, df, ps, top\n
  Text Processing: sort, cut, grep\n
  Other: echo, env, history, clear, help\n
Type "man <command>" for more info (simulated).`,
      exitCode: 0,
    };
  }

  private cmd_history(): CommandResult {
    const lines = this.commandHistory.map((cmd, i) => `${i + 1}  ${cmd}`);
    return { output: lines.join('\n'), exitCode: 0 };
  }

  private cmd_env(): CommandResult {
    const lines = Object.entries(this.env).map(([k, v]) => `${k}=${v}`);
    return { output: lines.join('\n'), exitCode: 0 };
  }
}

export const bashEmulator = new BashEmulator();
