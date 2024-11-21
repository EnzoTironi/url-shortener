import { Module } from '@nestjs/common';
import { TenantModule } from './modules/tenant/tenant.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { HealthModule } from './modules/health/health.module';
import { SeedModule } from './modules/seed/seed.module';
import { LoggerModule } from '@url-shortener/logger';
import { PrismaClientIamModule } from '@url-shortener/prisma-client-iam';
import { PasswordService } from './modules/utils/password.service';

@Module({
  imports: [
    LoggerModule.forRoot('iam-service'),
    PrismaClientIamModule,
    UserModule,
    TenantModule,
    AuthModule,
    HealthModule,
    SeedModule,
  ],
  providers: [PasswordService],
  exports: [PasswordService],
})
export class AppModule {}
