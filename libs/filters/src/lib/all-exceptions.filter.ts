import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { LoggerService } from '../../../logger/src';
import { Prisma } from '../../../prisma-url/src';
import { Request, Response } from 'express';
import {
  isPrismaError,
  isPrismaValidationError,
  ErrorResponse,
  LogContext,
} from './interfaces/';
import { DefaultMessages, PrismaErrorMap } from './constansts';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly prismaErrorMap = PrismaErrorMap;

  constructor(
    @Inject(LoggerService) private readonly logger: LoggerService,
    @Inject('SERVICE_NAME') private readonly serviceName: string
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.handleError(exception, request.url);
    this.logError(errorResponse, exception);
    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private handleError(exception: unknown, path: string): ErrorResponse {
    if (isPrismaError(exception)) {
      return this.handlePrismaKnownError(exception, path);
    }
    if (isPrismaValidationError(exception)) {
      return this.handlePrismaValidationError(exception, path);
    }
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, path);
    }
    return this.handleUnknownError(exception, path);
  }

  // Specific Error Handlers
  private handlePrismaKnownError(
    exception: Prisma.PrismaClientKnownRequestError,
    path: string
  ): ErrorResponse {
    const error = this.prismaErrorMap[
      exception.code as keyof typeof this.prismaErrorMap
    ] ?? {
      status: HttpStatus.BAD_REQUEST,
      message: 'An error occurred while processing your request',
    };

    return {
      statusCode: error.status,
      message: error.message,
      error: 'Request Failed',
      timestamp: new Date().toISOString(),
      path,
    };
  }

  private handlePrismaValidationError(
    exception: Prisma.PrismaClientValidationError,
    path: string
  ): ErrorResponse {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'The provided data is invalid or incomplete',
      error: 'Invalid Data',
      timestamp: new Date().toISOString(),
      path,
    };
  }

  private handleHttpException(
    exception: HttpException,
    path: string
  ): ErrorResponse {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as Record<
      string,
      unknown
    >;

    return {
      statusCode: status,
      message:
        (exceptionResponse['message'] as string) ??
        DefaultMessages[status] ??
        exception.message,
      error:
        (exceptionResponse['error'] as string) ?? this.getErrorTitle(status),
      timestamp: new Date().toISOString(),
      path,
    };
  }

  private handleUnknownError(exception: unknown, path: string): ErrorResponse {
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'We encountered an unexpected problem. Please try again later',
      error: 'Unexpected Error',
      timestamp: new Date().toISOString(),
      path,
    };
  }

  // Utility Methods
  private getErrorTitle(status: number): string {
    if (status >= 500) return 'Server Error';
    if (status >= 400) return 'Request Error';
    return 'Error';
  }

  private logError(errorResponse: ErrorResponse, exception: unknown): void {
    const logContext: LogContext = {
      service: this.serviceName,
      path: errorResponse.path,
      statusCode: errorResponse.statusCode,
      message: errorResponse.message,
      error: errorResponse.error,
    };

    if (errorResponse.statusCode >= 500) {
      this.logger.error(
        logContext,
        exception instanceof Error ? exception : undefined,
        'AllExceptionsFilter'
      );
    } else if (errorResponse.statusCode >= 400) {
      this.logger.warn(logContext, 'AllExceptionsFilter');
    } else {
      this.logger.debug(logContext, 'AllExceptionsFilter');
    }
  }
}
