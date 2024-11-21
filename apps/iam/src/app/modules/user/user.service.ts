import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto, UpdateRoleDto, UpdateUserDto } from './dtos/';
import { Actions, UserJWT } from '@url-shortener/shared';
import { IUserService } from './interfaces/user-service.interface';
import { LoggerService } from '@url-shortener/logger';
import { PasswordService } from '../utils/password.service';
import { RoleType, User } from '@database/iam';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService implements IUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly logger: LoggerService
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await this.hashPassword(createUserDto.password);
    const user = await this.userRepository.create({
      email: createUserDto.email,
      password: hashedPassword,
      tenantId: createUserDto.tenantId,
    });

    this.logger.log(`User created with ID: ${user.id}`, 'UserService');
    return this.formatUserResponse(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto, userInfo: UserJWT) {
    const user = await this.findUser(id);
    this.verifyAccess(user, userInfo, Actions.UPDATE);

    const updatedUser = await this.userRepository.update(id, updateUserDto);

    this.logger.log(`User ${id} updated successfully`, 'UserService');
    return this.formatUserResponse(updatedUser);
  }

  async softDelete(id: string, userInfo: UserJWT) {
    const user = await this.findUser(id);
    this.verifyAccess(user, userInfo, Actions.DELETE);

    const deletedUser = await this.userRepository.softDelete(id);

    this.logger.log(`User ${id} soft deleted successfully`, 'UserService');
    return deletedUser;
  }

  async updateRole(updateRoleDto: UpdateRoleDto, userInfo: UserJWT) {
    const user = await this.findUser(userInfo.userId!);
    this.verifyAccess(user, userInfo, Actions.ROLE);

    const updatedUser = await this.userRepository.updateRole(
      userInfo.userId!,
      updateRoleDto.role
    );

    this.logger.log(`Role updated for user ${userInfo.userId}`, 'UserService');
    return this.formatUserResponse(updatedUser);
  }

  private async findUser(id: string) {
    const user = await this.userRepository.findById(id);
    const isNotDeleted = user?.deletedAt === null;

    if (user && isNotDeleted) return user;

    this.logger.warn(`User not found: ${id}`, 'UserService');
    throw new NotFoundException('User not found');
  }

  private async hashPassword(password: string) {
    return await this.passwordService.hashPassword(password);
  }

  private verifyAccess(user: User, userInfo: UserJWT, action?: Actions) {
    const isAdmin = userInfo.userRoles === RoleType.ADMIN;
    const isSameTenantAdmin =
      userInfo.userRoles === RoleType.TENANT_ADMIN &&
      user.tenantId === userInfo.tenantId;
    const isSelfAction = user.id === userInfo.userId;
    const isNotRoleAction = action !== Actions.ROLE;
    // Admin has full access
    if (isAdmin) return;

    // Tenant admin can manage users in their tenant, except roles
    if (isSameTenantAdmin && isNotRoleAction) return;

    // Regular users can only manage themselves, except for role updates
    if (isSelfAction && isNotRoleAction) return;

    this.throwUnauthorizedError(userInfo.userId!);
  }

  private throwUnauthorizedError(userId: string): never {
    this.logger.warn(
      `Unauthorized access attempt: User ${userId}`,
      'UserService'
    );
    throw new ForbiddenException('You are not allowed to perform this action');
  }

  private formatUserResponse(
    user: User
  ): Pick<User, 'id' | 'email' | 'role' | 'tenantId'> {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };
  }
}
