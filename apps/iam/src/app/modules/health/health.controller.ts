import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HttpHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '@url-shortener/prisma-client-iam';
import { LoggerService } from '@url-shortener/logger';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private prisma: PrismaHealthIndicator,
    private prismaService: PrismaService,
    private logger: LoggerService
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
        () =>
          this.http.pingCheck('elasticsearch', 'http://elasticsearch:9200', {
            timeout: 3000,
          }),
        () =>
          this.http.pingCheck('jaeger', 'http://jaeger:16686', {
            timeout: 3000,
          }),
      ]);

      this.logger.log('Health check completed successfully', 'HealthCheck');
      return result;
    } catch (error) {
      this.logger.error('Health check failed', error.stack, 'HealthCheck');
      throw error;
    }
  }
}
