import { RoleType } from '@url-shortener/prisma-iam';

export interface IJwtPayload {
  sub: number;
  email: string;
  role: RoleType;
  tenantId: number;
}
