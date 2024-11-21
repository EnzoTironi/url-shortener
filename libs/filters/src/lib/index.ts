import { AllExceptionsFilter } from './all-exceptions.filter';
import { LoggerService } from '../../../logger/src';
import { Provider } from '@nestjs/common';

export const ExceptionFilterProvider: Provider = {
  provide: 'APP_FILTER',
  useFactory: (logger: LoggerService, serviceName: string) => {
    if (!logger) {
      throw new Error('Logger service must be provided');
    }
    if (!serviceName) {
      throw new Error('Service name must be provided');
    }
    if (typeof logger.log !== 'function') {
      throw new Error('Invalid logger instance');
    }

    return new AllExceptionsFilter(logger, serviceName);
  },
  inject: [LoggerService, 'SERVICE_NAME'],
};
