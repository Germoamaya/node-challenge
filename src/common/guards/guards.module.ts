import { Module } from '@nestjs/common';
import { AuthModule } from '../../modules/auth/auth.module';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RoleGuard } from './role.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [AuthModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class GuardsModule {}
