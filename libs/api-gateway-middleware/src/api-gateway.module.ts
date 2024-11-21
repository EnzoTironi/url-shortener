import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ApiKeyMiddleware } from './api-gateway.middleware';
import { LoggerModule } from '@url-shortener/logger';

@Module({
  imports: [LoggerModule.forRoot('API_GATEWAY')],
  providers: [ApiKeyMiddleware],
  exports: [ApiKeyMiddleware],
})
export class ApiGatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiKeyMiddleware)
      .exclude(
        { path: '/health', method: RequestMethod.GET },
        { path: '/metrics', method: RequestMethod.GET }
      )
      .forRoutes('*');
  }
}
