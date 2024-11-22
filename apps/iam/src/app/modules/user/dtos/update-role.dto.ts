import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { RoleType } from '@url-shortener/prisma-iam';

export class UpdateRoleDto {
  @IsNotEmpty({ message: 'User ID is required' })
  userId!: string;

  @IsEnum(RoleType, { message: 'Invalid role' })
  @IsNotEmpty({ message: 'Role is required' })
  role!: RoleType;
}
