import { HttpException } from '@nestjs/common';
import { Prisma } from '../../../../prisma-client-url/src';

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  details?: unknown;
}

export interface ErrorContext {
  service: string;
  path: string;
  statusCode: number;
  timestamp: string;
  details?: unknown;
}

export interface ErrorHandlers {
  handlePrismaKnownError(
    exception: Prisma.PrismaClientKnownRequestError,
    path: string
  ): ErrorResponse;

  handlePrismaValidationError(
    exception: Prisma.PrismaClientValidationError,
    path: string
  ): ErrorResponse;

  handleHttpException(exception: HttpException, path: string): ErrorResponse;

  handleUnknownError(exception: unknown, path: string): ErrorResponse;
}
