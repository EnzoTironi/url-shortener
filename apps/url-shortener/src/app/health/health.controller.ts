import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  PrismaHealthIndicator,
  HealthCheckResult,
} from '@nestjs/terminus';
import { PrismaService } from '@url-shortener/prisma-client-url';
import { LoggerService } from '@url-shortener/logger';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly prisma: PrismaHealthIndicator,
    private readonly prismaService: PrismaService,
    private readonly logger: LoggerService
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    try {
      const result = await this.health.check([
        () =>
          this.prisma.pingCheck('database', this.prismaService, {
            timeout: 3000,
          }),
        // () =>
        //   this.http.pingCheck('elasticsearch', 'http://elasticsearch:9200', {
        //     timeout: 3000,
        //   }),
        // () =>
        //   this.http.pingCheck('jaeger', 'http://jaeger:16686', {
        //     timeout: 3000,
        //   }),
      ]);

      this.logger.log('Health check completed successfully', 'HealthCheck');
      return result;
    } catch (error) {
      this.logger.error('Health check failed', error.stack, 'HealthCheck');
      throw error;
    }
  }
}
