import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

export interface TaskCompletedEvent {
  taskId: number;
  userId: number;
  title: string;
  updatedAt: Date;
}

@Injectable()
export class TaskCompletedListener {
  private readonly logger = new Logger(TaskCompletedListener.name);

  @OnEvent('TASK_COMPLETED')
  handleTaskCompleted({
    taskId,
    userId,
    title,
    updatedAt,
  }: TaskCompletedEvent) {
    this.logger.log(
      `Task completed: "${title}" (ID: ${taskId}) by user ${userId} at ${updatedAt.toISOString()}`,
    );
  }
}
