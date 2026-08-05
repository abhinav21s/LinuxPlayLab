/**
 * Phase 5: Terminal Color Themes
 * Multiple terminal color schemes for customization
 */

export interface TerminalTheme {
  id: string;
  name: string;
  background: string;
  foreground: string;
  cursor: string;
  selection: string;
  colors: {
    black: string;
    red: string;
    green: string;
    yellow: string;
    blue: string;
    magenta: string;
    cyan: string;
    white: string;
  };
}

class TerminalThemesService {
  private currentTheme: TerminalTheme;
  private themes: Map<string, TerminalTheme> = new Map();
  private readonly STORAGE_KEY = 'terminal-theme';

  constructor() {
    this.initializeThemes();
    this.currentTheme = this.themes.get('dracula')!;
    this.loadTheme();
  }

  /**
   * Initialize default themes
   */
  private initializeThemes(): void {
    // Classic Green Terminal
    this.registerTheme({
      id: 'classic-green',
      name: 'Classic Green',
      background: '#000000',
      foreground: '#00ff00',
      cursor: '#00ff00',
      selection: '#00440022',
      colors: {
        black: '#000000',
        red: '#ff0000',
        green: '#00ff00',
        yellow: '#ffff00',
        blue: '#0000ff',
        magenta: '#ff00ff',
        cyan: '#00ffff',
        white: '#ffffff',
      },
    });

    // Dracula
    this.registerTheme({
      id: 'dracula',
      name: 'Dracula',
      background: '#282a36',
      foreground: '#f8f8f2',
      cursor: '#f8f8f2',
      selection: '#44475a66',
      colors: {
        black: '#21222c',
        red: '#ff5555',
        green: '#50fa7b',
        yellow: '#f1fa8c',
        blue: '#bd93f9',
        magenta: '#ff79c6',
        cyan: '#8be9fd',
        white: '#f8f8f2',
      },
    });

    // Solarized Dark
    this.registerTheme({
      id: 'solarized-dark',
      name: 'Solarized Dark',
      background: '#002b36',
      foreground: '#839496',
      cursor: '#839496',
      selection: '#073642cc',
      colors: {
        black: '#073642',
        red: '#dc322f',
        green: '#859900',
        yellow: '#b58900',
        blue: '#268bd2',
        magenta: '#d33682',
        cyan: '#2aa198',
        white: '#eee8d5',
      },
    });

    // Nord
    this.registerTheme({
      id: 'nord',
      name: 'Nord',
      background: '#2e3440',
      foreground: '#eceff4',
      cursor: '#eceff4',
      selection: '#434c5e99',
      colors: {
        black: '#3b4252',
        red: '#bf616a',
        green: '#a3be8c',
        yellow: '#ebcb8b',
        blue: '#81a1c1',
        magenta: '#b48ead',
        cyan: '#88c0d0',
        white: '#eceff4',
      },
    });

    // One Dark
    this.registerTheme({
      id: 'one-dark',
      name: 'One Dark',
      background: '#282c34',
      foreground: '#abb2bf',
      cursor: '#abb2bf',
      selection: '#3e4451cc',
      colors: {
        black: '#1e222a',
        red: '#e06c75',
        green: '#98c379',
        yellow: '#d19a66',
        blue: '#61afef',
        magenta: '#c678dd',
        cyan: '#56b6c2',
        white: '#abb2bf',
      },
    });

    // Gruvbox Dark
    this.registerTheme({
      id: 'gruvbox-dark',
      name: 'Gruvbox Dark',
      background: '#282828',
      foreground: '#ebdbb2',
      cursor: '#ebdbb2',
      selection: '#504945cc',
      colors: {
        black: '#282828',
        red: '#cc241d',
        green: '#98971a',
        yellow: '#d79921',
        blue: '#458588',
        magenta: '#b16286',
        cyan: '#689d6a',
        white: '#ebdbb2',
      },
    });

    // Set default theme
    this.currentTheme = this.themes.get('dracula')!;
  }

  /**
   * Register a theme
   */
  registerTheme(theme: TerminalTheme): void {
    this.themes.set(theme.id, theme);
  }

  /**
   * Get all available themes
   */
  getThemes(): TerminalTheme[] {
    return Array.from(this.themes.values());
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): TerminalTheme {
    return this.currentTheme;
  }

  /**
   * Set theme by ID
   */
  setTheme(themeId: string): boolean {
    const theme = this.themes.get(themeId);
    if (theme) {
      this.currentTheme = theme;
      this.saveTheme();
      return true;
    }
    return false;
  }

  /**
   * Get theme by ID
   */
  getTheme(themeId: string): TerminalTheme | undefined {
    return this.themes.get(themeId);
  }

  /**
   * Get CSS variables for theme
   */
  getThemeCSSVariables(): Record<string, string> {
    return {
      '--terminal-bg': this.currentTheme.background,
      '--terminal-fg': this.currentTheme.foreground,
      '--terminal-cursor': this.currentTheme.cursor,
      '--terminal-selection': this.currentTheme.selection,
      '--terminal-black': this.currentTheme.colors.black,
      '--terminal-red': this.currentTheme.colors.red,
      '--terminal-green': this.currentTheme.colors.green,
      '--terminal-yellow': this.currentTheme.colors.yellow,
      '--terminal-blue': this.currentTheme.colors.blue,
      '--terminal-magenta': this.currentTheme.colors.magenta,
      '--terminal-cyan': this.currentTheme.colors.cyan,
      '--terminal-white': this.currentTheme.colors.white,
    };
  }

  /**
   * Apply theme to element
   */
  applyThemeToElement(element: HTMLElement): void {
    const vars = this.getThemeCSSVariables();
    Object.entries(vars).forEach(([key, value]) => {
      element.style.setProperty(key, value);
    });
  }

  /**
   * Save current theme to localStorage
   */
  private saveTheme(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, this.currentTheme.id);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }

  /**
   * Load theme from localStorage
   */
  private loadTheme(): void {
    try {
      const savedThemeId = localStorage.getItem(this.STORAGE_KEY);
      if (savedThemeId && this.themes.has(savedThemeId)) {
        this.currentTheme = this.themes.get(savedThemeId)!;
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
    }
  }
}

export const terminalThemesService = new TerminalThemesService();
