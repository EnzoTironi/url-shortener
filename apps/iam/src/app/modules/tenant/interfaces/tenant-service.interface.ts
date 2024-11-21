import { CreateTenantDto, UpdateTenantDto } from '../dtos';
import { UserJWT } from '../../auth/dtos';
import { Tenant } from '@database/iam';

type TenantResponse = Pick<Tenant, 'id' | 'name' | 'subDomain'>;

export interface ITenantService {
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
