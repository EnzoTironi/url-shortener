import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserJWT } from '../dtos/user-jwt.dto';

export const UserHeaders = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserJWT => {
    const request = ctx.switchToHttp().getRequest();
    return {
      userId: request.headers['x-user-id'] || null,
      userRoles: request.headers['x-user-roles'] || null,
      userHost: request.headers.host,
      tenantId: request.headers['x-tenant-id'] || null,
    };
  }
);
