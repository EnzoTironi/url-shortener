import { DynamicModule, Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import {
  LOGGER_ROOT_NAME,
  LOGGER_FEATURE_NAME,
} from './constants/logger.constants';

@Global()
@Module({})
export class LoggerModule {
  static forRoot(serviceName: string): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        {
          provide: LOGGER_ROOT_NAME,
          useValue: serviceName,
        },
        {
          provide: LoggerService,
          useFactory: (rootName: string) => new LoggerService(rootName),
          inject: [LOGGER_ROOT_NAME],
        },
      ],
      exports: [LoggerService],
    };
  }

  static forFeature(featureName: string): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        {
          provide: LOGGER_FEATURE_NAME,
          useValue: featureName,
        },
        {
          provide: LoggerService,
          useFactory: (featureName: string) => new LoggerService(featureName),
          inject: [LOGGER_FEATURE_NAME],
        },
      ],
      exports: [LoggerService],
    };
  }
}
