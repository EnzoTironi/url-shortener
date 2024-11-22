import { HttpException } from '@nestjs/common';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from './prisma-error.interface';

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

export interface LogContext extends Record<string, unknown> {
  service: string;
  path: string;
  statusCode: number;
  message: string;
  error?: string;
}

export interface ErrorHandlers {
  handlePrismaKnownError(
    exception: PrismaClientKnownRequestError,
    path: string
  ): ErrorResponse;

  handlePrismaValidationError(
    exception: PrismaClientValidationError,
    path: string
  ): ErrorResponse;

  handleHttpException(exception: HttpException, path: string): ErrorResponse;

  handleUnknownError(exception: unknown, path: string): ErrorResponse;
}
