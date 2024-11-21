//dummy imports
import * as pinoPretty from 'pino-pretty';
import pinoElastic from 'pino-elasticsearch';

import pino, { Logger, LoggerOptions } from 'pino';
import { Injectable, Inject, Optional } from '@nestjs/common';
import {
  LOGGER_ROOT_NAME,
  LOGGER_FEATURE_NAME,
} from './constants/logger.constants';

type LogMessage = string | Record<string, unknown>;

@Injectable()
export class LoggerService {
  private readonly logger: Logger;

  constructor(
    @Inject(LOGGER_ROOT_NAME) private readonly rootName: string,
    @Optional()
    @Inject(LOGGER_FEATURE_NAME)
    private readonly featureName?: string
  ) {
    this.logger = pino(this.createLoggerOptions());
  }

  log(message: LogMessage, context?: string): void {
    this.logMessage('info', message, context);
  }

  error(message: LogMessage, trace?: string | Error, context?: string): void {
    this.logMessage('error', message, context, trace);
  }

  warn(message: LogMessage, context?: string): void {
    this.logMessage('warn', message, context);
  }

  debug(message: LogMessage, context?: string): void {
    this.logMessage('debug', message, context);
  }

  verbose(message: LogMessage, context?: string): void {
    this.logMessage('trace', message, context);
  }

  private logMessage(
    level: 'info' | 'error' | 'warn' | 'debug' | 'trace',
    message: LogMessage,
    context?: string,
    trace?: string | Error
  ): void {
    const { msg, meta } = this.formatMessage(message);
    const logContext = {
      context,
      feature: this.featureName,
      root: this.rootName,
      error: trace ? this.formatError(trace) : undefined,
      ...meta,
    };

    this.logger[level](logContext, msg);
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

  private formatError(error: string | Error): Error {
    return typeof error === 'string' ? new Error(error) : error;
  }

  private createLoggerOptions(): LoggerOptions {
    const targets = [];

    // Development transport - pretty print to console
    if (process.env['NODE_ENV'] === 'development') {
      targets.push({
        target: 'pino-pretty',
        options: {
          colorize: true,
          levelFirst: true,
          translateTime: 'UTC:yyyy-mm-dd HH:MM:ss.l o',
          singleLine: true,
        },
      });
    }

    // Elasticsearch transport for all environments
    targets.push({
      target: 'pino-elasticsearch',
      options: {
        node: process.env['ELASTICSEARCH_URL'] ?? 'http://elasticsearch:9200',
        index: `logs-${this.rootName}-%{DATE}`, // e.g., logs-iam-2024.03.18
        flushBytes: 1000,
        flushInterval: 1000,
        bulkSize: 200,
        ecs: true, // Enable Elastic Common Schema
        timestampField: '@timestamp',
        documentType: '_doc',
      },
    });

    return {
      level: process.env['LOG_LEVEL'] ?? 'info',
      base: {
        service: this.rootName,
        feature: this.featureName,
        environment: process.env['NODE_ENV'] ?? 'development',
        hostname: process.env['HOSTNAME'] ?? 'unknown',
        pid: process.pid,
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      transport: {
        targets,
      },
    };
  }
}
