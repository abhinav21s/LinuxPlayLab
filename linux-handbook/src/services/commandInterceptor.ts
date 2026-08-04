/**
 * Command Interception Layer - Phase 3
 * Intercepts commands before they reach the WebVM
 * Blocks dangerous/non-functional commands with user-friendly messages
 */

export interface BlockedCommand {
  pattern: RegExp;
  category: 'networking' | 'services' | 'scheduling' | 'docker' | 'privileged';
  message: string;
  explanation: string;
}

const BLOCKED_COMMANDS: BlockedCommand[] = [
  // Networking commands
  {
    pattern: /^ping\s/,
    category: 'networking',
    message: '⚠️ Networking is disabled in this sandbox',
    explanation: 'ping requires network access which is disabled for security',
  },
  {
    pattern: /^curl\s/,
    category: 'networking',
    message: '⚠️ Networking is disabled in this sandbox',
    explanation: 'curl requires outbound network connections which are blocked',
  },
  {
    pattern: /^wget\s/,
    category: 'networking',
    message: '⚠️ Networking is disabled in this sandbox',
    explanation: 'wget requires network access to download files',
  },
  {
    pattern: /^ssh\s/,
    category: 'networking',
    message: '⚠️ SSH is disabled in this sandbox',
    explanation: 'SSH requires network access to remote servers',
  },
  {
    pattern: /^scp\s/,
    category: 'networking',
    message: '⚠️ Network file transfer is disabled',
    explanation: 'scp requires network access to remote servers',
  },
  {
    pattern: /^rsync\s.*(-e|--rsh)/,
    category: 'networking',
    message: '⚠️ Remote rsync is disabled in this sandbox',
    explanation: 'rsync over network requires network access',
  },
  {
    pattern: /^sftp\s/,
    category: 'networking',
    message: '⚠️ SFTP is disabled in this sandbox',
    explanation: 'sftp requires network access to remote servers',
  },
  {
    pattern: /^nmap\s/,
    category: 'networking',
    message: '⚠️ Network scanning is disabled',
    explanation: 'nmap requires network access for port scanning',
  },
  {
    pattern: /^traceroute\s/,
    category: 'networking',
    message: '⚠️ Route tracing is disabled in this sandbox',
    explanation: 'traceroute requires network access',
  },
  {
    pattern: /^mtr\s/,
    category: 'networking',
    message: '⚠️ Network diagnostics are disabled',
    explanation: 'mtr (My Traceroute) requires network access',
  },
  {
    pattern: /^netstat\s/,
    category: 'networking',
    message: '⚠️ Network statistics are limited in sandbox',
    explanation: 'Full netstat requires network interface access',
  },
  {
    pattern: /^ss\s/,
    category: 'networking',
    message: '⚠️ Socket statistics are limited in sandbox',
    explanation: 'ss requires network interface monitoring',
  },
  {
    pattern: /^nslookup\s/,
    category: 'networking',
    message: '⚠️ DNS lookups are disabled',
    explanation: 'nslookup requires network access to DNS servers',
  },
  {
    pattern: /^dig\s/,
    category: 'networking',
    message: '⚠️ DNS queries are disabled in this sandbox',
    explanation: 'dig requires network access to DNS servers',
  },
  {
    pattern: /^host\s/,
    category: 'networking',
    message: '⚠️ DNS lookups are disabled',
    explanation: 'host command requires network access to DNS servers',
  },
  {
    pattern: /^whois\s/,
    category: 'networking',
    message: '⚠️ Domain lookups are disabled',
    explanation: 'whois requires network access to lookup servers',
  },
  {
    pattern: /^ifconfig\s/,
    category: 'networking',
    message: '⚠️ Network configuration is read-only in sandbox',
    explanation: 'Full ifconfig requires network interface privileges',
  },
  {
    pattern: /^ip\s(addr|route|link)/,
    category: 'networking',
    message: '⚠️ Network configuration is read-only in sandbox',
    explanation: 'IP command requires network namespace access',
  },
  {
    pattern: /^route\s/,
    category: 'networking',
    message: '⚠️ Routing table is read-only in sandbox',
    explanation: 'route modification requires privileged access',
  },
  {
    pattern: /^arp\s/,
    category: 'networking',
    message: '⚠️ ARP access is limited in sandbox',
    explanation: 'ARP requires network interface access',
  },
  {
    pattern: /^nmcli\s/,
    category: 'networking',
    message: '⚠️ Network Manager is disabled in sandbox',
    explanation: 'nmcli requires NetworkManager daemon',
  },

  // Service management
  {
    pattern: /^systemctl\s(start|restart|enable|disable|stop)/,
    category: 'services',
    message: '⚠️ Service management is disabled in sandbox',
    explanation: 'systemctl can only be used to check status, not modify services',
  },
  {
    pattern: /^service\s.*\s(start|restart|stop)/,
    category: 'services',
    message: '⚠️ Service management is disabled in sandbox',
    explanation: 'Service startup/shutdown not allowed in sandbox',
  },
  {
    pattern: /^journalctl\s-f/,
    category: 'services',
    message: '⚠️ Journal follow mode may hang in sandbox',
    explanation: 'journalctl -f continuously waits for logs (use Ctrl+C)',
  },

  // Cron/Scheduling
  {
    pattern: /^crontab\s(-e|-r|-i)/,
    category: 'scheduling',
    message: '⚠️ Cron editing is disabled in sandbox',
    explanation: 'Cron jobs cannot persist in the sandbox',
  },
  {
    pattern: /^at\s/,
    category: 'scheduling',
    message: '⚠️ Job scheduling is disabled in sandbox',
    explanation: 'at command scheduling not supported',
  },

  // Docker/Containers
  {
    pattern: /^docker\s/,
    category: 'docker',
    message: '⚠️ Docker is not available in sandbox',
    explanation: 'Container runtime is not installed',
  },
  {
    pattern: /^docker-compose\s/,
    category: 'docker',
    message: '⚠️ Docker Compose is not available',
    explanation: 'Container orchestration is not supported',
  },

  // Privileged operations
  {
    pattern: /^sudo\s/,
    category: 'privileged',
    message: '⚠️ sudo is disabled in sandbox',
    explanation: 'Privilege escalation is not allowed',
  },
];

export interface InterceptionResult {
  isBlocked: boolean;
  message?: string;
  explanation?: string;
  category?: string;
}

/**
 * Check if command should be blocked
 */
export const checkCommandInterception = (
  command: string
): InterceptionResult => {
  const trimmedCommand = command.trim();

  // Check against all blocked patterns
  for (const blocked of BLOCKED_COMMANDS) {
    if (blocked.pattern.test(trimmedCommand)) {
      return {
        isBlocked: true,
        message: blocked.message,
        explanation: blocked.explanation,
        category: blocked.category,
      };
    }
  }

  // Command is allowed
  return { isBlocked: false };
};

/**
 * Get all blocked commands by category
 */
export const getBlockedCommandsByCategory = (
  category: string
): BlockedCommand[] => {
  return BLOCKED_COMMANDS.filter((cmd) => cmd.category === category);
};

/**
 * Get summary of blocked commands
 */
export const getBlockedCommandsSummary = () => {
  const categories = new Set(BLOCKED_COMMANDS.map((cmd) => cmd.category));
  const summary: Record<string, number> = {};

  for (const category of categories) {
    summary[category] = BLOCKED_COMMANDS.filter(
      (cmd) => cmd.category === category
    ).length;
  }

  return summary;
};
