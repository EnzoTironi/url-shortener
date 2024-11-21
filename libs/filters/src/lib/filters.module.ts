import { DynamicModule, Global, Module } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { APP_FILTER } from '@nestjs/core';
import { LoggerModule, LoggerService } from '../../../logger/src';

@Global()
@Module({})
export class ExceptionFilterModule {
  static forRoot(serviceName: string): DynamicModule {
    return {
      module: ExceptionFilterModule,
      imports: [LoggerModule.forFeature('ExceptionFilter')],
      providers: [
        {
          provide: APP_FILTER,
          useFactory: (logger: LoggerService) => {
            return new AllExceptionsFilter(logger, serviceName);
          },
          inject: [LoggerService],
        },
        {
          provide: 'SERVICE_NAME',
          useValue: serviceName,
        },
      ],
    };
  }
}
