/**
 * WebVM Service Layer
 * Manages CheerpX VM initialization with:
 * - Networking disabled (no Tailscale, no outbound connections)
 * - Client-side only execution (IndexedDB overlay)
 * - Terminal connection
 * 
 * CheerpX is loaded from CDN, not npm
 */

import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

// CheerpX is loaded from CDN as a global
declare global {
  interface Window {
    CheerpX?: {
      VM: (config: any) => any;
    };
  }
}

export interface WebVMConfig {
  networking: boolean;
  mount: { [path: string]: string };
  onOutput?: (data: string) => void;
  onError?: (error: string) => void;
}

export class WebVMService {
  private vm: any = null;
  private terminal: Terminal | null = null;
  private fitAddon: FitAddon | null = null;
  private isInitialized = false;
  private isInitializing = false;

  /**
   * Initialize WebVM with networking disabled
   */
  async initialize(config: Partial<WebVMConfig> = {}): Promise<boolean> {
    if (this.isInitialized) return true;
    if (this.isInitializing) return false;

    this.isInitializing = true;

    try {
      console.log('🚀 Initializing WebVM with networking disabled...');

      // Load CheerpX library if not already loaded
      if (!window.CheerpX) {
        await this.loadCheerpXLibrary();
      }

      // Create VM with security settings
      this.vm = window.CheerpX.VM({
        mount: {
          '/tmp': 'tmp',
          '/home': 'home',
          ...config.mount,
        },
        // Network isolation - crucial for security
        networking: false,
        // Use IndexedDB for persistent overlay
        fstype: 'IndexedDB',
      });

      // Initialize terminal
      this.terminal = new Terminal({
        rows: 24,
        cols: 80,
        theme: {
          background: '#0f172a',
          foreground: '#e2e8f0',
          cursor: '#0ea5e9',
          cursorAccent: '#0f172a',
          selection: 'rgba(14, 165, 233, 0.3)',
          black: '#000000',
          red: '#ef4444',
          green: '#22c55e',
          yellow: '#eab308',
          blue: '#3b82f6',
          magenta: '#ec4899',
          cyan: '#06b6d4',
          white: '#ffffff',
          brightBlack: '#6b7280',
          brightRed: '#fca5a5',
          brightGreen: '#86efac',
          brightYellow: '#fde047',
          brightBlue: '#93c5fd',
          brightMagenta: '#f472b6',
          brightCyan: '#22d3ee',
          brightWhite: '#f9fafb',
        },
        fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro", monospace',
        fontSize: 14,
        lineHeight: 1.2,
        letterSpacing: 0,
        cursorBlink: true,
        cursorStyle: 'block',
      });

      this.fitAddon = new FitAddon();
      this.terminal.loadAddon(this.fitAddon);

      // Connect terminal to VM
      if (this.vm.run && this.terminal) {
        // Terminal input handler
        this.terminal.onData((data: string) => {
          if (this.vm && this.vm.stdin) {
            this.vm.stdin.write(data);
          }
        });

        // VM output to terminal
        if (this.vm.stdout) {
          this.vm.stdout.onData((data: Uint8Array) => {
            const text = new TextDecoder().decode(data);
            this.terminal?.write(text);
            config.onOutput?.(text);
          });
        }

        // Error handling
        if (this.vm.stderr) {
          this.vm.stderr.onData((data: Uint8Array) => {
            const text = new TextDecoder().decode(data);
            const errorText = `\x1b[31m${text}\x1b[0m`; // Red color
            this.terminal?.write(errorText);
            config.onError?.(text);
          });
        }
      }

      this.isInitialized = true;
      console.log('✅ WebVM initialized successfully (networking disabled)');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize WebVM:', error);
      config.onError?.(`Failed to initialize WebVM: ${error}`);
      this.isInitializing = false;
      return false;
    }
  }

  /**
   * Attach terminal to DOM element
   */
  attachTerminal(element: HTMLElement): void {
    if (!this.terminal) {
      throw new Error('Terminal not initialized. Call initialize() first.');
    }
    this.terminal.open(element);
    this.fitAddon?.fit();
  }

  /**
   * Execute a command in the VM
   */
  async executeCommand(command: string): Promise<string> {
    if (!this.isInitialized || !this.vm) {
      throw new Error('WebVM not initialized');
    }

    return new Promise((resolve, reject) => {
      try {
        if (this.vm.run) {
          // Run command and capture output
          const result = this.vm.run(command);
          resolve(result?.toString() || '');
        } else {
          reject(new Error('VM run method not available'));
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Write to terminal input
   */
  writeToTerminal(data: string): void {
    if (this.terminal) {
      this.terminal.write(data);
    }
  }

  /**
   * Fit terminal to window
   */
  fitTerminal(): void {
    this.fitAddon?.fit();
  }

  /**
   * Clear terminal
   */
  clearTerminal(): void {
    this.terminal?.clear();
  }

  /**
   * Reset filesystem and terminal to clean state
   */
  async reset(): Promise<boolean> {
    try {
      console.log('🔄 Resetting WebVM filesystem...');

      // Clear IndexedDB overlay
      if (indexedDB && window.IDBDatabase) {
        const dbs = await indexedDB.databases();
        for (const db of dbs) {
          if (db.name?.includes('cheerpx') || db.name?.includes('webvm')) {
            indexedDB.deleteDatabase(db.name);
          }
        }
      }

      // Clear terminal
      this.clearTerminal();

      // Reinitialize VM
      this.isInitialized = false;
      this.vm = null;
      const success = await this.initialize();

      if (success) {
        console.log('✅ WebVM reset to clean state');
        this.terminal?.write('\x1b[32m✓ System reset to clean state\x1b[0m\n');
      }

      return success;
    } catch (error) {
      console.error('❌ Failed to reset WebVM:', error);
      return false;
    }
  }

  /**
   * Get VM status
   */
  getStatus(): {
    initialized: boolean;
    networking: boolean;
    fsType: string;
  } {
    return {
      initialized: this.isInitialized,
      networking: false, // Always false - security critical
      fsType: 'IndexedDB (client-side only)',
    };
  }

  /**
   * Dispose and cleanup
   */
  dispose(): void {
    if (this.terminal) {
      this.terminal.dispose();
      this.terminal = null;
    }
    this.fitAddon = null;
    this.vm = null;
    this.isInitialized = false;
  }

  /**
   * Load CheerpX library from CDN
   */
  private loadCheerpXLibrary(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Try loading from CDN - using a stable version
      const script = document.createElement('script');
      script.src = 'https://cheerpxdev.ltmx.net/releases/v2.3.0/cheerpx.js';
      script.async = true;

      script.onload = () => {
        console.log('✅ CheerpX library loaded');
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load CheerpX library from CDN'));
      };

      document.head.appendChild(script);
    });
  }
}

// Singleton instance
let vmServiceInstance: WebVMService | null = null;

export const getWebVMService = (): WebVMService => {
  if (!vmServiceInstance) {
    vmServiceInstance = new WebVMService();
  }
  return vmServiceInstance;
};

export const resetWebVMService = (): void => {
  vmServiceInstance = null;
};
