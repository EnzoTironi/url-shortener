import { CreateTenantDto, UpdateTenantDto } from '../dtos';
import { Tenant } from '@database/iam';
import { UserJWT } from '@url-shortener/shared';

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

  remove(id: string, userInfo: UserJWT): Promise<TenantResponse>;
}

export default ITenantController;
