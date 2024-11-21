import { Injectable } from '@nestjs/common';
import pino from 'pino';
import { ILoggerService } from './interfaces/logger-service.interface';

type LogMessage = string | Record<string, unknown>;

@Injectable()
export class LoggerService implements ILoggerService {
  private logger: pino.Logger;
  private feature?: string;

  constructor(private readonly serviceName: string) {
    const targets: pino.TransportTargetOptions[] = [];

    // Pretty print em desenvolvimento
    if (process.env['NODE_ENV'] !== 'production') {
      targets.push(
        pino.transport({
          target: 'pino-pretty',
          options: {
            colorize: true,
            levelFirst: true,
            translateTime: 'UTC:yyyy-mm-dd HH:MM:ss.l o',
            singleLine: true,
          },
        })
      );
    }

    // Transporte para Logstash
    if (process.env['LOGSTASH_HOST']) {
      targets.push(
        pino.transport({
          target: 'pino-socket',
          options: {
            address: process.env['LOGSTASH_HOST'],
            port: parseInt(process.env['LOGSTASH_PORT'] || '5044', 10),
            mode: 'tcp',
            reconnect: true,
            retryTimeout: 3000,
            tls: process.env['LOGSTASH_TLS'] === 'true',
          },
        })
      );
    }

    const baseConfig: pino.LoggerOptions = {
      level: process.env['LOG_LEVEL'] || 'info',
      serializers: {
        error: pino.stdSerializers.err,
      },
      base: {
        service: this.serviceName,
        environment: process.env['NODE_ENV'] || 'development',
        hostname: process.env['HOSTNAME'] || 'unknown',
        pid: process.pid,
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      formatters: {
        level: (label: string) => ({ level: label }),
      },
    };

    if (targets.length > 0) {
      baseConfig.transport = { targets };
    }

    this.logger = pino(baseConfig);
  }

  /**
   * Log information messages
   * @example
   * // Simple message
   * logger.log('User logged in successfully');
   *
   * // With context
   * logger.log('User logged in successfully', 'AuthService');
   *
   * // With metadata
   * logger.log({
   *   message: 'User logged in successfully',
   *   userId: '123',
   *   email: 'user@example.com'
   * }, 'AuthService');
   */
  log(message: LogMessage, context?: string): void {
    const { msg, meta } = this.formatMessage(message);
    this.logger.info({ context, feature: this.feature, ...meta }, msg);
  }

  /**
   * Log error messages
   * @example
   * // Simple error
   * logger.error('Failed to connect to database');
   *
   * // With error object
   * try {
   *   // some code
   * } catch (error) {
   *   logger.error('Database connection failed', error, 'DatabaseService');
   * }
   *
   * // With metadata
   * logger.error({
   *   message: 'Failed to create user',
   *   userId: '123',
   *   errorCode: 'USER_001'
   * }, new Error('Validation failed'), 'UserService');
   */
  error(message: LogMessage, trace?: string | Error, context?: string): void {
    const { msg, meta } = this.formatMessage(message);
    this.logger.error(
      {
        context,
        feature: this.feature,
        error: this.formatError(trace),
        ...meta,
      },
      msg
    );
  }

  /**
   * Log warning messages
   * @example
   * // Simple warning
   * logger.warn('High memory usage detected');
   *
   * // With context
   * logger.warn('Rate limit approaching', 'RateLimiterService');
   *
   * // With metadata
   * logger.warn({
   *   message: 'High CPU usage',
   *   usage: 85,
   *   threshold: 80
   * }, 'SystemMonitor');
   */
  warn(message: LogMessage, context?: string): void {
    const { msg, meta } = this.formatMessage(message);
    this.logger.warn({ context, feature: this.feature, ...meta }, msg);
  }

  /**
   * Log debug messages
   * @example
   * // Simple debug
   * logger.debug('Processing request payload');
   *
   * // With context
   * logger.debug('Cache miss for key: user-123', 'CacheService');
   *
   * // With metadata
   * logger.debug({
   *   message: 'Request processed',
   *   duration: 235,
   *   endpoint: '/api/users',
   *   method: 'POST'
   * }, 'RequestProcessor');
   */
  debug(message: LogMessage, context?: string): void {
    const { msg, meta } = this.formatMessage(message);
    this.logger.debug({ context, feature: this.feature, ...meta }, msg);
  }

  /**
   * Log verbose messages (detailed information)
   * @example
   * // Simple verbose
   * logger.verbose('Starting background job');
   *
   * // With context
   * logger.verbose('Cleaning expired sessions', 'SessionManager');
   *
   * // With metadata
   * logger.verbose({
   *   message: 'Email notification queued',
   *   recipient: 'user@example.com',
   *   template: 'welcome',
   *   variables: { name: 'John' }
   * }, 'NotificationService');
   */
  verbose(message: LogMessage, context?: string): void {
    const { msg, meta } = this.formatMessage(message);
    this.logger.trace({ context, feature: this.feature, ...meta }, msg);
  }

  private formatError(error: Error | string | undefined): Error | undefined {
    if (error instanceof Error) return error;
    if (typeof error === 'string') return new Error(error);
    return undefined;
  }

  private formatMessage(message: LogMessage): {
    msg: string;
    meta: Record<string, unknown>;
  } {
    if (typeof message === 'string') {
      return { msg: message, meta: {} };
    }
    const { message: msg, ...meta } = message;
    return { msg: (msg as string) || '', meta };
  }
}
