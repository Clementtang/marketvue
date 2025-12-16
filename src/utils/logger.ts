/**
 * Unified Logger Service
 *
 * Provides centralized logging with consistent formatting and environment-aware behavior.
 * Supports debug, info, warn, and error log levels with automatic timestamps.
 *
 * Features:
 * - Environment-aware: debug logs only appear in development
 * - Timestamped: all logs include ISO timestamps
 * - Typed: strong TypeScript types for log levels
 * - Extensible: easy to integrate with error tracking services (e.g., Sentry)
 *
 * @example
 * ```typescript
 * import { logger } from './utils/logger';
 *
 * // Debug (development only)
 * logger.debug('Batch request queued:', request);
 *
 * // Info
 * logger.info('User logged in successfully');
 *
 * // Warning
 * logger.warn('API rate limit approaching');
 *
 * // Error
 * logger.error('Failed to fetch stock data', error);
 * ```
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private log(level: LogLevel, message: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'debug':
        if (this.isDevelopment) {
          console.log(prefix, message, ...args);
        }
        break;
      case 'info':
        console.log(prefix, message, ...args);
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        break;
      case 'error':
        console.error(prefix, message, ...args);
        // Future: integrate with error tracking service (e.g., Sentry)
        // if (typeof window !== 'undefined' && window.Sentry) {
        //   window.Sentry.captureException(args[0] instanceof Error ? args[0] : new Error(message));
        // }
        break;
    }
  }

  /**
   * Debug level logging - only shown in development environment
   * Use for detailed debugging information not needed in production
   */
  debug(message: string, ...args: any[]) {
    this.log('debug', message, ...args);
  }

  /**
   * Info level logging - shown in all environments
   * Use for general informational messages
   */
  info(message: string, ...args: any[]) {
    this.log('info', message, ...args);
  }

  /**
   * Warning level logging - shown in all environments
   * Use for potentially harmful situations that don't prevent operation
   */
  warn(message: string, ...args: any[]) {
    this.log('warn', message, ...args);
  }

  /**
   * Error level logging - shown in all environments
   * Use for error conditions that should be investigated
   */
  error(message: string, ...args: any[]) {
    this.log('error', message, ...args);
  }
}

/**
 * Singleton logger instance for application-wide use
 */
export const logger = new Logger();
