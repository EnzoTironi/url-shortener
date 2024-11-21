import { Prisma } from '../../../../prisma-client-url/src';

export interface PrismaErrorResponse {
  code: string;
  clientVersion: string;
  meta?: {
    modelName?: string;
    target?: string[];
    [key: string]: any;
  };
  message: string;
}

export function isPrismaError(
  error: unknown
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    (error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      'clientVersion' in error &&
      typeof (error as any).code === 'string' &&
      (error as any).code.startsWith('P'))
  );
}

export function isPrismaValidationError(
  error: unknown
): error is Prisma.PrismaClientValidationError {
  return error instanceof Prisma.PrismaClientValidationError;
}
