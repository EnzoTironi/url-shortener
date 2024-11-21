export interface ILoggerService {
  log(message: LogMessage, context?: string): void;
  error(message: LogMessage, trace?: string | Error, context?: string): void;
  warn(message: LogMessage, context?: string): void;
  debug(message: LogMessage, context?: string): void;
  verbose(message: LogMessage, context?: string): void;
}

export type LogMessage = string | Record<string, unknown>;
