/**
 * Phase 5: Keyboard Shortcuts
 * Global keyboard shortcuts for enhanced UX
 */

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  handler: () => void;
}

class KeyboardShortcutsService {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();

  /**
   * Register a keyboard shortcut
   */
  registerShortcut(shortcut: KeyboardShortcut): void {
    const key = this.getShortcutKey(shortcut);
    this.shortcuts.set(key, shortcut);
  }

  /**
   * Unregister a keyboard shortcut
   */
  unregisterShortcut(key: string, ctrl?: boolean, shift?: boolean, alt?: boolean): void {
    const shortcutKey = this.buildShortcutKey(key, ctrl, shift, alt);
    this.shortcuts.delete(shortcutKey);
  }

  /**
   * Get shortcut by key combination
   */
  getShortcut(key: string, ctrl?: boolean, shift?: boolean, alt?: boolean): KeyboardShortcut | undefined {
    const shortcutKey = this.buildShortcutKey(key, ctrl, shift, alt);
    return this.shortcuts.get(shortcutKey);
  }

  /**
   * Get all shortcuts
   */
  getAllShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Handle keyboard event
   */
  handleKeyboardEvent(event: KeyboardEvent): KeyboardShortcut | undefined {
    const shortcut = this.getShortcut(event.key, event.ctrlKey, event.shiftKey, event.altKey);
    if (shortcut) {
      shortcut.handler();
    }
    return shortcut;
  }

  private getShortcutKey(shortcut: KeyboardShortcut): string {
    return this.buildShortcutKey(shortcut.key, shortcut.ctrl, shortcut.shift, shortcut.alt);
  }

  private buildShortcutKey(key: string, ctrl?: boolean, shift?: boolean, alt?: boolean): string {
    const parts: string[] = [];
    if (ctrl) parts.push('ctrl');
    if (shift) parts.push('shift');
    if (alt) parts.push('alt');
    parts.push(key.toLowerCase());
    return parts.join('+');
  }

  /**
   * Format shortcut for display
   */
  formatShortcut(shortcut: KeyboardShortcut): string {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    parts.push(shortcut.key.toUpperCase());
    return parts.join('+');
  }
}

export const keyboardShortcutsService = new KeyboardShortcutsService();

/**
 * Default shortcuts configuration
 */
export const DEFAULT_SHORTCUTS = {
  TOGGLE_TERMINAL: { key: '`', ctrl: true, description: 'Toggle Terminal' },
  CLEAR_TERMINAL: { key: 'l', ctrl: true, description: 'Clear Terminal' },
  SEARCH_FOCUS: { key: 'k', ctrl: true, description: 'Focus Search' },
  TERMINAL_HISTORY_UP: { key: 'ArrowUp', description: 'Previous Command' },
  TERMINAL_HISTORY_DOWN: { key: 'ArrowDown', description: 'Next Command' },
  COPY_COMMAND: { key: 'c', ctrl: true, description: 'Copy Command' },
  HELP: { key: '?', shift: true, description: 'Show Help' },
};
