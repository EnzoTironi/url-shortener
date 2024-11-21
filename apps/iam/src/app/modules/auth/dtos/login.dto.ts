import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;

  @IsString({ message: 'Tenant ID must be a string' })
  @IsNotEmpty({ message: 'Tenant ID is required' })
  tenantId!: string;
}
