import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TaskCreatedListener, TaskCompletedListener } from './listeners';

@Module({
  imports: [HttpModule],
  controllers: [TaskController],
  providers: [TaskService, TaskCreatedListener, TaskCompletedListener],
  exports: [TaskService],
})
export class TaskModule {}
