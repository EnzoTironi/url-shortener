import { CreateTenantDto, UpdateTenantDto } from '../dtos';
import { UserJWT } from '@url-shortener/shared';
import { Tenant } from '@database/iam';

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
