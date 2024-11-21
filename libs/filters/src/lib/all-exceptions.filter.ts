import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { LoggerService } from '../../../logger/src';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import {
  isPrismaError,
  isPrismaValidationError,
} from './interfaces/prisma-error.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly prismaErrorMap = {
    P2002: {
      status: HttpStatus.CONFLICT,
      message: 'A record with this value already exists',
    },
    P2025: {
      status: HttpStatus.NOT_FOUND,
      message: 'The requested record could not be found',
    },
    P2003: {
      status: HttpStatus.BAD_REQUEST,
      message: 'Invalid reference to a related record',
    },
    P2014: {
      status: HttpStatus.CONFLICT,
      message: 'The operation violates a required relationship between records',
    },
  };

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

  private handleError(exception: unknown, path: string) {
    if (isPrismaError(exception)) {
      return this.handlePrismaKnownError(
        exception as PrismaClientKnownRequestError,
        path
      );
    }
    if (isPrismaValidationError(exception)) {
      return this.handlePrismaValidationError(
        exception as PrismaClientValidationError,
        path
      );
    }
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, path);
    }
    return this.handleUnknownError(exception, path);
  }

  private handlePrismaKnownError(
    exception: PrismaClientKnownRequestError,
    path: string
  ) {
    this.logger.error('AllExceptionsFilter', exception);
    const error = this.prismaErrorMap[
      exception.code as keyof typeof this.prismaErrorMap
    ] || {
      status: HttpStatus.BAD_REQUEST,
      message: 'An error occurred while processing your request',
    };

    return {
      statusCode: error.status,
      message: error.message,
      error: 'Request Failed',
      timestamp: new Date().toISOString(),
      path,
      details: undefined,
    };
  }

  private handlePrismaValidationError(
    exception: PrismaClientValidationError,
    path: string
  ) {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'The provided data is invalid or incomplete',
      error: 'Invalid Data',
      timestamp: new Date().toISOString(),
      path,
      details: undefined,
    };
  }

  private handleHttpException(exception: HttpException, path: string) {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as Record<
      string,
      unknown
    >;

    const defaultMessages: Record<number, string> = {
      400: 'The request contains invalid data',
      401: 'Authentication is required to access this resource',
      403: 'You do not have permission to access this resource',
      404: 'The requested resource was not found',
      405: 'This operation is not allowed',
      408: 'The request took too long to complete',
      409: 'This operation conflicts with existing data',
      429: 'Too many requests, please try again later',
      500: 'An unexpected error occurred on our end',
      503: 'The service is temporarily unavailable',
    };

    return {
      statusCode: status,
      message:
        exceptionResponse['message'] ||
        defaultMessages[status] ||
        exception.message,
      error: exceptionResponse['error'] || this.getErrorTitle(status),
      timestamp: new Date().toISOString(),
      path,
      details: undefined,
    };
  }

  private handleUnknownError(exception: unknown, path: string) {
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'We encountered an unexpected problem. Please try again later',
      error: 'Unexpected Error',
      timestamp: new Date().toISOString(),
      path,
      details: undefined,
    };
  }

  private getErrorTitle(status: number): string {
    if (status >= 500) return 'Server Error';
    if (status >= 400) return 'Request Error';
    return 'Error';
  }

  private logError(errorResponse: any, exception: unknown): void {
    const logContext = {
      service: this.serviceName,
      path: errorResponse.path,
      statusCode: errorResponse.statusCode,
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
