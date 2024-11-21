import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerService } from './logger.service';
import {
  LOGGER_SERVICE_NAME,
  LOGGER_FEATURE_NAME,
} from './constants/logger.constants';

@Global()
@Module({
  imports: [ConfigModule],
})
export class LoggerModule {
  static forRoot(serviceName: string): DynamicModule {
    const serviceNameProvider: Provider = {
      provide: LOGGER_SERVICE_NAME,
      useValue: serviceName,
    };

    return {
      module: LoggerModule,
      imports: [ConfigModule],
      providers: [serviceNameProvider, LoggerService],
      exports: [LoggerService],
    };
  }

  static forFeature(featureName: string): DynamicModule {
    const featureNameProvider: Provider = {
      provide: LOGGER_FEATURE_NAME,
      useValue: featureName,
    };

    return {
      module: LoggerModule,
      providers: [featureNameProvider, LoggerService],
      exports: [LoggerService],
    };
  }
}
