# Security & Sandbox Architecture

## Phase 2: WebVM Integration with Network Isolation

### Security Guarantees

✅ **Networking Disabled** - All network access is blocked at the VM level
✅ **Client-Side Only** - All code execution happens in the browser, no server involvement
✅ **IndexedDB Isolation** - VM filesystem is isolated in browser IndexedDB
✅ **No Shell Escape** - WebVM runs in a sandboxed WebAssembly environment
✅ **No Root by Default** - VM runs as non-root user
✅ **Reset Capability** - Complete filesystem reset to clean state

### Architecture

```
┌─────────────────────────────────────────┐
│   Linux Command Handbook UI (React)     │
├─────────────────────────────────────────┤
│  WebVM Service Layer (webvmService.ts)  │
│  - Initialize VM with networking=false  │
│  - Terminal I/O handling               │
│  - Command execution                   │
│  - Reset functionality                 │
├─────────────────────────────────────────┤
│ CheerpX WebVM (WebAssembly VM)          │
│  - Network Stack: DISABLED              │
│  - Filesystem: IndexedDB Overlay        │
│  - User: Non-root                       │
├─────────────────────────────────────────┤
│ Browser Sandbox (Native)                │
│  - SharedArrayBuffer Isolation          │
│  - WebAssembly Execution Environment    │
└─────────────────────────────────────────┘
```

### Implementation Details

#### 1. Networking Disabled
```typescript
// In webvmService.ts
this.vm = window.CheerpX.VM({
  networking: false,  // ← CRITICAL: Disables all network access
  fstype: 'IndexedDB', // ← Client-side only
});
```

**What this blocks:**
- All TCP/UDP connections
- DNS resolution
- Ping, curl, wget, ssh, scp
- Any outbound connections
- Tailscale, VPN, proxy
- HTTP/HTTPS requests

#### 2. Client-Side Execution
- Terminal runs in browser thread
- No server-side code execution
- No external API calls for command execution
- All data stays in IndexedDB

#### 3. IndexedDB Isolation
- VM filesystem is sandboxed in IndexedDB
- Each browser profile has separate database
- Can be cleared via DevTools → Storage
- Persistent across page reloads (intended)

#### 4. Reset Functionality
```typescript
async reset() {
  // Clears all IndexedDB databases
  // Reinitializes clean VM state
  // Clears terminal history
}
```

### Blocked Commands (Phase 3)

The following will be blocked **before** sending to VM:

#### Networking Commands
- `ping`, `ping -c 4`
- `curl`, `curl -O`, `curl -I`
- `wget`
- `ssh`, `ssh-keygen`, `scp`, `sftp`
- `netstat`, `ss -tulnp`
- `traceroute`, `mtr`
- `nslookup`, `dig`, `host`, `whois`
- `nmap`
- `rsync` (with network options)
- `ip`, `ifconfig`, `route`, `arp`, `nmcli`

#### Service Management (Persistent Services)
- `systemctl start/restart/enable` (any daemon)
- `service start/restart`
- `journalctl -f` (in sandboxed context, may hang)

#### Scheduling (Persistence)
- `crontab -e`, `crontab -l`, `crontab -r`
- `at` (one-time tasks)

#### Docker/Containers
- All `docker` commands
- `docker-compose` commands

#### File Operations (Dangerous)
- `shred` (not truly secure in sandbox)
- `dd` (write operations on virtual devices)

### What IS Allowed

✅ File operations: `ls`, `mkdir`, `rm`, `cp`, `mv`, `touch`
✅ Text viewing: `cat`, `head`, `tail`, `less`, `more`
✅ Text processing: `grep`, `sed`, `awk`, `sort`, `cut`
✅ File searching: `find`, `locate`
✅ System info: `uname`, `uptime`, `free`, `df`
✅ Process viewing: `ps`, `top`, `jobs`
✅ Compression: `tar`, `gzip`, `zip`, `unzip`
✅ Permissions: `chmod`, `chown`, `ls -l`
✅ Text editing: `nano`, `vim`, `echo`, `printf`
✅ Bash scripting: All shell features (local execution only)

### Threat Model

#### Threat: Network Exfiltration
**Mitigation:** Networking disabled at VM level
- No way to connect to external services
- All data stays in browser IndexedDB
- Even if user writes a script, it cannot escape the network sandbox

#### Threat: Persistent Backdoor
**Mitigation:** Reset functionality + no scheduled tasks
- Can't install persistent malware
- Can't set up cron jobs
- Reset wipes all changes
- Isolated IndexedDB per browser profile

#### Threat: VM Escape
**Mitigation:** WebAssembly sandbox + browser security model
- WebVM runs in WebAssembly
- WebAssembly cannot access host filesystem
- No direct syscall access
- Browser context isolation

#### Threat: Browser Storage Abuse
**Mitigation:** User control + visibility
- IndexedDB usage visible in DevTools
- User can clear storage
- No hidden persistence mechanisms

### Testing the Security

```javascript
// These should all fail silently or with block message:
ping google.com                    // ❌ No network
curl https://example.com           // ❌ No network
ssh user@host                       // ❌ No network
wget https://file.com/payload      // ❌ No network
crontab -e                         // ⚠️ Blocked by interception
systemctl start nginx              // ⚠️ Blocked by interception
docker ps                          // ⚠️ Blocked by interception

// These should work normally:
ls -la                             // ✅ Works
mkdir test && cd test              // ✅ Works
echo "hello" > file.txt            // ✅ Works
cat file.txt                       // ✅ Works
grep pattern file.txt              // ✅ Works
```

### Best Practices for Users

1. **Assume Public Environment**: Treat the sandbox as public since it's in-browser
2. **No Credentials**: Don't create/store real credentials
3. **Test Commands Safely**: Use `echo` and `cat` to preview before executing
4. **Use Reset Between Sessions**: Click "Reset Sandbox" to start fresh
5. **Read Error Messages**: Blocked commands will show friendly explanations

### Performance Considerations

- First load: 2-5 seconds (CheerpX library download + VM init)
- Command execution: <100ms for most operations
- Memory: ~150-200MB for running VM
- Storage: IndexedDB grows with file creation (clear via DevTools)

### Browser Compatibility

✅ Chrome/Edge 88+
✅ Firefox 78+
✅ Safari 15+
⚠️ Requires SharedArrayBuffer support (COOP/COEP headers needed for some operations)

## Future Hardening (Phase 5-6)

- [ ] Rate limiting on command execution
- [ ] Command history logging (local only)
- [ ] Disk quota enforcement
- [ ] Memory limit enforcement
- [ ] Timeout on long-running commands
- [ ] Signed command allowlist
