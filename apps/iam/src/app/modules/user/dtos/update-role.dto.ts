import { RoleType } from '@url-shortener/prisma-iam';

export class UpdateRoleDto {
  role!: RoleType;
}
