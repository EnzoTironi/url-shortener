import { Module } from '@nestjs/common';
import { TenantModule } from './modules/tenant/tenant.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { HealthModule } from './modules/health/health.module';
import { SeedModule } from './modules/seed/seed.module';
import { PrismaClientIamModule } from '@url-shortener/prisma-client-iam';
import { PasswordService } from './modules/utils/password.service';
import { ExceptionFilterModule } from '@url-shortener/filters';
import { LoggerModule } from '@url-shortener/logger';

@Module({
  imports: [
    LoggerModule.forRoot('IAM_SERVICE'),
    ExceptionFilterModule.forRoot('IAM_SERVICE'),
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
