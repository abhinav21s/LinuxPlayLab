# Linux Command Handbook

A modern, clean, and highly usable web application for learning and practicing Linux commands with an integrated safe sandbox environment.

## Project Status: Phase 2 Complete ✓

### What's Implemented in Phase 2

- **WebVM Integration**: CheerpX-based Linux VM running entirely in the browser
- **Networking Disabled**: All network access blocked at the VM level (no ping, curl, ssh, etc.)
- **Client-Side Only**: All execution happens in IndexedDB overlay, no server involvement
- **xterm.js Terminal**: Professional terminal UI with themes, cursor, scrollback
- **Terminal I/O**: Full bidirectional communication between UI and WebVM
- **Pre-filled Commands**: "Try it" buttons send command example directly to terminal
- **Reset Functionality**: Complete filesystem reset to clean state via "Reset" button
- **Error Handling**: Graceful fallback if WebVM unavailable
- **Security Indicators**: Clear visual indication of sandbox isolation

### Project Structure (Updated)

```
linux-handbook/
├── src/
│   ├── components/
│   │   ├── SearchBar.tsx
│   │   ├── CommandCard.tsx
│   │   ├── CommandSection.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── Terminal.tsx              ← NEW
│   ├── services/
│   │   └── webvmService.ts           ← NEW (WebVM wrapper)
│   ├── data/
│   │   └── commands.ts
│   ├── hooks/
│   │   ├── useSearch.ts
│   │   └── useLocalStorage.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx                       ← UPDATED
│   ├── main.tsx
│   └── index.css                     ← UPDATED (xterm styles)
├── package.json                      ← UPDATED
├── SECURITY.md                       ← NEW
└── README.md                         ← THIS FILE
```

## Features

### Phase 1 Features ✓
✓ Dark/Light mode toggle with persistence
✓ Fast fuzzy search with Fuse.js
✓ Collapsible command sections
✓ Copy to clipboard
✓ Favorites system
✓ Responsive design
✓ localStorage persistence

### Phase 2 Features ✓
✓ WebVM sandbox (CheerpX)
✓ Networking completely disabled
✓ xterm.js terminal
✓ Terminal resize and minimize
✓ Pre-filled commands from UI
✓ Reset to clean slate
✓ Terminal history
✓ Dark theme terminal
✓ Error handling & fallbacks

### Upcoming Features
⚬ Command interception layer (Phase 3)
⚬ Blocked command warnings (Phase 3)
⚬ Rate limiting (Phase 4)
⚬ Keyboard shortcuts (Phase 5)
⚬ Command history tracking (Phase 5)

## Getting Started

### Installation

```bash
cd linux-handbook
npm install
npm run dev
```

Opens at `http://localhost:5173`

### Build

```bash
npm run build
npm run preview
```

## Architecture

### WebVM Service Layer (`webvmService.ts`)

Provides a clean API for:
- **Initialize**: Start WebVM with networking disabled
- **AttachTerminal**: Connect xterm.js to VM
- **ExecuteCommand**: Run commands programmatically
- **Reset**: Clear filesystem and reinitialize
- **Status**: Check VM state and configuration

The terminal uses the official CheerpX Linux runtime with a streamed Debian
image and an IndexedDB writable overlay. The command interceptor remains in
front of the VM to block networking, Docker, Git, service management,
scheduling, and privileged operations. Vercel deployments use `vercel.json` to
enable the cross-origin isolation headers required by the browser VM.

### Terminal Component (`Terminal.tsx`)

Handles:
- Terminal rendering and resizing
- Loading states
- Error states with fallbacks
- Reset UI
- Minimize/maximize
- Footer status information

### Integration in App

- "Terminal" button in header to toggle visibility
- Terminal opens as fixed panel on bottom-right
- "Try it" buttons on commands pre-fill terminal
- Reset button clears filesystem

## Security Model

### What's Blocked (By Design)

❌ **All networking**: ping, curl, wget, ssh, scp, etc.
❌ **Persistent services**: systemctl, service, cron
❌ **Containers**: All docker commands
❌ **Privileged ops**: Anything requiring root

### What Works

✅ File operations: ls, mkdir, rm, cp, mv, touch
✅ Text processing: grep, sed, awk, sort
✅ System info: uname, uptime, free, df
✅ Shell scripting: bash, functions, loops
✅ Compression: tar, zip, gzip

See [SECURITY.md](./SECURITY.md) for detailed threat model and testing.

## Deployment

### Production Build

```bash
npm run build
```

Output goes to `dist/` folder. Deploy to any static host:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any web server

### Important Notes for Deployment

1. **COOP/COEP Headers**: Some browsers need these for SharedArrayBuffer
   ```
   Cross-Origin-Opener-Policy: same-origin
   Cross-Origin-Embedder-Policy: require-corp
   ```

2. **CSP Headers**: Consider allowing CheerpX CDN
   ```
   script-src 'self' https://cheerpxdev.ltmx.net
   ```

3. **Size**: Production build is ~500KB gzipped (includes all dependencies)

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling with dark mode
- **Lucide React** - Icon library
- **Fuse.js** - Fuzzy search
- **xterm.js** - Terminal emulation
- **CheerpX** - Linux VM in WebAssembly (loaded from CDN, not npm)

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome  | 88+     | ✅ Full |
| Firefox | 78+     | ✅ Full |
| Safari  | 15+     | ✅ Full |
| Edge    | 88+     | ✅ Full |

## Development Notes

### Adding New Commands

Edit `src/data/commands.ts`:
```typescript
{
  id: "cmd_1_11",
  name: "ls",
  description: "list directory contents",
  example: "ls -la /home",
  section: 1,
}
```

### Customizing Terminal Theme

Edit `webvmService.ts` `Terminal` constructor:
```typescript
theme: {
  background: '#0f172a',
  foreground: '#e2e8f0',
  // ... customize colors
}
```

### Debugging WebVM

Check browser console for:
- CheerpX library load status
- VM initialization logs
- Command execution output
- Network errors (will show as "no network" instead)

## Next Phases

### Phase 3: Command Interception Layer
- Intercept dangerous commands before reaching VM
- Show friendly "blocked" messages
- Log blocked command attempts
- User-friendly explanations

### Phase 4: Security Hardening
- Rate limiting
- Command timeout enforcement
- Memory limit enforcement
- Disk quota tracking
- Better error messages

### Phase 5: Polish & UX
- Keyboard shortcuts
- Command history persistence
- Favorite commands in terminal
- Terminal color themes
- Mobile terminal optimization

### Phase 6: Testing & Documentation
- End-to-end security tests
- Performance benchmarks
- Accessibility audit (WCAG 2.1)
- Comprehensive user documentation
- Video tutorials

## Contributing

This is an educational project. Contributions welcome for:
- Additional commands to handbook
- UI improvements
- Security hardening
- Documentation
- Bug fixes

## License

MIT

## Support

For issues, suggestions, or security concerns:
1. Check existing documentation
2. Search GitHub issues
3. Review SECURITY.md for security questions
4. Submit issue with reproduction steps
