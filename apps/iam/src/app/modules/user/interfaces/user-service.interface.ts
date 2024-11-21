import { CreateUserDto, UpdateRoleDto, UpdateUserDto } from '../dtos';
import { User } from '@database/iam';
import { UserJWT } from '@url-shortener/shared';

type UserResponse = Pick<User, 'id' | 'email' | 'role' | 'tenantId'>;

export interface IUserService {
  create(createUserDto: CreateUserDto): Promise<UserResponse>;
  update(
    id: string,
    updateUserDto: UpdateUserDto,
    userInfo: UserJWT
  ): Promise<UserResponse>;
  softDelete(id: string, userInfo: UserJWT): Promise<User>;
  updateRole(
    updateRoleDto: UpdateRoleDto,
    userInfo: UserJWT
  ): Promise<UserResponse>;
}
