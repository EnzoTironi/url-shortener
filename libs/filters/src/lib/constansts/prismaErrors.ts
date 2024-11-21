import { HttpStatus } from '@nestjs/common';

export const PrismaErrorMap = {
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
