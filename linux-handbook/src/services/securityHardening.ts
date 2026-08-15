/**
 * Phase 4: Security Hardening
 * - Rate limiting per user
 * - Command timeout enforcement
 * - Memory limit enforcement
 * - Disk quota tracking
 * - Better error messages
 */

export interface RateLimitConfig {
  maxCommandsPerMinute: number;
  maxCommandsPerHour: number;
  cooldownMs: number;
}

export interface CommandLimits {
  timeoutMs: number;
  memoryLimitMb: number;
  diskLimitMb: number;
}

export interface SecurityMetrics {
  commandsThisMinute: number;
  commandsThisHour: number;
  totalBlockedAttempts: number;
  memoryUsedMb: number;
  diskUsedMb: number;
  lastCommandTime: number;
}

// Default rate limiting configuration
const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  maxCommandsPerMinute: 35,
  maxCommandsPerHour: 60,
  cooldownMs: 100, // Minimum time between commands
};

// Default command limits
const DEFAULT_COMMAND_LIMITS: CommandLimits = {
  timeoutMs: 5000, // 5 second timeout per command
  memoryLimitMb: 256, // 256 MB memory limit
  diskLimitMb: 100, // 100 MB disk quota
};

// Store metrics in sessionStorage to persist during session
class SecurityHardeningService {
  private metrics: SecurityMetrics;
  private rateLimit: RateLimitConfig;
  private commandLimits: CommandLimits;
  private commandHistory: Array<{ timestamp: number; command: string }> = [];
  private lastCommandTime: number = 0;

  constructor(
    rateLimit: RateLimitConfig = DEFAULT_RATE_LIMIT,
    commandLimits: CommandLimits = DEFAULT_COMMAND_LIMITS
  ) {
    this.rateLimit = rateLimit;
    this.commandLimits = commandLimits;

    // Initialize metrics from sessionStorage or create new
    const stored = sessionStorage.getItem('terminal-security-metrics');
    if (stored) {
      this.metrics = JSON.parse(stored);
    } else {
      this.metrics = {
        commandsThisMinute: 0,
        commandsThisHour: 0,
        totalBlockedAttempts: 0,
        memoryUsedMb: 0,
        diskUsedMb: 0,
        lastCommandTime: Date.now(),
      };
    }

    this.updateMetrics();
  }

  /**
   * Update rate limit counters (reset minute/hour if time has passed)
   */
  private updateMetrics(): void {
    const now = Date.now();
    const lastTime = this.metrics.lastCommandTime;

    if (!lastTime) {
      this.metrics.lastCommandTime = now;
      this.saveMetrics();
      return;
    }

    // Reset minute counter if 60 seconds have passed
    if (now - lastTime > 60000) {
      this.metrics.commandsThisMinute = 0;
      this.metrics.lastCommandTime = now;
    }

    // Reset hour counter if 3600 seconds have passed
    if (now - lastTime > 3600000) {
      this.metrics.commandsThisHour = 0;
    }

    this.saveMetrics();
  }

  /**
   * Save metrics to sessionStorage
   */
  private saveMetrics(): void {
    sessionStorage.setItem('terminal-security-metrics', JSON.stringify(this.metrics));
  }

  /**
   * Check if command can be executed (rate limit check)
   */
  canExecuteCommand(): {
    allowed: boolean;
    message?: string;
    remainingSeconds?: number;
  } {
    const now = Date.now();
    this.updateMetrics();

    // Rate limiting is temporarily disabled. Metrics are still collected so
    // the limit can be restored later without changing the terminal UI.
    return { allowed: true };

    // Check cooldown (minimum time between commands)
    if (this.lastCommandTime > 0 && now - this.lastCommandTime < this.rateLimit.cooldownMs) {
      return {
        allowed: false,
        message: `Rate limited: Wait ${Math.ceil((this.rateLimit.cooldownMs - (now - this.lastCommandTime)) / 1000)} seconds before next command`,
      };
    }

    // Check per-minute rate limit
    if (this.metrics.commandsThisMinute >= this.rateLimit.maxCommandsPerMinute) {
      const timeToWait = 60 - ((now - this.metrics.lastCommandTime) % 60000) / 1000;
      return {
        allowed: false,
        message: `Rate limit exceeded: Max ${this.rateLimit.maxCommandsPerMinute} commands per minute. Retry in ${Math.ceil(timeToWait)} seconds`,
        remainingSeconds: Math.ceil(timeToWait),
      };
    }

    // Check per-hour rate limit
    if (this.metrics.commandsThisHour >= this.rateLimit.maxCommandsPerHour) {
      return {
        allowed: false,
        message: `Hour limit exceeded: Max ${this.rateLimit.maxCommandsPerHour} commands per hour`,
      };
    }

    return { allowed: true };
  }

