import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto, UpdateUserDto, UpdateRoleDto } from './dtos';
import { IUserController } from './interfaces/user-controller.interface';
import {
  UserJWT,
  UserHeaders,
  HttpResponseInterceptor,
} from '@url-shortener/shared';
import { UserService } from './user.service';

@Controller('user')
@UseInterceptors(HttpResponseInterceptor)
export class UserController implements IUserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UserHeaders() userInfo: UserJWT
  ) {
    return await this.userService.update(id, updateUserDto, userInfo);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async softDelete(@Param('id') id: string, @UserHeaders() userInfo: UserJWT) {
    return await this.userService.softDelete(id, userInfo);
  }

  @Put('role')
  @HttpCode(HttpStatus.OK)
  async updateRole(
    @Body() updateRoleDto: UpdateRoleDto,
    @UserHeaders() userInfo: UserJWT
  ) {
    return await this.userService.updateRole(updateRoleDto, userInfo);
  }
}
