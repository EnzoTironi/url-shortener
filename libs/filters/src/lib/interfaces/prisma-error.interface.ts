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

export interface PrismaClientKnownRequestError {
  name: 'PrismaClientKnownRequestError';
  code: string;
  message: string;
  clientVersion: string;
  meta?: Record<string, any>;
}

export interface PrismaClientValidationError {
  name: 'PrismaClientValidationError';
  message: string;
  clientVersion: string;
}

export function isPrismaError(
  error: unknown
): error is PrismaClientKnownRequestError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    'clientVersion' in error &&
    (error as any).name === 'PrismaClientKnownRequestError' &&
    typeof (error as any).code === 'string' &&
    (error as any).code.startsWith('P')
  );
}

export function isPrismaValidationError(
  error: unknown
): error is PrismaClientValidationError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'name' in error &&
    'message' in error &&
    (error as any).name === 'PrismaClientValidationError'
  );
}
