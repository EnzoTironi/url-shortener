import { HttpStatus } from '@nestjs/common';

export interface IResponse<T> {
  statusCode: HttpStatus;
  data: T;
} 