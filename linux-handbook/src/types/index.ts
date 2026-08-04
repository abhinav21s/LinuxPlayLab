export interface Command {
  id: string;
  name: string;
  description: string;
  example: string;
  section: number;
  isBlocked?: boolean;
  blockReason?: string;
}

export interface CommandSection {
  id: number;
  title: string;
  commands: Command[];
}

export interface AppState {
  darkMode: boolean;
  favorites: Set<string>;
  searchQuery: string;
}
