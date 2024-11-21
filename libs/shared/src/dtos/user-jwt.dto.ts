import { RoleType } from '@url-shortener/prisma-iam';

export class UserJWT {
  userId?: string;
  userToken?: string;
  userRoles?: RoleType;
  userHost!: string;
  tenantId?: string;
}
