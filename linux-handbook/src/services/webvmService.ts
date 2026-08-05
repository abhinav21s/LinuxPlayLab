/**
 * Real WebVM Integration (Multiple CDN options + fallback)
 * Actual Linux environment execution with network disabled
 */

declare global {
  interface Window {
    CheerpX?: any;
  }
}

export interface WebVMInstance {
  ready: boolean;
  running: boolean;
  terminal: any;
  executeCommand: (cmd: string) => Promise<string>;
  resize: (cols: number, rows: number) => void;
}

let vmInstance: WebVMInstance | null = null;

// Multiple CDN sources to try
const CHEERPX_CDN_SOURCES = [
  'https://cheerpx.io/releases/latest/cheerpx.js',
  'https://cdn.jsdelivr.net/npm/cheerpx@latest/dist/cheerpx.js',
  'https://unpkg.com/cheerpx@latest/dist/cheerpx.js',
];

/**
 * Load CheerpX from CDN with fallback options
 */
const loadCheerpXScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const tryNextSource = (index: number) => {
      if (index >= CHEERPX_CDN_SOURCES.length) {
        reject(new Error('Failed to load CheerpX from all CDN sources'));
        return;
      }

      const src = CHEERPX_CDN_SOURCES[index];
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.crossOrigin = 'anonymous';

      script.onload = () => {
        if (window.CheerpX) {
          resolve();
        } else {
          tryNextSource(index + 1);
        }
      };

      script.onerror = () => {
        tryNextSource(index + 1);
      };

      document.body.appendChild(script);
    };

    if (window.CheerpX) {
      resolve();
    } else {
      tryNextSource(0);
    }
  });
};

/**
 * Initialize WebVM with CheerpX
 */
export const initializeWebVM = async (): Promise<WebVMInstance> => {
  if (vmInstance && vmInstance.ready) {
    return vmInstance;
  }

  try {
    // Load CheerpX library
    await loadCheerpXScript();

    const CheerpX = window.CheerpX;
    if (!CheerpX) {
      throw new Error('CheerpX library not available after loading');
    }

    // Create WebVM instance with no networking
    const vm = await CheerpX.Linux.create({
      mounts: {
        '/root': new CheerpX.FS.Directory(),
        '/tmp': new CheerpX.FS.Directory(),
        '/home': new CheerpX.FS.Directory(),
        '/dev': new CheerpX.FS.Directory(),
      },
      // Disable networking completely
      net: false,
      // Minimal CPU and memory
      cpu_count: 1,
      memory_size: 256 * 1024 * 1024, // 256MB
    });

    vmInstance = {
      ready: true,
      running: true,
      terminal: vm,
      executeCommand: async (cmd: string) => {
        try {
          const result = await vm.run(cmd, {
            cwd: '/root',
            timeout: 5000, // 5 second timeout
            env: {
              TERM: 'xterm-256color',
              PATH: '/usr/local/bin:/usr/bin:/bin',
            },
          });

          // Handle different result formats
          if (typeof result === 'string') {
            return result;
          }
          if (result.stdout) {
            return result.stdout;
          }
          if (result.output) {
            return result.output;
          }
          if (result.exitCode === 0) {
            return '(success)';
          }
          return '';
        } catch (error: any) {
          // Return error message instead of throwing
          if (error.timeout) {
            return `[TIMEOUT] Command exceeded 5 second limit`;
          }
          return `[ERROR] ${error.message || 'Command execution error'}`;
        }
      },
      resize: (cols: number, rows: number) => {
        if (vm.resize) {
          vm.resize(cols, rows);
        }
      },
    };

    return vmInstance;
  } catch (error: any) {
    console.error('WebVM initialization error:', error);
    throw new Error(`WebVM failed to initialize: ${error.message}`);
  }
};

/**
 * Execute command in WebVM
 */
export const executeInWebVM = async (command: string): Promise<string> => {
  if (!vmInstance) {
    throw new Error('WebVM not initialized');
  }

  if (!vmInstance.ready) {
    throw new Error('WebVM not ready');
  }

  try {
    const output = await vmInstance.executeCommand(command);
    return output || '(no output)';
  } catch (error: any) {
    throw new Error(error.message || 'WebVM command execution failed');
  }
};

/**
 * Get WebVM instance
 */
export const getWebVMInstance = (): WebVMInstance | null => {
  return vmInstance;
};

/**
 * Terminate WebVM
 */
export const terminateWebVM = () => {
  if (vmInstance) {
    vmInstance.ready = false;
    vmInstance.running = false;
    vmInstance = null;
  }
};
