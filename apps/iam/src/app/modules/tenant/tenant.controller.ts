import { Body, Controller, Delete, Param, Post, Put } from '@nestjs/common';
import { CreateTenantDto, UpdateTenantDto } from './dtos';
import { ITenantController } from './interfaces/tenant-controller.interface';
import { TenantService } from './tenant.service';
import { UserHeaders, UserJWT } from '@url-shortener/shared';

@Controller('tenant')
export class TenantController implements ITenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  async create(
    @Body() createTenantDto: CreateTenantDto,
    @UserHeaders() userInfo: UserJWT
  ) {
    return await this.tenantService.create(createTenantDto, userInfo);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
    @UserHeaders() userInfo: UserJWT
  ) {
    return await this.tenantService.update(id, updateTenantDto, userInfo);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @UserHeaders() userInfo: UserJWT) {
    return await this.tenantService.softDelete(id, userInfo);
  }
}
