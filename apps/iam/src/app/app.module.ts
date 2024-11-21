import { ApiGatewayModule } from '@url-shortener/api-gateway-middleware';
import { AuthModule } from './modules/auth/auth.module';
import { ExceptionFilterModule } from '@url-shortener/filters';
import { HealthModule } from './modules/health/health.module';
import { LoggerModule } from '@url-shortener/logger';
import { Module } from '@nestjs/common';
import { PasswordService } from './modules/utils/password.service';
import { PrismaClientIamModule } from '@url-shortener/prisma-iam';
import { SeedModule } from './modules/seed/seed.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { UserModule } from './modules/user/user.module';

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
    ApiGatewayModule,
  ],
  providers: [PasswordService],
  exports: [PasswordService],
})
export class AppModule {}
