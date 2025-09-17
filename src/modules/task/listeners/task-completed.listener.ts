import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

export interface TaskCompletedEvent {
  taskId: number;
  userId: number;
  title: string;
  completedAt: Date;
}

@Injectable()
export class TaskCompletedListener {
  private readonly logger = new Logger(TaskCompletedListener.name);

  @OnEvent('TASK_COMPLETED')
  handleTaskCompleted(payload: TaskCompletedEvent) {
    this.logger.log(
      `🎉 Task completed: "${payload.title}" (ID: ${payload.taskId}) by user ${payload.userId} at ${payload.completedAt.toISOString()}`,
    );
  }
}
