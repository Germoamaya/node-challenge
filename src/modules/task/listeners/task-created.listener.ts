import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from 'src/entities/user.entity';

export interface TaskCreatedEvent {
  id: number;
  user: User;
  title: string;
  createdAt: Date;
}

@Injectable()
export class TaskCreatedListener {
  private readonly logger = new Logger(TaskCreatedListener.name);

  @OnEvent('TASK_CREATED')
  handleTaskCreated({ id, user, title, createdAt }: TaskCreatedEvent) {
    this.logger.log(
      `Task created: "${title}" (ID: ${id}) by user ${user.id} at ${createdAt.toISOString()}`,
    );
  }
}
