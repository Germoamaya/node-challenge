import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './database/mikro-orm.config';
import { Task, User, RefreshToken } from './entities';
import { AppController } from './app.controller';
import { TaskModule } from './modules/task/task.module';
import { AuthModule } from './modules/auth/auth.module';
import { GuardsModule } from './common/guards/guards.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MikroOrmModule.forRootAsync({
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    MikroOrmModule.forFeature([Task, User, RefreshToken]),
    TaskModule,
    AuthModule,
    GuardsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
