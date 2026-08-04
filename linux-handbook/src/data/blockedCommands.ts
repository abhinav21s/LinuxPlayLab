/**
 * Blocked Commands Reference
 * Display information about commands that are blocked in the sandbox
 */

export interface BlockedCommandInfo {
  command: string;
  category: string;
  reason: string;
  alternatives?: string;
}

export const blockedCommandsList: BlockedCommandInfo[] = [
  // Networking
  {
    command: 'ping',
    category: 'Networking',
    reason: 'Network access disabled for security',
    alternatives: 'Use ip command to check local network config',
  },
  {
    command: 'curl / wget',
    category: 'Networking',
    reason: 'Outbound connections blocked',
    alternatives: 'Learn HTTP concepts but cannot make requests',
  },
  {
    command: 'ssh / scp',
    category: 'Networking',
    reason: 'Remote access disabled',
    alternatives: 'Practice SSH syntax locally',
  },
  {
    command: 'nmap / nslookup / dig',
    category: 'Networking',
    reason: 'Network scanning/DNS disabled',
    alternatives: 'Study networking concepts',
  },
  {
    command: 'netstat / ss',
    category: 'Networking',
    reason: 'Network statistics limited',
    alternatives: 'Use ip command for routing info',
  },

  // Services
  {
    command: 'systemctl start/stop/restart',
    category: 'Services',
    reason: 'Service management disabled',
    alternatives: 'Use systemctl status to check services',
  },
  {
    command: 'service start/stop',
    category: 'Services',
    reason: 'Legacy service control disabled',
    alternatives: 'Learn about systemd concepts',
  },

  // Scheduling
  {
    command: 'crontab -e/-r',
    category: 'Scheduling',
    reason: 'Cron jobs cannot persist in sandbox',
    alternatives: 'Use crontab -l to view existing crons',
  },
  {
    command: 'at',
    category: 'Scheduling',
    reason: 'Job scheduling disabled',
    alternatives: 'Learn scheduling concepts',
  },

  // Containers
  {
    command: 'docker',
    category: 'Containers',
    reason: 'Docker not installed in sandbox',
    alternatives: 'Learn Docker concepts and commands',
  },

  // Privileged
  {
    command: 'sudo',
    category: 'Privileged',
    reason: 'Privilege escalation disabled',
    alternatives: 'All commands run as regular user',
  },
];

export const getBlockedCommandsByCategory = (category: string) => {
  return blockedCommandsList.filter((cmd) => cmd.category === category);
};

export const getCategoryCount = () => {
  const categories = new Set(blockedCommandsList.map((cmd) => cmd.category));
  return categories.size;
};

export const getTotalBlockedCount = () => {
  return blockedCommandsList.length;
};
