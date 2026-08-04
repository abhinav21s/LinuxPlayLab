# Linux Command Handbook

A modern, clean, and highly usable web application for learning and practicing Linux commands with an integrated safe sandbox environment.

## Project Status: Phase 1 Complete ✓

### What's Implemented

- **Modern UI Shell**: Clean, responsive design with dark/light mode toggle
- **Command Data Modeling**: Structured command organization in 7+ sections
- **Sectioned Display**: Collapsible sections with grouped commands
- **Fast Search**: Real-time fuzzy search across command names, descriptions, and examples
- **Dark Mode**: Full dark/light theme support with localStorage persistence
- **Favorites System**: Bookmark commands for quick access
- **Copy Commands**: One-click copy to clipboard
- **Responsive Design**: Works on desktop and tablet

### Project Structure

```
linux-handbook/
├── src/
│   ├── components/          # React components
│   │   ├── SearchBar.tsx
│   │   ├── CommandCard.tsx
│   │   ├── CommandSection.tsx
│   │   └── ThemeToggle.tsx
│   ├── data/
│   │   └── commands.ts      # Command database
│   ├── hooks/
│   │   ├── useSearch.ts     # Search logic with Fuse.js
│   │   └── useLocalStorage.ts # Persistence
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css            # Tailwind styles
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── index.html
```

## Getting Started

### Installation

```bash
cd linux-handbook
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`

### Build

```bash
npm run build
npm run preview
```

## Next Phases

- **Phase 2**: WebVM integration with networking disabled + basic terminal
- **Phase 3**: Command interception layer + blocked command handling
- **Phase 4**: Reset to clean slate + security hardening
- **Phase 5**: Polish UX (Try buttons, dark mode, keyboard shortcuts)
- **Phase 6**: Final testing, accessibility, performance, documentation

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Fuse.js** - Fuzzy search
- **xterm.js** - Terminal (Phase 2)
- **WebVM** - Browser-based Linux VM (Phase 2)

## Features

✓ Dark/Light mode toggle
✓ Fast fuzzy search
✓ Collapsible command sections
✓ Copy to clipboard
✓ Favorites system
✓ Responsive design
✓ localStorage persistence
⚬ WebVM sandbox (coming Phase 2)
⚬ Command interception (coming Phase 3)
⚬ Reset functionality (coming Phase 4)
