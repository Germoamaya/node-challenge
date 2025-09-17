import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import KeyvAdapter from '@keyv/redis';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TaskCreatedListener, TaskCompletedListener } from './listeners';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const redisUrl =
          configService.get('REDIS_URL') || 'redis://localhost:6379';
        return {
          store: new KeyvAdapter(redisUrl),
          ttl: 600000,
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [TaskController],
  providers: [TaskService, TaskCreatedListener, TaskCompletedListener],
  exports: [TaskService],
})
export class TaskModule {}
