import * as CheerpX from '@leaningtech/cheerpx';
import { checkCommandInterception } from './commandInterceptor';
import { bashEmulator } from './bashEmulator';

export interface VMResponse { success: boolean; output: string; error?: string; exitCode: number; }

const DISK_IMAGE = 'wss://disks.webvm.io/debian_large_20230522_5044875331.ext2';
const OVERLAY_NAME = 'linux-playbook-sandbox-v1';
const WORKING_DIRECTORY = '/tmp/linux-playbook';
class SecureWebVM {
  private vm: CheerpX.Linux | null = null;
  private overlay: CheerpX.IDBDevice | null = null;
  private initialization: Promise<void> | null = null;
  private outputBuffer = '';
  private fallbackFiles = new Set(['Documents', 'Downloads', 'README.md']);

  private executeFallback(command: string): VMResponse {
    const redirect = command.match(/^echo\s+["']?(.*?)["']?\s*>\s*([^\s]+)$/);
    if (redirect) {
      bashEmulator.writeFile(redirect[2], redirect[1]);
      return { success: true, output: '', exitCode: 0 };
    }
    const emulated = bashEmulator.execute(command);
    if (emulated.exitCode === 0 || emulated.output || emulated.stderr) {
      return { success: emulated.exitCode === 0, output: emulated.output, exitCode: emulated.exitCode, error: emulated.stderr };
    }
    const [name, ...args] = command.split(/\s+/);
    if (name === 'touch' && args[0]) { args.forEach((file) => this.fallbackFiles.add(file)); return { success: true, output: `created: ${args.join(', ')}`, exitCode: 0 }; }
    if (name === 'mkdir' && args[0]) { args.forEach((dir) => this.fallbackFiles.add(dir)); return { success: true, output: `created directory: ${args.join(', ')}`, exitCode: 0 }; }
    if (name === 'ls') return { success: true, output: [...this.fallbackFiles].sort().join('\n'), exitCode: 0 };
    if (name === 'cp' && args.length === 2) { this.fallbackFiles.add(args[1]); return { success: true, output: `copied: ${args[0]} -> ${args[1]}`, exitCode: 0 }; }
    if (name === 'mv' && args.length === 2) { this.fallbackFiles.delete(args[0]); this.fallbackFiles.add(args[1]); return { success: true, output: `moved: ${args[0]} -> ${args[1]}`, exitCode: 0 }; }
    if (name === 'pwd') return { success: true, output: '/home/user', exitCode: 0 };
    if (name === 'echo') return { success: true, output: args.join(' '), exitCode: 0 };
    return { success: false, output: '', error: `${name}: command not found (browser Linux VM unavailable)`, exitCode: 127 };
  }

  private appendOutput(buffer: Uint8Array) {
    const chunk = new TextDecoder().decode(buffer).replace(/\r/g, '');
    this.outputBuffer += chunk;
  }

  async initialize(): Promise<void> {
    if (this.vm) return;
    if (this.initialization) return this.initialization;

    this.initialization = (async () => {
      const cloudDevice = await Promise.race([
        CheerpX.CloudDevice.create(DISK_IMAGE),
        new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error('Unable to connect to the Linux disk image')), 15000)),
      ]);
      this.overlay = await CheerpX.IDBDevice.create(OVERLAY_NAME);
      const overlayDevice = await CheerpX.OverlayDevice.create(cloudDevice, this.overlay);
      const vm = await CheerpX.Linux.create({ mounts: [{ type: 'ext2', path: '/', dev: overlayDevice }] });
      this.vm = vm;
      vm.setCustomConsole((buffer) => this.appendOutput(buffer), 140, 45);
      // The base Debian image may ship /home/user as root-owned. Prepare the
      // handbook's working directory once so regular shell commands can write
      // files there without requiring sudo.
      await vm.run('/bin/sh', ['-c', `mkdir -p ${WORKING_DIRECTORY} && chmod 0777 ${WORKING_DIRECTORY}`]);
    })();

    try { await this.initialization; } catch (error) { this.initialization = null; this.vm = null; throw error; }
  }

  async executeCommand(command: string): Promise<VMResponse> {
    const trimmed = command.trim();
    if (!trimmed) return { success: true, output: '', exitCode: 0 };
    const interception = checkCommandInterception(trimmed);
    if (interception.isBlocked) return { success: false, output: `[BLOCKED] ${interception.message}\n[INFO] ${interception.explanation}`, error: interception.message, exitCode: 127 };

    try {
      await this.initialize();
      if (!this.vm) throw new Error('Linux VM is unavailable');
      this.outputBuffer = '';
      const execution = await Promise.race([
        this.vm.run('/bin/bash', ['-c', trimmed], {
          env: ['HOME=/home/user', 'USER=user', 'SHELL=/bin/bash', 'LANG=C', 'LC_ALL=C'],
          cwd: WORKING_DIRECTORY,
        }),
        new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error('Linux shell command timed out after 10 seconds')), 10000)),
      ]);
      await new Promise((resolve) => window.setTimeout(resolve, 100));
      const exitCode = Number(execution.status);
      if (!Number.isFinite(exitCode)) throw new Error('Linux VM returned an invalid exit status');
      const output = this.outputBuffer.trimEnd();
      this.outputBuffer = '';
      return { success: exitCode === 0, output, exitCode, error: exitCode === 0 ? undefined : `Process exited with code ${exitCode}` };
    } catch (error) {
      // A process that does not terminate must not remain attached to the VM;
      // otherwise every following command waits on the same wedged process.
      if (error instanceof Error && error.message.includes('timed out')) {
        this.vm?.delete();
        this.vm = null;
        this.initialization = null;
        this.outputBuffer = '';
        return { success: false, output: '', error: 'Linux VM command timed out. Check the disk image connection.', exitCode: 124 };
      }
      return this.executeFallback(trimmed);
    }
  }

  async reset(): Promise<void> {
    this.vm?.delete();
    this.vm = null;
    this.initialization = null;
    await this.overlay?.reset();
    this.overlay = null;
  }

  getStatus() { return { initialized: Boolean(this.vm), networking: false, runtime: 'CheerpX Linux' }; }
}

export const secureWebVM = new SecureWebVM();
