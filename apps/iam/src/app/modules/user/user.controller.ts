import { Controller, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto, UpdateRoleDto } from './dtos';
import { IUserController } from './interfaces/user-controller.interface';
import { UserJWT, UserHeaders } from '@url-shortener/shared';
import { UserService } from './user.service';

@Controller('user')
export class UserController implements IUserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UserHeaders() userInfo: UserJWT
  ) {
    return await this.userService.update(id, updateUserDto, userInfo);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @UserHeaders() userInfo: UserJWT) {
    return await this.userService.softDelete(id, userInfo);
  }

  @Put('role')
  async updateRole(
    @Body() updateRoleDto: UpdateRoleDto,
    @UserHeaders() userInfo: UserJWT
  ) {
    return await this.userService.updateRole(updateRoleDto, userInfo);
  }
}
