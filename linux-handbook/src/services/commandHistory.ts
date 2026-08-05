/**
 * Phase 5: Command History Persistence
 * Stores and retrieves command history with favorites
 */

export interface HistoryEntry {
  id: string;
  command: string;
  timestamp: number;
  isFavorite: boolean;
  exitCode?: number;
}

class CommandHistoryService {
  private history: HistoryEntry[] = [];
  private favorites: Set<string> = new Set();
  private readonly STORAGE_KEY = 'terminal-command-history';
  private readonly FAVORITES_KEY = 'terminal-favorite-commands';
  private readonly MAX_HISTORY = 500;

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Add command to history
   */
  addCommand(command: string, exitCode?: number): HistoryEntry {
    const entry: HistoryEntry = {
      id: `${Date.now()}-${Math.random()}`,
      command,
      timestamp: Date.now(),
      isFavorite: this.favorites.has(command),
      exitCode,
    };

    this.history.unshift(entry);

    // Keep only last MAX_HISTORY entries
    if (this.history.length > this.MAX_HISTORY) {
      this.history = this.history.slice(0, this.MAX_HISTORY);
    }

    this.saveToStorage();
    return entry;
  }

  /**
   * Get all history
   */
  getHistory(limit?: number): HistoryEntry[] {
    if (limit) {
      return this.history.slice(0, limit);
    }
    return [...this.history];
  }

  /**
   * Get history by search query
   */
  searchHistory(query: string): HistoryEntry[] {
    return this.history.filter((entry) =>
      entry.command.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Get favorite commands
   */
  getFavoriteCommands(): HistoryEntry[] {
    return this.history.filter((entry) => entry.isFavorite);
  }

  /**
   * Toggle favorite status for a command
   */
  toggleFavorite(command: string): boolean {
    if (this.favorites.has(command)) {
      this.favorites.delete(command);
    } else {
      this.favorites.add(command);
    }

    // Update all history entries with this command
    this.history.forEach((entry) => {
      if (entry.command === command) {
        entry.isFavorite = this.favorites.has(command);
      }
    });

    this.saveToStorage();
    return this.favorites.has(command);
  }

  /**
   * Clear all history
   */
  clearHistory(): void {
    this.history = [];
    this.saveToStorage();
  }

  /**
   * Get recent commands (last N)
   */
  getRecentCommands(count: number = 10): HistoryEntry[] {
    return this.history.slice(0, count);
  }

  /**
   * Get most used commands
   */
  getMostUsedCommands(count: number = 10): HistoryEntry[] {
    const commandMap = new Map<string, number>();

    this.history.forEach((entry) => {
      commandMap.set(entry.command, (commandMap.get(entry.command) || 0) + 1);
    });

    return Array.from(commandMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([cmd]) => {
        const entry = this.history.find((h) => h.command === cmd);
        return entry || { id: '', command: cmd, timestamp: 0, isFavorite: false };
      });
  }

  /**
   * Save to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(this.history)
      );
      localStorage.setItem(
        this.FAVORITES_KEY,
        JSON.stringify(Array.from(this.favorites))
      );
    } catch (error) {
      console.warn('Failed to save command history to storage:', error);
    }
  }

  /**
   * Load from localStorage
   */
  private loadFromStorage(): void {
    try {
      const historyData = localStorage.getItem(this.STORAGE_KEY);
      if (historyData) {
        this.history = JSON.parse(historyData);
      }

      const favoritesData = localStorage.getItem(this.FAVORITES_KEY);
      if (favoritesData) {
        const favorites = JSON.parse(favoritesData);
        this.favorites = new Set(favorites);
      }
    } catch (error) {
      console.warn('Failed to load command history from storage:', error);
    }
  }

  /**
   * Export history as JSON
   */
  exportHistory(): string {
    return JSON.stringify(
      {
        history: this.history,
        favorites: Array.from(this.favorites),
        exportDate: new Date().toISOString(),
      },
      null,
      2
    );
  }

  /**
   * Get statistics about command history
   */
  getStatistics() {
    return {
      totalCommands: this.history.length,
      uniqueCommands: new Set(this.history.map((h) => h.command)).size,
      favoriteCount: this.favorites.size,
      oldestCommand: this.history[this.history.length - 1]?.timestamp || 0,
      newestCommand: this.history[0]?.timestamp || 0,
    };
  }
}

export const commandHistoryService = new CommandHistoryService();
