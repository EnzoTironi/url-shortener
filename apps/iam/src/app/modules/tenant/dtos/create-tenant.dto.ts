import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateTenantDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;

  @IsString({ message: 'Subdomain must be a string' })
  @IsNotEmpty({ message: 'Subdomain is required' })
  @Matches(/^[a-z0-9-]+$/, {
    message:
      'Subdomain can only contain lowercase letters, numbers, and hyphens',
  })
  subDomain!: string;
}
