import { IsEnum, IsNotEmpty } from 'class-validator';
import { RoleType } from '@url-shortener/prisma-iam';

export class UpdateRoleDto {
  @IsEnum(RoleType, { message: 'Invalid role' })
  @IsNotEmpty({ message: 'Role is required' })
  role!: RoleType;
}
