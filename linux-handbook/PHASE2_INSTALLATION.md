# Phase 2 Installation & Setup Guide

## Quick Start

### Prerequisites
- Node.js 16+ (verify: `node --version`)
- npm 8+ (verify: `npm --version`)
- Any modern browser (Chrome 88+, Firefox 78+, Safari 15+)

### Installation Steps

```bash
# 1. Navigate to project directory
cd linux-handbook

# 2. Install dependencies
npm install

# 3. Install Tailwind CSS development dependencies
npm install -D tailwindcss postcss autoprefixer

# 4. Initialize Tailwind (creates config files)
npx tailwindcss init -p

# 5. Start development server
npm run dev

# 6. Open browser to http://localhost:5173
```

**Note**: CheerpX (WebVM library) is loaded from CDN at runtime, not installed via npm.

## What You'll See

1. **Header** with search bar and theme toggle
2. **Command sections** (File & Directory, Viewing & Editing, etc.)
3. **Terminal button** in top-right header
4. **Command cards** with copy and "Try it" buttons

## First Time Terminal Use

1. Click the **"Terminal"** button in the header
2. Wait for initialization (2-5 seconds on first load)
3. You should see a Unix shell prompt (`$`)
4. Type commands or click "Try it" on any command card

## Testing WebVM Integration

### Verify Networking is Disabled

Try these commands in the terminal - they should all fail gracefully:

```bash
# These should NOT work (no network):
ping google.com          # Network disabled
curl example.com         # Network disabled
wget https://...         # Network disabled
ssh user@host            # Network disabled
nslookup example.com     # Network disabled

# These SHOULD work:
ls -la                   # ✅ Works
mkdir test               # ✅ Works
cd test                  # ✅ Works
echo "hello" > file.txt  # ✅ Works
cat file.txt             # ✅ Works
pwd                      # ✅ Works
whoami                   # ✅ Works
uname -a                 # ✅ Works
```

## Features to Try

### 1. Search Functionality
- Type in the search bar (top of page)
- Search by command name, description, or example
- Try: "search", "permissions", "grep"

### 2. Dark Mode
- Click the sun/moon icon (top-right)
- Settings persist across refreshes

### 3. Favorites System
- Click the heart icon on any command card
- Favorites persist in localStorage

### 4. Copy Commands
- Click "Copy" on any command card
- Command is copied to clipboard
- Paste anywhere with Ctrl+V (or Cmd+V on Mac)

### 5. Try Commands in Terminal
- Click "Try it" on any command card
- Example command pre-fills in terminal
- Press Enter to execute

### 6. Reset Sandbox
- Click the refresh icon in terminal header
- Filesystem is completely reset
- All changes are cleared
- Returns to clean Linux state

### 7. Terminal Controls
- **Minimize**: Collapse terminal to header
- **Maximize**: Restore after minimize
- **Close (X)**: Hide terminal
- Click Terminal button to re-open

## Troubleshooting

### Terminal shows "Initializing..." indefinitely

**Cause**: CheerpX library may be slow to load or CDN is unreachable
**Solution**:
1. Check browser console (F12) for errors
2. Verify internet connection (to load CheerpX from CDN)
3. Try refreshing the page
4. Wait 10+ seconds on slow connections

### "Terminal Error" message appears

**Cause**: WebVM initialization failed (usually CDN issue or browser incompatibility)
**Solution**:
1. Check browser compatibility (Chrome 88+, Firefox 78+, Safari 15+)
2. Verify browser has WebAssembly support
3. Try a different browser
4. Check browser console for detailed error message

### Commands aren't executing

**Cause**: Terminal not fully initialized
**Solution**:
1. Wait for initialization indicator to disappear
2. Click Terminal to close/re-open
3. Hard refresh page (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac)

### Terminal is very slow

**Cause**: First terminal initialization can be slow (2-5s) on slow connections
**Solution**:
1. This is normal - subsequent commands are faster
2. Ensure good internet connection
3. Close browser extensions that might interfere

### "No network" messages for all commands

**This is expected and intended!** Networking is disabled by design for security.
- If you see this for **networking commands** (ping, curl, ssh), that's correct
- If you see it for **file operations** (ls, mkdir), that's a bug - please check console

## Development Mode Features

### Hot Module Replacement (HMR)
- Edit component files and see changes instantly
- No need to refresh page
- TypeScript errors show in console

### View WebVM Status

In browser console (F12), run:
```javascript
import { getWebVMService } from './src/services/webvmService.js';
getWebVMService().getStatus();
// Output: { initialized: boolean, networking: boolean, fsType: string }
```

### Clear IndexedDB (Sandbox Storage)

```javascript
// In browser console:
indexedDB.databases().then(dbs => {
  dbs.forEach(db => {
    if (db.name?.includes('cheerpx')) {
      indexedDB.deleteDatabase(db.name);
    }
  });
});

// Or via DevTools:
// Storage → IndexedDB → Right-click database → Delete
```

## Building for Production

```bash
# Build optimized version
npm run build

# Preview production build locally
npm run preview

# Output in dist/ folder ready to deploy
```

## Next Steps

- **Phase 3**: Command interception layer (blocking dangerous commands)
- **Phase 4**: Security hardening and rate limiting
- **Phase 5**: Enhanced UX with keyboard shortcuts and themes
- **Phase 6**: Full accessibility and performance optimization

## Getting Help

1. Check [README.md](./README.md) for overview
2. Check [SECURITY.md](./SECURITY.md) for security details
3. Open browser DevTools (F12) to see console logs
4. Check GitHub issues or create a new one

## Known Limitations (Phase 2)

- ⚠️ Persistent services (systemctl, cron) cannot be used (no point in sandbox)
- ⚠️ Network commands (ping, curl, ssh) are blocked at VM level
- ⚠️ No Docker or container commands available
- ⚠️ Some advanced features may not work in sandbox (systemd, udev)
- ⚠️ Terminal is single-user, non-interactive mode partially supported

These are intentional design choices for security and usability.

## Performance Tips

1. **Close Terminal** when not using it (saves memory)
2. **Reset Sandbox** if terminal becomes slow (clears IndexedDB)
3. **Hard Refresh** if UI feels sluggish
4. **Clear Browser Cache** if experiencing issues after updates

---

**You're all set!** Enjoy learning Linux commands safely. 🎉
