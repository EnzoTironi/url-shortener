import { UserJWT } from '@url-shortener/shared';
import { CreateTenantDto, UpdateTenantDto } from '../dtos';
import { Tenant } from '@url-shortener/prisma-iam';

type TenantResponse = Pick<Tenant, 'id' | 'name' | 'subDomain'>;

export interface ITenantController {
  create(
    createTenantDto: CreateTenantDto,
    userInfo: UserJWT
  ): Promise<TenantResponse>;
  update(
    id: string,
    updateTenantDto: UpdateTenantDto,
    userInfo: UserJWT
  ): Promise<TenantResponse>;
  softDelete(id: string, userInfo: UserJWT): Promise<TenantResponse>;
}
