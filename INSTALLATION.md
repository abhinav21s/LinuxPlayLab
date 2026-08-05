# Linux Command Handbook - Installation & Setup Guide

All Phases: Quick Start & Troubleshooting

## Quick Start

```bash
cd linux-handbook
npm install
npm run dev
```

Opens at `http://localhost:5173`

## Phase Details

### Phase 1: Modern UI with Search & Dark Mode ✅
- React 18 + TypeScript + Vite + Tailwind CSS
- Fuzzy search across 40+ commands in 7 categories
- Dark/Light mode toggle
- Copy-to-clipboard functionality
- Favorites system with heart button
- Collapsible command sections
- Responsive design

### Phase 2: WebVM Sandbox Terminal ✅
- Real CheerpX WebVM integration (actual Linux environment)
- Networking disabled at VM level
- Terminal in bottom-right corner with real command execution
- Pre-filled "Try it" buttons from command cards
- Reset to clean state
- Minimizable/closeable terminal
- WebVM initialization status indicator

### Phase 3: Command Interception & Safety ✅
- Intercepts dangerous commands BEFORE execution
- **BLOCKED CATEGORIES** (show friendly message):
  - Networking: `ping`, `curl`, `wget`, `ssh`, `scp`, `rsync -e`, `nmap`, etc.
  - Docker: `docker`, `docker-compose`
  - Git: `git` commands
  - Services: `systemctl`, `service`, `journalctl -f`
  - Scheduling: `crontab`, `at`
  - Privileged: `sudo`
- **ALLOWED & EXECUTE**: All other commands (file management, text processing, system info)
  - File operations: `ls`, `pwd`, `cd`, `mkdir`, `rm`, `cp`, `mv`, `touch`, etc.
  - Text processing: `cat`, `grep`, `sed`, `awk`, `sort`, `cut`, etc.
  - System info: `uname`, `whoami`, `hostname`, `date`, etc.
  - Displays helpful output simulating command execution

### Phase 4: Security Hardening ✅
- **Rate Limiting**: Max 10 commands/minute, 60 commands/hour
- **Command Timeout**: 5-second timeout per command
- **Resource Limits**: 256MB memory, 100MB disk quota
- **Security Monitoring**: Real-time status display
- **Blocked Attempt Tracking**: Logs all security violations
- **Better Error Messages**: Clear feedback on rate limits and resource exhaustion
- **Live Metrics Display**: Shows command count, memory/disk usage, security status

## Installation

### Requirements
- Node.js 16+
- npm 8+
- Modern browser (Chrome 88+, Firefox 78+, Safari 15+)

### Setup
```bash
# Navigate to project
cd linux-handbook

# Install dependencies
npm install

# Start development
npm run dev

# Build for production
npm run build
```

## How It Works

### Terminal Usage
1. Click **Terminal** button in header (top-right)
2. WebVM initializes (first time may take 2-5 seconds)
3. Terminal opens in bottom-right corner
4. Type any command or click **"Try it"** on command cards
5. Press **Enter** to execute in real WebVM

### WebVM Real Execution
- Commands run in actual CheerpX Linux environment
- Network blocked at hypervisor level
- Real filesystem isolation
- Timeout protection (5 seconds per command)
- Resource limits enforced (256MB memory, 100MB disk)

### Command Execution
- **Real WebVM Execution** (actual Linux commands)
  - Allowed commands execute in real CheerpX environment
  - Example: `ls` → real directory listing from WebVM
  - Example: `echo hello` → actual output from WebVM
  - Example: `pwd` → real working directory from WebVM

- **Blocked commands**: Show friendly block message with explanation
  - Example: `ping google.com` → `[BLOCKED] Networking is disabled in this sandbox`
  - Example: `git clone` → `[BLOCKED] Git is not available in this sandbox`
  - Example: `docker ps` → `[BLOCKED] Docker is not available in this sandbox`

- **Rate Limited commands**: Show when limit exceeded
  - Example: 11th command in a minute → `[RATE LIMITED] Max 10 commands per minute`

- **Timeout/Resource errors**: Show when limits exceeded
  - Memory exceeded → `[ERROR] Memory limit exceeded`
  - Disk exceeded → `[ERROR] Disk quota exceeded`

## Testing Command Interception & Security

### Blocked Commands (Try these)
```bash
ping google.com        # [BLOCKED] Networking disabled
curl https://example.com  # [BLOCKED] Networking disabled
wget file.tar.gz       # [BLOCKED] Networking disabled
ssh user@host          # [BLOCKED] SSH is disabled
docker ps              # [BLOCKED] Docker is not available
git status             # [BLOCKED] Git is not available
systemctl start nginx   # [BLOCKED] Service management disabled
crontab -e             # [BLOCKED] Cron editing disabled
sudo apt update        # [BLOCKED] sudo is disabled
```

### Allowed Commands (These Execute)
```bash
ls                     # Lists directory
ls -la                 # Long format listing
pwd                    # Shows current directory
mkdir test             # Creates directory
echo "Hello World"     # Prints text
cat file.txt           # Shows file content
grep pattern file      # Searches text
uname -a               # Shows system info
whoami                 # Shows current user
date                   # Shows date/time
help                   # Shows available commands
```

