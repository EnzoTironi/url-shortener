import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, NextFunction } from 'express';
import { LoggerService } from '@url-shortener/logger';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  private static readonly API_KEY_HEADER = 'x-api-key';
  private readonly apiKey = process.env['API_KEY'];

  constructor(private readonly logger: LoggerService) {}

  use(req: Request, _res: Response, next: NextFunction): void {
    if (!this.apiKey) {
      this.logger.error(
        'API Gateway configuration error: API_KEY environment variable is not set',
        'API_GATEWAY_MIDDLEWARE'
      );
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    const providedApiKey = req.headers[ApiKeyMiddleware.API_KEY_HEADER];

    if (!providedApiKey || providedApiKey !== this.apiKey) {
      this.logger.error(
        `Invalid API key provided for request to ${req.path}`,
        'API_GATEWAY_MIDDLEWARE'
      );
      throw new HttpException('Forbidden access', HttpStatus.FORBIDDEN);
    }

    next();
  }
}
