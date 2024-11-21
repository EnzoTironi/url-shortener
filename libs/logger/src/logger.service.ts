import pino, { Logger, LoggerOptions } from 'pino';
import pinoElastic from 'pino-elasticsearch';
import pretty from 'pino-pretty';
import { Injectable, Inject, Optional } from '@nestjs/common';
import { LoggerConfig } from './interfaces';
import { ecsFormat } from '@elastic/ecs-pino-format';
import { trace as Trace } from '@opentelemetry/api';
import {
  LOGGER_ROOT_NAME,
  LOGGER_FEATURE_NAME,
} from './constants/logger.constants';

type LogMessage = string | Record<string, unknown>;

@Injectable()
export class LoggerService {
  private readonly logger: Logger;
  private readonly config: LoggerConfig;

  constructor(
    @Inject(LOGGER_ROOT_NAME) private readonly rootName: string,
    @Optional()
    @Inject(LOGGER_FEATURE_NAME)
    private readonly featureName?: string
  ) {
    this.config = this.loadConfig();
    this.logger = this.initializeLogger();
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

  // Configuration Methods
  private loadConfig() {
    return {
      elasticUrl:
        process.env['ELASTICSEARCH_URL'] ?? 'http://elasticsearch:9200',
      logLevel: process.env['LOG_LEVEL'] ?? 'info',
      environment: process.env['NODE_ENV'] ?? 'development',
      hostname: process.env['HOSTNAME'] ?? 'unknown',
    };
  }

  private createLoggerOptions(): LoggerOptions {
    const { logLevel, environment, hostname } = this.config;

    return {
      level: logLevel,
      base: {
        service: this.rootName,
        feature: this.featureName,
        environment,
        hostname,
        pid: process.pid,
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      ...ecsFormat(),
    };
  }

  // Logger Initialization Methods
  private initializeLogger(): Logger {
    const streams = pino.multistream([
      { stream: this.streamToConsole() },
      { stream: this.streamToElastic() },
    ]);

    return pino(this.createLoggerOptions(), streams);
  }

  private streamToConsole() {
    return pretty({
      colorize: true,
      levelFirst: true,
      translateTime: 'UTC:yyyy-mm-dd HH:MM:ss.l o',
      singleLine: true,
    });
  }

  private streamToElastic() {
    const { elasticUrl } = this.config;
    const index = this.generateIndexName();

    const streamToElastic = pinoElastic({
      node: elasticUrl,
      index,
      flushBytes: 10,
      esVersion: 8,
      opType: 'create',
    });

    streamToElastic.on('error', (error) => {
      console.error('Elasticsearch client error:', error);
    });
    streamToElastic.on('insertError', (error) => {
      console.error('Elasticsearch server error:', error);
    });
    return streamToElastic;
  }

  // Utility Methods
  private generateIndexName(): string {
    const today = new Date().toLocaleDateString('en-CA').replace(/-/g, '.');
    return `logs-${this.rootName.toLowerCase()}-${today}`;
  }

  private getContextandTrace() {
    const activeSpan = Trace.getActiveSpan();
    const spanContext = activeSpan?.spanContext();

    const traceId = spanContext?.traceId;
    const spanId = spanContext?.spanId;

    return { traceId, spanId };
  }

  // Logging Helper Methods
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
      message: msg,
      ...this.getContextandTrace(),
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
}
