import AsyncStorage from '@react-native-async-storage/async-storage';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  userId?: string;
  sessionId?: string;
  stackTrace?: string;
}

export class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogsInMemory = 1000;
  private logLevel: LogLevel = LogLevel.DEBUG;
  private isDevelopment = __DEV__;
  private sessionId: string;

  private constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.loadPersistedLogs();
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
    this.info('Logger', 'Log level changed', { newLevel: level });
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private createLogEntry(
    level: LogLevel,
    category: string,
    message: string,
    data?: any,
    stackTrace?: string
  ): LogEntry {
    return {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      category,
      message,
      data,
      sessionId: this.sessionId,
      stackTrace
    };
  }

  private addLog(entry: LogEntry): void {
    // Add to memory
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogsInMemory) {
      this.logs = this.logs.slice(0, this.maxLogsInMemory);
    }

    // Persist critical logs
    if (entry.level >= LogLevel.ERROR) {
      this.persistLog(entry);
    }

    // Console output with enhanced formatting
    this.outputToConsole(entry);
  }

  private outputToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const levelStr = LogLevel[entry.level];
    const prefix = `[${timestamp}] [${levelStr}] [${entry.category}]`;

    const message = entry.data
      ? `${entry.message} ${JSON.stringify(entry.data, null, 2)}`
      : entry.message;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(`${prefix} ${message}`, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(`${prefix} ${message}`, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(`${prefix} ${message}`, entry.data || '');
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(`${prefix} ${message}`, entry.data || '', entry.stackTrace || '');
        break;
    }
  }

  private async persistLog(entry: LogEntry): Promise<void> {
    try {
      const persistedLogs = await AsyncStorage.getItem('uber_app_logs') || '[]';
      const logs = JSON.parse(persistedLogs);

      logs.unshift({
        ...entry,
        timestamp: entry.timestamp.toISOString() // Convert to string for storage
      });

      // Keep only last 500 persisted logs
      if (logs.length > 500) {
        logs.splice(500);
      }

      await AsyncStorage.setItem('uber_app_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('[Logger] Failed to persist log:', error);
    }
  }

  private async loadPersistedLogs(): Promise<void> {
    try {
      const persistedLogs = await AsyncStorage.getItem('uber_app_logs');
      if (persistedLogs) {
        const logs = JSON.parse(persistedLogs);
        // Convert timestamp strings back to Date objects
        this.logs = logs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
      }
    } catch (error) {
      console.error('[Logger] Failed to load persisted logs:', error);
    }
  }

  debug(category: string, message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const entry = this.createLogEntry(LogLevel.DEBUG, category, message, data);
      this.addLog(entry);
    }
  }

  info(category: string, message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const entry = this.createLogEntry(LogLevel.INFO, category, message, data);
      this.addLog(entry);
    }
  }

  warn(category: string, message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const entry = this.createLogEntry(LogLevel.WARN, category, message, data);
      this.addLog(entry);
    }
  }

  error(category: string, message: string, data?: any, error?: Error): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const entry = this.createLogEntry(
        LogLevel.ERROR,
        category,
        message,
        data,
        error?.stack
      );
      this.addLog(entry);
    }
  }

  critical(category: string, message: string, data?: any, error?: Error): void {
    if (this.shouldLog(LogLevel.CRITICAL)) {
      const entry = this.createLogEntry(
        LogLevel.CRITICAL,
        category,
        message,
        data,
        error?.stack
      );
      this.addLog(entry);
    }
  }

  // Performance logging
  performance(category: string, operation: string, startTime: number, metadata?: any): void {
    const duration = Date.now() - startTime;
    const level = duration > 5000 ? LogLevel.WARN : LogLevel.INFO;

    if (this.shouldLog(level)) {
      const entry = this.createLogEntry(
        level,
        category,
        `Performance: ${operation}`,
        {
          duration,
          ...metadata
        }
      );
      this.addLog(entry);
    }
  }

  // Network logging
  network(category: string, method: string, url: string, statusCode?: number, duration?: number, error?: any): void {
    const level = statusCode && statusCode >= 400 ? LogLevel.ERROR :
                 error ? LogLevel.WARN : LogLevel.DEBUG;

    if (this.shouldLog(level)) {
      const entry = this.createLogEntry(
        level,
        category,
        `Network: ${method} ${url}`,
        {
          statusCode,
          duration,
          error: error?.message
        }
      );
      this.addLog(entry);
    }
  }

  // WebSocket logging
  websocket(category: string, event: string, data?: any, error?: any): void {
    const level = error ? LogLevel.ERROR : LogLevel.DEBUG;

    if (this.shouldLog(level)) {
      const entry = this.createLogEntry(
        level,
        category,
        `WebSocket: ${event}`,
        data,
        error?.stack
      );
      this.addLog(entry);
    }
  }

  // User action logging
  userAction(category: string, action: string, details?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const entry = this.createLogEntry(
        LogLevel.INFO,
        category,
        `User Action: ${action}`,
        details
      );
      this.addLog(entry);
    }
  }

  // Get logs for debugging
  getLogs(level?: LogLevel, category?: string, limit = 100): LogEntry[] {
    let filteredLogs = this.logs;

    if (level !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.level >= level);
    }

    if (category) {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }

    return filteredLogs.slice(0, limit);
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
    AsyncStorage.removeItem('uber_app_logs');
    this.info('Logger', 'Logs cleared');
  }

  // Export logs for debugging
  exportLogs(): Promise<string> {
    return new Promise((resolve) => {
      AsyncStorage.getItem('uber_app_logs').then((persistedLogs) => {
        const allLogs = {
          memoryLogs: this.logs,
          persistedLogs: persistedLogs ? JSON.parse(persistedLogs) : [],
          sessionId: this.sessionId,
          timestamp: new Date().toISOString()
        };
        resolve(JSON.stringify(allLogs, null, 2));
      });
    });
  }

  // Get log statistics
  getStats(): { total: number; byLevel: Record<string, number>; byCategory: Record<string, number> } {
    const stats = {
      total: this.logs.length,
      byLevel: {} as Record<string, number>,
      byCategory: {} as Record<string, number>
    };

    this.logs.forEach(log => {
      const levelStr = LogLevel[log.level];
      stats.byLevel[levelStr] = (stats.byLevel[levelStr] || 0) + 1;
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
    });

    return stats;
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience functions
export const log = {
  debug: (category: string, message: string, data?: any) => logger.debug(category, message, data),
  info: (category: string, message: string, data?: any) => logger.info(category, message, data),
  warn: (category: string, message: string, data?: any) => logger.warn(category, message, data),
  error: (category: string, message: string, data?: any, error?: Error) => logger.error(category, message, data, error),
  critical: (category: string, message: string, data?: any, error?: Error) => logger.critical(category, message, data, error),

  performance: (category: string, operation: string, startTime: number, metadata?: any) =>
    logger.performance(category, operation, startTime, metadata),

  network: (category: string, method: string, url: string, statusCode?: number, duration?: number, error?: any) =>
    logger.network(category, method, url, statusCode, duration, error),

  websocket: (category: string, event: string, data?: any, error?: any) =>
    logger.websocket(category, event, data, error),

  userAction: (category: string, action: string, details?: any) =>
    logger.userAction(category, action, details)
};
