import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';

@Module({
  imports: [HttpModule],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
