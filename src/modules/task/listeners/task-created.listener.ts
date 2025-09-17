import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

export interface TaskCreatedEvent {
  taskId: number;
  userId: number;
  title: string;
  createdAt: Date;
}

@Injectable()
export class TaskCreatedListener {
  private readonly logger = new Logger(TaskCreatedListener.name);

  @OnEvent('TASK_CREATED')
  handleTaskCreated(payload: TaskCreatedEvent) {
    this.logger.log(
      `✅ Task created: "${payload.title}" (ID: ${payload.taskId}) by user ${payload.userId} at ${payload.createdAt.toISOString()}`,
    );
  }
}
