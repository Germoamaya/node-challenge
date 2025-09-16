import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './database/mikro-orm.config';
import { Task } from './entities/task.entity';
import { AppController } from './app.controller';
import { User } from './entities/user.entity';
import { TaskModule } from './modules/task/task.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MikroOrmModule.forRootAsync({
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    MikroOrmModule.forFeature([Task, User]),
    TaskModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