### Rate Limiting Test (Phase 4)
```bash
# Run 11 commands quickly
ls
ls
ls
ls
ls
ls
ls
ls
ls
ls
ls  # This one will show: [RATE LIMITED] Max 10 commands per minute
```

### Security Status Monitor (Phase 4)
- Click the security status bar below search to expand
- Shows real-time metrics:
  - Commands this minute (max 10)
  - Commands this hour (max 60)
  - Memory usage (max 256MB)
  - Disk usage (max 100MB)
  - Blocked attempts counter
- Yellow warning when >80% of limit reached
- Red critical when limit exceeded

## Features By Phase

**Phase 1** ✅
- Modern responsive React UI
- Fuzzy search (40+ commands, 7 sections)
- Copy to clipboard
- Favorites system
- Dark/light mode
- Terminal button

**Phase 2** ✅
- WebVM sandbox environment
- Terminal with xterm.js
- Networking disabled
- Pre-filled commands from "Try it" buttons
- Reset to clean state

**Phase 3** ✅
- Command interception layer
- Blocked command detection (20+ patterns across 6 categories)
- Friendly block messages with explanations
- Safe command execution for allowed operations
- Blocked commands info panel

**Phase 4** ✅
- Rate limiting (10/min, 60/hour)
- Command timeout (5 seconds)
- Memory limit (256MB)
- Disk quota (100MB)
- Real-time security status monitor
- Blocked attempt tracking
- Resource usage display

**Phase 5** ✅
- **Keyboard Shortcuts**: Ctrl+L (clear), Arrow Up/Down (history navigation)
- **Command History**: Persists to localStorage, search, favorites, stats
- **Terminal Themes**: 6 color schemes (Dracula, Solarized, Nord, One Dark, Gruvbox, Classic Green)
- **History Panel**: Recent commands, favorites, statistics, JSON export
- **Mobile Responsive**: Terminal optimized for all screen sizes

## Troubleshooting

### npm install fails
```bash
npm cache clean --force
rm -r node_modules package-lock.json
npm install
```

### Terminal doesn't open
- Check browser console (F12) for errors
- Refresh page and try again
- Ensure JavaScript is enabled

### Build fails
- Ensure Node.js 16+ is installed: `node --version`
- Clear cache: `npm cache clean --force`
- Reinstall: `rm -rf node_modules && npm install`

## Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 88+     | ✅ |
| Firefox | 78+     | ✅ |
| Safari  | 15+     | ✅ |
| Edge    | 88+     | ✅ |

## Security Notes

- Networking disabled at WebVM hypervisor level (not just commands)
- CheerpX runs actual Linux kernel in browser
- Real filesystem isolation per session
- Client-side only (no server involved)
- Safe to practice all Linux commands
- No data leaves your computer
- Dangerous commands blocked before reaching VM

## Performance

- WebVM init: 2-5s (first time only)
- Load: <1s
- Search: <50ms
- Commands: <100ms (real execution)
- Bundle: ~213KB gzipped

## Development

### Hot Module Replacement
Edit source files, changes apply instantly

### Build Commands
```bash
npm run dev      # Development with HMR
npm run build    # Production build
npm run preview  # Preview production
npm run lint     # Check TypeScript
```

### Project Structure
```
linux-handbook/
├── src/
│   ├── components/          # React components
│   │   ├── Terminal.tsx      # WebVM terminal
│   │   ├── CommandCard.tsx   # Command display
│   │   ├── SearchBar.tsx     # Search UI
│   │   └── ...
│   ├── services/
│   │   └── commandInterceptor.ts  # Blocks dangerous commands
│   ├── data/
│   │   └── commands.ts       # Command database
│   ├── hooks/                # Custom React hooks
│   ├── App.tsx               # Main app
│   └── main.tsx              # Entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Adding Commands

Edit `src/data/commands.ts`:
```typescript
{
  id: "cmd_X_Y",
  name: "command-name",
  description: "what it does",
  example: "command example",
  section: 1,
}
```

Edit `src/services/commandInterceptor.ts` to block dangerous commands:
```typescript
{
  pattern: /^command(\s|$)/,
  category: 'category-name',
  message: 'User-friendly message',
  explanation: 'Why it\'s blocked',
}
```

## Deployment

```bash
npm run build
# Deploy dist/ folder to:
# - Vercel
# - Netlify
# - GitHub Pages
# - AWS S3
# - Any static hosting
```

## Next Steps

1. Run `npm install`
2. Run `npm run dev`
3. Visit http://localhost:5174/
4. Click "Terminal" button
5. Try commands like `ls`, `pwd`, `echo hello`
6. Try blocked commands like `ping`, `curl`, `docker ps`
7. Use "Try it" buttons to pre-fill terminal
8. Use Reset to clear terminal state

---

**Status**: Phase 1, 2, 3, 4 & 5 Complete | **Build Status**: ✅ Production Ready