  /**
   * Record a command execution
   */
  recordCommand(command: string): void {
    const now = Date.now();
    this.lastCommandTime = now;

    // Increment counters
    this.metrics.commandsThisMinute++;
    this.metrics.commandsThisHour++;

    // Add to history
    this.commandHistory.push({ timestamp: now, command });

    // Keep only last 100 commands in history
    if (this.commandHistory.length > 100) {
      this.commandHistory = this.commandHistory.slice(-100);
    }

    this.saveMetrics();
  }

  /**
   * Record a blocked command attempt
   */
  recordBlockedAttempt(command: string, reason: string): void {
    this.metrics.totalBlockedAttempts++;
    console.log(`[BLOCKED] ${command} - ${reason}`);
    this.saveMetrics();
  }

  /**
   * Check if command will timeout
   */
  getCommandTimeout(): number {
    return this.commandLimits.timeoutMs;
  }

  /**
   * Get remaining time before timeout
   */
  getRemainingTime(startTime: number): number {
    const elapsed = Date.now() - startTime;
    return Math.max(0, this.commandLimits.timeoutMs - elapsed);
  }

  /**
   * Check if command has exceeded timeout
   */
  isCommandTimedOut(startTime: number): boolean {
    return Date.now() - startTime > this.commandLimits.timeoutMs;
  }

  /**
   * Update memory usage estimation
   */
  updateMemoryUsage(percentUsed: number): void {
    this.metrics.memoryUsedMb = Math.round((percentUsed / 100) * this.commandLimits.memoryLimitMb);
    this.saveMetrics();
  }

  /**
   * Update disk usage estimation
   */
  updateDiskUsage(percentUsed: number): void {
    this.metrics.diskUsedMb = Math.round((percentUsed / 100) * this.commandLimits.diskLimitMb);
    this.saveMetrics();
  }

  /**
   * Check if memory limit exceeded
   */
  isMemoryLimitExceeded(): boolean {
    return this.metrics.memoryUsedMb >= this.commandLimits.memoryLimitMb;
  }

  /**
   * Check if disk limit exceeded
   */
  isDiskLimitExceeded(): boolean {
    return this.metrics.diskUsedMb >= this.commandLimits.diskLimitMb;
  }

  /**
   * Get current metrics
   */
  getMetrics(): SecurityMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * Get memory usage percentage
   */
  getMemoryUsagePercent(): number {
    return Math.round((this.metrics.memoryUsedMb / this.commandLimits.memoryLimitMb) * 100);
  }

  /**
   * Get disk usage percentage
   */
  getDiskUsagePercent(): number {
    return Math.round((this.metrics.diskUsedMb / this.commandLimits.diskLimitMb) * 100);
  }

  /**
   * Get command history
   */
  getCommandHistory(): Array<{ timestamp: number; command: string }> {
    return [...this.commandHistory];
  }

  /**
   * Reset all metrics (clear session)
   */
  resetMetrics(): void {
    this.metrics = {
      commandsThisMinute: 0,
      commandsThisHour: 0,
      totalBlockedAttempts: 0,
      memoryUsedMb: 0,
      diskUsedMb: 0,
      lastCommandTime: Date.now(),
    };
    this.commandHistory = [];
    this.lastCommandTime = 0;
    this.saveMetrics();
  }

  /**
   * Get security status summary
   */
  getSecurityStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    message: string;
    details: string[];
  } {
    const details: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Check rate limit
    if (this.metrics.commandsThisMinute > this.rateLimit.maxCommandsPerMinute * 0.8) {
      status = 'warning';
      details.push(`⚠️ Approaching rate limit: ${this.metrics.commandsThisMinute}/${this.rateLimit.maxCommandsPerMinute} commands this minute`);
    }

    // Check memory
    const memPercent = this.getMemoryUsagePercent();
    if (memPercent > 80) {
      status = 'warning';
      details.push(`⚠️ High memory usage: ${memPercent}%`);
    }
    if (this.isMemoryLimitExceeded()) {
      status = 'critical';
      details.push(`🔴 Memory limit exceeded: ${this.metrics.memoryUsedMb}MB`);
    }

    // Check disk
    const diskPercent = this.getDiskUsagePercent();
    if (diskPercent > 80) {
      status = 'warning';
      details.push(`⚠️ High disk usage: ${diskPercent}%`);
    }
    if (this.isDiskLimitExceeded()) {
      status = 'critical';
      details.push(`🔴 Disk limit exceeded: ${this.metrics.diskUsedMb}MB`);
    }

    // Check blocked attempts
    if (this.metrics.totalBlockedAttempts > 10) {
      status = 'warning';
      details.push(`⚠️ Multiple blocked attempts: ${this.metrics.totalBlockedAttempts}`);
    }

    const message = status === 'healthy' ? '✅ System running normally' : status === 'warning' ? '⚠️ System under load' : '🔴 Critical resource limit';

    return { status, message, details };
  }
}

// Export singleton instance
export const securityService = new SecurityHardeningService();
