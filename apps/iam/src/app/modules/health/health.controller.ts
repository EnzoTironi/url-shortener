import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  PrismaHealthIndicator,
  HealthCheckResult,
} from '@nestjs/terminus';
import { PrismaService } from '@url-shortener/prisma-iam';
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
    const elasticsearchUrl = process.env.ELASTICSEARCH_URL ?? '';
    const jaegerUrl = process.env.JAEGER_URL ?? '';

    try {
      const result = await this.health.check([
        () =>
          this.prisma.pingCheck('database', this.prismaService, {
            timeout: 3000,
          }),
        () =>
          this.http.pingCheck('elasticsearch', elasticsearchUrl, {
            timeout: 3000,
          }),
        () =>
          this.http.pingCheck('jaeger', jaegerUrl, {
            timeout: 3000,
          }),
      ]);

      this.logger.log('Health check completed successfully', 'HealthCheck');
      return result;
    } catch (error: unknown) {
      this.logger.error(
        'Health check failed',
        (error as Error).stack,
        'HealthCheck'
      );
      throw error;
    }
  }
}
