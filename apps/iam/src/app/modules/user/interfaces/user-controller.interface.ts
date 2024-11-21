import { CreateUserDto, UpdateRoleDto, UpdateUserDto } from '../dtos';
import { UserJWT } from '../../auth/dtos';
import { User } from '@database/iam';

type UserResponse = Pick<User, 'id' | 'email' | 'role' | 'tenantId'>;

export interface IUserController {
  create(createUserDto: CreateUserDto): Promise<UserResponse>;
  
  update(
    id: string,
    updateUserDto: UpdateUserDto,
    userInfo: UserJWT
  ): Promise<UserResponse>;
  
  remove(id: string, userInfo: UserJWT): Promise<User>;
  
  updateRole(
    updateRoleDto: UpdateRoleDto,
    userInfo: UserJWT
  ): Promise<UserResponse>;
}

export default IUserController; 