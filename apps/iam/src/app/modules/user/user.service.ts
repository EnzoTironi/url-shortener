import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto, UpdateRoleDto, UpdateUserDto } from './dtos/';
import { PasswordService } from '../utils/password.service';
import { RoleType } from '@database/iam';
import { UserJWT } from '@url-shortener/shared';
import { LoggerService } from '@url-shortener/logger';
import { IUserService } from './interfaces/user-service.interface';
import { User } from '@database/iam';
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
      ...createUserDto,
      password: hashedPassword,
    });

    this.logger.log(`User created with ID: ${user.id}`, 'UserService');
    return this.formatUserResponse(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto, userInfo: UserJWT) {
    const user = await this.findUser(id);
    await this.verifyUserAccess(user, userInfo);

    const updatedUser = await this.userRepository.update(id, updateUserDto);

    this.logger.log(`User ${id} updated successfully`, 'UserService');
    return this.formatUserResponse(updatedUser);
  }

  async softDelete(id: string, userInfo: UserJWT) {
    const user = await this.findUser(id);
    await this.verifyDeleteAccess(user, userInfo);

    const deletedUser = await this.userRepository.softDelete(id);

    this.logger.log(`User ${id} soft deleted successfully`, 'UserService');
    return deletedUser;
  }

  async updateRole(updateRoleDto: UpdateRoleDto, userInfo: UserJWT) {
    const user = await this.findUser(userInfo.userId);
    await this.verifyRoleUpdateAccess(user, userInfo);

    const updatedUser = await this.userRepository.updateRole(
      userInfo.userId,
      updateRoleDto.role
    );

    this.logger.log(`Role updated for user ${userInfo.userId}`, 'UserService');
    return this.formatUserResponse(updatedUser);
  }

  private async findUser(id: string) {
    const user = await this.userRepository.findById(id);

    if (!user || user.deletedAt !== null) {
      this.logger.warn(`User not found: ${id}`, 'UserService');
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async hashPassword(password: string) {
    return await this.passwordService.hashPassword(password);
  }

  private async verifyUserAccess(user: any, userInfo: UserJWT) {
    if (user?.id !== userInfo.userId) {
      this.logger.warn(
        `Unauthorized user update attempt: User ${userInfo.userId}`,
        'UserService'
      );
      throw new ForbiddenException('You are not allowed to update this user');
    }

    if (user?.tenantId !== userInfo.tenantId) {
      this.logger.warn(
        `Cross-tenant update attempt from tenant ${userInfo.tenantId}`,
        'UserService'
      );
      throw new ForbiddenException('You are not allowed to update this user');
    }
  }

  private async verifyDeleteAccess(user: any, userInfo: UserJWT) {
    const isAdmin = userInfo.userRoles.includes(RoleType.ADMIN);
    const isSelfDelete = user?.id === userInfo.userId;

    if (!isAdmin && !isSelfDelete) {
      this.logger.warn(
        `Unauthorized user deletion attempt: User ${userInfo.userId}`,
        'UserService'
      );
      throw new ForbiddenException('You are not allowed to delete this user');
    }
  }

  private async verifyRoleUpdateAccess(user: any, userInfo: UserJWT) {
    const isAdmin = userInfo.userRoles.includes(RoleType.ADMIN);
    const isTenantAdmin = userInfo.userRoles.includes(RoleType.TENANT_ADMIN);

    if (!isAdmin && !isTenantAdmin) {
      this.logger.warn(
        `Unauthorized role update attempt: User ${userInfo.userId}`,
        'UserService'
      );
      throw new ForbiddenException('You are not allowed to update roles');
    }

    if (user?.tenantId !== userInfo.tenantId) {
      this.logger.warn(
        `Cross-tenant role update attempt from tenant ${userInfo.tenantId}`,
        'UserService'
      );
      throw new ForbiddenException('You are not allowed to update this user');
    }
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
