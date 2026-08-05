/**
 * Command Interception Layer - Phase 3
 * Intercepts ONLY dangerous/unsafe commands
 * Blocks: Networking, Docker, Git, Services, Scheduling, Privileged operations
 * Allows: File management, text processing, system info, etc.
 */

export interface BlockedCommand {
  pattern: RegExp;
  category: 'networking' | 'docker' | 'git' | 'services' | 'scheduling' | 'privileged';
  message: string;
  explanation: string;
}

const BLOCKED_COMMANDS: BlockedCommand[] = [
  // ============ NETWORKING COMMANDS ============
  {
    pattern: /^ping(\s|$)/,
    category: 'networking',
    message: 'Networking is disabled in this sandbox',
    explanation: 'ping requires network access which is disabled for security',
  },
  {
    pattern: /^curl(\s|$)/,
    category: 'networking',
    message: 'Networking is disabled in this sandbox',
    explanation: 'curl requires outbound network connections',
  },
  {
    pattern: /^wget(\s|$)/,
    category: 'networking',
    message: 'Networking is disabled in this sandbox',
    explanation: 'wget requires network access to download files',
  },
  {
    pattern: /^ssh(\s|$)/,
    category: 'networking',
    message: 'SSH is disabled in this sandbox',
    explanation: 'SSH requires network access to remote servers',
  },
  {
    pattern: /^scp(\s|$)/,
    category: 'networking',
    message: 'Network file transfer is disabled',
    explanation: 'scp requires network access to remote servers',
  },
  {
    pattern: /^sftp(\s|$)/,
    category: 'networking',
    message: 'SFTP is disabled in this sandbox',
    explanation: 'sftp requires network access to remote servers',
  },
  {
    pattern: /^nmap(\s|$)/,
    category: 'networking',
    message: 'Network scanning is disabled',
    explanation: 'nmap requires network access for port scanning',
  },
  {
    pattern: /^traceroute(\s|$)/,
    category: 'networking',
    message: 'Route tracing is disabled in this sandbox',
    explanation: 'traceroute requires network access',
  },
  {
    pattern: /^mtr(\s|$)/,
    category: 'networking',
    message: 'Network diagnostics are disabled',
    explanation: 'mtr (My Traceroute) requires network access',
  },
  {
    pattern: /^nslookup(\s|$)/,
    category: 'networking',
    message: 'DNS lookups are disabled',
    explanation: 'nslookup requires network access to DNS servers',
  },
  {
    pattern: /^dig(\s|$)/,
    category: 'networking',
    message: 'DNS queries are disabled',
    explanation: 'dig requires network access to DNS servers',
  },
  {
    pattern: /^host(\s|$)/,
    category: 'networking',
    message: 'DNS lookups are disabled',
    explanation: 'host requires network access to DNS servers',
  },
  {
    pattern: /^whois(\s|$)/,
    category: 'networking',
    message: 'Domain lookups are disabled',
    explanation: 'whois requires network access to lookup servers',
  },
  {
    pattern: /^rsync\s.*-e/,
    category: 'networking',
    message: 'Remote rsync is disabled',
    explanation: 'rsync over network requires network access',
  },

  // ============ DOCKER COMMANDS ============
  {
    pattern: /^docker(\s|$)/,
    category: 'docker',
    message: 'Docker is not available in this sandbox',
    explanation: 'Container runtime is not installed',
  },
  {
    pattern: /^docker-compose(\s|$)/,
    category: 'docker',
    message: 'Docker Compose is not available',
    explanation: 'Container orchestration is not supported',
  },

  // ============ GIT COMMANDS ============
  {
    pattern: /^git(\s|$)/,
    category: 'git',
    message: 'Git is not available in this sandbox',
    explanation: 'Version control requires external setup',
  },

  // ============ SERVICE MANAGEMENT ============
  {
    pattern: /^systemctl\s(start|restart|stop|enable|disable)/,
    category: 'services',
    message: 'Service management is disabled in sandbox',
    explanation: 'System services cannot be modified in sandbox',
  },
  {
    pattern: /^service\s.*\s(start|restart|stop)/,
    category: 'services',
    message: 'Service management is disabled in sandbox',
    explanation: 'System services cannot be modified in sandbox',
  },
  {
    pattern: /^journalctl\s-f/,
    category: 'services',
    message: 'Journal follow mode is not supported',
    explanation: 'journalctl -f continuously waits for logs (use Ctrl+C)',
  },

  // ============ CRON/SCHEDULING ============
  {
    pattern: /^crontab\s(-e|-r|-i)/,
    category: 'scheduling',
    message: 'Cron editing is disabled in sandbox',
    explanation: 'Cron jobs cannot persist in the sandbox',
  },
  {
    pattern: /^at(\s|$)/,
    category: 'scheduling',
    message: 'Job scheduling is disabled in sandbox',
    explanation: 'at command scheduling not supported',
  },

  // ============ PRIVILEGED OPERATIONS ============
  {
    pattern: /^sudo(\s|$)/,
    category: 'privileged',
    message: 'sudo is disabled in sandbox',
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
 * Check if command should be BLOCKED
 * Returns true only for dangerous/unsafe commands
 * All other commands are allowed to execute in WebVM
 */
export const checkCommandInterception = (
  command: string
): InterceptionResult => {
  const trimmedCommand = command.trim();

  // Check against blocked patterns
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

  // Command is allowed - will execute in WebVM
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
